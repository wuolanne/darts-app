import { formatClock } from "../utils/time";

export function TimerBar({
  value,
  max,
  label
}: {
  value: number;
  max: number;
  label: string;
}) {
  const width = max > 0 ? `${(Math.max(value, 0) / max) * 100}%` : "0%";

  return (
    <div className="timer-bar">
      <div className="timer-bar-head">
        <span>{label}</span>
        <strong>{formatClock(value)}</strong>
      </div>
      <div className="timer-bar-track">
        <span className="timer-bar-fill" style={{ width }} />
      </div>
    </div>
  );
}
