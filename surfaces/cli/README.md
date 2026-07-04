# @waterusedbyourai/cli — Claude Code integration

Outputs the water, energy, and CO2 footprint of the current Claude Code session, calculated using exact token counts in the session transcript.

```
0.4 mL water · 210 mWh energy · 95 mg CO2e
```

## Build

```bash
npm run build --workspace @waterusedbyourai/cli
# -> surfaces/cli/dist/statusline.mjs (self-contained, core bundled in)
```

## Setup - Option A: statusline

Add this configuration to your ~/.claude/settings.json file:

```json
{
  "statusLine": {
    "type": "command",
    "command": "node /ABS/PATH/waterusedbyourAi/surfaces/cli/dist/statusline.mjs"
  }
}
```

Claude Code pipes a JSON payload containing the transcript path to the command on every render. The script sums the usage metrics across the transcript and prints the footprint values.

## Setup - Option B: hook (per-turn notification)

The script can also run as a Stop hook if you prefer to see the footprint output only when a turn completes. Add this to your ~/.claude/settings.json file:

```json
{
  "hooks": {
    "Stop": [
      { "hooks": [ { "type": "command", "command": "node /ABS/PATH/waterusedbyourAi/surfaces/cli/dist/statusline.mjs" } ] }
    ]
  }
}
```

## Accuracy

Unlike the browser extension which estimates tokens from text length, the CLI surface reads the transcript's exact token usage values directly.
