import { describe, it, expect } from 'vitest';
import { sumTranscriptUsage, render } from '../src/statusline';

const TRANSCRIPT = [
  JSON.stringify({ type: 'user', message: { role: 'user', content: 'hi' } }),
  JSON.stringify({
    type: 'assistant',
    message: { role: 'assistant', usage: { input_tokens: 100, output_tokens: 40, cache_read_input_tokens: 10 } },
  }),
  '', // blank line
  'not json at all', // garbage line must be skipped
  JSON.stringify({
    type: 'assistant',
    message: { role: 'assistant', usage: { input_tokens: 200, output_tokens: 60 } },
  }),
].join('\n');

describe('sumTranscriptUsage', () => {
  it('sums exact usage across assistant messages, incl. cache tokens', () => {
    expect(sumTranscriptUsage(TRANSCRIPT)).toEqual({ inputTokens: 310, outputTokens: 100 });
  });

  it('is resilient to empty / malformed input', () => {
    expect(sumTranscriptUsage('')).toEqual({ inputTokens: 0, outputTokens: 0 });
    expect(sumTranscriptUsage('garbage\n{bad json')).toEqual({ inputTokens: 0, outputTokens: 0 });
  });
});

describe('render', () => {
  it('produces a compact statusline string when no transcript is available', () => {
    const out = render({ model: { display_name: 'Claude Sonnet 4.6' } });
    expect(out).toMatch(/💧/);
    expect(out).toMatch(/⚡/);
    expect(out).toMatch(/🌿/);
  });
});
