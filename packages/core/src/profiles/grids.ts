/**
 * Built-in grid / datacenter coefficient packs.
 *
 * Water has two parts:
 *   - on-site:  evaporative cooling at the datacenter (WUE, litres/kWh)
 *   - off-site: water consumed generating the electricity (thermoelectric, litres/kWh)
 *
 * Combined "scope 1 + 2" water lands around 1.5-2.5 L/kWh in most public
 * analyses; carbon and water both swing widely by region and season, which is
 * exactly why this is a swappable profile rather than a constant.
 */
import type { GridProfile } from '../types';

export const GRID_GLOBAL_AVG: GridProfile = {
  id: 'global-avg',
  label: 'Global average',
  pue: 1.2,
  onSiteWaterLPerKwh: 0.5,
  offSiteWaterLPerKwh: 1.5,
  carbonKgPerKwh: 0.45,
};

export const GRID_US_AVG: GridProfile = {
  id: 'us-avg',
  label: 'US average',
  pue: 1.15,
  onSiteWaterLPerKwh: 0.55,
  offSiteWaterLPerKwh: 1.5,
  carbonKgPerKwh: 0.37,
};

/** Hydro/nuclear-heavy region: low carbon but still meaningful cooling water. */
export const GRID_LOW_CARBON: GridProfile = {
  id: 'low-carbon',
  label: 'Low-carbon region',
  pue: 1.1,
  onSiteWaterLPerKwh: 0.4,
  offSiteWaterLPerKwh: 0.9,
  carbonKgPerKwh: 0.05,
};
