import { Card, ScreenTitle, Segmented } from "../components/ui";
import { AppLanguageMode, ThemeMode, TimerOption, UserSettings } from "../types/models";
import { useI18n } from "../i18n";

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
  const { t } = useI18n();

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
    </div>
  );
}
