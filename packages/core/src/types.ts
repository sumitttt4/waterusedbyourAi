/**
 * Core domain types for the thirsty footprint engine.
 *
 * The whole platform is built around three small contracts:
 *   - {@link ModelProfile}    how much energy a model burns per token
 *   - {@link GridProfile}     how energy turns into water + CO2 (datacenter + grid)
 *   - {@link PromptEvent}     a single request/response worth of tokens
 *
 * Everything downstream (browser card, CLI statusline, API wrapper) consumes a
 * {@link FootprintEstimate}. Add a new provider or a new grid by registering a
 * profile — no engine changes required. That is the extension point.
 */

/** Energy characteristics of a single model. All numbers are Watt-hours per token. */
export interface ModelProfile {
  /** stable id, e.g. "claude-sonnet" */
  id: string;
  /** human label, e.g. "Claude Sonnet" */
  label: string;
  /**
   * Energy to process one *input* (prefill) token. Prefill is cheap per token
   * because it is one batched forward pass over the whole prompt.
   */
  whPerInputToken: number;
  /**
   * Energy to generate one *output* token. Decoding is autoregressive — one
   * forward pass per token — so output usually dominates the bill.
   */
  whPerOutputToken: number;
  /** substrings that identify this model in a UI string (for auto-detection). */
  match?: string[];
}

/** A provider groups models and names a default. Register one per AI vendor. */
export interface ProviderProfile {
  id: string;
  label: string;
  /** keyed by ModelProfile.id */
  models: Record<string, ModelProfile>;
  /** id of the model to assume when detection fails */
  defaultModel: string;
}

/**
 * How electricity becomes water and carbon. This is the part that carries the
 * biggest error bars — it depends on datacenter location, cooling type, grid
 * mix, and season — so it lives in its own swappable profile.
 */
export interface GridProfile {
  id: string;
  label: string;
  /** Power Usage Effectiveness: facility overhead multiplier (~1.1 modern). */
  pue: number;
  /** On-site cooling water, litres per kWh (a.k.a. WUE). */
  onSiteWaterLPerKwh: number;
  /** Off-site water to *generate* the electricity, litres per kWh. */
  offSiteWaterLPerKwh: number;
  /** Grid carbon intensity, kg CO2e per kWh. */
  carbonKgPerKwh: number;
}

/** One request/response worth of usage. Tokens may be exact (API) or estimated (DOM). */
export interface PromptEvent {
  inputTokens: number;
  outputTokens: number;
  /** ModelProfile.id; falls back to the provider default when omitted. */
  modelId?: string;
  /** ProviderProfile.id; defaults to "anthropic". */
  providerId?: string;
  /** GridProfile.id; defaults to the registered default grid. */
  gridId?: string;
  /** true when tokens were counted exactly (e.g. from an API usage field). */
  exact?: boolean;
}

/** The single output every surface renders. */
export interface FootprintEstimate {
  /** litres of water */
  waterL: number;
  /** millilitres of water (convenience mirror of waterL) */
  waterMl: number;
  /** energy in Watt-hours */
  energyWh: number;
  /** carbon in grams CO2e */
  co2g: number;
  /** whether the underlying token counts were exact */
  exact: boolean;
  /** the resolved profiles used, for transparency / tooltips */
  basis: {
    model: ModelProfile;
    grid: GridProfile;
    inputTokens: number;
    outputTokens: number;
  };
}
