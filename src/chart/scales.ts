import type { ChartPoint } from "../types";

// we Can change this later if we want
export const TEMP_MIN_C = 15;
export const TEMP_MAX_C = 40;
export const HUMIDITY_MIN = 0;
export const HUMIDITY_MAX = 20;

// This is a fucntion to calculate the scale of a point on chart
// use closure to get the scale value
export function makeLinearScale(
  dataMin: number,
  dataMax: number,
  pixelMin: number,
  pixelMax: number,
): (value: number) => number {
  return (value) => {
    const fraction = (value - dataMin) / (dataMax - dataMin);
    return pixelMin + fraction * (pixelMax - pixelMin);
  };
}

export interface Scales {
  x: (tempC: number) => number;
  y: (humidityRatio: number) => number;
  plotWidth: number;
  plotHeight: number;
}

export function createScales(plotWidth: number, plotHeight: number): Scales {
  return {
    x: makeLinearScale(TEMP_MIN_C, TEMP_MAX_C, 0, plotWidth),
    y: makeLinearScale(HUMIDITY_MIN, HUMIDITY_MAX, plotHeight, 0),
    plotWidth,
    plotHeight,
  };
}

// Turns a list of chart points into an SVG path string:
// (M = move the pen to x,y , L = draw a line to x,y).
export function pointsToSvgPath(points: ChartPoint[], scales: Scales): string {
  return points
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      const px = scales.x(point.tempC).toFixed(1);
      const py = scales.y(point.humidityRatio).toFixed(1);
      return `${command}${px},${py}`;
    })
    .join(" ");
}
