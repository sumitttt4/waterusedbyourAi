/**
 * Built-in provider coefficient packs.
 *
 * IMPORTANT: every number here is a public, order-of-magnitude ESTIMATE, not a
 * measurement. Vendors do not publish per-token energy. These are triangulated
 * from published per-prompt figures and reasonable token counts:
 *
 *   - Google (Aug 2025): median Gemini text prompt ~0.24 Wh, ~0.26 mL water.
 *   - OpenAI (Sam Altman, 2025): avg ChatGPT query ~0.34 Wh, ~0.32 mL water.
 *   - UC Riverside "Making AI Less Thirsty" (Ren et al.): the water methodology.
 *
 * Output tokens are weighted heavier than input because decoding is
 * autoregressive (one forward pass per generated token). Treat the split as a
 * modelling choice, easily overridden by registering your own provider.
 */
import type { ProviderProfile } from '../types';

export const ANTHROPIC: ProviderProfile = {
  id: 'anthropic',
  label: 'Anthropic Claude',
  defaultModel: 'claude-sonnet',
  models: {
    'claude-haiku': {
      id: 'claude-haiku',
      label: 'Claude Haiku',
      whPerInputToken: 0.00006,
      whPerOutputToken: 0.00025,
      match: ['haiku'],
    },
    'claude-sonnet': {
      id: 'claude-sonnet',
      label: 'Claude Sonnet',
      whPerInputToken: 0.00012,
      whPerOutputToken: 0.0005,
      match: ['sonnet'],
    },
    'claude-opus': {
      id: 'claude-opus',
      label: 'Claude Opus',
      whPerInputToken: 0.0003,
      whPerOutputToken: 0.0012,
      match: ['opus'],
    },
  },
};

export const OPENAI: ProviderProfile = {
  id: 'openai',
  label: 'OpenAI',
  defaultModel: 'gpt-4-class',
  models: {
    'gpt-mini': {
      id: 'gpt-mini',
      label: 'GPT (mini)',
      whPerInputToken: 0.00006,
      whPerOutputToken: 0.00025,
      // NB: no bare 'mini' — it matches inside "ge-mini". Keep tokens specific.
      match: ['gpt-4o-mini', 'gpt-5-mini', 'gpt-mini', 'o1-mini', 'o3-mini'],
    },
    'gpt-4-class': {
      id: 'gpt-4-class',
      label: 'GPT (4/5 class)',
      whPerInputToken: 0.00012,
      whPerOutputToken: 0.0005,
      match: ['gpt-4', 'gpt-5', 'gpt-4o', 'chatgpt'],
    },
  },
};

export const GOOGLE: ProviderProfile = {
  id: 'google',
  label: 'Google Gemini',
  defaultModel: 'gemini-pro',
  models: {
    'gemini-flash': {
      id: 'gemini-flash',
      label: 'Gemini Flash',
      whPerInputToken: 0.00005,
      whPerOutputToken: 0.0002,
      match: ['flash'],
    },
    'gemini-pro': {
      id: 'gemini-pro',
      label: 'Gemini Pro',
      whPerInputToken: 0.0001,
      whPerOutputToken: 0.00045,
      match: ['gemini', 'gemini pro'],
    },
  },
};
