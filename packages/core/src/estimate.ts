/**
 * The estimator. One pure function, no I/O, no DOM — safe to run anywhere
 * (browser content script, Node CLI, service worker).
 *
 *   tokens --(model Wh/token)--> energy (Wh, x PUE)
 *   energy --(grid L/kWh)------> water (mL)
 *   energy --(grid kgCO2/kWh)--> carbon (g)
 *
 * Unit trick: because 1 Wh = 1/1000 kWh and 1 L = 1000 mL,
 *   waterMl = energyWh * waterLPerKwh   (the /1000 and *1000 cancel)
 *   co2g    = energyWh * carbonKgPerKwh (same cancellation)
 */
import type { FootprintEstimate, PromptEvent } from './types';
import { getGrid, getProvider, resolveModel } from './registry';

export function estimate(event: PromptEvent): FootprintEstimate {
  const inputTokens = Math.max(0, event.inputTokens || 0);
  const outputTokens = Math.max(0, event.outputTokens || 0);

  const provider = getProvider(event.providerId);
  const model = resolveModel(provider, event.modelId);
  const grid = getGrid(event.gridId);

  // 1. energy at the chips, then scale up for facility overhead (PUE)
  const chipWh = inputTokens * model.whPerInputToken + outputTokens * model.whPerOutputToken;
  const energyWh = chipWh * grid.pue;

  // 2. water = energy * (on-site cooling + off-site generation) — see unit trick
  const waterLPerKwh = grid.onSiteWaterLPerKwh + grid.offSiteWaterLPerKwh;
  const waterMl = energyWh * waterLPerKwh;

  // 3. carbon
  const co2g = energyWh * grid.carbonKgPerKwh;

  return {
    energyWh,
    waterMl,
    waterL: waterMl / 1000,
    co2g,
    exact: Boolean(event.exact),
    basis: { model, grid, inputTokens, outputTokens },
  };
}

/** Sum a batch of estimates (e.g. a whole conversation). */
export function total(estimates: FootprintEstimate[]): Pick<FootprintEstimate, 'waterL' | 'waterMl' | 'energyWh' | 'co2g' | 'exact'> {
  return estimates.reduce<Pick<FootprintEstimate, 'waterL' | 'waterMl' | 'energyWh' | 'co2g' | 'exact'>>(
    (acc, e) => ({
      waterMl: acc.waterMl + e.waterMl,
      waterL: acc.waterL + e.waterL,
      energyWh: acc.energyWh + e.energyWh,
      co2g: acc.co2g + e.co2g,
      exact: acc.exact && e.exact,
    }),
    { waterMl: 0, waterL: 0, energyWh: 0, co2g: 0, exact: true },
  );
}
