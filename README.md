# waterusedbyourAi

waterusedbyourAi is an open-source footprint tracker that calculates the water, energy, and carbon footprint behind your AI conversations. It runs entirely locally in your browser to maintain total privacy.

![waterusedbyourAi chat widget preview](docs/media/widget-preview.png)

## Overview

Large language models require high-density compute clusters. These clusters consume electricity and require substantial cooling (direct evaporation or thermoelectric heat exchange). waterusedbyourAi models this footprint dynamically:
1. It parses the conversation history on AI chat interfaces to compute token counts.
2. It translates tokens into energy usage (Watt-hours) based on target model profiles.
3. It estimates the water (milliliters) and carbon (milligrams of CO2 equivalent) footprint using regional grid power mixes and average cooling overheads.
4. It displays these metrics inline in a clean widget below the assistant's reply.

## Features

- Multi-Site Compatibility: Runs seamlessly on ChatGPT, Claude, Google Gemini, and Perplexity.
- Apple Widget Design: A side-by-side widget utilizing glassmorphism styling, clean San Francisco typography, and iOS system color-coding.
- 60fps Physics & Inertia: Animated water glass SVG filling level and bubbles, along with smooth exponential counter increments.
- Accessible Banners: Status notifications that summarize chat footprint intensity.
- Complete Privacy: Runs 100% locally in the browser with zero external network requests.

## How to Install and Use

Depending on your background, choose one of the two setup paths below:

### Option A: For Users (Quick Setup - No Code Required)

If you are not a developer and want to run the extension immediately:

1. Go to the "Releases" section on the right side of this GitHub repository page.
2. Download the latest pre-compiled `waterusedbyourAi.zip` file.
3. Extract the downloaded ZIP file to a folder on your computer.
4. Open your browser and navigate to the Extensions page:
   - For Google Chrome: chrome://extensions
   - For Microsoft Edge: edge://extensions
5. Enable Developer Mode (using the toggle switch in the top-right corner).
6. Click the "Load unpacked" button in the top-left corner.
7. Select the folder where you extracted the ZIP file.
8. Open ChatGPT, Claude, Gemini, or Perplexity and start a conversation. The widget will display under completed replies.

### Option B: For Developers (Compile from Source)

If you are a developer and want to modify or compile the code:

1. Clone the repository:
   ```bash
   git clone https://github.com/sumitttt4/waterusedbyourAi.git
   cd waterusedbyourAi
   ```

2. Install the dependencies and compile the workspace:
   ```bash
   npm install
   ```

3. Build the browser extension:
   ```bash
   npm run build:ext
   ```
   This generates the compiled bundle in `surfaces/browser-extension/dist/content.js`.

4. Load the unpacked extension:
   - Open your browser's Extensions page (`chrome://extensions` or `edge://extensions`).
   - Enable Developer Mode.
   - Click "Load unpacked" and select the `surfaces/browser-extension` subdirectory in this project folder.

## Project Architecture

The project is structured as a monorepo using npm workspaces:

- packages/core: The shared footprint estimation engine. It handles token-to-energy calculations, grid mixes, and provider profiles.
- surfaces/browser-extension: Manifest V3 content script and styles that inject the widget inline on AI chat domains.
- surfaces/cli: A CLI integration script for terminal toolkits (such as Claude Code) to output session footprints.
- surfaces/api-wrapper: A node helper to analyze LLM API response usage payloads programmatically.
- plugins/: Pluggable providers (such as plugins/provider-xai) that register model coefficients dynamically without touching the core engine.

## Development and Verification

Run the test suite across all workspaces:
```bash
npm test
```

Perform typescript compilation validation:
```bash
npm run typecheck
```

## License

MIT License. See the LICENSE file for details.
