import { AppScreen } from "../types/models";
import { Card, ScreenTitle } from "../components/ui";

const items: { title: string; screen: AppScreen; description: string; active: boolean }[] = [
  {
    title: "Quick Checkout Practice",
    screen: "quick-checkout",
    description: "Low-input checkout reps with fast feedback.",
    active: true
  },
  {
    title: "Checkout Timed Run",
    screen: "speedrun",
    description: "Complete a checkout range as fast as possible.",
    active: true
  },
  {
    title: "Around the Clock",
    screen: "around-clock",
    description: "Timed sectors and targets with minimal taps.",
    active: true
  },
  {
    title: "Checkout Library",
    screen: "checkout-library",
    description: "Route reference table (light MVP version).",
    active: true
  },
  {
    title: "Stats",
    screen: "stats",
    description: "7d / 30d / total practice insights.",
    active: true
  },
  {
    title: "Settings",
    screen: "settings",
    description: "Preferred double, timer, theme, throw pace.",
    active: true
  }
];

export function HomeScreen({ onNavigate }: { onNavigate: (screen: AppScreen) => void }) {
  return (
    <div className="screen">
      <ScreenTitle title="Darts Practice" subtitle="Low-input practice modes for daily reps." />
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
