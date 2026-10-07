// A FAKE API that behaves like a real one: it returns a Promise, takes a little
// time, and can fail. Swapping in a real backend only changes this file.

import conditions from "../data/conditions.json";
import type { Reading, Site } from "../types";

export const TRAIL_LENGTH = 6; // 6 readings x 5 min = the last 30 minutes
const FAKE_LATENCY_MS = 300;

export interface RecentReadingsResponse {
  site: Site;
  readings: Reading[];
}

const site: Site = conditions.site;
const allReadings: Reading[] = conditions.readings;

// Index of the newest reading in the window. Start with a full trail.
let newestIndex = TRAIL_LENGTH - 1;

// Lets the UI switch on a pretend outage, to demo the failure state.
let simulateOutage = false;
export function setSimulateOutage(on: boolean) {
  simulateOutage = on;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchRecentReadings(
  siteId: string,
): Promise<RecentReadingsResponse> {
  await wait(FAKE_LATENCY_MS);

  if (simulateOutage) {
    throw new Error("The sensor gateway is not responding.");
  }
  if (siteId !== site.id) {
    throw new Error(`Unknown site: ${siteId}`);
  }

  // Collect the last TRAIL_LENGTH readings ending at newestIndex.
  // "% length" wraps around to the start of the file when we run past the end.
  const windowReadings: Reading[] = [];
  for (let i = TRAIL_LENGTH - 1; i >= 0; i--) {
    const index = (newestIndex - i + allReadings.length) % allReadings.length;
    windowReadings.push(allReadings[index]);
  }

  // Only move forward after a successful call.
  newestIndex = (newestIndex + 1) % allReadings.length;

  return { site, readings: windowReadings };
}
