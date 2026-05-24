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

type FeedbackTone = "idle" | "correct" | "wrong";

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

export function InteractiveDartboard({
  onTargetSelect,
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
  return (
    <div
      className={`interactive-dartboard-shell${feedbackTone === "correct" ? " is-correct" : ""}${feedbackTone === "wrong" ? " is-wrong" : ""}`}
    >
      <svg viewBox="0 0 340 340" className="interactive-dartboard-svg" aria-label="Interactive checkout dartboard">
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
                  onClick={() =>
                    onTargetSelect && !disabled ? onTargetSelect(zone.token) : undefined
                  }
                />
              ))}

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
