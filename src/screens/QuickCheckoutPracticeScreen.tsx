import { useEffect, useMemo, useState } from "react";
import { Button, Card, Pill, ScreenTitle, Segmented } from "../components/ui";
import { Dartboard } from "../components/Dartboard";
import { CheckoutAttempt, CheckoutRangeKey, CheckoutResult, TimerOption, UserSettings } from "../types/models";
import { CHECKOUT_RANGE_PRESETS, TIMER_OPTIONS } from "../utils/constants";
import { getRouteForFinish } from "../utils/checkoutRoutes";
import { triggerHaptic } from "../utils/haptics";
import { formatClock, toRoundedSeconds } from "../utils/time";

type Stage = "setup" | "attempt" | "feedback";

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function normalizeToken(token: string): string {
  return token.trim().toUpperCase();
}

function firstTargetFromRoute(route: string): string | null {
  const first = route
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)[0];
  if (!first) {
    return null;
  }
  if (first === "BULL") {
    return "BULL";
  }
  if (first === "25") {
    return "25";
  }
  if (/^\d{1,2}$/.test(first)) {
    return `S${first}`;
  }
  return first.toUpperCase();
}

function whyGoodRoute(route: string, usedPreferredRoute: boolean, preferredDouble: string): string {
  const darts = route.split(",").length;
  if (usedPreferredRoute) {
    return `Good because it supports your preferred double ${preferredDouble} in ${darts}-dart flow.`;
  }
  if (darts <= 2) {
    return "Good because it is a clean high-percentage 2-dart route.";
  }
  return "Good because it avoids awkward leaves and keeps a clear finish path.";
}

function missPlanForSingleMiss(finish: number, expectedTarget: string, route: string): string {
  const trebleMatch = expectedTarget.match(/^T(\d{1,2})$/);
  if (!trebleMatch) {
    return "If first dart misses, set up a clean double for the next dart.";
  }
  const singleScore = Number(trebleMatch[1]);
  const left = finish - singleScore;
  return `If ${expectedTarget} drops to S${singleScore}, ${left} left. Switch to safe setup route: ${route}.`;
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
  const [feedback, setFeedback] = useState("");
  const [lastResult, setLastResult] = useState<CheckoutResult | null>(null);
  const [lastPick, setLastPick] = useState<string | null>(null);
  const [expectedPick, setExpectedPick] = useState<string | null>(null);

  const selectedPreset = useMemo(
    () => CHECKOUT_RANGE_PRESETS.find((preset) => preset.key === selectedRange) ?? CHECKOUT_RANGE_PRESETS[0],
    [selectedRange]
  );
  const route = getRouteForFinish(finish, settings.preferredDouble);

  useEffect(() => {
    if (stage !== "attempt" || timerSeconds === 0) {
      return;
    }
    setSecondsLeft(timerSeconds);
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          const expected = firstTargetFromRoute(route.route);
          setExpectedPick(expected ? normalizeToken(expected) : null);
          setFeedback(
            expected
              ? `Time over. Best first target was ${normalizeToken(expected)}. ${whyGoodRoute(
                  route.route,
                  route.usedPreferredRoute,
                  settings.preferredDouble
                )}`
              : "Time over."
          );
          setRouteVisible(true);
          completeAttempt("failed");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [stage, timerSeconds, route.route, route.usedPreferredRoute, settings.preferredDouble]);

  useEffect(() => {
    if (stage !== "feedback") {
      return;
    }
    const timer = window.setTimeout(() => {
      startNext();
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [stage]);

  const startNext = () => {
    const nextFinish = randomBetween(selectedPreset.min, selectedPreset.max);
    setFinish(nextFinish);
    setAttemptStartedAt(performance.now());
    setRouteVisible(false);
    setFeedback("");
    setLastResult(null);
    setLastPick(null);
    setExpectedPick(null);
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
    setLastResult(result);
    setStage("feedback");
  };

  const handleBoardPick = (pickedTarget: string) => {
    if (stage !== "attempt") {
      return;
    }
    const expected = firstTargetFromRoute(route.route);
    if (!expected) {
      completeAttempt("failed");
      return;
    }

    const normalizedPick = normalizeToken(pickedTarget);
    const normalizedExpected = normalizeToken(expected);
    const correct = normalizedPick === normalizedExpected;
    const reason = whyGoodRoute(route.route, route.usedPreferredRoute, settings.preferredDouble);
    const missPlan = missPlanForSingleMiss(finish, normalizedExpected, route.route);
    const nextFeedback = correct
      ? `Correct: ${normalizedPick}. ${reason}`
      : `Wrong: ${normalizedPick}. Best was ${normalizedExpected}. ${reason} ${missPlan}`;

    setLastPick(normalizedPick);
    setExpectedPick(normalizedExpected);
    setFeedback(nextFeedback);
    setRouteVisible(true);
    completeAttempt(correct ? "finished" : "failed");
  };

  return (
    <div className="screen">
      <ScreenTitle title="Quick Checkout Practice" subtitle="Tap once per attempt." onBack={onBack} />

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
        <Card className="practice-card">
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

          {routeVisible ? (
            <div className="route-box">
              <h4>Route hint</h4>
              <p>{route.route}</p>
              <p className="muted">{route.note}</p>
            </div>
          ) : null}

          <p className="muted">Tap the board for your first target choice.</p>
          <Dartboard
            route={route.route}
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

          {stage === "feedback" ? (
            <div className="feedback-box">
              <h4>{lastResult === "finished" ? "Correct" : "Wrong"}</h4>
              <p>{feedback}</p>
              {expectedPick ? <p className="muted">Best first target: {expectedPick}</p> : null}
              <p className="muted">Moving to next checkout…</p>
            </div>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
