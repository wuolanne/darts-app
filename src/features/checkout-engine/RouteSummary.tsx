import { PreferredDouble } from "../../types/models";
import { formatRoute, getPrimaryCheckoutRoute, getSingleHitContinuation, normalizeDartTarget } from "../../utils/checkoutLibrary";
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
  const rankedRoutes = rankRoutes(finish, validRoutes, preferredDouble);
  const bestRoute = rankedRoutes[0] ?? null;
  const curatedPrimary = getPrimaryCheckoutRoute(finish, preferredDouble);
  const continuation = curatedPrimary ? getSingleHitContinuation(curatedPrimary) : undefined;
  const firstTarget = curatedPrimary?.route[0] ? normalizeDartTarget(curatedPrimary.route[0]) : null;
  const alternatives = rankedRoutes.slice(1, compact ? 4 : 7);

  if (!bestRoute) {
    return (
      <div className="route-teach-card">
        <p className="warn-text">No valid route yet.</p>
      </div>
    );
  }

  return (
    <div className="route-teach-card">
      <div className="route-teach-head">
        <strong>Optimal route</strong>
        <span className="muted">{bestRoute.quality}%</span>
      </div>
      <p className="route-compact-line">
        <span className="muted">Main:</span> <strong>{formatRoute(bestRoute.path)}</strong>
      </p>
      {continuation && firstTarget ? (
        <p className="route-compact-line">
          <span className="muted">Why:</span>{" "}
          If {firstTarget} becomes {normalizeDartTarget(continuation.singleHitTarget)}:{" "}
          {continuation.remaining} left
          {continuation.continuationRoute.length > 0 ? ` -> ${formatRoute(continuation.continuationRoute)}` : ""}
        </p>
      ) : (
        <p className="route-compact-line">
          <span className="muted">Why:</span> Best ranked route from valid double-out finishes.
        </p>
      )}
      {alternatives.length > 0 ? (
        <div className="route-compact-line">
          <span className="muted">Good alternatives:</span>
          <div className="route-alternative-list">
            {alternatives.map((route) => (
              <p key={formatRoute(route.path)} className="route-compact-line">
                <strong>{formatRoute(route.path)}</strong>{" "}
                <span className="muted">{route.quality}%</span>
              </p>
            ))}
          </div>
        </div>
      ) : null}
      {!compact ? (
        <p className="route-compact-line">
          <span className="muted">Valid routes:</span> {validRoutes.length}
        </p>
      ) : null}
    </div>
  );
}

