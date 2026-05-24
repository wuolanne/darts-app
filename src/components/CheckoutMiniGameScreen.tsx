import { useEffect, useState } from "react";
import { Button, Card, Pill } from "./ui";
import { InteractiveDartboard } from "./InteractiveDartboard";
import { TargetCard } from "./TargetCard";
import { TimerBar } from "./TimerBar";
import { CheckoutRouteSummary } from "../features/checkout-engine/RouteSummary";
import { PreferredDouble } from "../types/models";

interface FeedbackState {
  tone: "correct" | "wrong" | "complete" | "info";
  title: string;
  body: string;
}

export function CheckoutMiniGameScreen({
  rangeLabel,
  preferredDouble,
  finish,
  remaining,
  pickedTargets,
  maxPicks,
  timerSeconds,
  secondsLeft,
  boardRoute,
  completed,
  selectedTarget,
  onTargetSelect,
  onUndo,
  feedback,
  onNextCheckout,
  noneLabel,
  finishLabel,
  remainingLabel,
  picksLabel,
  tapBoardLabel,
  timerLabel,
  nextCheckoutLabel,
  preferredDoubleLabel,
  disabled
}: {
  rangeLabel: string;
  preferredDouble: PreferredDouble;
  finish: number;
  remaining: number;
  pickedTargets: string[];
  maxPicks: number;
  timerSeconds: number;
  secondsLeft: number;
  boardRoute: string;
  completed: boolean;
  selectedTarget: string | null;
  onTargetSelect: (target: string) => void;
  onUndo: () => void;
  feedback: FeedbackState | null;
  onNextCheckout: () => void;
  noneLabel: string;
  finishLabel: string;
  remainingLabel: string;
  picksLabel: string;
  tapBoardLabel: string;
  timerLabel: string;
  nextCheckoutLabel: string;
  preferredDoubleLabel: string;
  disabled?: boolean;
}) {
  const shownPicks = Array.from({ length: Math.max(maxPicks, 1) }, (_, index) => pickedTargets[index] ?? "-");
  const feedbackTone = feedback?.tone === "wrong" ? "wrong" : feedback?.tone === "complete" ? "correct" : "idle";
  const [showDeferredRouteSummary, setShowDeferredRouteSummary] = useState(false);

  useEffect(() => {
    if (!completed) {
      setShowDeferredRouteSummary(false);
      return;
    }
    let frameOne = 0;
    let frameTwo = 0;
    frameOne = window.requestAnimationFrame(() => {
      frameTwo = window.requestAnimationFrame(() => {
        setShowDeferredRouteSummary(true);
      });
    });
    return () => {
      if (frameOne) window.cancelAnimationFrame(frameOne);
      if (frameTwo) window.cancelAnimationFrame(frameTwo);
    };
  }, [completed, finish, preferredDouble]);

  return (
    <Card className="practice-card quick-practice-card checkout-mini-game-card">
      <div className="practice-header">
        <Pill tone="neutral">{rangeLabel}</Pill>
        <Pill tone="neutral">{preferredDoubleLabel}: {preferredDouble}</Pill>
      </div>

      <div className="checkout-mini-game-top">
        <div className="checkout-mini-game-copy">
          <p className="big-number">{finishLabel}: {finish}</p>
          <p className="checkout-mini-stat">
            <span className="muted">{remainingLabel}:</span> {remaining}
          </p>
          <div className="pick-row">
            <span className="muted">{picksLabel}:</span>
            <div className="target-card-list">
              {shownPicks.map((pick, index) => (
                <TargetCard
                  key={`pick-${index}`}
                  value={pick}
                  active={Boolean(pickedTargets[index])}
                />
              ))}
            </div>
          </div>
          {!completed ? <p className="muted checkout-mini-helper">{tapBoardLabel}</p> : null}
        </div>
      </div>

      {timerSeconds > 0 ? (
        <TimerBar value={secondsLeft} max={timerSeconds} label={timerLabel} />
      ) : null}

      <InteractiveDartboard
        route={boardRoute}
        reveal={completed}
        onTargetSelect={onTargetSelect}
        selectedTarget={selectedTarget}
        disabled={disabled}
        feedbackTone={feedbackTone}
      />

      {!completed && pickedTargets.length > 0 ? (
        <div className="checkout-board-actions">
          <Button variant="ghost" onClick={onUndo}>
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
                <span className="muted">{picksLabel}:</span> {pickedTargets.length > 0 ? pickedTargets.join(" -> ") : noneLabel}
              </p>
              {showDeferredRouteSummary ? (
                <div className="route-box top-gap quick-route-box">
                  <CheckoutRouteSummary finish={finish} preferredDouble={preferredDouble} compact />
                </div>
              ) : null}
              <div className="checkout-board-actions top-gap">
                <Button onClick={onNextCheckout}>{nextCheckoutLabel.toUpperCase()}</Button>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
