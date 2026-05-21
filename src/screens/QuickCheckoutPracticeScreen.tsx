import { useEffect, useMemo, useState } from "react";
import { Button, Card, Pill, ScreenTitle, Segmented } from "../components/ui";
import { Dartboard } from "../components/Dartboard";
import { CheckoutAttempt, CheckoutRangeKey, CheckoutResult, TimerOption, UserSettings } from "../types/models";
import {
  CHECKOUT_RANGE_PRESETS,
  TIMER_OPTIONS,
  listPlayableCheckoutNumbers,
  normalizeCheckoutRangeKey,
  sanitizeCheckoutCustomRange
} from "../utils/constants";
import {
  DartTarget,
  formatRoute,
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

interface AttemptSnapshot {
  remaining: number;
  stepIndex: number;
  activeRoute: DartTarget[];
  activeRouteLabel: string;
  selectedTarget: string | null;
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
  return listPlayableCheckoutNumbers(min, max, (value) => {
    const route = getPrimaryCheckoutRoute(value, preferredDouble);
    return Boolean(route && !route.isBogey && route.route.length > 0);
  });
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
  const [selectedRange, setSelectedRange] = useState<CheckoutRangeKey>("61-70");
  const [customStart, setCustomStart] = useState("61");
  const [customEnd, setCustomEnd] = useState("70");
  const [timerSeconds, setTimerSeconds] = useState<TimerOption>(settings.defaultTimer);
  const [stage, setStage] = useState<Stage>("setup");

  const [finish, setFinish] = useState(76);
  const [attemptStartedAt, setAttemptStartedAt] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(settings.defaultTimer);

  const [activeRoute, setActiveRoute] = useState<DartTarget[]>([]);
  const [activeRouteLabel, setActiveRouteLabel] = useState("Optimal route");
  const [stepIndex, setStepIndex] = useState(0);
  const [remaining, setRemaining] = useState(76);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [pickedTargets, setPickedTargets] = useState<string[]>([]);
  const [snapshots, setSnapshots] = useState<AttemptSnapshot[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [completed, setCompleted] = useState(false);
  const [savedResult, setSavedResult] = useState(false);

  const selectedPreset = useMemo(
    () => CHECKOUT_RANGE_PRESETS.find((preset) => preset.key === selectedRange) ?? CHECKOUT_RANGE_PRESETS[0],
    [selectedRange]
  );

  const customRange = useMemo(
    () => sanitizeCheckoutCustomRange(Number(customStart), Number(customEnd)),
    [customStart, customEnd]
  );

  const activeRange = selectedRange === "custom" && customRange
    ? { label: `${customRange.min}-${customRange.max}`, min: customRange.min, max: customRange.max }
    : selectedPreset;

  const playableFinishes = useMemo(
    () => buildPlayableFinishes(activeRange.min, activeRange.max, settings.preferredDouble),
    [activeRange.min, activeRange.max, settings.preferredDouble]
  );

  const currentRouteData = useMemo(
    () => getPrimaryCheckoutRoute(finish, settings.preferredDouble),
    [finish, settings.preferredDouble]
  );

  const expectedTarget = activeRoute[stepIndex] ?? null;

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
          const mainRoute = currentRouteData ? formatRoute(currentRouteData.route) : "No valid route yet.";
          setFeedback({
            tone: "wrong",
            title: "Time up",
            body: `Main: ${mainRoute}`
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
    setSelectedTarget(null);
    setPickedTargets([]);
    setSnapshots([]);
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
    const snapshot: AttemptSnapshot = {
      remaining,
      stepIndex,
      activeRoute: [...activeRoute],
      activeRouteLabel,
      selectedTarget
    };
    setSnapshots((prev) => [...prev, snapshot]);
    setSelectedTarget(chosenTarget);
    setPickedTargets((prev) => [...prev, chosenTarget]);

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
              ? `You hit ${singleHitTarget}. ${continuation?.remaining} left.`
              : `You hit ${singleHitTarget}. ${continuation?.remaining} left. No detailed follow-up yet.`
        });
        return;
      }
    }

    if (chosenTarget !== expected) {
      saveAttempt("failed");
      setCompleted(true);
      const mainRoute = currentRouteData ? formatRoute(currentRouteData.route) : "No valid route yet.";
      setFeedback({
        tone: "wrong",
        title: "Wrong",
        body: `Your picks: ${[...pickedTargets, chosenTarget].join(" -> ")}\nMain: ${mainRoute}`
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
        title: "Correct",
        body: "Correct! Good route."
      });
      return;
    }

    setStepIndex(nextStep);
    setRemaining(nextRemaining);
    setFeedback({
      tone: "correct",
      title: "Correct",
      body: `Good hit: ${expected}.`
    });
  }

  function undoLatestPick() {
    if (completed || snapshots.length === 0 || pickedTargets.length === 0) {
      return;
    }
    const previous = snapshots[snapshots.length - 1];
    if (!previous) {
      return;
    }
    setSnapshots((prev) => prev.slice(0, -1));
    setPickedTargets((prev) => prev.slice(0, -1));
    setRemaining(previous.remaining);
    setStepIndex(previous.stepIndex);
    setActiveRoute(previous.activeRoute);
    setActiveRouteLabel(previous.activeRouteLabel);
    setSelectedTarget(previous.selectedTarget);
    setFeedback(null);
  }

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
            onChange={(value) => setSelectedRange(normalizeCheckoutRangeKey(String(value)))}
          />
          {selectedRange === "custom" ? (
            <div className="row top-gap">
              <input
                className="text-input"
                inputMode="numeric"
                value={customStart}
                onChange={(event) => setCustomStart(event.target.value)}
                placeholder="From (61-170)"
              />
              <input
                className="text-input"
                inputMode="numeric"
                value={customEnd}
                onChange={(event) => setCustomEnd(event.target.value)}
                placeholder="To (61-170)"
              />
            </div>
          ) : null}
          {selectedRange === "custom" && !customRange ? (
            <p className="warn-text top-gap">Custom range must be 61-170 and From must be less than or equal to To.</p>
          ) : null}
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
            <Button full onClick={startPractice} disabled={playableFinishes.length === 0 || (selectedRange === "custom" && !customRange)}>
              Start practice
            </Button>
          </div>
          {feedback?.tone === "info" ? <p className="warn-text top-gap">{feedback.body}</p> : null}
        </Card>
      ) : null}

      {stage === "playing" ? (
        <Card className="practice-card quick-practice-card">
          <div className="practice-header">
            <Pill tone="neutral">{activeRange.label}</Pill>
            <Pill tone="neutral">Preferred double: {settings.preferredDouble}</Pill>
          </div>

          <p className="big-number">Finish: {finish}</p>
          <p>
            <span className="muted">Current remaining:</span> {remaining}
          </p>

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

          <p className="muted">Tap your target choice on the board.</p>
          <p className="muted">
            Your picks: {pickedTargets.length > 0 ? pickedTargets.join(" -> ") : "None yet"}
          </p>

          <Dartboard
            route=""
            reveal={false}
            onTargetSelect={handleTargetTap}
            selectedTarget={selectedTarget}
            disabled={completed || activeRoute.length === 0}
          />

          {!completed && pickedTargets.length > 0 ? (
            <div className="top-gap">
              <Button variant="secondary" onClick={undoLatestPick}>
                UNDO
              </Button>
            </div>
          ) : null}

          {feedback ? (
            <div className="feedback-box quick-feedback-box">
              <h4>{feedback.title}</h4>
              {feedback.body.split("\n").map((line, index) => (
                <p key={`${feedback.title}-${index}`}>{line}</p>
              ))}
              <p>
                <span className="muted">Your picks:</span>{" "}
                {pickedTargets.length > 0 ? pickedTargets.join(" -> ") : "None"}
              </p>
              {completed && currentRouteData ? (
                <>
                  <p>
                    <span className="muted">Main:</span> {formatRoute(currentRouteData.route)}
                  </p>
                  {currentRouteData.singleHitContinuation ? (
                    <p>
                      <span className="muted">If single hit:</span>{" "}
                      {currentRouteData.singleHitContinuation.singleHitTarget}
                      {" -> "}
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
