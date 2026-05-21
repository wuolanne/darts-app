import { useMemo, useState } from "react";
import { Card, Pill, ScreenTitle } from "../components/ui";
import { PreferredDouble } from "../types/models";
import { CheckoutOption, getCheckoutOptions } from "../utils/checkoutLibrary";

const RANGES = [
  { label: "2 - 40", min: 2, max: 40 },
  { label: "41 - 60", min: 41, max: 60 },
  { label: "61 - 80", min: 61, max: 80 },
  { label: "81 - 90", min: 81, max: 90 },
  { label: "91 - 100", min: 91, max: 100 },
  { label: "101 - 120", min: 101, max: 120 },
  { label: "121 - 135", min: 121, max: 135 },
  { label: "136 - 160", min: 136, max: 160 },
  { label: "161 - 170", min: 161, max: 170 }
];

function getPreferredDoubleValue(preferredDouble: PreferredDouble): number {
  if (preferredDouble === "D20") return 40;
  if (preferredDouble === "D18") return 36;
  if (preferredDouble === "D12") return 24;
  if (preferredDouble === "D16") return 32;
  return 40;
}

function oneDartLabel(score: number): string | null {
  if (score >= 1 && score <= 20) return `${score}`;
  if (score === 25) return "25";
  if (score === 50) return "Bull";
  if (score % 2 === 0 && score <= 40) return `D${score / 2}`;
  if (score % 3 === 0 && score / 3 <= 20) return `T${score / 3}`;
  return null;
}

function pickRecommendedRoute(options: CheckoutOption[]): CheckoutOption | null {
  if (options.length === 0) return null;
  const twoDartPreferred = options.find((option) => option.dartsUsed === 2 && option.endsOnPreferred);
  if (twoDartPreferred) return twoDartPreferred;
  const twoDartAny = options.find((option) => option.dartsUsed === 2);
  if (twoDartAny) return twoDartAny;
  const preferred = options.find((option) => option.endsOnPreferred);
  if (preferred) return preferred;
  return options[0];
}

function getWhyBestMessage(
  recommended: CheckoutOption,
  preferredDouble: PreferredDouble
): string {
  if (recommended.dartsUsed === 2 && recommended.endsOnPreferred) {
    return `Best because it is a 2-dart finish and ends on your preferred ${preferredDouble}.`;
  }
  if (recommended.dartsUsed === 2) {
    return "Best because it is a direct 2-dart finish with high percentage.";
  }
  if (recommended.endsOnPreferred) {
    return `Best because it keeps your preferred ${preferredDouble} as the finishing dart.`;
  }
  return "Best available practical route for this finish.";
}

function getMissPlan(
  finish: number,
  recommended: CheckoutOption,
  preferredDouble: PreferredDouble
): string {
  const first = recommended.route[0];
  const treble = first.match(/^T(\d{1,2})$/);
  if (!treble) {
    return "If first dart misses, switch to your highest-confidence setup to leave a clean double.";
  }

  const singleScore = Number(treble[1]);
  const remainingAfterMiss = finish - singleScore;
  const dartsLeft = recommended.dartsUsed - 1;
  if (remainingAfterMiss <= 1) {
    return "If it drops to single, reset and build a clean leave on the next visit.";
  }

  const afterMiss = getCheckoutOptions(remainingAfterMiss, preferredDouble);
  const direct = afterMiss.options.find((option) => option.dartsUsed <= dartsLeft);
  if (direct) {
    return `If ${first} becomes S${singleScore}, ${remainingAfterMiss} left: go ${direct.route.join(" - ")}.`;
  }

  if (dartsLeft >= 1) {
    const targetLeave = getPreferredDoubleValue(preferredDouble);
    const setupScore = remainingAfterMiss - targetLeave;
    const setup = oneDartLabel(setupScore);
    if (setup) {
      const pd = preferredDouble === "Not sure" ? "D20" : preferredDouble;
      return `If ${first} becomes S${singleScore}, no direct finish with ${dartsLeft} dart left. Use ${setup} to leave ${pd}.`;
    }
  }

  return `If ${first} becomes S${singleScore}, set up a clean checkout under 60 for the next visit.`;
}

export function CheckoutLibraryScreen({
  onBack,
  preferredDouble
}: {
  onBack: () => void;
  preferredDouble: PreferredDouble;
}) {
  const [selectedFinish, setSelectedFinish] = useState(60);
  const detail = useMemo(() => {
    const data = getCheckoutOptions(selectedFinish, preferredDouble);
    const recommended = pickRecommendedRoute(data.options);
    const twoDartOnly = data.options.filter((option) => option.dartsUsed === 2);
    return { data, recommended, twoDartOnly };
  }, [selectedFinish, preferredDouble]);

  return (
    <div className="screen">
      <ScreenTitle
        title="Checkout Library"
        subtitle={`All finishes 2-170. Preferred double: ${preferredDouble}`}
        onBack={onBack}
      />

      {RANGES.map((range) => (
        <Card key={range.label}>
          <div className="practice-header">
            <h3>{range.label}</h3>
            <Pill tone="neutral">{range.max - range.min + 1} finishes</Pill>
          </div>
          <div className="finish-grid">
            {Array.from({ length: range.max - range.min + 1 }, (_, idx) => range.min + idx).map(
              (finish) => (
                <button
                  key={finish}
                  type="button"
                  className={`finish-chip${selectedFinish === finish ? " finish-chip-active" : ""}`}
                  onClick={() => setSelectedFinish(finish)}
                >
                  {finish}
                </button>
              )
            )}
          </div>

          {selectedFinish >= range.min && selectedFinish <= range.max ? (
            <div className="finish-inline-detail">
              <h4>Finish {selectedFinish}</h4>
              {detail.recommended ? (
                <>
                  <p className="muted">
                    Preferred route: <strong>{detail.recommended.route.join(" - ")}</strong>
                  </p>
                  <p className="muted">
                    {detail.twoDartOnly.length > 0
                      ? `${detail.twoDartOnly.length} two-dart route(s) available.`
                      : `${detail.recommended.dartsUsed}-dart route available.`}
                  </p>
                  <p className="muted">{getWhyBestMessage(detail.recommended, preferredDouble)}</p>
                  <p className="muted">
                    {getMissPlan(selectedFinish, detail.recommended, preferredDouble)}
                  </p>
                </>
              ) : (
                <p className="warn-text">
                  No direct checkout. Build a setup finish and avoid bogey numbers.
                </p>
              )}
            </div>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
