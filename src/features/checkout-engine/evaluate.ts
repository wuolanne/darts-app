import { formatRoute } from "../../utils/checkoutLibrary";
import { getHit } from "./segments";
import { existsCheckout, generateValidRoutes } from "./solver";
import { pathEquals, rankRoutes, xpFromQuality } from "./ranking";
import { CheckoutEvaluationResult, EvaluateCheckoutParams, EvaluatedThrowStep, SegmentCode } from "./types";

function buildFailureExplanation(status: CheckoutEvaluationResult["status"]): string {
  if (status === "bust") return "Bust. The visit was lost by standard double-out rules.";
  if (status === "impossible") return "This route could no longer finish with the darts left.";
  return "No checkout completed within the dart limit.";
}

export function evaluateCheckoutAttempt({
  startScore,
  dartsAvailable,
  throws,
  preferredDouble
}: EvaluateCheckoutParams): CheckoutEvaluationResult {
  let remaining = startScore;
  let dartsLeft = dartsAvailable;
  let status: CheckoutEvaluationResult["status"] = "no-finish";
  const userRoute: SegmentCode[] = [];
  const steps: EvaluatedThrowStep[] = [];

  for (const throwStep of throws.slice(0, dartsAvailable)) {
    const hit = getHit(throwStep.actual);
    if (!hit) break;

    const remainingBefore = remaining;
    const next = remaining - hit.value;
    const bust = next < 0 || next === 1 || (next === 0 && !hit.isFinish);
    userRoute.push(hit.code);
    dartsLeft -= 1;

    if (bust) {
      steps.push({
        intended: throwStep.intended,
        actual: hit.code,
        remainingBefore,
        remainingAfter: remainingBefore,
        dartsLeftAfter: dartsLeft,
        bust: true,
        stillFinishable: false
      });
      status = "bust";
      break;
    }

    remaining = next;
    const checkedOut = remaining === 0;
    const stillFinishable = checkedOut || existsCheckout(remaining, dartsLeft);
    steps.push({
      intended: throwStep.intended,
      actual: hit.code,
      remainingBefore,
      remainingAfter: remaining,
      dartsLeftAfter: dartsLeft,
      bust: false,
      stillFinishable
    });

    if (checkedOut) {
      status = "checked-out";
      break;
    }
    if (!stillFinishable) {
      status = "impossible";
      break;
    }
  }

  const allValidRoutes = generateValidRoutes(startScore, dartsAvailable);
  const ranked = rankRoutes(startScore, allValidRoutes, preferredDouble);
  const exactMatch = ranked.find((route) => pathEquals(route.path, userRoute));
  const optimal = ranked[0] ?? null;
  const validCheckout = status === "checked-out" && Boolean(exactMatch);
  const routeQuality = validCheckout ? exactMatch?.quality ?? 0 : 0;
  const alternatives = ranked.slice(0, 6).map((route) => route.path);

  if (!validCheckout) {
    return {
      status,
      isValidCheckout: false,
      routeQuality: 0,
      xp: 0,
      userRoute,
      optimalRoute: optimal?.path ?? [],
      alternatives,
      allValidRoutes,
      steps,
      explanation: buildFailureExplanation(status),
      improvement: optimal ? `Best route: ${formatRoute(optimal.path)}.` : undefined
    };
  }

  return {
    status: "checked-out",
    isValidCheckout: true,
    routeQuality,
    xp: xpFromQuality(routeQuality),
    routeClass: exactMatch?.routeClass,
    userRoute,
    optimalRoute: optimal?.path ?? [],
    alternatives,
    allValidRoutes,
    steps,
    explanation: exactMatch?.explanation ?? "Checkout complete.",
    improvement: optimal && !pathEquals(optimal.path, userRoute)
      ? `Best route: ${formatRoute(optimal.path)}.`
      : "Played the best route."
  };
}

