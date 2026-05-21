const BOARD_ORDER = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

type HighlightKind = "single" | "double" | "treble" | "outer-bull" | "bull";

interface HighlightTarget {
  number: number | null;
  kind: HighlightKind;
}

function polar(cx: number, cy: number, radius: number, angleRad: number) {
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad)
  };
}

function annularSectorPath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startRad: number,
  endRad: number
) {
  const outerStart = polar(cx, cy, outerR, startRad);
  const outerEnd = polar(cx, cy, outerR, endRad);
  const innerEnd = polar(cx, cy, innerR, endRad);
  const innerStart = polar(cx, cy, innerR, startRad);
  const largeArc = endRad - startRad > Math.PI ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    "Z"
  ].join(" ");
}

function parseToken(raw: string): HighlightTarget | null {
  const token = raw.trim();
  if (!token) {
    return null;
  }
  if (token === "Bull" || token === "DBull") {
    return { number: null, kind: "bull" };
  }
  if (token === "25" || token === "SBull") {
    return { number: null, kind: "outer-bull" };
  }
  const doubleMatch = token.match(/^D(\d{1,2})$/);
  if (doubleMatch) {
    return { number: Number(doubleMatch[1]), kind: "double" };
  }
  const trebleMatch = token.match(/^T(\d{1,2})$/);
  if (trebleMatch) {
    return { number: Number(trebleMatch[1]), kind: "treble" };
  }
  const singleMatch = token.match(/^S(\d{1,2})$/);
  if (singleMatch) {
    return { number: Number(singleMatch[1]), kind: "single" };
  }
  const plain = token.match(/^(\d{1,2})$/);
  if (plain) {
    return { number: Number(plain[1]), kind: "single" };
  }
  return null;
}

function parseRoute(route: string): HighlightTarget[] {
  return route
    .split(",")
    .map(parseToken)
    .filter((item): item is HighlightTarget => item !== null);
}

function isHighlighted(targets: HighlightTarget[], sector: number, kind: HighlightKind): boolean {
  return targets.some((target) => target.number === sector && target.kind === kind);
}

function tokenFor(sector: number, kind: HighlightKind): string {
  if (kind === "single") return `S${sector}`;
  if (kind === "double") return `D${sector}`;
  if (kind === "treble") return `T${sector}`;
  if (kind === "outer-bull") return "25";
  return "Bull";
}

export function Dartboard({
  route,
  reveal,
  onTargetSelect,
  selectedTarget,
  disabled = false
}: {
  route: string;
  reveal: boolean;
  onTargetSelect?: (target: string) => void;
  selectedTarget?: string | null;
  disabled?: boolean;
}) {
  const targets = reveal ? parseRoute(route) : [];
  const selected = selectedTarget ? parseToken(selectedTarget) : null;
  const cx = 200;
  const cy = 200;
  const segmentSize = (Math.PI * 2) / 20;

  return (
    <div className="dartboard-wrap">
      <svg viewBox="0 0 400 400" className="dartboard-svg" aria-label="Dartboard route helper">
        <circle cx={cx} cy={cy} r={195} fill="#ecefe8" />
        <circle cx={cx} cy={cy} r={190} fill="#1d1f1f" />

        {BOARD_ORDER.map((sector, idx) => {
          const start = -Math.PI / 2 - segmentSize / 2 + idx * segmentSize;
          const end = start + segmentSize;
          const isDark = idx % 2 === 0;

          return (
            <g key={sector}>
              <path
                d={annularSectorPath(cx, cy, 170, 190, start, end)}
                fill={isDark ? "#e42d2a" : "#22a33a"}
                className={onTargetSelect && !disabled ? "dart-clickable" : ""}
                onClick={() =>
                  onTargetSelect && !disabled ? onTargetSelect(tokenFor(sector, "double")) : undefined
                }
              />
              <path
                d={annularSectorPath(cx, cy, 110, 170, start, end)}
                fill={isDark ? "#ecefe8" : "#0f1115"}
                className={onTargetSelect && !disabled ? "dart-clickable" : ""}
                onClick={() =>
                  onTargetSelect && !disabled ? onTargetSelect(tokenFor(sector, "single")) : undefined
                }
              />
              <path
                d={annularSectorPath(cx, cy, 90, 110, start, end)}
                fill={isDark ? "#e42d2a" : "#22a33a"}
                className={onTargetSelect && !disabled ? "dart-clickable" : ""}
                onClick={() =>
                  onTargetSelect && !disabled ? onTargetSelect(tokenFor(sector, "treble")) : undefined
                }
              />
              <path
                d={annularSectorPath(cx, cy, 40, 90, start, end)}
                fill={isDark ? "#ecefe8" : "#0f1115"}
                className={onTargetSelect && !disabled ? "dart-clickable" : ""}
                onClick={() =>
                  onTargetSelect && !disabled ? onTargetSelect(tokenFor(sector, "single")) : undefined
                }
              />

              {isHighlighted(targets, sector, "double") ? (
                <path
                  d={annularSectorPath(cx, cy, 170, 190, start, end)}
                  fill="#39c7ff"
                  fillOpacity={0.45}
                />
              ) : null}
              {isHighlighted(targets, sector, "treble") ? (
                <path
                  d={annularSectorPath(cx, cy, 90, 110, start, end)}
                  fill="#39c7ff"
                  fillOpacity={0.45}
                />
              ) : null}
              {isHighlighted(targets, sector, "single") ? (
                <>
                  <path
                    d={annularSectorPath(cx, cy, 110, 170, start, end)}
                    fill="#39c7ff"
                    fillOpacity={0.3}
                  />
                  <path
                    d={annularSectorPath(cx, cy, 40, 90, start, end)}
                    fill="#39c7ff"
                    fillOpacity={0.3}
                  />
                </>
              ) : null}

              {selected && selected.number === sector && selected.kind === "double" ? (
                <path
                  d={annularSectorPath(cx, cy, 170, 190, start, end)}
                  fill="#ffce3a"
                  fillOpacity={0.8}
                />
              ) : null}
              {selected && selected.number === sector && selected.kind === "treble" ? (
                <path
                  d={annularSectorPath(cx, cy, 90, 110, start, end)}
                  fill="#ffce3a"
                  fillOpacity={0.8}
                />
              ) : null}
              {selected && selected.number === sector && selected.kind === "single" ? (
                <>
                  <path
                    d={annularSectorPath(cx, cy, 110, 170, start, end)}
                    fill="#ffce3a"
                    fillOpacity={0.7}
                  />
                  <path
                    d={annularSectorPath(cx, cy, 40, 90, start, end)}
                    fill="#ffce3a"
                    fillOpacity={0.7}
                  />
                </>
              ) : null}
            </g>
          );
        })}

        <circle
          cx={cx}
          cy={cy}
          r={40}
          fill="#22a33a"
          className={onTargetSelect && !disabled ? "dart-clickable" : ""}
          onClick={() =>
            onTargetSelect && !disabled ? onTargetSelect(tokenFor(0, "outer-bull")) : undefined
          }
        />
        <circle
          cx={cx}
          cy={cy}
          r={18}
          fill="#e42d2a"
          className={onTargetSelect && !disabled ? "dart-clickable" : ""}
          onClick={() =>
            onTargetSelect && !disabled ? onTargetSelect(tokenFor(0, "bull")) : undefined
          }
        />

        {targets.some((item) => item.kind === "outer-bull") ? (
          <circle cx={cx} cy={cy} r={40} fill="#39c7ff" fillOpacity={0.45} />
        ) : null}
        {targets.some((item) => item.kind === "bull") ? (
          <circle cx={cx} cy={cy} r={18} fill="#39c7ff" fillOpacity={0.65} />
        ) : null}
        {selected?.kind === "outer-bull" ? (
          <circle cx={cx} cy={cy} r={40} fill="#ffce3a" fillOpacity={0.7} />
        ) : null}
        {selected?.kind === "bull" ? (
          <circle cx={cx} cy={cy} r={18} fill="#ffce3a" fillOpacity={0.9} />
        ) : null}

        {BOARD_ORDER.map((sector, idx) => {
          const mid = -Math.PI / 2 + idx * segmentSize;
          const point = polar(cx, cy, 145, mid);
          return (
            <text
              key={`label-${sector}`}
              x={point.x}
              y={point.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#ffffff"
              fontSize="16"
              fontWeight="700"
            >
              {sector}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
