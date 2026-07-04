import { describe, it, expect } from 'vitest';
import {
  formatWater,
  waterComparison,
  formatEnergy,
  formatCarbon,
  waterFraction,
} from '../src/index';

describe('formatWater', () => {
  it('spans drops to litres', () => {
    expect(formatWater(0.005)).toBe('<0.01 mL');
    expect(formatWater(0.03)).toBe('0.03 mL');
    expect(formatWater(3.4)).toBe('3.4 mL');
    expect(formatWater(46)).toBe('46 mL');
    expect(formatWater(1500)).toBe('1.5 L');
    expect(formatWater(46000)).toBe('46 L');
  });

  it('satire mode reproduces the meme without touching the real number', () => {
    // 0.01 mL honest, x4,600,000 for the "46 L" gag
    expect(formatWater(0.01, { satire: 4_600_000 })).toBe('46 L');
  });
});

describe('waterComparison', () => {
  it('describes small amounts as drops', () => {
    expect(waterComparison(0.03)).toBe('a few drops');
  });
  it('scales to glasses and bottles', () => {
    expect(waterComparison(125)).toBe('~50% of a glass');
    expect(waterComparison(500)).toBe('~1 water bottles');
  });
});

describe('formatEnergy', () => {
  it('spans mWh to kWh', () => {
    expect(formatEnergy(0.005)).toBe('5 mWh');
    expect(formatEnergy(2.5)).toBe('2.5 Wh');
    expect(formatEnergy(1500)).toBe('1.5 kWh');
  });
});

describe('formatCarbon', () => {
  it('spans mg to kg', () => {
    expect(formatCarbon(0.002)).toBe('2 mg CO₂e');
    expect(formatCarbon(3.4)).toBe('3.4 g CO₂e');
    expect(formatCarbon(2500)).toBe('2.5 kg CO₂e');
  });
});

describe('waterFraction', () => {
  it('clamps between 0 and 1', () => {
    expect(waterFraction(0)).toBe(0);
    expect(waterFraction(125)).toBeCloseTo(0.5, 5); // half a glass
    expect(waterFraction(9999)).toBe(1);
  });
});
