// Builds the shapes we draw, in chart units (°C and g/kg).
// Pixels come later, via the scales.

import { humidityRatioGPerKg } from "../physics/psychrometrics";
import type { ChartPoint, Envelope } from "../types";
import { TEMP_MAX_C, TEMP_MIN_C } from "./scales";

const STEP_C = 0.1;

export function temperaturesBetween(minC: number, maxC: number): number[] {
  const stepCount = Math.round((maxC - minC) / STEP_C);
  const temps: number[] = [];
  for (let i = 0; i <= stepCount; i++) {
    temps.push(minC + (i * (maxC - minC)) / stepCount);
  }
  return temps;
}

// to get the rH curve data points
export function rhCurvePoints(rhPct: number): ChartPoint[] {
  return temperaturesBetween(TEMP_MIN_C, TEMP_MAX_C).map((tempC) => ({
    tempC,
    humidityRatio: humidityRatioGPerKg(tempC, rhPct),
  }));
}

// to get the SLA envelope outline data points
export function envelopeOutline(envelope: Envelope): ChartPoint[] {
  const temps = temperaturesBetween(envelope.dryBulbMinC, envelope.dryBulbMaxC);

  const floor = temps.map((tempC) => ({
    tempC,
    humidityRatio: humidityRatioGPerKg(tempC, envelope.rhMinPct),
  }));

  const roof = [...temps].reverse().map((tempC) => ({
    tempC,
    humidityRatio: Math.min(
      humidityRatioGPerKg(tempC, envelope.rhMaxPct),
      envelope.humidityRatioMaxGPerKg,
    ),
  }));

  return [...floor, ...roof];
}
