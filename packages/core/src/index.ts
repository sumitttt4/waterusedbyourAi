/**
 * @thirsty/core — the estimation engine every surface shares.
 *
 * Typical use:
 *   import { estimate, approxTokens, formatWater } from '@thirsty/core';
 *   const e = estimate({ inputTokens: approxTokens(prompt), outputTokens: approxTokens(reply) });
 *   formatWater(e.waterMl); // "0.03 mL"
 *
 * Extend it:
 *   import { registerProvider, registerGrid } from '@thirsty/core';
 *   registerProvider(myProviderProfile); // a plugin under plugins/ does this
 */
export * from './types';
export * from './estimate';
export * from './tokens';
export * from './format';
export {
  registerProvider,
  registerGrid,
  setDefaults,
  getProvider,
  getGrid,
  listProviders,
  listGrids,
  detectModel,
  resolveModel,
} from './registry';
