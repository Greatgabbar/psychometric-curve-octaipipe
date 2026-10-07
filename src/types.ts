// The shapes of the data we work with. They match conditions.json exactly.

export interface Reading {
  timestamp: string; // ISO time, e.g. "2026-08-24T08:00:00Z"
  dryBulbC: number; // air temperature in °C
  rhPct: number; // relative humidity in %, e.g. 45 means 45%
}

export interface Envelope {
  dryBulbMinC: number;
  dryBulbMaxC: number;
  rhMinPct: number;
  rhMaxPct: number;
  humidityRatioMaxGPerKg: number;
}

export interface Site {
  id: string;
  name: string;
  envelope: Envelope;
}

// A point on the chart, in chart units (not pixels):
// x = temperature in °C, y = humidity ratio in g/kg.
export interface ChartPoint {
  tempC: number;
  humidityRatio: number;
}
