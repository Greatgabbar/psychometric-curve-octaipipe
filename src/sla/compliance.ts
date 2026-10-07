// Decides whether a reading is inside the SLA envelope.
//
// We check the five rules directly with numbers. We do NOT test whether the
// dot is inside the drawn shape: the numbers are exact, simple and easy to test.
// Limits are inclusive: exactly 27.0 °C counts as inside.

import { humidityRatioGPerKg } from '../physics/psychrometrics';
import type { Envelope, Reading } from '../types';

export interface Violation {
  label: string; // what broke, e.g. "Humidity ratio"
  value: number; // the reading's value
  limit: number; // the limit it broke
  kind: 'min' | 'max';
  unit: string;
}

export interface ComplianceResult {
  isCompliant: boolean;
  humidityRatio: number; // computed g/kg, handy for the UI
  violations: Violation[]; // empty when compliant
}

export function checkCompliance(reading: Reading, envelope: Envelope): ComplianceResult {
  const humidityRatio = humidityRatioGPerKg(reading.dryBulbC, reading.rhPct);
  const violations: Violation[] = [];

  if (reading.dryBulbC < envelope.dryBulbMinC) {
    violations.push({ label: 'Temperature', value: reading.dryBulbC, limit: envelope.dryBulbMinC, kind: 'min', unit: '°C' });
  }
  if (reading.dryBulbC > envelope.dryBulbMaxC) {
    violations.push({ label: 'Temperature', value: reading.dryBulbC, limit: envelope.dryBulbMaxC, kind: 'max', unit: '°C' });
  }
  if (reading.rhPct < envelope.rhMinPct) {
    violations.push({ label: 'Relative humidity', value: reading.rhPct, limit: envelope.rhMinPct, kind: 'min', unit: '%' });
  }
  if (reading.rhPct > envelope.rhMaxPct) {
    violations.push({ label: 'Relative humidity', value: reading.rhPct, limit: envelope.rhMaxPct, kind: 'max', unit: '%' });
  }
  if (humidityRatio > envelope.humidityRatioMaxGPerKg) {
    violations.push({ label: 'Humidity ratio', value: humidityRatio, limit: envelope.humidityRatioMaxGPerKg, kind: 'max', unit: 'g/kg' });
  }

  return { isCompliant: violations.length === 0, humidityRatio, violations };
}
