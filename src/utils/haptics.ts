export function triggerHaptic(enabled: boolean, pattern: number | number[] = 24): void {
  if (!enabled) {
    return;
  }
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    return;
  }
  navigator.vibrate(pattern);
}
