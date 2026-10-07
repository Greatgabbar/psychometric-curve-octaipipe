// The current reading. Two visual cues so colour is never the only signal:
//   inside the envelope  -> green filled circle
//   outside              -> red diamond
//   stale data           -> grey hollow circle (we don't know the real state)

import { humidityRatioGPerKg } from '../../physics/psychrometrics';
import type { Reading } from '../../types';
import type { Scales } from '../scales';

interface OperatingPointProps {
  reading: Reading;
  isCompliant: boolean;
  isStale: boolean;
  scales: Scales;
  onHover: (timestamp: string | null) => void;
}

export function OperatingPoint({ reading, isCompliant, isStale, scales, onHover }: OperatingPointProps) {
  const px = scales.x(reading.dryBulbC);
  const py = scales.y(humidityRatioGPerKg(reading.dryBulbC, reading.rhPct));

  let marker;
  if (isStale) {
    marker = <circle className="point point-stale" r={7} />;
  } else if (isCompliant) {
    marker = <circle className="point point-inside" r={7} />;
  } else {
    marker = <rect className="point point-outside" x={-6} y={-6} width={12} height={12} transform="rotate(45)" />;
  }

  const statusText = isStale ? 'status unknown' : isCompliant ? 'inside SLA' : 'outside SLA';

  return (
    // The group moves with a CSS transition, so the point glides between readings.
    <g className="operating-point" style={{ transform: `translate(${px}px, ${py}px)` }}>
      {marker}
      {/* A bigger invisible circle makes the moving point easy to hover,
          and tabIndex lets keyboard users focus it to see the tooltip. */}
      <circle
        className="hit-area"
        r={14}
        tabIndex={0}
        aria-label={`Current reading: ${reading.dryBulbC} °C, ${reading.rhPct}% RH, ${statusText}`}
        onMouseEnter={() => onHover(reading.timestamp)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(reading.timestamp)}
        onBlur={() => onHover(null)}
      />
    </g>
  );
}
