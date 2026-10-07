// The chart component. It does three things:
//   1. creates the scales once,
//   2. stacks the layers in drawing order (back to front),
//   3. remembers which reading is hovered.
// Each layer gets the scales as a prop, so all positions come from one place.

import { useState } from 'react';
import type { Envelope as EnvelopeLimits, Reading } from '../types';
import { Axes } from './layers/Axes';
import { Envelope } from './layers/Envelope';
import { OperatingPoint } from './layers/OperatingPoint';
import { RhCurveLabels, RhCurves } from './layers/RhCurves';
import { Tooltip } from './layers/Tooltip';
import { Trail } from './layers/Trail';
import { createScales } from './scales';

// The SVG has a fixed internal size; CSS stretches it to fit the screen (viewBox).
const WIDTH = 760;
const HEIGHT = 480;
const MARGIN = { top: 16, right: 20, bottom: 56, left: 58 };
const PLOT_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;

interface PsychroChartProps {
  envelope: EnvelopeLimits;
  readings: Reading[]; // oldest first; the last one is the current reading
  isCompliant: boolean;
  isStale: boolean;
}

export function PsychroChart({ envelope, readings, isCompliant, isStale }: PsychroChartProps) {
  const [hoveredTimestamp, setHoveredTimestamp] = useState<string | null>(null);
  const scales = createScales(PLOT_WIDTH, PLOT_HEIGHT);

  const current = readings[readings.length - 1];
  // Look the hovered reading up by timestamp: if it has scrolled out of the
  // trail since the user hovered it, the tooltip simply disappears.
  const hoveredReading = readings.find((r) => r.timestamp === hoveredTimestamp);

  return (
    <svg
      className="psychro-chart"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="Psychrometric chart: dry-bulb temperature against humidity ratio, with the SLA envelope and the hall's current reading"
    >
      <defs>
        {/* Anything inside this rectangle is shown; anything outside is cut off. */}
        <clipPath id="plot-area">
          <rect x={0} y={0} width={PLOT_WIDTH} height={PLOT_HEIGHT} />
        </clipPath>
      </defs>

      <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
        <Axes scales={scales} />

        <g clipPath="url(#plot-area)">
          <Envelope envelope={envelope} scales={scales} />
          <RhCurves scales={scales} />
          <Trail readings={readings} scales={scales} onHover={setHoveredTimestamp} />
          <OperatingPoint
            reading={current}
            isCompliant={isCompliant}
            isStale={isStale}
            scales={scales}
            onHover={setHoveredTimestamp}
          />
        </g>

        <RhCurveLabels scales={scales} />
        {hoveredReading && <Tooltip reading={hoveredReading} scales={scales} />}
      </g>
    </svg>
  );
}
