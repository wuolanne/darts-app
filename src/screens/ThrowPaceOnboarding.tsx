import { Button, Card } from "../components/ui";
import { UserSettings } from "../types/models";
import { useI18n } from "../i18n";

export function ThrowPaceOnboarding({
  settings,
  onComplete
}: {
  settings: UserSettings;
  onComplete: (next: UserSettings) => void;
}) {
  const { t } = useI18n();

  const savePreset = (secondsPerThree: number, source: "preset_fast" | "preset_normal" | "preset_relaxed") => {
    onComplete({
      ...settings,
      throwPaceOnboardingCompleted: true,
      throwPace: {
        mode: "manual",
        source,
        secondsPerThree,
        updatedAt: new Date().toISOString()
      }
    });
  };

  const setLater = () => {
    onComplete({
      ...settings,
      throwPaceOnboardingCompleted: true,
      throwPace: {
        ...settings.throwPace,
        mode: "not_set",
        source: "unset",
        secondsPerThree: null,
        updatedAt: settings.throwPace.updatedAt
      }
    });
  };

  return (
    <div className="screen screen-settings">
      <Card className="onboarding-card">
        <h2>{t.onboarding.throwPaceTitle}</h2>
        <p>{t.onboarding.throwPaceBody}</p>
        <div className="onboarding-actions">
          <Button full variant="secondary" onClick={() => savePreset(7, "preset_fast")}>
            {t.onboarding.fastPreset}
          </Button>
          <Button full variant="secondary" onClick={() => savePreset(10, "preset_normal")}>
            {t.onboarding.normalPreset}
          </Button>
          <Button full variant="secondary" onClick={() => savePreset(13, "preset_relaxed")}>
            {t.onboarding.relaxedPreset}
          </Button>
          <Button full variant="ghost" onClick={setLater}>
            {t.onboarding.setLater}
          </Button>
        </div>
      </Card>
    </div>
  );
}
