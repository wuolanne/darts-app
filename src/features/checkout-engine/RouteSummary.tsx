import { PreferredDouble } from "../../types/models";
import {
  formatRoute,
  getPrimaryCheckoutRoute,
  getSingleHitContinuation,
  normalizeDartTarget
} from "../../utils/checkoutLibrary";
import { formatI18n, useI18n } from "../../i18n";
import { generateValidRoutes, rankRoutes } from "./index";

export function CheckoutRouteSummary({
  finish,
  preferredDouble,
  compact = false
}: {
  finish: number;
  preferredDouble: PreferredDouble;
  compact?: boolean;
}) {
  const validRoutes = generateValidRoutes(finish, 3);
  const { t } = useI18n();
  const rankedRoutes = rankRoutes(finish, validRoutes, preferredDouble);
  const bestRoute = rankedRoutes[0] ?? null;
  const curatedPrimary = getPrimaryCheckoutRoute(finish, preferredDouble);
  const continuation = curatedPrimary ? getSingleHitContinuation(curatedPrimary) : undefined;
  const firstTarget = curatedPrimary?.route[0] ? normalizeDartTarget(curatedPrimary.route[0]) : null;
  const alternatives = rankedRoutes.slice(1, 2);

  if (!bestRoute) {
    return (
      <div className="route-teach-card">
        <p className="warn-text">{t.quickCheckout.noValidRouteYet}</p>
      </div>
    );
  }

  return (
    <div className={`route-teach-card${compact ? " route-teach-card-compact" : ""}`}>
      <div className="route-teach-head">
        <strong>{t.checkoutLibrary.optimalRoute}</strong>
        <span className="muted">{bestRoute.quality}%</span>
      </div>
      <p className="route-compact-line">
        <span className="muted">{t.checkoutLibrary.main}:</span> <strong>{formatRoute(bestRoute.path)}</strong>
      </p>
      {continuation && firstTarget ? (
        <p className="route-compact-line">
          <span className="muted">{t.checkoutLibrary.why}:</span>{" "}
          {formatI18n(t.checkoutTimedRun.ifHit, {
            from: firstTarget,
            to: normalizeDartTarget(continuation.singleHitTarget)
          })}{" "}
          {continuation.remaining} {t.common.left}
          {continuation.continuationRoute.length > 0 ? ` → ${formatRoute(continuation.continuationRoute)}` : ""}
        </p>
      ) : (
        <p className="route-compact-line">
          <span className="muted">{t.checkoutLibrary.why}:</span> {t.checkoutLibrary.bestRankedRoute}
        </p>
      )}
      {alternatives.length > 0 ? (
        <p className="route-compact-line">
          <span className="muted">{t.checkoutLibrary.goodAlternatives}:</span>{" "}
          <strong>{formatRoute(alternatives[0].path)}</strong>{" "}
          <span className="muted">{alternatives[0].quality}%</span>
        </p>
      ) : null}
    </div>
  );
}
