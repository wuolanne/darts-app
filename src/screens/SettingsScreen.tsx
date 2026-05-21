import { useEffect, useState } from "react";
import { Button, Card, ScreenTitle, Segmented } from "../components/ui";
import { AppLanguageMode, ThemeMode, TimerOption, UserSettings } from "../types/models";
import { calculateSecondsPerThreeFromFiveMinuteTest } from "../utils/pace";
import { formatClock } from "../utils/time";
import { useI18n } from "../i18n";

const PREFERRED_DOUBLES = ["D16", "D20", "D18", "D12", "Not sure"] as const;
const THEME_OPTIONS: ThemeMode[] = ["dark", "light", "dim", "system"];
const TIMER_OPTIONS: TimerOption[] = [0, 10, 20, 30];
const MIN_REASONABLE_SECONDS_PER_THREE = 4;
const MAX_REASONABLE_SECONDS_PER_THREE = 30;

function isReasonableSecondsPerThree(value: number): boolean {
  return (
    Number.isFinite(value) &&
    value >= MIN_REASONABLE_SECONDS_PER_THREE &&
    value <= MAX_REASONABLE_SECONDS_PER_THREE
  );
}

function formatCurrentPace(settings: UserSettings): string {
  if (!settings.throwPace.secondsPerThree) {
    return "Current: Not set";
  }
  if (settings.throwPace.mode === "calibrated") {
    return `Current: Measured pace — ${settings.throwPace.secondsPerThree.toFixed(1)} sec / 3 darts`;
  }
  return `Current: Manual pace — ${settings.throwPace.secondsPerThree.toFixed(1)} sec / 3 darts`;
}

export function SettingsScreen({
  settings,
  onUpdateSettings,
  onBack
}: {
  settings: UserSettings;
  onUpdateSettings: (next: UserSettings) => void;
  onBack: () => void;
}) {
  const { t } = useI18n();
  const [customPaceDraft, setCustomPaceDraft] = useState<string>("");
  const [paceTestRunning, setPaceTestRunning] = useState(false);
  const [paceTestSecondsLeft, setPaceTestSecondsLeft] = useState(300);
  const [paceTestDarts, setPaceTestDarts] = useState("");
  const [paceTestReady, setPaceTestReady] = useState(false);
  const [paceError, setPaceError] = useState<string | null>(null);
  const [paceSuccess, setPaceSuccess] = useState<string | null>(null);

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
      <ScreenTitle title={t.settings.title} subtitle={t.settings.subtitle} onBack={onBack} />

      <Card>
        <h3>{t.settings.preferredDouble}</h3>
        <Segmented
          value={settings.preferredDouble}
          options={PREFERRED_DOUBLES.map((value) => ({ label: value, value }))}
          onChange={(preferredDouble) => onUpdateSettings({ ...settings, preferredDouble })}
        />
      </Card>

      <Card>
        <h3>{t.settings.defaultTimer}</h3>
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
        <h3>{t.settings.theme}</h3>
        <Segmented
          value={settings.themeMode}
          options={THEME_OPTIONS.map((value) => ({ label: value[0].toUpperCase() + value.slice(1), value }))}
          onChange={(themeMode) => onUpdateSettings({ ...settings, themeMode })}
        />
      </Card>

      <Card>
        <h3>{t.settings.vibrationFeedback}</h3>
        <Segmented
          value={settings.vibrationFeedback ? "on" : "off"}
          options={[
            { label: "On", value: "on" },
            { label: "Off", value: "off" }
          ]}
          onChange={(value) =>
            onUpdateSettings({
              ...settings,
              vibrationFeedback: value === "on"
            })
          }
        />
        <p className="muted">Uses device vibration when available.</p>
      </Card>

      <Card>
        <h3>{t.settings.language}</h3>
        <Segmented
          value={settings.languageMode}
          options={[
            { label: t.settings.english, value: "en" as AppLanguageMode },
            { label: t.settings.finnish, value: "fi" as AppLanguageMode },
            { label: t.settings.system, value: "system" as AppLanguageMode }
          ]}
          onChange={(languageMode) => onUpdateSettings({ ...settings, languageMode })}
        />
      </Card>

      <Card>
        <h3>{t.settings.throwPace}</h3>
        <p className="muted">{formatCurrentPace(settings)}</p>
        {paceSuccess ? <p className="good-text">{paceSuccess}</p> : null}
        {paceError ? <p className="warn-text">{paceError}</p> : null}

        <div className="stack-row">
          <Button
            onClick={() => {
              setThrowPace(7, "manual");
              setPaceError(null);
              setPaceSuccess("Manual pace saved: 7.0 sec / 3 darts");
            }}
            variant="secondary"
          >
            Fast: 7 sec / 3 darts
          </Button>
          <Button
            onClick={() => {
              setThrowPace(10, "manual");
              setPaceError(null);
              setPaceSuccess("Manual pace saved: 10.0 sec / 3 darts");
            }}
            variant="secondary"
          >
            Normal: 10 sec / 3 darts
          </Button>
          <Button
            onClick={() => {
              setThrowPace(13, "manual");
              setPaceError(null);
              setPaceSuccess("Manual pace saved: 13.0 sec / 3 darts");
            }}
            variant="secondary"
          >
            Relaxed: 13 sec / 3 darts
          </Button>
          <Button
            onClick={() => {
              setThrowPace(null, "not_set");
              setPaceError(null);
              setPaceSuccess(null);
            }}
            variant="ghost"
          >
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
                if (!isReasonableSecondsPerThree(parsed)) {
                  setPaceError(
                    `Pace must be between ${MIN_REASONABLE_SECONDS_PER_THREE} and ${MAX_REASONABLE_SECONDS_PER_THREE} sec / 3 darts.`
                  );
                  setPaceSuccess(null);
                  return;
                }
                setThrowPace(parsed, "manual");
                setPaceError(null);
                setPaceSuccess(`Manual pace saved: ${parsed.toFixed(1)} sec / 3 darts`);
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
                if (!Number.isFinite(darts) || darts <= 0) {
                  setPaceError("Darts thrown must be a positive number.");
                  setPaceSuccess(null);
                  return;
                }
                const calculated = calculateSecondsPerThreeFromFiveMinuteTest(darts);
                if (!calculated || !isReasonableSecondsPerThree(calculated)) {
                  setPaceError(
                    `Calculated pace must be between ${MIN_REASONABLE_SECONDS_PER_THREE} and ${MAX_REASONABLE_SECONDS_PER_THREE} sec / 3 darts.`
                  );
                  setPaceSuccess(null);
                  return;
                }
                setThrowPace(calculated, "calibrated");
                setCustomPaceDraft(calculated.toFixed(1));
                setPaceError(null);
                setPaceSuccess(`Measured pace saved: ${calculated.toFixed(1)} sec / 3 darts`);
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
