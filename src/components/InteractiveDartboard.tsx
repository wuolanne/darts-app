import type { PointerEvent } from "react";

const BOARD_ORDER = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

const CX = 170;
const CY = 170;
const R_BOARD = 164;
const R_NUM = 148;
const R_DBL_OUT = 150;
const R_DBL_IN = 127;
const R_TPL_OUT = 94;
const R_TPL_IN = 75;
const R_BULL = 24;
const R_EYE = 11;
const VIEWBOX_MIN = 8;
const VIEWBOX_SIZE = 324;
const DOUBLE_TOUCH_IN = 121;
const DOUBLE_TOUCH_OUT = 158;
const TREBLE_TOUCH_IN = 68;
const TREBLE_TOUCH_OUT = 101;
const OUTER_BULL_TOUCH = 31;
const BULL_TOUCH = 15;

type FeedbackTone = "idle" | "correct" | "wrong";
type TargetKind = "single" | "double" | "treble" | "outer-bull" | "bull";

interface ParsedTarget {
  number: number | null;
  kind: TargetKind;
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

function tokenFor(sector: number, kind: "single" | "double" | "treble"): string {
  if (kind === "single") return `S${sector}`;
  if (kind === "double") return `D${sector}`;
  return `T${sector}`;
}

function parseTarget(token: string | null | undefined): ParsedTarget | null {
  if (!token) return null;
  if (token === "Bull" || token === "DBull") return { number: null, kind: "bull" };
  if (token === "25" || token === "SBull") return { number: null, kind: "outer-bull" };
  const match = token.match(/^([SDT])(\d{1,2})$/);
  if (!match) return null;
  const [, prefix, number] = match;
  if (prefix === "D") return { number: Number(number), kind: "double" };
  if (prefix === "T") return { number: Number(number), kind: "treble" };
  return { number: Number(number), kind: "single" };
}

export function InteractiveDartboard({
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
  const selected = parseTarget(selectedTarget);

  const targetFromPoint = (clientX: number, clientY: number, rect: DOMRect): string | null => {
    const x = VIEWBOX_MIN + ((clientX - rect.left) / rect.width) * VIEWBOX_SIZE;
    const y = VIEWBOX_MIN + ((clientY - rect.top) / rect.height) * VIEWBOX_SIZE;
    const dx = x - CX;
    const dy = y - CY;
    const radius = Math.hypot(dx, dy);

    if (radius <= BULL_TOUCH) return "Bull";
    if (radius <= OUTER_BULL_TOUCH) return "25";
    if (radius > DOUBLE_TOUCH_OUT) return null;

    const degrees = (Math.atan2(dy, dx) * 180) / Math.PI;
    const boardAngle = (degrees + 90 + 360) % 360;
    const sectorIndex = Math.floor((boardAngle + 9) / 18) % BOARD_ORDER.length;
    const sector = BOARD_ORDER[sectorIndex];

    if (radius >= DOUBLE_TOUCH_IN) return tokenFor(sector, "double");
    if (radius >= TREBLE_TOUCH_IN && radius <= TREBLE_TOUCH_OUT) return tokenFor(sector, "treble");
    return tokenFor(sector, "single");
  };

  const handleBoardPointerDown = (event: PointerEvent<SVGSVGElement>) => {
    if (!onTargetSelect || disabled) return;
    event.preventDefault();
    const target = targetFromPoint(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect());
    if (target) {
      onTargetSelect(target);
    }
  };

  return (
    <div
      className={`interactive-dartboard-shell${feedbackTone === "correct" ? " is-correct" : ""}${feedbackTone === "wrong" ? " is-wrong" : ""}`}
    >
      <svg
        viewBox={`${VIEWBOX_MIN} ${VIEWBOX_MIN} ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        className="interactive-dartboard-svg"
        aria-label="Interactive checkout dartboard"
        onPointerDown={handleBoardPointerDown}
      >
        <circle cx={CX} cy={CY} r={R_BOARD + 5} fill="#040712" />
        <circle cx={CX} cy={CY} r={R_BOARD} fill="#0a0f18" />

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
                />
              ))}

              {selected?.number === sector && selected.kind === "double" ? (
                <path d={arcPath(R_DBL_OUT, R_DBL_IN, a1, a2)} className="dart-selected-outline" />
              ) : null}
              {selected?.number === sector && selected.kind === "treble" ? (
                <path d={arcPath(R_TPL_OUT, R_TPL_IN, a1, a2)} className="dart-selected-outline" />
              ) : null}
              {selected?.number === sector && selected.kind === "single" ? (
                <>
                  <path d={arcPath(R_DBL_IN, R_TPL_OUT, a1, a2)} className="dart-selected-outline is-soft" />
                  <path d={arcPath(R_TPL_IN, R_BULL, a1, a2)} className="dart-selected-outline is-soft" />
                </>
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
        />
        <circle
          cx={CX}
          cy={CY}
          r={R_EYE}
          fill="#c31f36"
          stroke="#070910"
          strokeWidth="1"
          className={onTargetSelect && !disabled ? "dart-zone is-clickable" : "dart-zone"}
        />
        {selected?.kind === "outer-bull" ? (
          <circle cx={CX} cy={CY} r={R_BULL} className="dart-selected-outline" />
        ) : null}
        {selected?.kind === "bull" ? (
          <circle cx={CX} cy={CY} r={R_EYE} className="dart-selected-outline" />
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

        <circle cx={CX} cy={CY} r={R_BOARD - 1} className="dartboard-rim" />
        <circle cx={CX} cy={CY} r={R_BOARD + 2} className="dartboard-rim-secondary" />
      </svg>
    </div>
  );
}
