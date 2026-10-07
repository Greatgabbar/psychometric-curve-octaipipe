import { describe, expect, it } from "vitest";
import { envelopeOutline, temperaturesBetween } from "./geometry";
import { humidityRatioGPerKg } from "../physics/psychrometrics";

const envelope = {
  dryBulbMinC: 18,
  dryBulbMaxC: 27,
  rhMinPct: 20,
  rhMaxPct: 80,
  humidityRatioMaxGPerKg: 14,
};

describe("temperaturesBetween", () => {
  it("includes both ends exactly", () => {
    const temps = temperaturesBetween(18, 27);
    expect(temps[0]).toBe(18);
    expect(temps[temps.length - 1]).toBe(27);
  });
});

describe("envelopeOutline", () => {
  const outline = envelopeOutline(envelope);

  it("never goes above the humidity-ratio cap", () => {
    const highest = Math.max(...outline.map((p) => p.humidityRatio));
    expect(highest).toBeLessThanOrEqual(14);
  });

  it("follows the 80% RH curve at the cold end, and the cap at the warm end", () => {
    const roofAt = (tempC: number) =>
      outline
        .filter((p) => Math.abs(p.tempC - tempC) < 1e-9)
        .map((p) => p.humidityRatio);
    // Each temperature appears twice: once on the floor, once on the roof.
    expect(Math.max(...roofAt(18))).toBeCloseTo(humidityRatioGPerKg(18, 80), 6);
    expect(Math.max(...roofAt(27))).toBe(14);
  });
});
