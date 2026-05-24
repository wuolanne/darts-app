import { useEffect, useMemo, useState } from "react";
import { Button, Card, ScreenTitle, Segmented } from "../components/ui";
import { CheckoutMiniGameScreen } from "../components/CheckoutMiniGameScreen";
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
  getPrimaryCheckoutRoute,
  normalizeDartTarget
} from "../utils/checkoutLibrary";
import { CheckoutEvaluationResult, evaluateCheckoutAttempt } from "../features/checkout-engine";
import { triggerHaptic } from "../utils/haptics";
import { toRoundedSeconds } from "../utils/time";
import { useI18n } from "../i18n";

type Stage = "setup" | "playing";

interface FeedbackState {
  tone: "correct" | "wrong" | "complete" | "info";
  title: string;
  body: string;
}

interface RouteSnapshot {
  remaining: number;
}

interface PickHistoryItem {
  snapshot: RouteSnapshot;
}

function randomPick<T>(values: T[]): T | null {
  if (values.length === 0) return null;
  const index = Math.floor(Math.random() * values.length);
  return values[index] ?? null;
}

function randomPickAvoiding<T>(values: T[], getKey: (value: T) => string, avoidKey: string | null): T | null {
  if (values.length === 0) return null;
  if (!avoidKey || values.length === 1) return randomPick(values);
  const filtered = values.filter((item) => getKey(item) !== avoidKey);
  if (filtered.length === 0) return randomPick(values);
  return randomPick(filtered);
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
  const { t } = useI18n();
  const [selectedRange, setSelectedRange] = useState<CheckoutRangeKey>("61-70");
  const [customStart, setCustomStart] = useState("61");
  const [customEnd, setCustomEnd] = useState("70");
  const [timerSeconds, setTimerSeconds] = useState<TimerOption>(settings.defaultTimer);
  const [stage, setStage] = useState<Stage>("setup");

  const [finish, setFinish] = useState(76);
  const [attemptStartedAt, setAttemptStartedAt] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(settings.defaultTimer);

  const [activeRoute, setActiveRoute] = useState<DartTarget[]>([]);
  const [remaining, setRemaining] = useState(76);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [completed, setCompleted] = useState(false);
  const [savedResult, setSavedResult] = useState(false);
  const [pickedTargets, setPickedTargets] = useState<string[]>([]);
  const [pickHistory, setPickHistory] = useState<PickHistoryItem[]>([]);
  const [lastMainFinish, setLastMainFinish] = useState<number | null>(null);

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
  const playableCountForMode = playableFinishes.length;

  const currentRouteData = useMemo(
    () => getPrimaryCheckoutRoute(finish, settings.preferredDouble),
    [finish, settings.preferredDouble]
  );

  const attemptStartScore = finish;
  const maxDarts = 3;
  const getEvaluationExplanation = (result: CheckoutEvaluationResult): string => {
    if (!result.isValidCheckout) {
      if (result.status === "bust") return t.quickCheckout.bustExplanation;
      if (result.status === "impossible") return t.quickCheckout.impossibleExplanation;
      return t.quickCheckout.noFinishExplanation;
    }
    if (result.routeQuality >= 96) return t.quickCheckout.perfectRouteExplanation;
    if (result.routeQuality >= 80) {
      return result.routeClass === "proAlternative"
        ? t.quickCheckout.proAlternativeExplanation
        : t.quickCheckout.cleanFinishExplanation;
    }
    if (result.routeQuality >= 60) return t.quickCheckout.cleanerRouteAvailable;
    return t.quickCheckout.avoidableRisk;
  };

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
            title: t.common.timeUp,
            body: t.quickCheckout.timerEnded
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
    currentRouteData,
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

  function resetAttemptState() {
    setAttemptStartedAt(performance.now());
    setSecondsLeft(timerSeconds);
    setSelectedTarget(null);
    setFeedback(null);
    setCompleted(false);
    setSavedResult(false);
    setPickedTargets([]);
    setPickHistory([]);
  }

  function loadCheckout(nextFinish: number) {
    const primary = getPrimaryCheckoutRoute(nextFinish, settings.preferredDouble);
    const fallbackRoute = primary?.route ?? [];

    setFinish(nextFinish);
    resetAttemptState();
    setRemaining(nextFinish);
    setActiveRoute(fallbackRoute);
    setLastMainFinish(nextFinish);
    setStage("playing");
  }

  function startPractice() {
    const nextFinish = randomPickAvoiding(
      playableFinishes,
      (item) => String(item),
      null
    );
    if (nextFinish === null) {
      setFeedback({
        tone: "info",
        title: t.quickCheckout.noRouteData,
        body: t.quickCheckout.noDetailedRouteInRange
      });
      return;
    }
    loadCheckout(nextFinish);
  }

  function nextCheckout() {
    const nextFinish = randomPickAvoiding(
      playableFinishes,
      (item) => String(item),
      lastMainFinish !== null ? String(lastMainFinish) : null
    );
    if (nextFinish === null) {
      setFeedback({
        tone: "info",
        title: t.quickCheckout.noRouteData,
        body: t.quickCheckout.noDetailedRouteInRange
      });
      return;
    }
    loadCheckout(nextFinish);
  }

  function handleUndo() {
    if (completed || pickHistory.length === 0) return;
    const latest = pickHistory[pickHistory.length - 1];
    setPickHistory((prev) => prev.slice(0, -1));
    setPickedTargets((prev) => prev.slice(0, -1));
    setSelectedTarget(null);
    setRemaining(latest.snapshot.remaining);
    setFeedback(null);
  }

  function handleTargetTap(rawTarget: string) {
    if (stage !== "playing" || completed) {
      return;
    }

    const chosenTarget = normalizeDartTarget(rawTarget);
    const nextPicks = [...pickedTargets, chosenTarget];
    const evalResult = evaluateCheckoutAttempt({
      startScore: attemptStartScore,
      dartsAvailable: maxDarts,
      throws: nextPicks.map((actual) => ({ actual })),
      preferredDouble: settings.preferredDouble
    });
    const latestStep = evalResult.steps[evalResult.steps.length - 1];

    setSelectedTarget(chosenTarget);
    setPickedTargets(nextPicks);
    setPickHistory((prev) => [
      ...prev,
      {
        snapshot: { remaining }
      }
    ]);

    if (latestStep) {
      setRemaining(latestStep.remainingAfter);
    }

    if (evalResult.status === "checked-out") {
      setCompleted(true);
      saveAttempt("finished");
      setFeedback({
        tone: "complete",
        title: evalResult.xp === 3 ? t.quickCheckout.perfectCheckout : t.quickCheckout.checkoutComplete,
        body: getEvaluationExplanation(evalResult)
      });
      triggerHaptic(settings.vibrationFeedback);
      return;
    }

    if (evalResult.status === "bust") {
      setCompleted(true);
      saveAttempt("bust");
      setFeedback({
        tone: "wrong",
        title: t.quickCheckout.bust,
        body: getEvaluationExplanation(evalResult)
      });
      return;
    }

    if (evalResult.status === "impossible" || nextPicks.length >= maxDarts) {
      setCompleted(true);
      saveAttempt("failed");
      setFeedback({
        tone: "wrong",
        title: evalResult.status === "impossible" ? t.quickCheckout.noCheckoutAvailable : t.quickCheckout.noCheckout,
        body: getEvaluationExplanation(evalResult)
      });
    }
  }

  const boardRoute = completed
    ? activeRoute.join(", ")
    : "";

  return (
    <div className="screen screen-quick">
      <ScreenTitle title={t.quickCheckout.title} subtitle={t.quickCheckout.subtitle} onBack={onBack} />

      {stage === "setup" ? (
        <Card>
          <h3>{t.quickCheckout.setup}</h3>
          <p className="muted">{t.quickCheckout.range}</p>
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
            <p className="warn-text top-gap">{t.quickCheckout.customRangeError}</p>
          ) : null}
          <p className="muted top-gap">{t.quickCheckout.timer}</p>
          <Segmented
            value={timerSeconds}
            options={TIMER_OPTIONS.map((option) => ({
              label: option === 0 ? "Off" : `${option}s`,
              value: option
            }))}
            onChange={setTimerSeconds}
          />
          <p className="muted top-gap">{t.quickCheckout.playableFinishes}: {playableCountForMode}</p>
          <div className="top-gap">
            <Button
              full
              onClick={startPractice}
              disabled={
                playableCountForMode === 0 ||
                (selectedRange === "custom" && !customRange)
              }
            >
              {t.quickCheckout.startPractice}
            </Button>
          </div>
          {feedback?.tone === "info" ? <p className="warn-text top-gap">{feedback.body}</p> : null}
        </Card>
      ) : null}

      {stage === "playing" ? (
        <CheckoutMiniGameScreen
          rangeLabel={activeRange.label}
          preferredDouble={settings.preferredDouble}
          finish={finish}
          remaining={remaining}
          pickedTargets={pickedTargets}
          maxPicks={maxDarts}
          timerSeconds={timerSeconds}
          secondsLeft={secondsLeft}
          boardRoute={boardRoute}
          completed={completed}
          selectedTarget={selectedTarget}
          onTargetSelect={handleTargetTap}
          onUndo={handleUndo}
          feedback={feedback}
          onNextCheckout={nextCheckout}
          noneLabel={t.quickCheckout.none}
          finishLabel={t.quickCheckout.finish}
          remainingLabel={t.quickCheckout.currentRemaining}
          picksLabel={t.quickCheckout.yourPicks}
          tapBoardLabel={t.quickCheckout.tapBoard}
          timerLabel="Timer"
          nextCheckoutLabel={t.quickCheckout.nextCheckout}
          preferredDoubleLabel={t.settings.preferredDouble}
          disabled={completed}
        />
      ) : null}
    </div>
  );
}
