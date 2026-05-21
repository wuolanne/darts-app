export function formatPracticeDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  if (safe < 60) {
    return `${safe}s`;
  }
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatClock(totalSeconds: number): string {
  return formatPracticeDuration(totalSeconds);
}

export function formatSeconds(value: number): string {
  return formatPracticeDuration(value);
}

export function toRoundedSeconds(milliseconds: number): number {
  return Math.max(0, Number((milliseconds / 1000).toFixed(1)));
}
