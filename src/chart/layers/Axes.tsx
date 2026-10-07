// Gridlines, tick numbers and axis titles.

import type { Scales } from "../scales";
import { HUMIDITY_MAX, HUMIDITY_MIN, TEMP_MAX_C, TEMP_MIN_C } from "../scales";

const X_TICK_STEP = 5; // every 5 °C
const Y_TICK_STEP = 2; // every 2 g/kg

function ticks(min: number, max: number, step: number): number[] {
  const values: number[] = [];
  for (let value = min; value <= max; value += step) values.push(value);
  return values;
}

export function Axes({ scales }: { scales: Scales }) {
  const { x, y, plotWidth, plotHeight } = scales;

  return (
    <g className="axes">
      {ticks(TEMP_MIN_C, TEMP_MAX_C, X_TICK_STEP).map((tempC) => (
        <g key={`x-${tempC}`}>
          <line
            className="grid-line"
            x1={x(tempC)}
            x2={x(tempC)}
            y1={0}
            y2={plotHeight}
          />
          <text
            className="tick-label"
            x={x(tempC)}
            y={plotHeight + 18}
            textAnchor="middle"
          >
            {tempC}
          </text>
        </g>
      ))}

      {ticks(HUMIDITY_MIN, HUMIDITY_MAX, Y_TICK_STEP).map((ratio) => (
        <g key={`y-${ratio}`}>
          <line
            className="grid-line"
            x1={0}
            x2={plotWidth}
            y1={y(ratio)}
            y2={y(ratio)}
          />
          <text className="tick-label" x={-8} y={y(ratio) + 4} textAnchor="end">
            {ratio}
          </text>
        </g>
      ))}

      <rect
        className="plot-border"
        x={0}
        y={0}
        width={plotWidth}
        height={plotHeight}
      />

      <text
        className="axis-title"
        x={plotWidth / 2}
        y={plotHeight + 42}
        textAnchor="middle"
      >
        Dry-bulb temperature (°C)
      </text>
      <text
        className="axis-title"
        transform={`translate(-40, ${plotHeight / 2}) rotate(-90)`}
        textAnchor="middle"
      >
        Humidity ratio (g water / kg dry air)
      </text>
    </g>
  );
}
