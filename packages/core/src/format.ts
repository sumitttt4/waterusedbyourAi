/**
 * Humanize an estimate for display.
 *
 * The honest numbers are tiny (fractions of a millilitre per short prompt), so
 * formatting has to gracefully span ~0.01 mL up to litres for long sessions.
 *
 * `satire` mode exists to reproduce the meme (the "46 L for a Hello" joke)
 * without lying about it — it applies a labelled multiplier so a product can
 * ship the funny version and the honest version from the same engine.
 */

export interface FormatOptions {
  /** multiply water by this for comedic effect; default 1 (honest). */
  satire?: number;
}

const GLASS_ML = 250; // a drinking glass
const BOTTLE_ML = 500; // a standard water bottle

/** Format a water amount (in mL) as a compact human string. */
export function formatWater(waterMl: number, opts: FormatOptions = {}): string {
  const ml = waterMl * (opts.satire ?? 1);
  if (ml >= 1000) {
    const l = ml / 1000;
    return `${round(l, l < 10 ? 1 : 0)} L`;
  }
  if (ml >= 1) return `${round(ml, ml < 10 ? 1 : 0)} mL`;
  if (ml >= 0.01) return `${round(ml, 2)} mL`;
  return '<0.01 mL';
}

/** A friendly comparison, e.g. "about a fifth of a glass". */
export function waterComparison(waterMl: number, opts: FormatOptions = {}): string {
  const ml = waterMl * (opts.satire ?? 1);
  if (ml >= BOTTLE_ML) return `~${round(ml / BOTTLE_ML, 1)} water bottles`;
  if (ml >= GLASS_ML) return `~${round(ml / GLASS_ML, 1)} glasses`;
  if (ml >= 1) return `~${round((ml / GLASS_ML) * 100, 0)}% of a glass`;
  return 'a few drops';
}

export function formatEnergy(energyWh: number): string {
  if (energyWh >= 1000) return `${round(energyWh / 1000, 2)} kWh`;
  if (energyWh >= 1) return `${round(energyWh, 2)} Wh`;
  return `${round(energyWh * 1000, 1)} mWh`;
}

export function formatCarbon(co2g: number): string {
  if (co2g >= 1000) return `${round(co2g / 1000, 2)} kg CO₂e`;
  if (co2g >= 0.1) return `${round(co2g, 2)} g CO₂e`;
  return `${round(co2g * 1000, 1)} mg CO₂e`;
}

/** Fraction 0..1 for a progress bar, relative to a reference amount (default 1 glass). */
export function waterFraction(waterMl: number, referenceMl = GLASS_ML, opts: FormatOptions = {}): number {
  const ml = waterMl * (opts.satire ?? 1);
  return Math.max(0, Math.min(1, ml / referenceMl));
}

function round(n: number, dp: number): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}
