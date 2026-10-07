# CLAUDE.md: development plan and working notes

Context for an AI coding assistant working in this repo. It describes what we're
building, the decisions agreed before coding, and how to work here.

## Goal

A React + TypeScript app that draws a psychrometric chart by hand in SVG, shades a
data hall's SLA envelope, and plots the hall's live operating point with a short
trail, fed by a polled readings API.

## How to work in this repo

- Plain, readable code over clever code. The owner must be able to explain and
  change every line, so comment the _why_ in simple English.
- Small steps. After each step: `npm test` and `npx tsc --noEmit` must pass.
- No pre-built chart components. Draw with SVG; compute positions ourselves.
- Avoid new dependencies unless asked. Current stack: Vite, React 18, TypeScript,
  Vitest, @tanstack/react-query.
- Priority order: chart geometry correct first, then data/state handling, then polish.

## Commands

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # Vitest
npm run build    # type-check + production build
```

## Physics (use exactly these formulas)

- Saturation vapour pressure (kPa): `p_ws(T) = 0.61094 * exp(17.625 * T / (T + 243.04))`
- Vapour pressure: `p_w = RH * p_ws(T)`, with RH as a fraction (60% -> 0.6)
- Humidity ratio: `W = 0.622 * p_w / (101.325 - p_w)`, x1000 for g/kg
- A constant-RH curve is W plotted against T with RH held fixed.

## Data

`src/data/conditions.json`: one site with an envelope (dry-bulb min/max in °C,
RH min/max in %, humidity-ratio max in g/kg) and readings 5 minutes apart
(timestamp, dry-bulb °C, RH %). Readings never include humidity ratio; compute it.

## Design decisions

1. **Envelope geometry.** The limits are in three different units:
   temperature -> vertical walls, RH -> curved floor and roof, humidity-ratio cap
   -> flat line. Sample every 0.1 °C. Floor = min-RH curve. Roof = the LOWER of the
   max-RH curve and the cap at each temperature. Walk floor left->right, roof
   right->left, close with `Z`.
2. **Compliance** is decided by the numeric rules, not by testing the point
   against the drawn shape (the shape is a sampled approximation). Limits are
   inclusive. Return the list of violations (label, value, limit, min/max, unit),
   not a boolean, so the UI can say why.
3. **Scales.** Hand-written linear scales (no d3). y range is inverted because
   SVG y grows downward. Data layers are clipped to the plot area.
4. **Components.** Scales are created in one place (`PsychroChart`) and passed as
   props to each layer: Axes, RhCurves (+ labels outside the clip), Envelope,
   Trail, OperatingPoint, Tooltip. Layers never compute pixels except via scales.
   Shapes are built in chart units (°C, g/kg) in `geometry.ts`.
5. **Data.** A fake API module returns a Promise with ~300 ms latency, can fail,
   and returns the recent window of readings (last 6, about 30 minutes), like a
   `?since=30m` endpoint. A UI toggle simulates an outage. React Query polls with
   `refetchInterval` and `retry: false` (the next poll is the retry).
6. **States.** Loading -> message. First call failed -> error message. Later call
   failed -> keep last good data, grey the point, badge says "Status unknown".
   Never show green on stale data.
7. **SLA signal.** Colour plus shape (circle inside, diamond outside, hollow grey
   when stale). Badge names each broken rule with value and limit.
8. **Tooltip.** Dry-bulb, RH, computed humidity ratio, time. Opens on hover and
   keyboard focus; enlarged invisible hit area; flips at the plot edges; does not
   capture the mouse.
9. **Known shortcut.** Readings are 5 minutes apart but we poll every 2 s so the
   point visibly moves; the fake API loops at the end of the data.

## Structure

```
src/
  types.ts, format.ts, data/conditions.json
  physics/psychrometrics.ts      (°C, RH%) -> g/kg
  sla/compliance.ts              checkCompliance(reading, envelope)
  chart/scales.ts                makeLinearScale, createScales, pointsToSvgPath
  chart/geometry.ts              RH curves and envelope outline in chart units
  chart/layers/*.tsx             one component per visual layer
  chart/PsychroChart.tsx         creates scales, stacks layers, hover state
  api/readingsApi.ts             fake polled API
  hooks/useRecentReadings.ts     React Query polling
  components/SlaStatusBadge.tsx  status in words
  App.tsx                        loading / error / stale states
```

## Build order

1. Scaffold; physics functions + tests
2. Scales + axes + clip path
3. RH curves + labels
4. Envelope outline (check the corner where the cap takes over the roof)
5. Compliance function + tests
6. Fake API + React Query hook + operating point + trail
7. Status badge + point styling
8. Tooltip (hover + focus)
9. Loading / stale / error states
10. README

## Tests to keep green

Unit conversion against a hand-computed value (catches forgetting RH / 100),
envelope roof never above the cap, compliance rules including inclusive limits and
readings that pass temperature and RH but fail the humidity-ratio cap, and scale
endpoints including the y flip.
