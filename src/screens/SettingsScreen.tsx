import { useEffect, useState } from "react";
import { Button, Card, ScreenTitle, Segmented } from "../components/ui";
import { AppLanguageMode, ThemeMode, TimerOption, UserSettings } from "../types/models";
import { calculateSecondsPerThreeFromFiveMinuteTest } from "../utils/pace";
import { formatClock } from "../utils/time";
import { formatI18n, useI18n } from "../i18n";

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

  const setThrowPace = (
    secondsPerThree: number | null,
    mode: "not_set" | "manual" | "calibrated",
    source: UserSettings["throwPace"]["source"]
  ) =>
    onUpdateSettings({
      ...settings,
      throwPaceOnboardingCompleted: true,
      throwPace: {
        mode,
        source,
        secondsPerThree,
        updatedAt: new Date().toISOString()
      }
    });
  const currentPace = !settings.throwPace.secondsPerThree
    ? t.settings.currentNotSet
    : formatI18n(t.settings.currentThrowPace, {
        pace: settings.throwPace.secondsPerThree.toFixed(1)
      });
  const formatPaceMessage = (template: string, pace: number) =>
    formatI18n(template, { pace: pace.toFixed(1) });
  const formatRangeMessage = (template: string) =>
    formatI18n(template, {
      min: String(MIN_REASONABLE_SECONDS_PER_THREE),
      max: String(MAX_REASONABLE_SECONDS_PER_THREE)
    });

  return (
    <div className="screen screen-settings">
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
            label: value === 0 ? t.common.off : `${value}s`,
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
            { label: t.common.on, value: "on" },
            { label: t.common.off, value: "off" }
          ]}
          onChange={(value) =>
            onUpdateSettings({
              ...settings,
              vibrationFeedback: value === "on"
            })
          }
        />
        <p className="muted">{t.settings.vibrationHelp}</p>
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
        <p className="muted">{currentPace}</p>
        <p className="muted">{t.settings.throwPaceHelp}</p>
        {paceSuccess ? <p className="good-text">{paceSuccess}</p> : null}
        {paceError ? <p className="warn-text">{paceError}</p> : null}

        <div className="stack-row">
          <Button
            onClick={() => {
              setThrowPace(7, "manual", "preset_fast");
              setPaceError(null);
              setPaceSuccess(formatPaceMessage(t.settings.manualPaceSaved, 7));
            }}
            variant="secondary"
          >
            {t.settings.fastPace}
          </Button>
          <Button
            onClick={() => {
              setThrowPace(10, "manual", "preset_normal");
              setPaceError(null);
              setPaceSuccess(formatPaceMessage(t.settings.manualPaceSaved, 10));
            }}
            variant="secondary"
          >
            {t.settings.normalPace}
          </Button>
          <Button
            onClick={() => {
              setThrowPace(13, "manual", "preset_relaxed");
              setPaceError(null);
              setPaceSuccess(formatPaceMessage(t.settings.manualPaceSaved, 13));
            }}
            variant="secondary"
          >
            {t.settings.relaxedPace}
          </Button>
          <Button
            onClick={() => {
              setThrowPace(null, "not_set", "unset");
              setPaceError(null);
              setPaceSuccess(null);
            }}
            variant="ghost"
          >
            {t.settings.notSet}
          </Button>
        </div>

        <div className="field-group">
          <label htmlFor="custom-pace">{t.settings.customSecondsPerThree}</label>
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
                  setPaceError(formatRangeMessage(t.settings.paceRangeError));
                  setPaceSuccess(null);
                  return;
                }
                setThrowPace(parsed, "manual", "manual");
                setPaceError(null);
                setPaceSuccess(formatPaceMessage(t.settings.manualPaceSaved, parsed));
                setCustomPaceDraft("");
              }}
            >
              {t.settings.saveCustom}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <h3>{t.settings.fiveMinuteTest}</h3>
        <p className="muted">{t.settings.fiveMinuteTestHelp}</p>
        {!paceTestRunning && !paceTestReady ? (
          <Button
            onClick={() => {
              setPaceTestSecondsLeft(300);
              setPaceTestDarts("");
              setPaceTestReady(false);
              setPaceTestRunning(true);
            }}
          >
            {t.settings.startFiveMinuteTest}
          </Button>
        ) : null}

        {paceTestRunning ? (
          <div className="timer-banner">
            <strong>{formatClock(paceTestSecondsLeft)}</strong>
            <Button variant="ghost" onClick={() => setPaceTestRunning(false)}>
              {t.common.stop}
            </Button>
          </div>
        ) : null}

        {paceTestReady ? (
          <div className="field-group">
            <label htmlFor="test-darts">{t.settings.dartsThrownInFive}</label>
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
                    setPaceError(t.settings.dartsThrownPositive);
                    setPaceSuccess(null);
                    return;
                  }
                  const calculated = calculateSecondsPerThreeFromFiveMinuteTest(darts);
                  if (!calculated || !isReasonableSecondsPerThree(calculated)) {
                    setPaceError(formatRangeMessage(t.settings.calculatedPaceRangeError));
                    setPaceSuccess(null);
                    return;
                  }
                  setThrowPace(calculated, "calibrated", "measured");
                  setCustomPaceDraft(calculated.toFixed(1));
                  setPaceError(null);
                  setPaceSuccess(formatPaceMessage(t.settings.measuredPaceSaved, calculated));
                  setPaceTestReady(false);
                  setPaceTestDarts("");
                }}
              >
                {t.settings.saveCalibratedPace}
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
