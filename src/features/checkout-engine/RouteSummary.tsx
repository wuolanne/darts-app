import { PreferredDouble } from "../../types/models";
import {
  getAlternativeCheckoutRoutes,
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
  const curatedAlternatives = getAlternativeCheckoutRoutes(finish, preferredDouble);
  const primaryPath = curatedPrimary?.route ?? bestRoute?.path ?? [];
  const primaryQuality =
    rankedRoutes.find((route) => formatRoute(route.path) === formatRoute(primaryPath))?.quality ??
    bestRoute?.quality ??
    null;
  const topAlternative = curatedAlternatives[0]
    ? {
        route: curatedAlternatives[0].route,
        quality:
          rankedRoutes.find((route) => formatRoute(route.path) === formatRoute(curatedAlternatives[0].route))?.quality ??
          null
      }
    : rankedRoutes.find((route) => formatRoute(route.path) !== formatRoute(primaryPath))
      ? {
          route: rankedRoutes.find((route) => formatRoute(route.path) !== formatRoute(primaryPath))!.path,
          quality: rankedRoutes.find((route) => formatRoute(route.path) !== formatRoute(primaryPath))!.quality
        }
      : null;

  if (!bestRoute && !curatedPrimary) {
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
        {primaryQuality !== null ? <span className="muted">{primaryQuality}%</span> : null}
      </div>
      <p className="route-compact-line">
        <span className="muted">{t.checkoutLibrary.main}:</span> <strong>{formatRoute(primaryPath)}</strong>
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
      {topAlternative ? (
        <p className="route-compact-line">
          <span className="muted">{t.checkoutLibrary.goodAlternatives}:</span>{" "}
          <strong>{formatRoute(topAlternative.route)}</strong>
          {topAlternative.quality !== null ? (
            <>
              {" "}
              <span className="muted">{topAlternative.quality}%</span>
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
