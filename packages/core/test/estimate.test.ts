import { describe, it, expect } from 'vitest';
import {
  estimate,
  total,
  approxTokens,
  fromUsage,
  detectModel,
  setDefaults,
} from '../src/index';

describe('approxTokens', () => {
  it('returns 0 for empty text', () => {
    expect(approxTokens('')).toBe(0);
    expect(approxTokens('   ')).toBe(0);
  });

  it('never returns less than 1 for non-empty text', () => {
    expect(approxTokens('a')).toBe(1);
  });

  it('is roughly 4 chars per token', () => {
    expect(approxTokens('x'.repeat(400))).toBe(100);
  });
});

describe('estimate', () => {
  it('produces the honest, tiny number for a short "Hello" turn', () => {
    // "Hello" (~1 token in) + a short greeting reply (~8 tokens out), Sonnet.
    const e = estimate({ inputTokens: 1, outputTokens: 8, modelId: 'claude-sonnet' });
    // energy = (1*0.00012 + 8*0.0005) * pue(1.2) = 0.004944 Wh
    expect(e.energyWh).toBeCloseTo(0.004944, 6);
    // water = energy * (0.5 + 1.5) = 0.009888 mL  -> a few drops, NOT 46 L
    expect(e.waterMl).toBeCloseTo(0.009888, 6);
    expect(e.waterMl).toBeLessThan(1);
    expect(e.waterL).toBeCloseTo(e.waterMl / 1000, 12);
  });

  it('carbon scales with energy and grid intensity', () => {
    const e = estimate({ inputTokens: 100, outputTokens: 100, modelId: 'claude-sonnet' });
    // co2g = energyWh * carbonKgPerKwh
    expect(e.co2g).toBeCloseTo(e.energyWh * 0.45, 9);
  });

  it('opus costs more than haiku for identical tokens', () => {
    const haiku = estimate({ inputTokens: 500, outputTokens: 500, modelId: 'claude-haiku' });
    const opus = estimate({ inputTokens: 500, outputTokens: 500, modelId: 'claude-opus' });
    expect(opus.waterMl).toBeGreaterThan(haiku.waterMl);
  });

  it('falls back to the provider default model for unknown ids', () => {
    const known = estimate({ inputTokens: 10, outputTokens: 10, modelId: 'claude-sonnet' });
    const unknown = estimate({ inputTokens: 10, outputTokens: 10, modelId: 'does-not-exist' });
    expect(unknown.waterMl).toBe(known.waterMl); // default IS sonnet
    expect(unknown.basis.model.id).toBe('claude-sonnet');
  });

  it('handles missing/negative tokens gracefully', () => {
    const e = estimate({ inputTokens: -5, outputTokens: 0 });
    expect(e.waterMl).toBe(0);
    expect(e.energyWh).toBe(0);
  });

  it('respects a swapped grid profile', () => {
    const dirty = estimate({ inputTokens: 100, outputTokens: 100, gridId: 'global-avg' });
    const clean = estimate({ inputTokens: 100, outputTokens: 100, gridId: 'low-carbon' });
    expect(clean.co2g).toBeLessThan(dirty.co2g);
    expect(clean.waterMl).toBeLessThan(dirty.waterMl);
  });
});

describe('fromUsage', () => {
  it('reads Anthropic-style usage', () => {
    expect(fromUsage({ input_tokens: 12, output_tokens: 34 })).toEqual({
      inputTokens: 12,
      outputTokens: 34,
      exact: true,
    });
  });

  it('reads OpenAI-style usage', () => {
    expect(fromUsage({ prompt_tokens: 5, completion_tokens: 7 })).toEqual({
      inputTokens: 5,
      outputTokens: 7,
      exact: true,
    });
  });
});

describe('total', () => {
  it('sums a conversation and stays exact only if every turn was exact', () => {
    const a = estimate({ inputTokens: 10, outputTokens: 10, exact: true });
    const b = estimate({ inputTokens: 20, outputTokens: 20, exact: false });
    const t = total([a, b]);
    expect(t.waterMl).toBeCloseTo(a.waterMl + b.waterMl, 9);
    expect(t.exact).toBe(false);
  });
});

describe('detectModel', () => {
  it('finds a model from a UI string', () => {
    expect(detectModel('Claude Opus 4.8')).toEqual({ providerId: 'anthropic', modelId: 'claude-opus' });
    expect(detectModel('Using GPT-4o')).toEqual({ providerId: 'openai', modelId: 'gpt-4-class' });
    expect(detectModel('Gemini 2.5 Flash')).toEqual({ providerId: 'google', modelId: 'gemini-flash' });
  });

  it('returns null when nothing matches', () => {
    expect(detectModel('some random text')).toBeNull();
  });
});

describe('setDefaults', () => {
  it('changes the default grid used when none is specified', () => {
    const before = estimate({ inputTokens: 100, outputTokens: 100 });
    setDefaults({ gridId: 'low-carbon' });
    const after = estimate({ inputTokens: 100, outputTokens: 100 });
    setDefaults({ gridId: 'global-avg' }); // restore for other tests
    expect(after.co2g).toBeLessThan(before.co2g);
  });
});
