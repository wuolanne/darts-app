import { useEffect, useMemo, useState } from "react";

const BOARD_ORDER = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

const CX = 170;
const CY = 170;
const R_BOARD = 164;
const R_NUM = 148;
const R_DBL_OUT = 147;
const R_DBL_IN = 131;
const R_TPL_OUT = 89;
const R_TPL_IN = 79;
const R_BULL = 20;
const R_EYE = 9;

type HighlightKind = "single" | "double" | "treble" | "outer-bull" | "bull";
type FeedbackTone = "idle" | "correct" | "wrong";

interface HighlightTarget {
  number: number | null;
  kind: HighlightKind;
}

function toRad(deg: number) {
  return ((deg - 90) * Math.PI) / 180;
}

function polarXY(radius: number, deg: number): [number, number] {
  const angle = toRad(deg);
  return [CX + radius * Math.cos(angle), CY + radius * Math.sin(angle)];
}

function arcPath(r1: number, r2: number, a1: number, a2: number): string {
  const [ax, ay] = polarXY(r1, a1);
  const [bx, by] = polarXY(r1, a2);
  const [cx, cy] = polarXY(r2, a2);
  const [dx, dy] = polarXY(r2, a1);
  const lg = a2 - a1 > 180 ? 1 : 0;
  const f = (n: number) => n.toFixed(2);
  return [
    `M ${f(ax)} ${f(ay)}`,
    `A ${r1} ${r1} 0 ${lg} 1 ${f(bx)} ${f(by)}`,
    `L ${f(cx)} ${f(cy)}`,
    `A ${r2} ${r2} 0 ${lg} 0 ${f(dx)} ${f(dy)} Z`
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
  const plainMatch = token.match(/^(\d{1,2})$/);
  if (plainMatch) {
    return { number: Number(plainMatch[1]), kind: "single" };
  }
  return null;
}

function parseRoute(route: string): HighlightTarget[] {
  return route
    .split(",")
    .map(parseToken)
    .filter((item): item is HighlightTarget => item !== null);
}

function isHighlighted(targets: HighlightTarget[], sector: number, kind: HighlightKind) {
  return targets.some((target) => target.number === sector && target.kind === kind);
}

function tokenFor(sector: number, kind: HighlightKind): string {
  if (kind === "single") return `S${sector}`;
  if (kind === "double") return `D${sector}`;
  if (kind === "treble") return `T${sector}`;
  if (kind === "outer-bull") return "25";
  return "Bull";
}

export function InteractiveDartboard({
  route,
  reveal,
  onTargetSelect,
  selectedTarget,
  disabled = false,
  feedbackTone = "idle"
}: {
  route: string;
  reveal: boolean;
  onTargetSelect?: (target: string) => void;
  selectedTarget?: string | null;
  disabled?: boolean;
  feedbackTone?: FeedbackTone;
}) {
  const routeTargets = useMemo(() => (reveal ? parseRoute(route) : []), [reveal, route]);
  const selected = useMemo(() => (selectedTarget ? parseToken(selectedTarget) : null), [selectedTarget]);
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    if (selectedTarget) {
      setPulseKey((previous) => previous + 1);
    }
  }, [selectedTarget]);

  return (
    <div
      className={`interactive-dartboard-shell${feedbackTone === "correct" ? " is-correct" : ""}${feedbackTone === "wrong" ? " is-wrong" : ""}`}
    >
      <svg viewBox="0 0 340 340" className="interactive-dartboard-svg" aria-label="Interactive checkout dartboard">
        <defs>
          <radialGradient id="dartboard-depth" cx="50%" cy="50%" r="52%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="72%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.66)" />
          </radialGradient>
          <radialGradient id="dartboard-shell" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#18132c" />
            <stop offset="60%" stopColor="#0d1020" />
            <stop offset="100%" stopColor="#080b14" />
          </radialGradient>
          <filter id="dartboard-rim-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="dartboard-selection-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 1.2 0"
            />
          </filter>
        </defs>

        <circle cx={CX} cy={CY} r={R_BOARD + 5} fill="#040712" style={{ pointerEvents: "none" }} />
        <circle cx={CX} cy={CY} r={R_BOARD} fill="url(#dartboard-shell)" style={{ pointerEvents: "none" }} />

        {BOARD_ORDER.map((sector, index) => {
          const a1 = index * 18 - 9;
          const a2 = index * 18 + 9;
          const even = index % 2 === 0;
          const singleColor = even ? "#141728" : "#d3b061";
          const ringColor = even ? "#c31f36" : "#16743d";
          const segmentClasses = onTargetSelect && !disabled ? "dart-zone is-clickable" : "dart-zone";
          const zoneDefs = [
            { key: "double", path: arcPath(R_DBL_OUT, R_DBL_IN, a1, a2), fill: ringColor, token: tokenFor(sector, "double"), kind: "double" as const },
            { key: "outer-single", path: arcPath(R_DBL_IN, R_TPL_OUT, a1, a2), fill: singleColor, token: tokenFor(sector, "single"), kind: "single" as const },
            { key: "treble", path: arcPath(R_TPL_OUT, R_TPL_IN, a1, a2), fill: ringColor, token: tokenFor(sector, "treble"), kind: "treble" as const },
            { key: "inner-single", path: arcPath(R_TPL_IN, R_BULL, a1, a2), fill: singleColor, token: tokenFor(sector, "single"), kind: "single" as const }
          ];

          return (
            <g key={sector}>
              {zoneDefs.map((zone) => (
                <path
                  key={`${sector}-${zone.key}`}
                  d={zone.path}
                  fill={zone.fill}
                  stroke="#070910"
                  strokeWidth="0.85"
                  strokeLinejoin="round"
                  className={segmentClasses}
                  onClick={() =>
                    onTargetSelect && !disabled ? onTargetSelect(zone.token) : undefined
                  }
                />
              ))}

              {isHighlighted(routeTargets, sector, "double") ? (
                <path d={arcPath(R_DBL_OUT, R_DBL_IN, a1, a2)} className="dart-route-highlight" />
              ) : null}
              {isHighlighted(routeTargets, sector, "treble") ? (
                <path d={arcPath(R_TPL_OUT, R_TPL_IN, a1, a2)} className="dart-route-highlight" />
              ) : null}
              {isHighlighted(routeTargets, sector, "single") ? (
                <>
                  <path d={arcPath(R_DBL_IN, R_TPL_OUT, a1, a2)} className="dart-route-highlight is-soft" />
                  <path d={arcPath(R_TPL_IN, R_BULL, a1, a2)} className="dart-route-highlight is-soft" />
                </>
              ) : null}

              {selected?.number === sector && selected.kind === "double" ? (
                <path key={`selected-double-${pulseKey}-${sector}`} d={arcPath(R_DBL_OUT, R_DBL_IN, a1, a2)} className="dart-selected-highlight" />
              ) : null}
              {selected?.number === sector && selected.kind === "treble" ? (
                <path key={`selected-treble-${pulseKey}-${sector}`} d={arcPath(R_TPL_OUT, R_TPL_IN, a1, a2)} className="dart-selected-highlight" />
              ) : null}
              {selected?.number === sector && selected.kind === "single" ? (
                <g key={`selected-single-${pulseKey}-${sector}`}>
                  <path d={arcPath(R_DBL_IN, R_TPL_OUT, a1, a2)} className="dart-selected-highlight is-soft" />
                  <path d={arcPath(R_TPL_IN, R_BULL, a1, a2)} className="dart-selected-highlight is-soft" />
                </g>
              ) : null}
            </g>
          );
        })}

        <circle
          cx={CX}
          cy={CY}
          r={R_BULL}
          fill="#16743d"
          stroke="#070910"
          strokeWidth="1"
          className={onTargetSelect && !disabled ? "dart-zone is-clickable" : "dart-zone"}
          onClick={() => (onTargetSelect && !disabled ? onTargetSelect("25") : undefined)}
        />
        <circle
          cx={CX}
          cy={CY}
          r={R_EYE}
          fill="#c31f36"
          stroke="#070910"
          strokeWidth="1"
          className={onTargetSelect && !disabled ? "dart-zone is-clickable" : "dart-zone"}
          onClick={() => (onTargetSelect && !disabled ? onTargetSelect("Bull") : undefined)}
        />

        {routeTargets.some((item) => item.kind === "outer-bull") ? (
          <circle cx={CX} cy={CY} r={R_BULL} className="dart-route-highlight" style={{ pointerEvents: "none" }} />
        ) : null}
        {routeTargets.some((item) => item.kind === "bull") ? (
          <circle cx={CX} cy={CY} r={R_EYE} className="dart-route-highlight" style={{ pointerEvents: "none" }} />
        ) : null}
        {selected?.kind === "outer-bull" ? (
          <circle
            key={`selected-outer-bull-${pulseKey}`}
            cx={CX}
            cy={CY}
            r={R_BULL}
            className="dart-selected-highlight"
            style={{ pointerEvents: "none" }}
          />
        ) : null}
        {selected?.kind === "bull" ? (
          <circle
            key={`selected-bull-${pulseKey}`}
            cx={CX}
            cy={CY}
            r={R_EYE}
            className="dart-selected-highlight"
            style={{ pointerEvents: "none" }}
          />
        ) : null}

        {BOARD_ORDER.map((sector, index) => {
          const [x, y] = polarXY(R_NUM, index * 18);
          return (
            <text
              key={`label-${sector}`}
              x={x.toFixed(2)}
              y={y.toFixed(2)}
              textAnchor="middle"
              dominantBaseline="middle"
              className="dartboard-number"
            >
              {sector}
            </text>
          );
        })}

        <circle cx={CX} cy={CY} r={R_BOARD} fill="url(#dartboard-depth)" style={{ pointerEvents: "none" }} />
        <circle
          cx={CX}
          cy={CY}
          r={R_BOARD - 1}
          className="dartboard-rim"
          filter="url(#dartboard-rim-glow)"
          style={{ pointerEvents: "none" }}
        />
        <circle
          cx={CX}
          cy={CY}
          r={R_BOARD + 2}
          className="dartboard-rim-secondary"
          style={{ pointerEvents: "none" }}
        />
      </svg>
    </div>
  );
}
