import { useEffect, useState } from "react";
import { Button, Card, ScreenTitle, Segmented } from "../components/ui";
import { ThemeMode, TimerOption, UserSettings } from "../types/models";
import { calculateSecondsPerThreeFromFiveMinuteTest } from "../utils/pace";
import { formatClock } from "../utils/time";

const PREFERRED_DOUBLES = ["D16", "D20", "D18", "D12", "Not sure"] as const;
const THEME_OPTIONS: ThemeMode[] = ["dark", "light", "dim", "system"];
const TIMER_OPTIONS: TimerOption[] = [0, 10, 20, 30];

export function SettingsScreen({
  settings,
  onUpdateSettings,
  onBack
}: {
  settings: UserSettings;
  onUpdateSettings: (next: UserSettings) => void;
  onBack: () => void;
}) {
  const [customPaceDraft, setCustomPaceDraft] = useState<string>("");
  const [paceTestRunning, setPaceTestRunning] = useState(false);
  const [paceTestSecondsLeft, setPaceTestSecondsLeft] = useState(300);
  const [paceTestDarts, setPaceTestDarts] = useState("");
  const [paceTestReady, setPaceTestReady] = useState(false);

  useEffect(() => {
    if (!paceTestRunning) {
      return;
    }
    const timer = window.setInterval(() => {
      setPaceTestSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setPaceTestRunning(false);
          setPaceTestReady(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [paceTestRunning]);

  const setThrowPace = (secondsPerThree: number | null, mode: "not_set" | "manual" | "calibrated") =>
    onUpdateSettings({
      ...settings,
      throwPace: {
        mode,
        secondsPerThree,
        updatedAt: new Date().toISOString()
      }
    });

  return (
    <div className="screen">
      <ScreenTitle title="Settings" subtitle="Local-only preferences for practice flow." onBack={onBack} />

      <Card>
        <h3>Preferred double</h3>
        <Segmented
          value={settings.preferredDouble}
          options={PREFERRED_DOUBLES.map((value) => ({ label: value, value }))}
          onChange={(preferredDouble) => onUpdateSettings({ ...settings, preferredDouble })}
        />
      </Card>

      <Card>
        <h3>Default timer</h3>
        <Segmented
          value={settings.defaultTimer}
          options={TIMER_OPTIONS.map((value) => ({
            label: value === 0 ? "Off" : `${value}s`,
            value
          }))}
          onChange={(defaultTimer) => onUpdateSettings({ ...settings, defaultTimer })}
        />
      </Card>

      <Card>
        <h3>Theme</h3>
        <Segmented
          value={settings.themeMode}
          options={THEME_OPTIONS.map((value) => ({ label: value[0].toUpperCase() + value.slice(1), value }))}
          onChange={(themeMode) => onUpdateSettings({ ...settings, themeMode })}
        />
      </Card>

      <Card>
        <h3>Throw pace</h3>
        <p className="muted">
          Current:{" "}
          {settings.throwPace.secondsPerThree
            ? `${settings.throwPace.secondsPerThree.toFixed(2)} sec / 3 darts`
            : "Not set"}
        </p>

        <div className="stack-row">
          <Button onClick={() => setThrowPace(7, "manual")} variant="secondary">
            Fast: 7 sec / 3 darts
          </Button>
          <Button onClick={() => setThrowPace(10, "manual")} variant="secondary">
            Normal: 10 sec / 3 darts
          </Button>
          <Button onClick={() => setThrowPace(13, "manual")} variant="secondary">
            Relaxed: 13 sec / 3 darts
          </Button>
          <Button onClick={() => setThrowPace(null, "not_set")} variant="ghost">
            Not set
          </Button>
        </div>

        <div className="field-group">
          <label htmlFor="custom-pace">Custom seconds per 3 darts</label>
          <div className="row">
            <input
              id="custom-pace"
              className="text-input"
              inputMode="decimal"
              placeholder="e.g. 9.5"
              value={customPaceDraft}
              onChange={(event) => setCustomPaceDraft(event.target.value)}
            />
            <Button
              variant="secondary"
              onClick={() => {
                const parsed = Number(customPaceDraft);
                if (!Number.isFinite(parsed) || parsed <= 0) {
                  return;
                }
                setThrowPace(parsed, "manual");
                setCustomPaceDraft("");
              }}
            >
              Save custom
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <h3>5 Minute Throw Pace Test</h3>
        <p className="muted">
          Throw for 5 minutes, then enter the number of darts thrown. App calculates seconds per 3 darts.
        </p>
        {!paceTestRunning && !paceTestReady ? (
          <Button
            onClick={() => {
              setPaceTestSecondsLeft(300);
              setPaceTestDarts("");
              setPaceTestReady(false);
              setPaceTestRunning(true);
            }}
          >
            Start 5 minute test
          </Button>
        ) : null}

        {paceTestRunning ? (
          <div className="timer-banner">
            <strong>{formatClock(paceTestSecondsLeft)}</strong>
            <Button variant="ghost" onClick={() => setPaceTestRunning(false)}>
              Stop
            </Button>
          </div>
        ) : null}

        {paceTestReady ? (
          <div className="field-group">
            <label htmlFor="test-darts">Darts thrown in 5 minutes</label>
            <div className="row">
              <input
                id="test-darts"
                className="text-input"
                inputMode="numeric"
                value={paceTestDarts}
                onChange={(event) => setPaceTestDarts(event.target.value)}
                placeholder="e.g. 97"
              />
              <Button
                onClick={() => {
                  const darts = Number(paceTestDarts);
                  const calculated = calculateSecondsPerThreeFromFiveMinuteTest(darts);
                  if (!calculated) {
                    return;
                  }
                  setThrowPace(calculated, "calibrated");
                  setPaceTestReady(false);
                  setPaceTestDarts("");
                }}
              >
                Save calibrated pace
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
