/**
 * Token counting.
 *
 * Two modes:
 *   - EXACT: read `usage.input_tokens` / `usage.output_tokens` from an API
 *     response. Use {@link fromUsage}.
 *   - APPROX: no API access (e.g. scraping the claude.ai DOM). Estimate from
 *     text length. Use {@link approxTokens}.
 *
 * The approximation is deliberately simple and transparent. ~4 chars/token is
 * the widely-used rule of thumb for English; we nudge it for whitespace/code.
 */

/** Rough token count from a piece of text (~4 chars/token). */
export function approxTokens(text: string): number {
  if (!text) return 0;
  const chars = text.trim().length;
  if (chars === 0) return 0;
  // ~4 chars/token, but never less than 1 token for non-empty text.
  return Math.max(1, Math.round(chars / 4));
}

/** Shape of the usage block most LLM APIs return. */
export interface ApiUsage {
  input_tokens?: number;
  output_tokens?: number;
  prompt_tokens?: number; // OpenAI naming
  completion_tokens?: number; // OpenAI naming
}

/** Extract exact { inputTokens, outputTokens } from an API usage object. */
export function fromUsage(usage: ApiUsage): { inputTokens: number; outputTokens: number; exact: true } {
  const inputTokens = usage.input_tokens ?? usage.prompt_tokens ?? 0;
  const outputTokens = usage.output_tokens ?? usage.completion_tokens ?? 0;
  return { inputTokens, outputTokens, exact: true };
}
