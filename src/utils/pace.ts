export function estimateDartsFromActiveTime(
  activeSeconds: number,
  secondsPerThree: number | null
): number | null {
  if (!secondsPerThree || secondsPerThree <= 0) {
    return null;
  }
  return Math.round((activeSeconds * 3) / secondsPerThree);
}

export function calculateSecondsPerThreeFromFiveMinuteTest(
  dartsThrown: number
): number | null {
  if (!Number.isFinite(dartsThrown) || dartsThrown <= 0) {
    return null;
  }
  return Number((300 / (dartsThrown / 3)).toFixed(2));
}
