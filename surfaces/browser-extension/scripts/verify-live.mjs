/**
 * Connect to a Chrome you launched with --remote-debugging-port=9222 (so it uses
 * YOUR logged-in profile), find the claude.ai tab, and verify the Thirsty card
 * mounted on the real UI. Screenshots it and reports selector diagnostics so we
 * can tune the DOM adapter against live claude.ai if anything differs.
 *
 * Usage (after launching Chrome per the README):
 *   node surfaces/browser-extension/scripts/verify-live.mjs
 */
import { chromium } from 'playwright-core';

const CDP = process.env.THIRSTY_CDP ?? 'http://localhost:9222';

const browser = await chromium.connectOverCDP(CDP).catch((e) => {
  console.error(`Could not connect to Chrome at ${CDP}.`);
  console.error('Launch Chrome first (see surfaces/browser-extension/README.md → "Verify on your real Claude").');
  console.error(String(e.message ?? e));
  process.exit(1);
});

const contexts = browser.contexts();
const pages = contexts.flatMap((c) => c.pages());
const page =
  pages.find((p) => p.url().includes('claude.ai')) ??
  (await (async () => {
    const p = contexts[0]?.pages()[0] ?? (await contexts[0]?.newPage());
    if (p) await p.goto('https://claude.ai/new', { waitUntil: 'domcontentloaded' }).catch(() => {});
    return p;
  })());

if (!page) {
  console.error('No usable page found. Open a claude.ai conversation and re-run.');
  process.exit(1);
}

console.log('Connected. Active URL:', page.url());
// Give the content script a moment (and any in-flight render) to settle.
await page.waitForTimeout(1500);

const diag = await page.evaluate(() => {
  const q = (sel) => document.querySelectorAll(sel).length;
  const card = document.querySelector('.thirsty-card');
  const rect = card?.getBoundingClientRect();
  return {
    cardPresent: !!card,
    cardWidth: rect ? Math.round(rect.width) : null,
    value: document.querySelector('[data-thirsty="value"]')?.textContent ?? null,
    counts: {
      userMessages: q('[data-testid="user-message"]'),
      assistantFontClaude: q('.font-claude-message'),
      assistantTestid: q('[data-testid="assistant-message"]'),
    },
  };
});

console.log('Diagnostics:', JSON.stringify(diag, null, 2));

const out = 'surfaces/browser-extension/live-claude.png';
await page.screenshot({ path: out, fullPage: false }).catch(() => {});
console.log('Screenshot saved to', out);

if (!diag.cardPresent) {
  console.warn(
    '\n⚠  Card not found. Either no bot reply is visible yet, or claude.ai selectors changed.\n' +
      '   assistant matches (.font-claude-message):',
    diag.counts.assistantFontClaude,
    '\n   If that count is 0, we need to update SELECTORS in src/content.ts.',
  );
}

await browser.close().catch(() => {}); // detaches CDP; does NOT close your Chrome
console.log('Done (your Chrome stays open).');
