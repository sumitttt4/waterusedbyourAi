import { describe, it, expect } from 'vitest';
import { footprintForResponse, FootprintMeter } from '../src/index';

describe('footprintForResponse', () => {
  it('reads exact usage from an Anthropic-style response', () => {
    const e = footprintForResponse({ model: 'claude-sonnet-4', usage: { input_tokens: 500, output_tokens: 500 } });
    expect(e.exact).toBe(true);
    expect(e.waterMl).toBeGreaterThan(0);
    expect(e.basis.model.id).toBe('claude-sonnet');
  });

  it('reads exact usage from an OpenAI-style response', () => {
    const e = footprintForResponse({ model: 'gpt-4o', usage: { prompt_tokens: 100, completion_tokens: 100 } });
    expect(e.basis.model.id).toBe('gpt-4-class');
  });
});

describe('FootprintMeter', () => {
  it('accumulates across requests', () => {
    const meter = new FootprintMeter();
    meter.record({ model: 'claude-opus-4', usage: { input_tokens: 100, output_tokens: 100 } });
    meter.record({ model: 'claude-opus-4', usage: { input_tokens: 100, output_tokens: 100 } });
    const snap = meter.snapshot();
    expect(snap.requests).toBe(2);
    expect(snap.waterMl).toBeGreaterThan(0);
  });
});
