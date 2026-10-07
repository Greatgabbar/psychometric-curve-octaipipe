// Polls the readings API with React Query.
// React Query handles the timer, keeps the last good data when a call fails,
// and tells us whether we're loading or in error.

import { useQuery } from '@tanstack/react-query';
import { fetchRecentReadings } from '../api/readingsApi';

// Real readings arrive every 5 minutes; we poll every 2 seconds so the demo moves.
export const POLL_INTERVAL_MS = 2000;

export function useRecentReadings(siteId: string) {
  return useQuery({
    queryKey: ['recent-readings', siteId],
    queryFn: () => fetchRecentReadings(siteId),
    refetchInterval: POLL_INTERVAL_MS,
    // No automatic retries: the next poll is already the retry,
    // and it lets the UI show a failure straight away.
    retry: false,
  });
}
