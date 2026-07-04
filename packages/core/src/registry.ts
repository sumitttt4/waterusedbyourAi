/**
 * Pluggable registries for providers and grids.
 *
 * This is the seam the user asked for: new repos / directories can register
 * their own {@link ProviderProfile} or {@link GridProfile} at import time and
 * every surface picks them up automatically. A plugin under `plugins/` just
 * calls `registerProvider(...)` / `registerGrid(...)`.
 */
import type { GridProfile, ModelProfile, ProviderProfile } from './types';
import { ANTHROPIC, OPENAI, GOOGLE } from './profiles/providers';
import { GRID_GLOBAL_AVG, GRID_US_AVG, GRID_LOW_CARBON } from './profiles/grids';

const providers = new Map<string, ProviderProfile>();
const grids = new Map<string, GridProfile>();

let defaultProviderId = 'anthropic';
let defaultGridId = 'global-avg';

export function registerProvider(profile: ProviderProfile): void {
  providers.set(profile.id, profile);
}

export function registerGrid(profile: GridProfile): void {
  grids.set(profile.id, profile);
}

export function setDefaults(opts: { providerId?: string; gridId?: string }): void {
  if (opts.providerId) defaultProviderId = opts.providerId;
  if (opts.gridId) defaultGridId = opts.gridId;
}

export function getProvider(id?: string): ProviderProfile {
  const p = providers.get(id ?? defaultProviderId);
  if (!p) throw new Error(`thirsty: unknown provider "${id ?? defaultProviderId}"`);
  return p;
}

export function getGrid(id?: string): GridProfile {
  const g = grids.get(id ?? defaultGridId);
  if (!g) throw new Error(`thirsty: unknown grid "${id ?? defaultGridId}"`);
  return g;
}

export function listProviders(): ProviderProfile[] {
  return [...providers.values()];
}

export function listGrids(): GridProfile[] {
  return [...grids.values()];
}

/** Resolve a model within a provider, falling back to the provider default. */
export function resolveModel(provider: ProviderProfile, modelId?: string): ModelProfile {
  if (modelId && provider.models[modelId]) return provider.models[modelId]!;
  return provider.models[provider.defaultModel]!;
}

/**
 * Best-effort model detection from a free-form UI string (e.g. the model name
 * shown in a chat header). Returns a `${providerId}:${modelId}` pair or null.
 */
export function detectModel(text: string): { providerId: string; modelId: string } | null {
  const haystack = text.toLowerCase();
  for (const provider of providers.values()) {
    for (const model of Object.values(provider.models)) {
      for (const needle of model.match ?? []) {
        if (haystack.includes(needle.toLowerCase())) {
          return { providerId: provider.id, modelId: model.id };
        }
      }
    }
  }
  return null;
}

// --- seed the built-in profiles -------------------------------------------
for (const p of [ANTHROPIC, OPENAI, GOOGLE]) registerProvider(p);
for (const g of [GRID_GLOBAL_AVG, GRID_US_AVG, GRID_LOW_CARBON]) registerGrid(g);
