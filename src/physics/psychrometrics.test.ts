import { describe, expect, it } from 'vitest';
import { humidityRatioGPerKg, saturationVapourPressureKPa } from './psychrometrics';

describe('saturationVapourPressureKPa', () => {
  it('matches the known value at 25 °C (about 3.16 kPa)', () => {
    expect(saturationVapourPressureKPa(25)).toBeCloseTo(3.16, 2);
  });
});

describe('humidityRatioGPerKg', () => {
  it('converts 25 °C at 60% RH to about 11.87 g/kg', () => {
    // If RH were not divided by 100, this would be absurdly large.
    expect(humidityRatioGPerKg(25, 60)).toBeCloseTo(11.87, 2);
  });

  it('gives zero water when RH is 0%', () => {
    expect(humidityRatioGPerKg(25, 0)).toBe(0);
  });

  it('holds more water at higher temperature for the same RH', () => {
    expect(humidityRatioGPerKg(30, 50)).toBeGreaterThan(humidityRatioGPerKg(20, 50));
  });

  it('puts the 80% RH curve at 14 g/kg near 22.9 °C (where the cap cuts the envelope)', () => {
    expect(humidityRatioGPerKg(22.9, 80)).toBeCloseTo(14, 1);
  });
});
