// Small box showing the values of the hovered reading.

import { humidityRatioGPerKg } from '../../physics/psychrometrics';
import { formatTime } from '../../format';
import type { Reading } from '../../types';
import type { Scales } from '../scales';

const BOX_WIDTH = 168;
const BOX_HEIGHT = 84;
const GAP = 14; // distance between point and box

export function Tooltip({ reading, scales }: { reading: Reading; scales: Scales }) {
  const humidityRatio = humidityRatioGPerKg(reading.dryBulbC, reading.rhPct);
  const px = scales.x(reading.dryBulbC);
  const py = scales.y(humidityRatio);

  // Flip to the left near the right edge, and below the point near the top,
  // so the box never gets cut off.
  const boxX = px + GAP + BOX_WIDTH > scales.plotWidth ? px - GAP - BOX_WIDTH : px + GAP;
  const boxY = py - BOX_HEIGHT - GAP < 0 ? py + GAP : py - BOX_HEIGHT - GAP;

  const rows = [
    `Dry-bulb: ${reading.dryBulbC.toFixed(1)} °C`,
    `RH: ${reading.rhPct.toFixed(0)} %`,
    `Humidity ratio: ${humidityRatio.toFixed(1)} g/kg`,
  ];

  return (
    <g className="tooltip" transform={`translate(${boxX}, ${boxY})`} pointerEvents="none">
      <rect className="tooltip-box" width={BOX_WIDTH} height={BOX_HEIGHT} rx={6} />
      <text className="tooltip-time" x={10} y={20}>
        {formatTime(reading.timestamp)}
      </text>
      {rows.map((row, index) => (
        <text key={row} className="tooltip-row" x={10} y={40 + index * 16}>
          {row}
        </text>
      ))}
    </g>
  );
}
