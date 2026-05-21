import { useMemo, useState } from "react";
import { Card, Pill, ScreenTitle } from "../components/ui";
import { PreferredDouble } from "../types/models";
import { getCheckoutOptions } from "../utils/checkoutLibrary";
import { getRouteForFinish } from "../utils/checkoutRoutes";

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

function byDartsCount(dartsUsed: 1 | 2 | 3, limit: number) {
  return (options: ReturnType<typeof getCheckoutOptions>["options"]) =>
    options.filter((option) => option.dartsUsed === dartsUsed).slice(0, limit);
}

export function CheckoutLibraryScreen({
  onBack,
  preferredDouble
}: {
  onBack: () => void;
  preferredDouble: PreferredDouble;
}) {
  const [selectedFinish, setSelectedFinish] = useState(60);
  const data = useMemo(
    () => getCheckoutOptions(selectedFinish, preferredDouble),
    [selectedFinish, preferredDouble]
  );
  const suggested = getRouteForFinish(selectedFinish, preferredDouble);
  const oneDart = byDartsCount(1, 12)(data.options);
  const twoDart = byDartsCount(2, 24)(data.options);
  const threeDart = byDartsCount(3, 40)(data.options);

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
        </Card>
      ))}

      <Card>
        <h3>Finish {selectedFinish}</h3>
        <p className="muted">Suggested route: {suggested.route}</p>
        <p className="muted">{suggested.note}</p>

        {!data.isCheckoutPossible ? (
          <div className="feedback-box">
            <p className="warn-text">
              No direct checkout from {selectedFinish}. Set up to a finishable number and avoid
              bogey leaves.
            </p>
          </div>
        ) : (
          <>
            <div className="route-section">
              <h4>1 Dart ({oneDart.length})</h4>
              {oneDart.length === 0 ? <p className="muted">No 1-dart checkout.</p> : null}
              <div className="breakdown-list">
                {oneDart.map((option, idx) => (
                  <div key={`one-${idx}`} className="route-row">
                    <span>{option.route.join(" - ")}</span>
                    {option.endsOnPreferred ? <Pill tone="success">Preferred</Pill> : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="route-section">
              <h4>2 Darts ({twoDart.length})</h4>
              {twoDart.length === 0 ? <p className="muted">No 2-dart checkout.</p> : null}
              <div className="breakdown-list">
                {twoDart.map((option, idx) => (
                  <div key={`two-${idx}`} className="route-row">
                    <span>{option.route.join(" - ")}</span>
                    {option.endsOnPreferred ? <Pill tone="success">Preferred</Pill> : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="route-section">
              <h4>3 Darts ({threeDart.length} shown)</h4>
              <p className="muted">Showing first 40 practical routes.</p>
              <div className="breakdown-list">
                {threeDart.map((option, idx) => (
                  <div key={`three-${idx}`} className="route-row">
                    <span>{option.route.join(" - ")}</span>
                    {option.endsOnPreferred ? <Pill tone="success">Preferred</Pill> : null}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
