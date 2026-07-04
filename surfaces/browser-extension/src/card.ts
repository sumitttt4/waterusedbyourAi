/**
 * The "waterusedbyourAi" widget — framework-free DOM with a premium iOS/macOS layout.
 *
 * Implements:
 *   - Smooth 60fps counter animation using requestAnimationFrame
 *   - Multi-state rendering (empty vs active) to avoid layout shifts
 *   - Cache-stabilized randomized environmental alerts
 *   - Dynamic fluid sloshing & bubble particles inside an SVG glass
 */
import {
  formatWater,
  formatEnergy,
  formatCarbon,
  waterComparison,
  waterFraction,
} from '@waterusedbyourai/core';
import { CSS } from './styles';

export interface CardState {
  waterMl: number;
  energyWh: number;
  co2g: number;
  exact: boolean;
  turns: number;
  totalTokens: number;
}

// ── Curated Environment Messages ───────────────────────────

const ALERTS = {
  chill: [
    '🌱 Minimal footprint. This chat uses less energy than a brief LED light.',
    '💧 Micro-sip. Your prompt consumed less than a single droplet of water.',
    '🧊 Cool chips. Datacenter cooling overhead for this message was near zero.',
  ],
  mild: [
    '🫧 Small impact. Cumulative water cooling is about equal to a splash.',
    '🔋 Efficient tokens. Your prompt layout uses resources highly effectively.',
    '⚡ Low energy. Equivalent to charging a smart watch for a short period.',
  ],
  warm: [
    '🥤 Growing footprint. This conversation has consumed half a glass of water.',
    '⚠️ Warming up. Your token overhead is accumulating cooling demand.',
    '🔌 Medium power. Equivalent to keeping a desk lamp on for an hour.',
  ],
  hot: [
    '🥵 High compute load! Datacenter evaporated a full glass of water for this thread.',
    '🔥 Heavy load. Advanced reasoning structures consume higher energy.',
    '🚰 Consider starting a new conversation thread to clean up context memory.',
  ],
} as const;

type AlertLevel = 'chill' | 'mild' | 'warm' | 'hot';

function getAlertLevel(waterMl: number): AlertLevel {
  if (waterMl >= 10) return 'hot';
  if (waterMl >= 1) return 'warm';
  if (waterMl >= 0.1) return 'mild';
  return 'chill';
}

function pickAlert(waterMl: number, turns: number, el: HTMLElement): { text: string; level: AlertLevel } {
  const level = getAlertLevel(waterMl);
  const msgs = ALERTS[level];
  const currentTurns = String(turns);
  
  // Cache the alert text in the DOM to avoid flickering on minor re-renders
  let alertText = el.dataset.lastAlertText || '';
  if (el.dataset.lastAlertTurns !== currentTurns || !alertText || el.dataset.lastAlertLevel !== level) {
    const randomIndex = Math.floor(Math.random() * msgs.length);
    alertText = msgs[randomIndex]!;
    el.dataset.lastAlertText = alertText;
    el.dataset.lastAlertTurns = currentTurns;
    el.dataset.lastAlertLevel = level;
  }
  
  return { text: alertText, level };
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  if (n === 0) return '0';
  return String(n);
}

// ── SVG Glass Component ──────────────────────────────────────────

const GLASS_SVG = `
<svg class="waterusedbyourai-glass" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="waterusedbyourai-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#00c7fc"/>
      <stop offset="1" stop-color="#007aff"/>
    </linearGradient>
    <clipPath id="waterusedbyourai-clip">
      <path d="M6 4 h28 l-3 40 a3 3 0 0 1 -3 3 h-16 a3 3 0 0 1 -3 -3 z"/>
    </clipPath>
  </defs>
  <!-- glass outline -->
  <path d="M6 4 h28 l-3 40 a3 3 0 0 1 -3 3 h-16 a3 3 0 0 1 -3 -3 z"
        stroke="rgba(255,255,255,0.22)" stroke-width="1.2" fill="rgba(255,255,255,0.01)"/>
  <!-- water body + wave + bubbles, clipped to glass -->
  <g clip-path="url(#waterusedbyourai-clip)">
    <rect class="waterusedbyourai-fill" x="2" y="44" width="36" height="0" fill="url(#waterusedbyourai-grad)"/>
    <g class="waterusedbyourai-wave-group">
      <path class="waterusedbyourai-wave-path"
            d="M-12 0 Q-6 -3 0 0 Q6 3 12 0 Q18 -3 24 0 Q30 3 36 0 Q42 -3 48 0 L48 6 L-12 6 Z"
            fill="rgba(0, 199, 252, 0.25)"/>
    </g>
    <circle class="waterusedbyourai-bub waterusedbyourai-bub-1" cx="13" cy="38" r="1.1" fill="rgba(255,255,255,0.2)"/>
    <circle class="waterusedbyourai-bub waterusedbyourai-bub-2" cx="27" cy="40" r="0.8" fill="rgba(255,255,255,0.15)"/>
    <circle class="waterusedbyourai-bub waterusedbyourai-bub-3" cx="19" cy="42" r="0.6" fill="rgba(255,255,255,0.12)"/>
  </g>
</svg>`;

const DROPS_HTML = `<div class="waterusedbyourai-drops">${Array.from({ length: 5 }, () => '<div class="waterusedbyourai-drop"></div>').join('')}</div>`;

// ── Value Counter Animation ─────────────────────────────────────

function animateValue(el: HTMLElement, start: number, end: number, duration: number) {
  let startTimestamp: number | null = null;
  const step = (timestamp: number) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    // Easing out exponential: 1 - 2^(-10 * progress)
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const current = start + (end - start) * easeProgress;
    
    let formatted = "";
    if (current === 0) {
      formatted = "0";
    } else if (current < 0.01) {
      formatted = "<0.01";
    } else if (current < 10) {
      formatted = current.toFixed(2);
    } else if (current < 100) {
      formatted = current.toFixed(1);
    } else {
      formatted = Math.round(current).toString();
    }
    el.textContent = formatted;
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// ── Build / Update ────────────────────────────────────────────────

let styleInjected = false;

function injectStyleOnce(root: Document | ShadowRoot): void {
  if (styleInjected) return;
  const style = document.createElement('style');
  style.textContent = CSS;
  (root instanceof Document ? root.head : root).appendChild(style);
  styleInjected = true;
}

export function buildCard(): HTMLElement {
  injectStyleOnce(document);
  const el = document.createElement('div');
  el.className = 'waterusedbyourai-card';
  el.setAttribute('data-state', 'empty');
  el.innerHTML = `
    ${DROPS_HTML}
    
    <!-- Empty / Loading State (No Layout Shifts) -->
    <div class="waterusedbyourai-empty-state">
      <div class="waterusedbyourai-empty-ico">🌱</div>
      <div class="waterusedbyourai-empty-lbl">Footprint calculations will appear as you chat</div>
    </div>

    <!-- Active Widget UI -->
    <div class="waterusedbyourai-active-state">
      <div class="waterusedbyourai-layout">
        <!-- Left Column: Primary Metrics -->
        <div class="waterusedbyourai-left-panel">
          <div class="waterusedbyourai-header">
            <div class="waterusedbyourai-glass-wrap">${GLASS_SVG}</div>
            <div class="waterusedbyourai-heading">
              <div class="waterusedbyourai-title">waterusedbyourAi</div>
              <div class="waterusedbyourai-sub" data-waterusedbyourai="sub">Estimated usage</div>
            </div>
          </div>
          <div class="waterusedbyourai-value-row">
            <span class="waterusedbyourai-val" data-waterusedbyourai="value">0</span><span class="waterusedbyourai-unit" data-waterusedbyourai="unit">mL</span>
          </div>
          <div class="waterusedbyourai-bar-container">
            <span class="waterusedbyourai-progress" data-waterusedbyourai="bar" style="width:0%"></span>
          </div>
        </div>

        <!-- Right Column: Micro-Metrics & System Alert -->
        <div class="waterusedbyourai-right-panel">
          <div class="waterusedbyourai-metrics">
            <div class="waterusedbyourai-chip">
              <div class="waterusedbyourai-chip-lbl">Energy</div>
              <div class="waterusedbyourai-chip-val" data-waterusedbyourai="energy">–</div>
            </div>
            <div class="waterusedbyourai-chip">
              <div class="waterusedbyourai-chip-lbl">Carbon</div>
              <div class="waterusedbyourai-chip-val" data-waterusedbyourai="co2">–</div>
            </div>
            <div class="waterusedbyourai-chip">
              <div class="waterusedbyourai-chip-lbl">Tokens</div>
              <div class="waterusedbyourai-chip-val" data-waterusedbyourai="tokens">–</div>
            </div>
          </div>
          <div class="waterusedbyourai-alert" data-waterusedbyourai="warn" data-level="chill">
            <span class="waterusedbyourai-alert-txt" data-waterusedbyourai="warn-text"></span>
          </div>
        </div>
      </div>

      <!-- Bottom Metadata/Options Footer -->
      <div class="waterusedbyourai-footer">
        <span class="waterusedbyourai-tag" data-waterusedbyourai="tag">estimate</span>
      </div>
    </div>`;

  return el;
}

function splitUnit(s: string): [number, string] {
  const m = s.match(/^(<?[\d.]+)\s*(\S+)$/);
  if (m) {
    const val = m[1]?.startsWith('<') ? 0.005 : parseFloat(m[1] || '0');
    return [val, m[2] || ''];
  }
  return [0, ''];
}

export function updateCard(el: HTMLElement, s: CardState): void {
  const q = <T extends Element>(sel: string) => el.querySelector<T>(sel)!;

  if (s.turns === 0) {
    el.setAttribute('data-state', 'empty');
    el.classList.remove('waterusedbyourai-animate-entry');
    return;
  }
  el.setAttribute('data-state', 'active');

  // ── Trigger Entry Slide Animation on New Turns ────────────────
  const lastTurns = parseInt(el.dataset.lastTurns || '0');
  if (s.turns > lastTurns) {
    el.classList.remove('waterusedbyourai-animate-entry');
    void el.offsetWidth; // force redraw/reflow
    el.classList.add('waterusedbyourai-animate-entry');
  }
  el.dataset.lastTurns = String(s.turns);

  // ── Headline Number & Dynamic Counting Animation ──────────────
  const waterStr = formatWater(s.waterMl);
  const [targetVal, targetUnit] = splitUnit(waterStr);
  const valEl = q<HTMLElement>('[data-waterusedbyourai="value"]');
  q<HTMLElement>('[data-waterusedbyourai="unit"]').textContent = targetUnit;

  const previousVal = parseFloat(el.dataset.lastNumVal || '0');
  const previousUnit = el.dataset.lastNumUnit || '';

  if (previousVal !== targetVal || previousUnit !== targetUnit) {
    // If the unit changed, animate from 0 to prevent visual jumps
    const startVal = previousUnit === targetUnit ? previousVal : 0;
    animateValue(valEl, startVal, targetVal, 750);
    el.dataset.lastNumVal = String(targetVal);
    el.dataset.lastNumUnit = targetUnit;
  }

  // ── Progress Bar & Water Level filling ────────────────────────
  const frac = waterFraction(s.waterMl, 250);
  const barWidth = Math.max(frac * 100, s.waterMl > 0 ? 3 : 0);
  q<HTMLElement>('[data-waterusedbyourai="bar"]').style.width = `${barWidth}%`;

  const fill = el.querySelector<SVGRectElement>('.waterusedbyourai-fill');
  const waveGroup = el.querySelector<SVGGElement>('.waterusedbyourai-wave-group');
  if (fill) {
    const h = 40 * Math.min(frac, 1);
    fill.setAttribute('height', String(h));
    fill.setAttribute('y', String(44 - h));
    if (waveGroup) {
      waveGroup.setAttribute('transform', `translate(0, ${44 - h - 2})`);
      waveGroup.style.opacity = h > 0 ? '1' : '0';
    }
  }

  // ── Metric Chips ──────────────────────────────────────────────
  q<HTMLElement>('[data-waterusedbyourai="energy"]').textContent = formatEnergy(s.energyWh);
  q<HTMLElement>('[data-waterusedbyourai="co2"]').textContent = formatCarbon(s.co2g);
  q<HTMLElement>('[data-waterusedbyourai="tokens"]').textContent = formatTokens(s.totalTokens);

  // ── Subtitle ──────────────────────────────────────────────────
  const comparison = waterComparison(s.waterMl);
  q<HTMLElement>('[data-waterusedbyourai="sub"]').textContent = `${comparison} · ${s.turns} turn${s.turns !== 1 ? 's' : ''}`;

  // ── Curated Random System Alerts ──────────────────────────────
  const warn = pickAlert(s.waterMl, s.turns, el);
  const warnEl = q<HTMLElement>('[data-waterusedbyourai="warn"]');
  const warnTextEl = q<HTMLElement>('[data-waterusedbyourai="warn-text"]');
  warnEl.setAttribute('data-level', warn.level);
  
  if (warnTextEl.textContent !== warn.text) {
    warnTextEl.textContent = warn.text;
  }

  // ── Footer Tag ────────────────────────────────────────────────
  const tag = q<HTMLElement>('[data-waterusedbyourai="tag"]');
  tag.textContent = s.exact ? 'estimate (exact tokens)' : 'estimate';
}
