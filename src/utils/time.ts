export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatSeconds(value: number): string {
  return `${value.toFixed(1)}s`;
}

export function toRoundedSeconds(milliseconds: number): number {
  return Math.max(0, Number((milliseconds / 1000).toFixed(1)));
}
