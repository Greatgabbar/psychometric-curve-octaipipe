// The SLA envelope as a shaded region.

import type { Envelope as EnvelopeLimits } from "../../types";
import { envelopeOutline } from "../geometry";
import type { Scales } from "../scales";
import { pointsToSvgPath } from "../scales";

export function Envelope({
  envelope,
  scales,
}: {
  envelope: EnvelopeLimits;
  scales: Scales;
}) {
  // "Z" closes the path back to the first point.
  const path = pointsToSvgPath(envelopeOutline(envelope), scales) + " Z";
  return <path className="envelope" d={path} />;
}
