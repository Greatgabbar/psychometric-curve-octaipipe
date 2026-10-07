// The physics from the brief. Three small steps turn
// (temperature, relative humidity) into humidity ratio (g of water per kg of dry air).

const ATMOSPHERIC_PRESSURE_KPA = 101.325;

// Step 1: the most water vapour air can hold at this temperature
// (saturation vapour pressure, in kPa). Magnus formula.
export function saturationVapourPressureKPa(tempC: number): number {
  return 0.61094 * Math.exp((17.625 * tempC) / (tempC + 243.04));
}

// Steps 2 and 3: how much water is actually in the air, as g/kg.
// rhPct is a percentage (45 means 45%), so we divide by 100 first.
// and unit is g/kg so mutliply by 1000 at the end.
export function humidityRatioGPerKg(tempC: number, rhPct: number): number {
  const rhFraction = rhPct / 100;
  const vapourPressureKPa = rhFraction * saturationVapourPressureKPa(tempC);
  const ratioKgPerKg =
    (0.622 * vapourPressureKPa) /
    (ATMOSPHERIC_PRESSURE_KPA - vapourPressureKPa);
  return ratioKgPerKg * 1000;
}
