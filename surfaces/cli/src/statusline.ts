/**
 * Claude Code statusline integration.
 *
 * Claude Code invokes a statusLine command once per render and pipes a JSON
 * payload on stdin (model, workspace, cost, and — crucially — `transcript_path`).
 * We sum the *exact* token usage from the transcript JSONL, run @thirsty/core,
 * and print a compact "💧 … · ⚡ …" string that Claude Code shows in the footer.
 *
 * Because we read real usage numbers, this integration is EXACT, not a guess —
 * that is why the CLI surface is the most accurate of the three.
 *
 * Wire it up in ~/.claude/settings.json:
 *   "statusLine": { "type": "command", "command": "node /abs/path/to/dist/statusline.mjs" }
 */
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { estimate, detectModel, formatWater, formatEnergy, formatCarbon } from '@waterusedbyourai/core';

interface StatusInput {
  model?: { id?: string; display_name?: string };
  transcript_path?: string;
  session_id?: string;
}

interface UsageBlock {
  input_tokens?: number;
  output_tokens?: number;
  cache_read_input_tokens?: number;
  cache_creation_input_tokens?: number;
}

/**
 * Sum token usage across every assistant message in a Claude Code transcript.
 * Pure + exported so it can be unit-tested without a live session.
 */
export function sumTranscriptUsage(jsonl: string): { inputTokens: number; outputTokens: number } {
  let inputTokens = 0;
  let outputTokens = 0;
  for (const line of jsonl.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let obj: unknown;
    try {
      obj = JSON.parse(trimmed);
    } catch {
      continue; // skip any non-JSON line
    }
    const usage = extractUsage(obj);
    if (!usage) continue;
    inputTokens +=
      (usage.input_tokens ?? 0) +
      (usage.cache_read_input_tokens ?? 0) +
      (usage.cache_creation_input_tokens ?? 0);
    outputTokens += usage.output_tokens ?? 0;
  }
  return { inputTokens, outputTokens };
}

function extractUsage(obj: unknown): UsageBlock | null {
  if (!obj || typeof obj !== 'object') return null;
  const rec = obj as Record<string, unknown>;
  const message = rec.message as Record<string, unknown> | undefined;
  const usage = (message?.usage ?? rec.usage) as UsageBlock | undefined;
  return usage ?? null;
}

function readStdin(): string {
  try {
    return readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

export function render(input: StatusInput): string {
  const label = input.model?.display_name ?? input.model?.id ?? '';
  const modelId = detectModel(label)?.modelId;

  let tokens = { inputTokens: 0, outputTokens: 0 };
  if (input.transcript_path) {
    try {
      tokens = sumTranscriptUsage(readFileSync(input.transcript_path, 'utf8'));
    } catch {
      /* transcript unreadable — fall through with zeros */
    }
  }

  const e = estimate({ ...tokens, modelId, exact: true });
  return `💧 ${formatWater(e.waterMl)} · ⚡ ${formatEnergy(e.energyWh)} · 🌿 ${formatCarbon(e.co2g)}`;
}

function main(): void {
  let input: StatusInput = {};
  try {
    input = JSON.parse(readStdin());
  } catch {
    /* no/invalid payload */
  }
  process.stdout.write(render(input));
}

// Run only when executed directly, not when imported by tests.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
