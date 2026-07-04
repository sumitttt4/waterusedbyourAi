import { describe, it, expect } from 'vitest';
import { getProvider, estimate, detectModel } from '@waterusedbyourai/core';
import '../src/index'; // importing the plugin must self-register the provider

describe('provider-xai plugin', () => {
  it('registers the xai provider on import', () => {
    expect(getProvider('xai').label).toBe('xAI Grok');
  });

  it('is now estimable end-to-end', () => {
    const e = estimate({ inputTokens: 100, outputTokens: 100, providerId: 'xai', modelId: 'grok' });
    expect(e.waterMl).toBeGreaterThan(0);
    expect(e.basis.model.id).toBe('grok');
  });

  it('is discoverable via detectModel', () => {
    expect(detectModel('powered by Grok')).toEqual({ providerId: 'xai', modelId: 'grok' });
  });
});
