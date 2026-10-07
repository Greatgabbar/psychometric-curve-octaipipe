import { describe, expect, it } from 'vitest';
import { checkCompliance } from './compliance';
import type { Envelope } from '../types';

const envelope: Envelope = {
  dryBulbMinC: 18,
  dryBulbMaxC: 27,
  rhMinPct: 20,
  rhMaxPct: 80,
  humidityRatioMaxGPerKg: 14,
};

const reading = (dryBulbC: number, rhPct: number) => ({ timestamp: 't', dryBulbC, rhPct });
const brokenRules = (dryBulbC: number, rhPct: number) =>
  checkCompliance(reading(dryBulbC, rhPct), envelope).violations.map((v) => v.label);

describe('checkCompliance', () => {
  it('passes a comfortable reading', () => {
    expect(checkCompliance(reading(24.2, 68), envelope).isCompliant).toBe(true);
  });

  it('fails on humidity ratio alone, even when temperature and RH are within limits', () => {
    // 24.9 °C / 74% looks fine on the two simple rules, but holds ~14.6 g/kg.
    expect(brokenRules(24.9, 74)).toEqual(['Humidity ratio']);
    expect(brokenRules(26.5, 70)).toEqual(['Humidity ratio']);
  });

  it('reports every broken rule, not just the first', () => {
    expect(brokenRules(27.5, 78)).toEqual(['Temperature', 'Humidity ratio']);
  });

  it('treats limits as inclusive', () => {
    expect(brokenRules(27, 40)).toEqual([]);
    expect(brokenRules(18, 20)).toEqual([]);
  });

  it('catches readings below the minimums', () => {
    expect(brokenRules(17, 15)).toEqual(['Temperature', 'Relative humidity']);
  });
});
