import { useEffect, useMemo, useState } from "react";
import { Button, Card, Pill, ScreenTitle, Segmented } from "../components/ui";
import { Dartboard } from "../components/Dartboard";
import { CheckoutAttempt, CheckoutRangeKey, CheckoutResult, TimerOption, UserSettings } from "../types/models";
import { CHECKOUT_RANGE_PRESETS, TIMER_OPTIONS } from "../utils/constants";
import {
  CheckoutRouteOption,
  getCheckoutRouteDetails,
  isValidDartTarget
} from "../utils/checkoutLibrary";
import { triggerHaptic } from "../utils/haptics";
import { formatClock, toRoundedSeconds } from "../utils/time";

type Stage = "setup" | "attempt" | "feedback";

interface FeedbackState {
  correct: boolean;
  chosenTarget: string;
  bestTarget: string;
  routeLabel: string;
  route: string[];
  singleHitTarget?: string;
  remainingAfterSingle: number;
  followUpRoute?: string[];
  explanation: string;
  note?: string;
}

function normalizeToken(token: string): string {
  return token.trim().toUpperCase();
}

function formatRoute(route: string[]): string {
  return route.join(" \u2192 ");
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickPrimaryRoute(optionList: CheckoutRouteOption[]): CheckoutRouteOption | null {
  if (optionList.length === 0) return null;
  const preferred = optionList.find((item) => item.preferredDouble);
  if (preferred) return preferred;
  return optionList[0];
}

function routeExplanation(route: CheckoutRouteOption, preferredDouble: string): string {
  if (route.preferredDouble) {
    return `Good route because it supports your preferred double ${preferredDouble}.`;
  }
  return "Good route because it keeps a clean high-percentage finish path.";
}

function findNextFinish(
  min: number,
  max: number,
  preferredDouble: UserSettings["preferredDouble"]
): number {
  for (let i = 0; i < 120; i += 1) {
    const candidate = randomBetween(min, max);
    const details = getCheckoutRouteDetails(candidate, preferredDouble);
    const route = details ? pickPrimaryRoute(details.routes) : null;
    if (route && isValidDartTarget(route.firstTarget)) {
      return candidate;
    }
  }
  return randomBetween(min, max);
}

export function QuickCheckoutPracticeScreen({
  settings,
  onBack,
  onSaveAttempt
}: {
  settings: UserSettings;
  onBack: () => void;
  onSaveAttempt: (attempt: CheckoutAttempt) => void;
}) {
  const [selectedRange, setSelectedRange] = useState<CheckoutRangeKey>("61-80");
  const [timerSeconds, setTimerSeconds] = useState<TimerOption>(settings.defaultTimer);
  const [stage, setStage] = useState<Stage>("setup");
  const [finish, setFinish] = useState<number>(76);
  const [attemptStartedAt, setAttemptStartedAt] = useState<number>(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(settings.defaultTimer);
  const [routeVisible, setRouteVisible] = useState(false);
  const [lastPick, setLastPick] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const selectedPreset = useMemo(
    () => CHECKOUT_RANGE_PRESETS.find((preset) => preset.key === selectedRange) ?? CHECKOUT_RANGE_PRESETS[0],
    [selectedRange]
  );

  const details = useMemo(
    () => getCheckoutRouteDetails(finish, settings.preferredDouble),
    [finish, settings.preferredDouble]
  );
  const primaryRoute = useMemo(
    () => (details ? pickPrimaryRoute(details.routes) : null),
    [details]
  );
  const alternativeRoute = useMemo(
    () =>
      details?.routes.find(
        (item) =>
          primaryRoute &&
          item !== primaryRoute &&
          item.label.toLowerCase().includes("alternative")
      ) ?? null,
    [details, primaryRoute]
  );
  const bestTarget = primaryRoute && isValidDartTarget(primaryRoute.firstTarget) ? primaryRoute.firstTarget : null;

  useEffect(() => {
    if (stage !== "attempt" || timerSeconds === 0) {
      return;
    }
    setSecondsLeft(timerSeconds);
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          const timedOutFeedback: FeedbackState = {
            correct: false,
            chosenTarget: "No target selected",
            bestTarget: bestTarget ?? "No valid route yet.",
            routeLabel: primaryRoute?.label ?? "Route",
            route: primaryRoute?.route ?? [],
            singleHitTarget: primaryRoute?.singleHitTarget,
            remainingAfterSingle: primaryRoute?.remainingAfterSingle ?? 0,
            followUpRoute: primaryRoute?.followUpRoute,
            explanation: bestTarget
              ? `Time over. ${routeExplanation(primaryRoute!, settings.preferredDouble)}`
              : "No valid route yet.",
            note: primaryRoute?.note
          };
          setFeedback(timedOutFeedback);
          setRouteVisible(true);
          completeAttempt("failed");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [stage, timerSeconds, bestTarget, primaryRoute, settings.preferredDouble]);

  const startNext = () => {
    const nextFinish = findNextFinish(
      selectedPreset.min,
      selectedPreset.max,
      settings.preferredDouble
    );
    setFinish(nextFinish);
    setAttemptStartedAt(performance.now());
    setRouteVisible(false);
    setLastPick(null);
    setFeedback(null);
    setSecondsLeft(timerSeconds);
    setStage("attempt");
  };

  const completeAttempt = (result: CheckoutResult) => {
    if (stage !== "attempt") {
      return;
    }
    const elapsed = toRoundedSeconds(performance.now() - attemptStartedAt);
    const attempt: CheckoutAttempt = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      finishNumber: finish,
      range: selectedRange,
      preferredDouble: settings.preferredDouble,
      result,
      elapsedSeconds: timerSeconds > 0 ? elapsed : null
    };
    onSaveAttempt(attempt);
    triggerHaptic(settings.vibrationFeedback);
    setStage("feedback");
  };

  const handleBoardPick = (pickedTarget: string) => {
    if (stage !== "attempt") {
      return;
    }

    const normalizedPick = normalizeToken(pickedTarget);
    setLastPick(normalizedPick);
    setRouteVisible(true);

    if (!bestTarget || !primaryRoute) {
      setFeedback({
        correct: false,
        chosenTarget: normalizedPick,
        bestTarget: "No valid route yet.",
        routeLabel: "Route",
        route: [],
        remainingAfterSingle: 0,
        explanation: "No valid route yet.",
        note: "No valid route yet."
      });
      completeAttempt("failed");
      return;
    }

    const normalizedBest = normalizeToken(bestTarget);
    const correct = normalizedPick === normalizedBest;
    setFeedback({
      correct,
      chosenTarget: normalizedPick,
      bestTarget: normalizedBest,
      routeLabel: primaryRoute.label,
      route: primaryRoute.route,
      singleHitTarget: primaryRoute.singleHitTarget,
      remainingAfterSingle: primaryRoute.remainingAfterSingle,
      followUpRoute: primaryRoute.followUpRoute,
      explanation: correct
        ? routeExplanation(primaryRoute, settings.preferredDouble)
        : `Best first target is ${normalizedBest}. ${routeExplanation(primaryRoute, settings.preferredDouble)}`,
      note: primaryRoute.note
    });
    completeAttempt(correct ? "finished" : "failed");
  };

  return (
    <div className="screen">
      <ScreenTitle title="Quick Checkout Practice" subtitle="First-target mini game on the dartboard." onBack={onBack} />

      {stage === "setup" ? (
        <Card>
          <h3>Setup</h3>
          <p className="muted">Range</p>
          <Segmented
            value={selectedRange}
            options={CHECKOUT_RANGE_PRESETS.map((preset) => ({ label: preset.label, value: preset.key }))}
            onChange={setSelectedRange}
          />
          <p className="muted top-gap">Timer</p>
          <Segmented
            value={timerSeconds}
            options={TIMER_OPTIONS.map((option) => ({
              label: option === 0 ? "Off" : `${option}s`,
              value: option
            }))}
            onChange={setTimerSeconds}
          />
          <div className="top-gap">
            <Button full onClick={startNext}>
              Start practice
            </Button>
          </div>
        </Card>
      ) : null}

      {stage !== "setup" ? (
        <Card className="practice-card quick-practice-card">
          <div className="practice-header">
            <Pill tone="neutral">{selectedPreset.label}</Pill>
            <Pill tone="neutral">Preferred double: {settings.preferredDouble}</Pill>
          </div>
          <p className="big-number">Finish: {finish}</p>

          {timerSeconds > 0 ? (
            <div className="timer-wrap">
              <div className="timer-row">
                <span>Timer</span>
                <strong>{formatClock(secondsLeft)}</strong>
              </div>
              <div className="progress">
                <span
                  style={{
                    width: `${(Math.max(secondsLeft, 0) / timerSeconds) * 100}%`
                  }}
                />
              </div>
            </div>
          ) : null}

          {routeVisible && primaryRoute ? (
            <div className="route-box quick-route-box">
              <h4>{primaryRoute.label}</h4>
              <p>{formatRoute(primaryRoute.route)}</p>
              {primaryRoute.singleHitTarget ? (
                <p className="muted">
                  If single hit: {primaryRoute.singleHitTarget} leaves {primaryRoute.remainingAfterSingle}
                </p>
              ) : null}
              {primaryRoute.followUpRoute && primaryRoute.followUpRoute.length > 0 ? (
                <p className="muted">Follow-up: {formatRoute(primaryRoute.followUpRoute)}</p>
              ) : null}
              {alternativeRoute ? (
                <p className="muted">
                  Alternative route: {formatRoute(alternativeRoute.route)}
                </p>
              ) : null}
              {primaryRoute.note ? <p className="muted">{primaryRoute.note}</p> : null}
            </div>
          ) : null}

          <p className="muted">Tap the board once for your first target.</p>
          <Dartboard
            route={primaryRoute ? primaryRoute.route.join(", ") : ""}
            reveal={routeVisible || stage === "feedback"}
            onTargetSelect={handleBoardPick}
            selectedTarget={lastPick}
            disabled={stage !== "attempt"}
          />

          {stage === "attempt" ? (
            <div className="top-gap">
              <Button variant="ghost" onClick={() => setRouteVisible((prev) => !prev)}>
                {routeVisible ? "HIDE ROUTE" : "SHOW ROUTE"}
              </Button>
            </div>
          ) : null}

          {stage === "feedback" && feedback ? (
            <div className="feedback-box quick-feedback-box">
              <h4>{feedback.correct ? "Correct" : "Wrong"}</h4>
              <p>You chose {feedback.chosenTarget}.</p>
              <p>
                <span className="muted">Best first target:</span> {feedback.bestTarget}
              </p>
              {feedback.route.length > 0 ? (
                <p>
                  <span className="muted">{feedback.routeLabel}:</span> {formatRoute(feedback.route)}
                </p>
              ) : (
                <p className="warn-text">No valid route yet.</p>
              )}
              {feedback.singleHitTarget ? (
                <p>
                  <span className="muted">If single hit:</span> {feedback.singleHitTarget} leaves{" "}
                  {feedback.remainingAfterSingle}
                </p>
              ) : null}
              {feedback.followUpRoute && feedback.followUpRoute.length > 0 ? (
                <p>
                  <span className="muted">Follow-up:</span> {formatRoute(feedback.followUpRoute)}
                </p>
              ) : null}
              <p className="muted">{feedback.explanation}</p>
              {feedback.note ? <p className="muted">{feedback.note}</p> : null}
              <div className="top-gap">
                <Button full onClick={startNext}>
                  Next checkout
                </Button>
              </div>
            </div>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
