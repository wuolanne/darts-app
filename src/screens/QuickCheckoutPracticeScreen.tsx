import { useEffect, useMemo, useState } from "react";
import { Button, Card, Pill, ScreenTitle, Segmented } from "../components/ui";
import { Dartboard } from "../components/Dartboard";
import { CheckoutAttempt, CheckoutRangeKey, CheckoutResult, TimerOption, UserSettings } from "../types/models";
import { CHECKOUT_RANGE_PRESETS, TIMER_OPTIONS } from "../utils/constants";
import {
  CheckoutRouteDetails,
  DartTarget,
  formatRoute,
  getBestFirstTarget,
  getCheckoutRouteDetails,
  getPrimaryCheckoutRoute,
  getSingleHitContinuation,
  normalizeDartTarget,
  scoreOfTarget
} from "../utils/checkoutLibrary";
import { triggerHaptic } from "../utils/haptics";
import { formatClock, toRoundedSeconds } from "../utils/time";

type Stage = "setup" | "playing";

interface FeedbackState {
  tone: "correct" | "wrong" | "single" | "complete" | "info";
  title: string;
  body: string;
}

function randomPick<T>(values: T[]): T | null {
  if (values.length === 0) return null;
  const index = Math.floor(Math.random() * values.length);
  return values[index] ?? null;
}

function buildPlayableFinishes(
  min: number,
  max: number,
  preferredDouble: UserSettings["preferredDouble"]
): number[] {
  const list: number[] = [];
  for (let value = min; value <= max; value += 1) {
    const route = getPrimaryCheckoutRoute(value, preferredDouble);
    if (route && !route.isBogey && route.route.length > 0) {
      list.push(value);
    }
  }
  return list;
}

function routePanel(details: CheckoutRouteDetails | null): JSX.Element {
  if (!details || details.routes.length === 0) {
    return <p className="warn-text">No detailed route yet.</p>;
  }

  return (
    <>
      {details.routes.map((option, index) => (
        <div key={`${details.finish}-${option.label}-${index}`} className="route-teach-card">
          <div className="route-teach-head">
            <strong>{option.label}</strong>
            {option.preferredDouble ? <Pill tone="success">Preferred double route</Pill> : null}
          </div>
          <p>
            <span className="muted">Route:</span> {formatRoute(option.route)}
          </p>
          {option.singleHitTarget ? (
            <p>
              <span className="muted">If single hit:</span> If {option.firstTarget} becomes{" "}
              {option.singleHitTarget}
            </p>
          ) : null}
          {option.singleHitTarget ? (
            <p>
              <span className="muted">Remaining:</span> {option.remainingAfterSingle} left
            </p>
          ) : null}
          {option.followUpRoute && option.followUpRoute.length > 0 ? (
            <p>
              <span className="muted">Follow-up:</span> {formatRoute(option.followUpRoute)}
            </p>
          ) : null}
          {option.note ? (
            <p>
              <span className="muted">Note:</span> {option.note}
            </p>
          ) : null}
        </div>
      ))}
    </>
  );
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

  const [finish, setFinish] = useState(76);
  const [attemptStartedAt, setAttemptStartedAt] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(settings.defaultTimer);
  const [routeVisible, setRouteVisible] = useState(false);

  const [activeRoute, setActiveRoute] = useState<DartTarget[]>([]);
  const [activeRouteLabel, setActiveRouteLabel] = useState("Optimal route");
  const [stepIndex, setStepIndex] = useState(0);
  const [remaining, setRemaining] = useState(76);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [completed, setCompleted] = useState(false);
  const [savedResult, setSavedResult] = useState(false);

  const selectedPreset = useMemo(
    () => CHECKOUT_RANGE_PRESETS.find((preset) => preset.key === selectedRange) ?? CHECKOUT_RANGE_PRESETS[1],
    [selectedRange]
  );

  const playableFinishes = useMemo(
    () => buildPlayableFinishes(selectedPreset.min, selectedPreset.max, settings.preferredDouble),
    [selectedPreset.min, selectedPreset.max, settings.preferredDouble]
  );

  const currentRouteData = useMemo(
    () => getPrimaryCheckoutRoute(finish, settings.preferredDouble),
    [finish, settings.preferredDouble]
  );

  const routeDetails = useMemo(
    () => getCheckoutRouteDetails(finish, settings.preferredDouble),
    [finish, settings.preferredDouble]
  );

  const expectedTarget = activeRoute[stepIndex] ?? null;
  const bestFirstTarget = getBestFirstTarget(finish, settings.preferredDouble);

  useEffect(() => {
    if (stage !== "playing" || timerSeconds === 0 || completed) {
      return;
    }
    const interval = window.setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          window.clearInterval(interval);
          if (!savedResult) {
            const elapsed = toRoundedSeconds(performance.now() - attemptStartedAt);
            const attempt: CheckoutAttempt = {
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
              finishNumber: finish,
              range: selectedRange,
              preferredDouble: settings.preferredDouble,
              result: "failed",
              elapsedSeconds: timerSeconds > 0 ? elapsed : null
            };
            onSaveAttempt(attempt);
            setSavedResult(true);
          }
          setCompleted(true);
          setFeedback({
            tone: "wrong",
            title: "Timer ended",
            body: "Time is up. Review the route and press NEXT CHECKOUT."
          });
          return 0;
        }
        return previous - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [
    attemptStartedAt,
    completed,
    finish,
    onSaveAttempt,
    savedResult,
    selectedRange,
    settings.preferredDouble,
    stage,
    timerSeconds
  ]);

  function saveAttempt(result: CheckoutResult) {
    if (savedResult) return;
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
    setSavedResult(true);
  }

  function loadCheckout(nextFinish: number) {
    const primary = getPrimaryCheckoutRoute(nextFinish, settings.preferredDouble);
    const fallbackRoute = primary?.route ?? [];

    setFinish(nextFinish);
    setAttemptStartedAt(performance.now());
    setSecondsLeft(timerSeconds);
    setRouteVisible(false);
    setSelectedTarget(null);
    setFeedback(null);
    setCompleted(false);
    setSavedResult(false);
    setStepIndex(0);
    setRemaining(nextFinish);
    setActiveRoute(fallbackRoute);
    setActiveRouteLabel(primary?.label ?? "Optimal route");
    setStage("playing");
  }

  function startPractice() {
    const nextFinish = randomPick(playableFinishes);
    if (nextFinish === null) {
      setFeedback({
        tone: "info",
        title: "No route data",
        body: "No detailed route yet for this range. Pick another range for now."
      });
      return;
    }
    loadCheckout(nextFinish);
  }

  function nextCheckout() {
    const nextFinish = randomPick(playableFinishes);
    if (nextFinish === null) {
      setFeedback({
        tone: "info",
        title: "No route data",
        body: "No detailed route yet for this range. Pick another range for now."
      });
      return;
    }
    loadCheckout(nextFinish);
  }

  function handleTargetTap(rawTarget: string) {
    if (stage !== "playing" || completed || activeRoute.length === 0 || !expectedTarget) {
      return;
    }

    const chosenTarget = normalizeDartTarget(rawTarget);
    const expected = normalizeDartTarget(expectedTarget);
    setSelectedTarget(chosenTarget);

    if (stepIndex === 0 && currentRouteData) {
      const continuation = getSingleHitContinuation(currentRouteData);
      const singleHitTarget = continuation?.singleHitTarget
        ? normalizeDartTarget(continuation.singleHitTarget)
        : null;
      if (singleHitTarget && chosenTarget === singleHitTarget) {
        const followUpRoute = continuation?.continuationRoute ?? [];
        setActiveRoute(followUpRoute);
        setActiveRouteLabel("Single-hit continuation");
        setStepIndex(0);
        setRemaining(continuation?.remaining ?? remaining);
        if (followUpRoute.length === 0) {
          setCompleted(true);
          saveAttempt("failed");
        }
        setFeedback({
          tone: "single",
          title: "Single hit",
          body:
            followUpRoute.length > 0
              ? `You hit ${singleHitTarget}. ${continuation?.remaining} left. Continue: ${formatRoute(followUpRoute)}`
              : `You hit ${singleHitTarget}. ${continuation?.remaining} left. No detailed follow-up yet.`
        });
        return;
      }
    }

    if (chosenTarget !== expected) {
      setFeedback({
        tone: "wrong",
        title: "Wrong target",
        body: `You chose ${chosenTarget}. Expected ${expected}. Keep playing this same checkout.`
      });
      return;
    }

    const scored = scoreOfTarget(expected);
    const nextRemaining = scored === null ? remaining : Math.max(0, remaining - scored);
    const nextStep = stepIndex + 1;

    if (nextStep >= activeRoute.length) {
      setRemaining(nextRemaining);
      setCompleted(true);
      saveAttempt("finished");
      triggerHaptic(settings.vibrationFeedback);
      setFeedback({
        tone: "complete",
        title: "Checkout complete",
        body: `Route done: ${formatRoute(activeRoute)}`
      });
      return;
    }

    setStepIndex(nextStep);
    setRemaining(nextRemaining);
    setFeedback({
      tone: "correct",
      title: "Correct",
      body: `Good hit: ${expected}. Next target: ${normalizeDartTarget(activeRoute[nextStep]!)}`
    });
  }

  const boardRoute = routeVisible
    ? activeRoute.join(", ")
    : expectedTarget
      ? expectedTarget
      : "";

  return (
    <div className="screen">
      <ScreenTitle title="Quick Checkout Practice" subtitle="Learning mode: tap the board target-by-target." onBack={onBack} />

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
          <p className="muted top-gap">Playable finishes in this range: {playableFinishes.length}</p>
          <div className="top-gap">
            <Button full onClick={startPractice} disabled={playableFinishes.length === 0}>
              Start practice
            </Button>
          </div>
          {feedback?.tone === "info" ? <p className="warn-text top-gap">{feedback.body}</p> : null}
        </Card>
      ) : null}

      {stage === "playing" ? (
        <Card className="practice-card quick-practice-card">
          <div className="practice-header">
            <Pill tone="neutral">{selectedPreset.label}</Pill>
            <Pill tone="neutral">Preferred double: {settings.preferredDouble}</Pill>
          </div>

          <p className="big-number">Finish: {finish}</p>
          <p>
            <span className="muted">Current remaining:</span> {remaining}
          </p>
          <p>
            <span className="muted">Expected target:</span> {expectedTarget ?? "No valid route yet."}
          </p>
          <p>
            <span className="muted">Best first target:</span> {bestFirstTarget ?? "No valid route yet."}
          </p>
          {currentRouteData ? (
            <p>
              <span className="muted">Optimal route:</span> {formatRoute(currentRouteData.route)}
            </p>
          ) : (
            <p className="warn-text">No valid route yet.</p>
          )}

          {timerSeconds > 0 ? (
            <div className="timer-wrap">
              <div className="timer-row">
                <span>Timer</span>
                <strong>{formatClock(secondsLeft)}</strong>
              </div>
              <div className="progress">
                <span style={{ width: `${(Math.max(secondsLeft, 0) / timerSeconds) * 100}%` }} />
              </div>
            </div>
          ) : null}

          <p className="muted">Tap the dartboard target shown above.</p>

          <Dartboard
            route={boardRoute}
            reveal
            onTargetSelect={handleTargetTap}
            selectedTarget={selectedTarget}
            disabled={completed || activeRoute.length === 0}
          />

          <div className="top-gap">
            <Button variant="ghost" onClick={() => setRouteVisible((previous) => !previous)}>
              {routeVisible ? "HIDE ROUTE" : "SHOW ROUTE"}
            </Button>
          </div>

          {routeVisible ? (
            <div className="finish-inline-detail">
              <h4>Finish {finish}</h4>
              {routePanel(routeDetails)}
            </div>
          ) : null}

          {feedback ? (
            <div className="feedback-box quick-feedback-box">
              <h4>{feedback.title}</h4>
              <p>{feedback.body}</p>
              <p>
                <span className="muted">Route now:</span>{" "}
                {activeRoute.length > 0 ? `${activeRouteLabel}: ${formatRoute(activeRoute)}` : "No valid route yet."}
              </p>
              {!completed && currentRouteData ? (
                <>
                  <p>
                    <span className="muted">Best first target:</span> {bestFirstTarget ?? "No valid route yet."}
                  </p>
                  {currentRouteData.singleHitContinuation ? (
                    <p>
                      <span className="muted">If single hit:</span>{" "}
                      {currentRouteData.singleHitContinuation.singleHitTarget} leaves{" "}
                      {currentRouteData.singleHitContinuation.remaining}, follow-up{" "}
                      {currentRouteData.singleHitContinuation.continuationRoute.length > 0
                        ? formatRoute(currentRouteData.singleHitContinuation.continuationRoute)
                        : "No detailed follow-up yet."}
                    </p>
                  ) : null}
                </>
              ) : null}
              {completed ? (
                <div className="top-gap">
                  <Button full onClick={nextCheckout}>
                    NEXT CHECKOUT
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
