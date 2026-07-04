/**
 * claude.ai content script.
 *
 * The card is mounted INLINE — right after the bot's most recent reply — to
 * match the original mockup. claude.ai is React, so we don't fight it: on a
 * debounced MutationObserver we (1) re-assert the card's position after the last
 * assistant message and (2) repaint it from the freshly-scraped conversation.
 *
 * To avoid a feedback loop (our own DOM writes would re-trigger the observer),
 * we disconnect the observer while we mutate and reconnect afterwards.
 *
 * Selectors live in one adapter block — the only thing to touch when claude.ai's
 * DOM shifts.
 */
import { estimate, total, approxTokens, detectModel, type FootprintEstimate } from '@waterusedbyourai/core';
import { buildCard, updateCard, type CardState } from './card';

/** DOM adapter for Claude, ChatGPT, Perplexity, and Gemini. Order matters — first selector that hits wins. */
const SELECTORS = {
  user: [
    '[data-testid="user-message"]',
    '[data-waterusedbyourai-role="user"]',
    '[data-message-author-role="user"]', // ChatGPT
    'div.font-sans.font-medium', // Perplexity first query
    'div[class*="query"]', // Perplexity query blocks
    'user-query', // Gemini custom element
    '[class*="user-query"]', // Gemini classes
  ],
  assistant: [
    '[data-is-streaming]', // Claude.ai
    '.font-claude-response', // Claude.ai
    '.font-claude-message', // Claude.ai legacy
    '[data-testid="assistant-message"]', // Claude.ai
    '[data-waterusedbyourai-role="assistant"]',
    '[data-message-author-role="assistant"]', // ChatGPT
    'div[class*="answer"]', // Perplexity answer blocks
    'div.prose', // Generic/Perplexity prose
    'model-response', // Gemini custom element
    '[class*="model-response"]', // Gemini classes
  ],
  /** places the model name might appear, for auto-detection */
  modelHint: [
    '[data-testid="model-selector"]',
    'button[aria-haspopup="menu"]',
    'header',
    '.text-token-text-secondary', // ChatGPT model menu text
    'div[class*="model"]', // Perplexity model indicator
    '[data-testid="selected-model-text"]', // Gemini model picker
  ],
};

let cardEl: HTMLElement | null = null;
let observer: MutationObserver | null = null;

// Watch text/children, characterData, and attributes so we catch generation progress.
const OBSERVE_OPTS: MutationObserverInit = {
  childList: true,
  subtree: true,
  characterData: true,
  attributes: true,
};

function firstMatch(selectors: string[]): HTMLElement[] {
  for (const sel of selectors) {
    const nodes = document.querySelectorAll<HTMLElement>(sel);
    if (nodes.length) return [...nodes];
  }
  return [];
}

function collectText(selectors: string[]): string[] {
  return firstMatch(selectors).map((n) => n.innerText || n.textContent || '');
}

/** True while the newest reply is still being generated ("thinking"/streaming). */
function replyInProgress(): boolean {
  // Claude.ai check:
  const assistants = firstMatch(SELECTORS.assistant);
  const last = assistants[assistants.length - 1];
  const isClaudeStreaming = !!last && last.getAttribute('data-is-streaming') === 'true';

  // ChatGPT check:
  const isGptStreaming = !!document.querySelector('.result-streaming, [data-testid="stop-button"], button[aria-label="Stop generating"]');

  // Perplexity check:
  const isPerplexityStreaming = !!document.querySelector('button[class*="stop"], svg[class*="animate-spin"]');

  // Gemini check:
  const isGeminiStreaming = !!document.querySelector('.generating, [class*="generating"], .model-response-generating');

  return isClaudeStreaming || isGptStreaming || isPerplexityStreaming || isGeminiStreaming;
}

/** Completed assistant messages only (drops the one still streaming). */
function completedAssistants(): HTMLElement[] {
  return firstMatch(SELECTORS.assistant).filter((el) => {
    // Claude.ai check:
    if (el.hasAttribute('data-is-streaming')) {
      return el.getAttribute('data-is-streaming') !== 'true';
    }
    // ChatGPT check:
    if (el.classList.contains('result-streaming')) {
      return false;
    }
    return true;
  });
}

function detectModelHit(): { providerId: string; modelId: string } | null {
  for (const sel of SELECTORS.modelHint) {
    for (const node of document.querySelectorAll<HTMLElement>(sel)) {
      const hit = detectModel(node.innerText || node.textContent || '');
      if (hit) return hit;
    }
  }
  return null; // core falls back to the provider default
}

const ALL_MESSAGE_SEL = [...SELECTORS.user, ...SELECTORS.assistant].join(',');

/** The element the card should sit directly beneath: the latest COMPLETED reply. */
function anchorElement(): HTMLElement | null {
  const assistants = completedAssistants();
  return assistants.length ? assistants[assistants.length - 1]! : null;
}

/**
 * Find the full "turn block" for a message: climb up until the next parent would
 * pull in a *different* turn's message. That block is a full-width child of the
 * conversation column, so inserting the card after it puts it on its own line
 * BELOW the reply — not squeezed beside it inside claude.ai's flex row.
 */
function turnBlockFor(anchor: HTMLElement): HTMLElement {
  let node: HTMLElement = anchor;
  while (node.parentElement && node.parentElement !== document.body) {
    const parent = node.parentElement;
    const foreign = [...parent.querySelectorAll<HTMLElement>(ALL_MESSAGE_SEL)].some(
      (m) => m !== anchor && !anchor.contains(m) && !m.contains(anchor),
    );
    if (foreign) break; // parent spans multiple turns -> `node` is this turn's block
    node = parent;
  }
  return node;
}

/** Ensure the card sits as a full-width block after the latest turn. */
function ensurePlacement(card: HTMLElement): boolean {
  const anchor = anchorElement();
  if (!anchor) return false;
  const block = turnBlockFor(anchor);
  if (block.nextElementSibling !== card) {
    block.insertAdjacentElement('afterend', card);
  }
  return true;
}

/** Pair up user/assistant texts into per-turn estimates and sum them. */
function computeConversation(): CardState {
  const hit = detectModelHit();
  const users = collectText(SELECTORS.user);
  const assistants = completedAssistants().map((n) => n.innerText || n.textContent || '');

  const estimates: FootprintEstimate[] = [];
  let totalTokens = 0;
  const turnCount = Math.max(users.length, assistants.length);
  for (let i = 0; i < turnCount; i++) {
    const inputTokens = approxTokens(users[i] ?? '');
    const outputTokens = approxTokens(assistants[i] ?? '');
    totalTokens += inputTokens + outputTokens;
    if (inputTokens + outputTokens === 0) continue;
    estimates.push(estimate({ inputTokens, outputTokens, providerId: hit?.providerId, modelId: hit?.modelId }));
  }

  const t = total(estimates);
  return {
    waterMl: t.waterMl,
    energyWh: t.energyWh,
    co2g: t.co2g,
    exact: false, // DOM scraping is always an approximation
    turns: estimates.length,
    totalTokens,
  };
}

function repaint(): void {
  observer?.disconnect();
  try {
    console.log('[waterusedbyourAi] repainting...');
    if (!cardEl) {
      cardEl = buildCard();
    }

    const completed = completedAssistants();
    const inProgress = replyInProgress();
    const anchor = anchorElement();

    console.log('[waterusedbyourAi] message status:', {
      userMessagesFound: firstMatch(SELECTORS.user).length,
      assistantMessagesFound: firstMatch(SELECTORS.assistant).length,
      completedAssistantsFound: completed.length,
      replyInProgress: inProgress,
      anchorFound: !!anchor
    });

    // Hold the card back until the newest reply has fully finished — no flicker
    // while the model is thinking/streaming. It reappears once streaming ends.
    if (inProgress) {
      console.log('[waterusedbyourAi] streaming in progress, removing card');
      cardEl.remove();
      return;
    }
    // Only show once a completed reply exists; keep re-asserting against re-renders.
    if (ensurePlacement(cardEl)) {
      const state = computeConversation();
      console.log('[waterusedbyourAi] updating card state:', state);
      updateCard(cardEl, state);
    } else {
      console.log('[waterusedbyourAi] could not place card (no anchor element)');
    }
  } catch (err) {
    console.error('[waterusedbyourAi] repaint error:', err);
  } finally {
    observer?.observe(document.body, OBSERVE_OPTS);
  }
}



// --- boot -----------------------------------------------------------------
function debounce(fn: () => void, ms: number): () => void {
  let h: ReturnType<typeof setTimeout> | undefined;
  return () => {
    if (h) clearTimeout(h);
    h = setTimeout(fn, ms);
  };
}

function start(): void {
  const paint = debounce(repaint, 400);
  observer = new MutationObserver(paint);
  observer.observe(document.body, OBSERVE_OPTS);
  repaint();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
