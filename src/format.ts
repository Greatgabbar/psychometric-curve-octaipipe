// Readings are in UTC, so we show times in UTC to avoid confusion.
export function formatTime(timestamp: string): string {
  return new Date(timestamp).toISOString().slice(11, 16) + ' UTC';
}
