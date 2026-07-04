/**
 * Premium Apple-inspired iOS/macOS Widget Stylesheet for waterusedbyourAi.
 *
 * Implements:
 *   - Glassmorphism: blur, saturation boost, thin borders, squircle corners
 *   - Apple typography: system-ui, negative letter-spacing, clean hierarchy
 *   - Two-column dashboard layout (flex-wrap for mobile responsiveness)
 *   - iOS-style Notification Warning Banner
 *   - Apple Accent Colors (systemBlue, systemCyan, systemOrange)
 *   - Floating micro-droplets & sloshing wave SVG animations
 */
export const CSS = `
/* ─── Keyframes & Animations ───────────────────────────────────── */
@keyframes waterusedbyourai-slide-up {
  0% { opacity: 0; transform: translateY(12px) scale(0.985); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes waterusedbyourai-float {
  0%   { transform: translateY(0) scale(1); opacity: 0; }
  12%  { opacity: 0.45; }
  88%  { opacity: 0.35; }
  100% { transform: translateY(-70px) scale(0.25); opacity: 0; }
}

@keyframes waterusedbyourai-wave {
  0%, 100% { transform: translateX(0); }
  50%      { transform: translateX(-8px); }
}

@keyframes waterusedbyourai-bub-rise {
  0%   { transform: translateY(0) scale(1); opacity: 0; }
  25%  { opacity: 0.3; }
  75%  { opacity: 0.2; }
  100% { transform: translateY(-22px) scale(0.3); opacity: 0; }
}

@keyframes waterusedbyourai-shimmer {
  0%, 100% { opacity: 0.65; }
  50%      { opacity: 0.95; }
}

/* ─── Card Container (Apple Widget Squircle) ────────────────────── */
.waterusedbyourai-card {
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  width: 100%;
  max-width: 650px;
  margin: 24px auto 16px;
  padding: 24px;
  border-radius: 20px;
  background: rgba(28, 28, 30, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 
    0 1px 0 rgba(255, 255, 255, 0.04) inset,
    0 8px 30px rgba(0, 0, 0, 0.35),
    0 20px 50px rgba(0, 0, 0, 0.5);
  color: #f5f5f7;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif;
  backdrop-filter: blur(24px) saturate(190%);
  -webkit-backdrop-filter: blur(24px) saturate(190%);
  will-change: transform, opacity;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}
.waterusedbyourai-card:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 
    0 1px 0 rgba(255, 255, 255, 0.06) inset,
    0 12px 36px rgba(0, 0, 0, 0.42),
    0 24px 60px rgba(0, 0, 0, 0.58);
}

.waterusedbyourai-animate-entry {
  animation: waterusedbyourai-slide-up 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* ─── State Management (Zero Layout Shift) ─────────────────────── */
.waterusedbyourai-card[data-state="empty"] .waterusedbyourai-active-state { display: none; }
.waterusedbyourai-card[data-state="empty"] .waterusedbyourai-empty-state { display: flex; }
.waterusedbyourai-card[data-state="active"] .waterusedbyourai-active-state { display: flex; flex-direction: column; }
.waterusedbyourai-card[data-state="active"] .waterusedbyourai-empty-state { display: none; }

/* ─── Empty / Loading State ────────────────────────────────────── */
.waterusedbyourai-empty-state {
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px 0;
  text-align: center;
  animation: waterusedbyourai-shimmer 2s ease-in-out infinite;
}
.waterusedbyourai-empty-ico {
  font-size: 24px;
}
.waterusedbyourai-empty-lbl {
  font-size: 13px;
  font-weight: 500;
  color: #8e8e93;
  letter-spacing: -0.01em;
}

/* ─── Active Layout ────────────────────────────────────────────── */
.waterusedbyourai-active-state {
  display: none;
}
.waterusedbyourai-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}
.waterusedbyourai-left-panel {
  flex: 1 1 230px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.waterusedbyourai-right-panel {
  flex: 1 1 290px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
}

/* ─── Floating Droplets ────────────────────────────────────────── */
.waterusedbyourai-drops {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}
.waterusedbyourai-drop {
  position: absolute;
  bottom: -10px;
  background: radial-gradient(circle at 35% 35%, rgba(125,211,252,0.6), rgba(0,122,255,0.25));
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  animation: waterusedbyourai-float linear infinite;
}
.waterusedbyourai-drop:nth-child(1) { left:  6%; animation-duration: 5.2s; animation-delay: 0s; width: 5px; height: 7px; }
.waterusedbyourai-drop:nth-child(2) { left: 24%; animation-duration: 6.0s; animation-delay: 1.5s; width: 4px; height: 5px; }
.waterusedbyourai-drop:nth-child(3) { left: 48%; animation-duration: 4.5s; animation-delay: 0.3s; width: 6px; height: 8px; }
.waterusedbyourai-drop:nth-child(4) { left: 72%; animation-duration: 6.3s; animation-delay: 2.2s; width: 4px; height: 6px; }
.waterusedbyourai-drop:nth-child(5) { left: 90%; animation-duration: 5.0s; animation-delay: 0.9s; width: 5px; height: 7px; }

/* ─── Left Column (Main Metrics) ───────────────────────────────── */
.waterusedbyourai-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.waterusedbyourai-glass-wrap {
  position: relative;
  flex: 0 0 auto;
}
.waterusedbyourai-glass {
  width: 40px;
  height: 48px;
  animation: thirsty-sway 5s ease-in-out infinite;
}
.waterusedbyourai-fill {
  transition: height 0.8s cubic-bezier(0.16, 1, 0.3, 1), y 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.waterusedbyourai-wave-group {
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.waterusedbyourai-wave-path {
  animation: waterusedbyourai-wave 3s ease-in-out infinite;
}
.waterusedbyourai-bub {
  animation: waterusedbyourai-bub-rise 3s ease-in-out infinite;
}
.waterusedbyourai-bub-2 { animation-delay: 1.1s; }
.waterusedbyourai-bub-3 { animation-delay: 2.2s; }

.waterusedbyourai-title {
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: -0.01em;
}
.waterusedbyourai-sub {
  font-size: 11px;
  color: #8e8e93;
  margin-top: 2px;
}

.waterusedbyourai-value-row {
  margin-top: 16px;
  display: flex;
  align-items: baseline;
  line-height: 1;
}
.waterusedbyourai-val {
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -0.035em;
  color: #ffffff;
}
.waterusedbyourai-unit {
  font-size: 16px;
  font-weight: 600;
  color: #8e8e93;
  margin-left: 4px;
  letter-spacing: -0.015em;
}

.waterusedbyourai-bar-container {
  margin-top: 16px;
  height: 5px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}
.waterusedbyourai-progress {
  display: block;
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, #007aff, #00c7fc);
  transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 0 10px rgba(0, 122, 255, 0.35);
}

/* ─── Right Column (Micro-Chips & iOS Alerts) ─────────────────── */
.waterusedbyourai-metrics {
  display: flex;
  gap: 8px;
}
.waterusedbyourai-chip {
  flex: 1 1 0;
  padding: 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.04);
  text-align: center;
  transition: background-color 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
}
.waterusedbyourai-chip:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.09);
  transform: scale(1.02);
}
.waterusedbyourai-chip-lbl {
  font-size: 9px;
  font-weight: 600;
  color: #8e8e93;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.waterusedbyourai-chip-val {
  font-size: 12.5px;
  font-weight: 650;
  color: #f5f5f7;
  margin-top: 4px;
  letter-spacing: -0.015em;
}

.waterusedbyourai-alert {
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 12px;
  line-height: 1.45;
  font-weight: 500;
  border: 1px solid transparent;
  transition: background-color 0.3s, border-color 0.3s, color 0.3s;
}
.waterusedbyourai-alert-txt {
  display: block;
}

/* Color Coding Themes matching system colors */
.waterusedbyourai-alert[data-level="chill"] {
  background: rgba(48, 209, 88, 0.08);
  border-color: rgba(48, 209, 88, 0.12);
  color: #30d158;
}
.waterusedbyourai-alert[data-level="mild"] {
  background: rgba(255, 214, 10, 0.08);
  border-color: rgba(255, 214, 10, 0.12);
  color: #ffd60a;
}
.waterusedbyourai-alert[data-level="warm"] {
  background: rgba(255, 159, 10, 0.09);
  border-color: rgba(255, 159, 10, 0.14);
  color: #ff9f0a;
}
.waterusedbyourai-alert[data-level="hot"] {
  background: rgba(255, 69, 58, 0.09);
  border-color: rgba(255, 69, 58, 0.14);
  color: #ff453a;
}

/* ─── Footer ───────────────────────────────────────────────────── */
.waterusedbyourai-footer {
  position: relative;
  z-index: 1;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
.waterusedbyourai-tag {
  font-size: 10px;
  font-weight: 500;
  color: #8e8e93;
}
`;
