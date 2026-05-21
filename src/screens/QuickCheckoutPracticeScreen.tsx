import { useEffect, useMemo, useState } from "react";
import { Button, Card, Pill, ScreenTitle, Segmented } from "../components/ui";
import {
  CheckoutAttempt,
  CheckoutRangeKey,
  CheckoutResult,
  TimerOption,
  UserSettings
} from "../types/models";
import { CHECKOUT_RANGE_PRESETS, TIMER_OPTIONS } from "../utils/constants";
import { getRouteForFinish } from "../utils/checkoutRoutes";
import { triggerHaptic } from "../utils/haptics";
import { formatClock, toRoundedSeconds } from "../utils/time";

type Stage = "setup" | "attempt" | "feedback";

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function feedbackForResult(result: CheckoutResult, preferredDouble: string): string {
  if (result === "finished") {
    return "Good route. Confident finish.";
  }
  if (result === "good_leave") {
    return preferredDouble === "D16"
      ? "Good leave. Leaves D16 chain."
      : "Good leave. Keeps checkout options open.";
  }
  if (result === "bust") {
    return "Bust risk. Reset with a simpler setup route.";
  }
  return "Bad leave. Does not match your preferred double route.";
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
          completeAttempt("failed");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [stage, timerSeconds]);

  const startNext = () => {
    const nextFinish = randomBetween(selectedPreset.min, selectedPreset.max);
    setFinish(nextFinish);
    setAttemptStartedAt(performance.now());
    setRouteVisible(false);
    setFeedback("");
    setLastResult(null);
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
    setFeedback(feedbackForResult(result, settings.preferredDouble));
    setLastResult(result);
    setStage("feedback");
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

          {stage === "attempt" ? (
            <div className="action-grid">
              <Button variant="success" onClick={() => completeAttempt("finished")}>
                FINISHED
              </Button>
              <Button variant="secondary" onClick={() => completeAttempt("good_leave")}>
                GOOD LEAVE
              </Button>
              <Button variant="danger" onClick={() => completeAttempt("failed")}>
                FAILED
              </Button>
              <Button variant="warning" onClick={() => completeAttempt("bust")}>
                BUST
              </Button>
              <Button variant="ghost" onClick={() => setRouteVisible((prev) => !prev)}>
                SHOW ROUTE
              </Button>
            </div>
          ) : null}

          {stage === "feedback" ? (
            <div className="feedback-box">
              <h4>Feedback</h4>
              <p>{feedback}</p>
              {lastResult === "finished" ? <p className="muted">Good route and confident closeout.</p> : null}
              {lastResult === "good_leave" ? <p className="muted">Leaves D16 chain or a stable next dart.</p> : null}
              {lastResult === "failed" ? <p className="muted">Bad leave. Reset to avoid bogey numbers.</p> : null}
              {lastResult === "bust" ? <p className="muted">Bust risk detected. Use safer first dart.</p> : null}
              <Button full onClick={startNext}>
                Next checkout
              </Button>
            </div>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
