import { useMemo, useState } from "react";
import { Card, Pill, ScreenTitle } from "../components/ui";
import { PreferredDouble } from "../types/models";
import {
  CheckoutRouteOption,
  getCheckoutRouteDetails
} from "../utils/checkoutLibrary";

const RANGES = [
  { label: "41-60", min: 41, max: 60 },
  { label: "61-80", min: 61, max: 80 },
  { label: "81-100", min: 81, max: 100 },
  { label: "101-120", min: 101, max: 120 },
  { label: "121-140", min: 121, max: 140 },
  { label: "141-170", min: 141, max: 170 }
];

function formatRoute(route: string[]): string {
  return route.join(" \u2192 ");
}

function RouteDetail({ option }: { option: CheckoutRouteOption }) {
  const mainLine = formatRoute(option.route);
  const continuationLine =
    option.singleHitTarget && option.followUpRoute && option.followUpRoute.length > 0
      ? `If ${option.singleHitTarget}: ${option.remainingAfterSingle} left \u2192 ${formatRoute(option.followUpRoute)}`
      : option.singleHitTarget
        ? `If ${option.singleHitTarget}: ${option.remainingAfterSingle} left`
        : null;

  return (
    <div className="route-teach-card">
      <div className="route-teach-head">
        <strong>{option.label}</strong>
        {option.preferredDouble ? <Pill tone="success">Preferred double route</Pill> : null}
      </div>
      <p className="route-compact-line">
        <span className="muted">Main:</span> <strong>{mainLine}</strong>
      </p>
      {continuationLine ? (
        <p className="route-compact-line">
          <span className="muted">If:</span> <strong>{continuationLine}</strong>
        </p>
      ) : null}
      {option.note ? (
        <p className="route-compact-line">
          <span className="muted">Note:</span> {option.note}
        </p>
      ) : null}
    </div>
  );
}

export function CheckoutLibraryScreen({
  onBack,
  preferredDouble
}: {
  onBack: () => void;
  preferredDouble: PreferredDouble;
}) {
  const [selectedFinish, setSelectedFinish] = useState<number | null>(null);
  const detail = useMemo(() => {
    if (selectedFinish === null) {
      return null;
    }
    return getCheckoutRouteDetails(selectedFinish, preferredDouble);
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
          </div>
          <div className="finish-grid">
            {Array.from({ length: range.max - range.min + 1 }, (_, idx) => range.min + idx).map(
              (finish) => (
                <button
                  key={finish}
                  type="button"
                  className={`finish-chip${selectedFinish === finish ? " finish-chip-active" : ""}`}
                  onClick={() => setSelectedFinish((prev) => (prev === finish ? null : finish))}
                >
                  {finish}
                </button>
              )
            )}
          </div>

          {selectedFinish !== null &&
          selectedFinish >= range.min &&
          selectedFinish <= range.max ? (
            <div className="finish-inline-detail">
              <h4>Finish {selectedFinish}</h4>
              {detail?.isBogey ? (
                <div className="route-teach-card">
                  <p className="warn-text">{detail.note ?? "Bogey number - cannot be finished in three darts."}</p>
                </div>
              ) : detail ? (
                <>
                  {detail.routes.map((option, idx) => (
                    <RouteDetail key={`${selectedFinish}-${option.label}-${idx}`} option={option} />
                  ))}
                </>
              ) : (
                <div className="route-teach-card">
                  <p className="warn-text">No detailed route yet.</p>
                </div>
              )}
            </div>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
