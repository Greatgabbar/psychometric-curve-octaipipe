// The saturation curve (100% RH) and the constant-RH curves, with labels.

import { rhCurvePoints } from "../geometry";
import type { Scales } from "../scales";
import { HUMIDITY_MAX, pointsToSvgPath } from "../scales";

export const RH_LEVELS = [20, 40, 60, 80, 100];

// Lines are drawn inside the clipped plot area (so they stop at the top edge).
export function RhCurves({ scales }: { scales: Scales }) {
  return (
    <g className="rh-curves">
      {RH_LEVELS.map((rhPct) => (
        <path
          key={rhPct}
          className={rhPct === 100 ? "saturation-curve" : "rh-curve"}
          d={pointsToSvgPath(rhCurvePoints(rhPct), scales)}
        />
      ))}
    </g>
  );
}

// Labels sit at the last visible point of each curve: either where it leaves
// the top of the chart, or at the right edge. Drawn outside the clip so they never get cut.
export function RhCurveLabels({ scales }: { scales: Scales }) {
  const LABEL_CEILING = HUMIDITY_MAX - 0.6; // keep labels just below the top edge

  return (
    <g className="rh-labels">
      {RH_LEVELS.map((rhPct) => {
        const visiblePoints = rhCurvePoints(rhPct).filter(
          (point) => point.humidityRatio <= LABEL_CEILING,
        );
        const lastVisible = visiblePoints[visiblePoints.length - 1];
        return (
          <text
            key={rhPct}
            className="rh-label"
            x={scales.x(lastVisible.tempC) - 4}
            y={scales.y(lastVisible.humidityRatio) - 2}
            textAnchor="end"
          >
            {rhPct === 100 ? "Saturation (100%)" : `${rhPct}%`}
          </text>
        );
      })}
    </g>
  );
}
