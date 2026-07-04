/**
 * Example plugin: add xAI Grok as an estimable provider.
 *
 * Importing this module once (from any surface entry point) self-registers the
 * provider. That's the whole extension mechanism — no core changes needed.
 */
import { registerProvider, type ProviderProfile } from '@waterusedbyourai/core';

export const XAI: ProviderProfile = {
  id: 'xai',
  label: 'xAI Grok',
  defaultModel: 'grok',
  models: {
    'grok-mini': {
      id: 'grok-mini',
      label: 'Grok (mini)',
      whPerInputToken: 0.00006,
      whPerOutputToken: 0.00025,
      match: ['grok-mini', 'grok mini'],
    },
    grok: {
      id: 'grok',
      label: 'Grok',
      whPerInputToken: 0.00013,
      whPerOutputToken: 0.00055,
      match: ['grok'],
    },
  },
};

registerProvider(XAI);
