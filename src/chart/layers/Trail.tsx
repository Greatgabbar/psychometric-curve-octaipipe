// Recent history: a thin line through the previous readings, with dots that
// fade the older they are. Shows which way the hall is moving.

import { humidityRatioGPerKg } from '../../physics/psychrometrics';
import type { Reading } from '../../types';
import type { Scales } from '../scales';

interface TrailProps {
  readings: Reading[]; // oldest first; the last one is the current reading
  scales: Scales;
  onHover: (timestamp: string | null) => void;
}

export function Trail({ readings, scales, onHover }: TrailProps) {
  const pixelPoints = readings.map((reading) => ({
    reading,
    px: scales.x(reading.dryBulbC),
    py: scales.y(humidityRatioGPerKg(reading.dryBulbC, reading.rhPct)),
  }));

  const linePoints = pixelPoints.map((p) => `${p.px},${p.py}`).join(' ');
  const olderPoints = pixelPoints.slice(0, -1); // the current point is drawn separately

  return (
    <g className="trail">
      <polyline className="trail-line" points={linePoints} />
      {olderPoints.map((p, index) => (
        <circle
          key={p.reading.timestamp}
          className="trail-dot"
          cx={p.px}
          cy={p.py}
          r={3.5}
          // older = fainter: from 0.25 up to about 0.8
          opacity={0.25 + (0.55 * (index + 1)) / olderPoints.length}
          onMouseEnter={() => onHover(p.reading.timestamp)}
          onMouseLeave={() => onHover(null)}
        />
      ))}
    </g>
  );
}
