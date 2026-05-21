import { AppScreen } from "../types/models";
import { Card, ScreenTitle } from "../components/ui";
import { useI18n } from "../i18n";

export function HomeScreen({ onNavigate }: { onNavigate: (screen: AppScreen) => void }) {
  const { t } = useI18n();
  const items: { title: string; screen: AppScreen; description: string; active: boolean }[] = [
    {
      title: t.stats.quickCheckoutPractice,
      screen: "quick-checkout",
      description: t.home.quickCheckoutDescription,
      active: true
    },
    {
      title: t.stats.checkoutTimedRun,
      screen: "speedrun",
      description: t.home.timedRunDescription,
      active: true
    },
    {
      title: t.stats.aroundTheClock,
      screen: "around-clock",
      description: t.home.aroundDescription,
      active: true
    },
    {
      title: t.checkoutLibrary.title,
      screen: "checkout-library",
      description: t.home.libraryDescription,
      active: true
    },
    {
      title: t.stats.title,
      screen: "stats",
      description: t.home.statsDescription,
      active: true
    },
    {
      title: t.settings.title,
      screen: "settings",
      description: t.home.settingsDescription,
      active: true
    }
  ];

  return (
    <div className="screen">
      <ScreenTitle title={t.home.title} subtitle={t.home.subtitle} />
      <div className="card-grid">
        {items.map((item) => (
          <button
            key={item.title}
            className="card-link"
            type="button"
            onClick={() => onNavigate(item.screen)}
            disabled={!item.active}
          >
            <Card>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
