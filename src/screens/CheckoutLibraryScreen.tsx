import { useMemo, useState } from "react";
import { Card, ScreenTitle } from "../components/ui";
import { PreferredDouble } from "../types/models";
import { getCheckoutRouteDetails } from "../utils/checkoutLibrary";
import { CheckoutRouteSummary } from "../features/checkout-engine/RouteSummary";
import { useI18n } from "../i18n";

const RANGES = [
  { label: "60-80", min: 60, max: 80 },
  { label: "81-100", min: 81, max: 100 },
  { label: "101-120", min: 101, max: 120 },
  { label: "121-140", min: 121, max: 140 },
  { label: "141-170", min: 141, max: 170 }
];

export function CheckoutLibraryScreen({
  onBack,
  preferredDouble
}: {
  onBack: () => void;
  preferredDouble: PreferredDouble;
}) {
  const { t } = useI18n();
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
        title={t.checkoutLibrary.title}
        subtitle={`${t.checkoutLibrary.subtitle}: ${preferredDouble}`}
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
              <h4>{t.checkoutLibrary.finish} {selectedFinish}</h4>
              {detail?.isBogey ? (
                <div className="route-teach-card">
                  <p className="warn-text">{detail.note ?? "Bogey number - cannot be finished in three darts."}</p>
                </div>
              ) : detail ? (
                <CheckoutRouteSummary finish={selectedFinish} preferredDouble={preferredDouble} />
              ) : (
                <div className="route-teach-card">
                  <p className="warn-text">{t.checkoutLibrary.noDetailedRoute}</p>
                </div>
              )}
            </div>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
