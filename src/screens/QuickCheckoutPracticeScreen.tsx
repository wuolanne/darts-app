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
  normalizeDartTarget
} from "../utils/checkoutLibrary";
import {
  CheckoutEvaluationResult,
  evaluateCheckoutAttempt,
  generateValidRoutes,
  rankRoutes
} from "../features/checkout-engine";
import { triggerHaptic } from "../utils/haptics";
import { formatClock, toRoundedSeconds } from "../utils/time";
import { formatI18n, useI18n } from "../i18n";

type Stage = "setup" | "playing";

interface FeedbackState {
  tone: "correct" | "wrong" | "complete" | "info";
  title: string;
  body: string;
}

type PracticeMode = "main-route" | "single-miss-scenario";

interface MissScenario {
  finish: number;
  triedTreble: string;
  hitSingle: string;
  remaining: number;
  continuationRoute: DartTarget[];
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

function buildMissScenarios(
  min: number,
  max: number,
  preferredDouble: UserSettings["preferredDouble"]
): MissScenario[] {
  const scenarios: MissScenario[] = [];
  const candidates = buildPlayableFinishes(min, max, preferredDouble);

  for (const finish of candidates) {
    const primary = getPrimaryCheckoutRoute(finish, preferredDouble);
    if (!primary || primary.route.length === 0) continue;
    const first = normalizeDartTarget(primary.route[0] ?? "");
    if (!first.startsWith("T")) continue;
    const continuation = getSingleHitContinuation(primary);
    if (!continuation) continue;
    const continuationRoute = continuation.continuationRoute.map((item) => normalizeDartTarget(item));
    if (continuationRoute.length === 0 || continuationRoute.length > 2) continue;
    scenarios.push({
      finish,
      triedTreble: first,
      hitSingle: normalizeDartTarget(continuation.singleHitTarget),
      remaining: continuation.remaining,
      continuationRoute
    });
  }

  return scenarios;
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
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("main-route");
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
  const [evaluation, setEvaluation] = useState<CheckoutEvaluationResult | null>(null);
  const [completed, setCompleted] = useState(false);
  const [savedResult, setSavedResult] = useState(false);
  const [missScenario, setMissScenario] = useState<MissScenario | null>(null);
  const [pickedTargets, setPickedTargets] = useState<string[]>([]);
  const [pickHistory, setPickHistory] = useState<PickHistoryItem[]>([]);
  const [lastMainFinish, setLastMainFinish] = useState<number | null>(null);
  const [lastScenarioKey, setLastScenarioKey] = useState<string | null>(null);

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
  const missScenarios = useMemo(
    () => buildMissScenarios(activeRange.min, activeRange.max, settings.preferredDouble),
    [activeRange.min, activeRange.max, settings.preferredDouble]
  );
  const playableCountForMode = practiceMode === "single-miss-scenario" ? missScenarios.length : playableFinishes.length;

  const currentRouteData = useMemo(
    () => getPrimaryCheckoutRoute(finish, settings.preferredDouble),
    [finish, settings.preferredDouble]
  );

  const attemptStartScore = missScenario ? missScenario.remaining : finish;
  const maxDarts = missScenario ? 2 : 3;
  const maxPicks = Math.max(maxDarts, 1);
  const shownPicks = Array.from({ length: maxPicks }, (_, index) => pickedTargets[index] ?? "_");
  const validRoutesForAttempt = useMemo(
    () => generateValidRoutes(attemptStartScore, maxDarts),
    [attemptStartScore, maxDarts]
  );
  const rankedRoutesForAttempt = useMemo(
    () => rankRoutes(attemptStartScore, validRoutesForAttempt, settings.preferredDouble),
    [attemptStartScore, validRoutesForAttempt, settings.preferredDouble]
  );
  const goodAlternativeRoutes = rankedRoutesForAttempt.slice(1, 5);

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
    setEvaluation(null);
  }

  function loadCheckout(nextFinish: number) {
    const primary = getPrimaryCheckoutRoute(nextFinish, settings.preferredDouble);
    const fallbackRoute = primary?.route ?? [];

    setFinish(nextFinish);
    setMissScenario(null);
    resetAttemptState();
    setRemaining(nextFinish);
    setActiveRoute(fallbackRoute);
    setLastMainFinish(nextFinish);
    setStage("playing");
  }

  function loadMissScenario(nextScenario: MissScenario) {
    setFinish(nextScenario.finish);
    setMissScenario(nextScenario);
    resetAttemptState();
    setRemaining(nextScenario.remaining);
    setActiveRoute(nextScenario.continuationRoute);
    setLastScenarioKey(`${nextScenario.finish}-${nextScenario.triedTreble}-${nextScenario.remaining}`);
    setStage("playing");
  }

  function startPractice() {
    if (practiceMode === "single-miss-scenario") {
      const scenario = randomPickAvoiding(
        missScenarios,
        (item) => `${item.finish}-${item.triedTreble}-${item.remaining}`,
        null
      );
      if (!scenario) {
        setFeedback({
          tone: "info",
          title: "No scenario data",
          body: t.quickCheckout.noScenarioInRange
        });
        return;
      }
      loadMissScenario(scenario);
      return;
    }

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
    if (practiceMode === "single-miss-scenario") {
      const scenario = randomPickAvoiding(
        missScenarios,
        (item) => `${item.finish}-${item.triedTreble}-${item.remaining}`,
        lastScenarioKey
      );
      if (!scenario) {
        setFeedback({
          tone: "info",
          title: t.quickCheckout.noScenarioData,
          body: t.quickCheckout.noScenarioInRange
        });
        return;
      }
      loadMissScenario(scenario);
      return;
    }

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
      setEvaluation(evalResult);
      setFeedback({
        tone: "complete",
        title: evalResult.xp === 3 ? "Perfect checkout!" : "Checkout complete!",
        body: evalResult.explanation
      });
      triggerHaptic(settings.vibrationFeedback);
      return;
    }

    if (evalResult.status === "bust") {
      setCompleted(true);
      saveAttempt("bust");
      setEvaluation(evalResult);
      setFeedback({
        tone: "wrong",
        title: "Bust",
        body: evalResult.explanation
      });
      return;
    }

    if (evalResult.status === "impossible" || nextPicks.length >= maxDarts) {
      setCompleted(true);
      saveAttempt("failed");
      setEvaluation(evalResult);
      setFeedback({
        tone: "wrong",
        title: evalResult.status === "impossible" ? "No checkout available" : "No checkout",
        body: evalResult.explanation
      });
    }
  }

  const boardRoute = completed
    ? activeRoute.join(", ")
    : "";

  return (
    <div className="screen">
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
          <p className="muted top-gap">{t.quickCheckout.mode}</p>
          <Segmented
            value={practiceMode}
            options={[
              { label: t.quickCheckout.mainRoute, value: "main-route" },
              { label: t.quickCheckout.singleMissScenarios, value: "single-miss-scenario" }
            ]}
            onChange={(value) => setPracticeMode(value as PracticeMode)}
          />
          <p className="muted top-gap">{t.quickCheckout.playableFinishes}: {playableCountForMode}</p>
          {practiceMode === "single-miss-scenario" ? (
            <p className="muted">{t.quickCheckout.availableScenarios}: {missScenarios.length}</p>
          ) : null}
          <div className="top-gap">
            <Button
              full
              onClick={startPractice}
              disabled={
                (practiceMode === "main-route" && playableCountForMode === 0) ||
                (practiceMode === "single-miss-scenario" && playableCountForMode === 0) ||
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
        <Card className="practice-card quick-practice-card">
          <div className="practice-header">
            <Pill tone="neutral">{activeRange.label}</Pill>
            <Pill tone="neutral">Preferred double: {settings.preferredDouble}</Pill>
          </div>

          <p className="big-number">{t.quickCheckout.finish}: {finish}</p>
          {practiceMode === "single-miss-scenario" && missScenario ? (
            <>
              <p>
                {formatI18n(t.quickCheckout.triedHit, {
                  tried: missScenario.triedTreble,
                  hit: missScenario.hitSingle
                })}
              </p>
              <p>{formatI18n(t.quickCheckout.leftChooseContinuation, { remaining: missScenario.remaining })}</p>
            </>
          ) : null}
          <p>
            <span className="muted">{t.quickCheckout.currentRemaining}:</span> {remaining}
          </p>
          <div className="pick-row">
            <span className="muted">{t.quickCheckout.yourPicks}:</span>
            <div className="pick-chips">
              {shownPicks.map((pick, index) => (
                <span key={`pick-${index}`} className="pick-chip">
                  {pick}
                </span>
              ))}
            </div>
          </div>
          {!completed ? <p className="muted">{t.quickCheckout.tapBoard}</p> : null}

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

          <Dartboard
            route={boardRoute}
            reveal={completed}
            onTargetSelect={handleTargetTap}
            selectedTarget={selectedTarget}
            disabled={completed}
          />

          {!completed && pickedTargets.length > 0 ? (
            <div className="top-gap">
              <Button variant="ghost" onClick={handleUndo}>
                UNDO
              </Button>
            </div>
          ) : null}

          {feedback ? (
            <div className="feedback-box quick-feedback-box">
              <h4>{feedback.title}</h4>
              <p>{feedback.body}</p>
              {completed ? (
                <>
                  <p>
                    <span className="muted">{t.quickCheckout.yourPicks}:</span> {pickedTargets.length > 0 ? pickedTargets.join(" -> ") : "None"}
                  </p>
                  {evaluation ? (
                    <div className="route-box top-gap">
                      <p className="route-compact-line">
                        <span className="muted">Route quality:</span> <strong>{evaluation.routeQuality}%</strong>
                      </p>
                      <p className="route-compact-line">
                        <span className="muted">Your route:</span>{" "}
                        <strong>{evaluation.userRoute.length > 0 ? formatRoute(evaluation.userRoute) : "None"}</strong>
                      </p>
                      <p className="route-compact-line">
                        <span className="muted">Optimal route:</span>{" "}
                        <strong>{evaluation.optimalRoute.length > 0 ? formatRoute(evaluation.optimalRoute) : "No valid route yet."}</strong>
                      </p>
                      <p className="route-compact-line">
                        <span className="muted">{t.quickCheckout.whyThisRoute}:</span> {evaluation.explanation}
                      </p>
                      {goodAlternativeRoutes.length > 0 ? (
                        <div className="route-compact-line">
                          <span className="muted">Good alternatives:</span>{" "}
                          {goodAlternativeRoutes.map((route) => (
                            <p key={formatRoute(route.path)} className="route-compact-line">
                              <strong>{formatRoute(route.path)}</strong>{" "}
                              <span className="muted">{route.quality}%</span>
                            </p>
                          ))}
                        </div>
                      ) : null}
                      <p className="route-compact-line">
                        <span className="muted">Valid routes:</span> {validRoutesForAttempt.length}
                      </p>
                    </div>
                  ) : null}
                  <div className="row top-gap">
                    <Button onClick={nextCheckout}>{t.quickCheckout.nextCheckout.toUpperCase()}</Button>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
