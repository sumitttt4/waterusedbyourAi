# @waterusedbyourai/browser-extension

Manifest V3 extension that injects a live water/energy/CO2 footprint meter into ChatGPT, Claude, Google Gemini, and Perplexity conversations.

## Build and Load

1. Build the extension package:
   ```bash
   npm run build --workspace @waterusedbyourai/browser-extension
   ```
   This compiles the content script to `dist/content.js`.

2. Load the unpacked extension in Chrome or Edge:
   - Navigate to `chrome://extensions`.
   - Enable Developer mode.
   - Click "Load unpacked" and select this `surfaces/browser-extension/` directory.

## Testing and Verification

To preview the widget without logging into an AI provider chat:

1. Build the package:
   ```bash
   npm run build --workspace @waterusedbyourai/browser-extension
   ```

2. Serve the demo folder using a local web server:
   ```bash
   npx serve surfaces/browser-extension -l 3456
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3456/demo.html
   ```
   This is a static mock page where you can inspect the widget layout and animations.

## How it Works

The content script runs a debounced `MutationObserver` on `document.body` to observe conversation changes. When a message is sent or generated:
1. It scrapes user messages and completed assistant responses.
2. It translates the raw text into approximate token counts.
3. It calls the `@waterusedbyourai/core` library to estimate water and energy consumption.
4. It inserts the squircle widget inline directly after the latest completed assistant message.

All domain-specific query selectors and streaming status checks reside in the selector map at the top of `src/content.ts`.
