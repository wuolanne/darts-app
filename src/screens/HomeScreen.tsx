import { AppScreen, AroundClockSession, CheckoutAttempt, CheckoutSpeedrunSession } from "../types/models";
import { formatPracticeDuration } from "../utils/time";
import { useI18n } from "../i18n";

interface HomeSummary {
  lastAverage: string;
  bestCheckout: string;
  practiceTime: string;
  totalReps: string;
  streak: string;
}

interface ModeCard {
  title: string;
  screen: AppScreen;
  description: string;
  icon: string;
  tone: "hot" | "timer" | "clock" | "library" | "stats" | "settings";
  badge?: string;
  metaLabel: string;
  metaValue: string;
}

function isToday(value: string): boolean {
  const date = new Date(value);
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

function formatNumber(value: number): string {
  return value.toLocaleString("en-US").replace(/,/g, " ");
}

function buildSummary(
  checkoutAttempts: CheckoutAttempt[],
  speedruns: CheckoutSpeedrunSession[],
  aroundSessions: AroundClockSession[]
): HomeSummary {
  const timedAttempts = checkoutAttempts.filter((attempt) => attempt.elapsedSeconds !== null);
  const lastAverageSeconds = timedAttempts.slice(0, 5).reduce((sum, attempt) => sum + (attempt.elapsedSeconds ?? 0), 0);
  const lastAverage = timedAttempts.length > 0
    ? formatPracticeDuration(lastAverageSeconds / Math.min(timedAttempts.length, 5))
    : "-";
  const finishedCheckouts = checkoutAttempts
    .filter((attempt) => attempt.result === "finished")
    .map((attempt) => attempt.finishNumber);
  const bestCheckout = finishedCheckouts.length > 0 ? String(Math.max(...finishedCheckouts)) : "-";
  const speedrunTime = speedruns.reduce((sum, session) => sum + session.totalActiveSeconds, 0);
  const aroundTime = aroundSessions.reduce((sum, session) => sum + session.totalActiveSeconds, 0);
  const attemptTime = checkoutAttempts.reduce((sum, attempt) => sum + (attempt.elapsedSeconds ?? 0), 0);
  const practiceTimeSeconds = speedrunTime + aroundTime + attemptTime;
  const totalReps =
    checkoutAttempts.length +
    speedruns.reduce((sum, session) => sum + session.entries.length, 0) +
    aroundSessions.reduce((sum, session) => sum + session.entries.length, 0);
  const todayReps =
    checkoutAttempts.filter((attempt) => isToday(attempt.timestamp)).length +
    speedruns
      .filter((session) => isToday(session.timestamp))
      .reduce((sum, session) => sum + session.entries.length, 0) +
    aroundSessions
      .filter((session) => isToday(session.timestamp))
      .reduce((sum, session) => sum + session.entries.length, 0);

  return {
    lastAverage,
    bestCheckout,
    practiceTime: practiceTimeSeconds > 0 ? formatPracticeDuration(practiceTimeSeconds) : "-",
    totalReps: totalReps > 0 ? formatNumber(totalReps) : "-",
    streak: todayReps > 0 ? String(todayReps) : "-"
  };
}

export function HomeScreen({
  onNavigate,
  checkoutAttempts,
  speedruns,
  aroundSessions
}: {
  onNavigate: (screen: AppScreen) => void;
  checkoutAttempts: CheckoutAttempt[];
  speedruns: CheckoutSpeedrunSession[];
  aroundSessions: AroundClockSession[];
}) {
  const { t } = useI18n();
  const summary = buildSummary(checkoutAttempts, speedruns, aroundSessions);
  const titleParts = t.home.title.split(" ");
  const latestAround = aroundSessions[0] ?? null;
  const latestCheckout = checkoutAttempts[0] ?? null;
  const bestTimedRun = speedruns.length > 0
    ? Math.min(...speedruns.map((session) => session.totalActiveSeconds))
    : null;

  const items: ModeCard[] = [
    {
      title: t.home.quickCheckoutTitle,
      screen: "quick-checkout",
      description: t.home.quickCheckoutDescription,
      icon: "Q",
      tone: "hot",
      badge: "Hot",
      metaLabel: t.home.latest,
      metaValue: latestCheckout ? String(latestCheckout.finishNumber) : "-"
    },
    {
      title: t.stats.checkoutTimedRun,
      screen: "speedrun",
      description: t.home.timedRunDescription,
      icon: "T",
      tone: "timer",
      metaLabel: t.home.bestTime,
      metaValue: bestTimedRun !== null ? formatPracticeDuration(bestTimedRun) : "-"
    },
    {
      title: t.stats.aroundTheClock,
      screen: "around-clock",
      description: t.home.aroundDescription,
      icon: "C",
      tone: "clock",
      metaLabel: t.home.latest,
      metaValue: latestAround ? formatPracticeDuration(latestAround.totalActiveSeconds) : "-"
    },
    {
      title: t.checkoutLibrary.title,
      screen: "checkout-library",
      description: t.home.libraryDescription,
      icon: "R",
      tone: "library",
      metaLabel: t.home.view,
      metaValue: t.home.table
    },
    {
      title: t.stats.title,
      screen: "stats",
      description: t.home.statsDescription,
      icon: "S",
      tone: "stats",
      metaLabel: t.home.view,
      metaValue: t.stats.title
    },
    {
      title: t.settings.title,
      screen: "settings",
      description: t.home.settingsDescription,
      icon: "G",
      tone: "settings",
      metaLabel: t.home.open,
      metaValue: t.settings.title
    }
  ];

  return (
    <div className="screen home-dashboard">
      <section className="home-hero">
        <div className="home-hero-board" aria-hidden="true" />
        <div className="home-hero-copy">
          <p className="home-kicker">{t.home.practiceModes}</p>
          <h1>
            <span>{(titleParts[0] ?? t.home.title).toUpperCase()}</span>
            <span>{titleParts.slice(1).join(" ").toUpperCase()}</span>
          </h1>
          <p>{t.home.subtitle}</p>
        </div>
        <div className="home-streak-card" aria-label={t.home.todayReps}>
          <span className="home-streak-icon">🔥</span>
          <strong>{summary.streak}</strong>
          <span>{t.home.todayReps}</span>
        </div>
      </section>

      <section className="home-summary-grid" aria-label={t.home.summary}>
        <div className="home-summary-card">
          <span>{t.home.lastAvg}</span>
          <strong>{summary.lastAverage}</strong>
        </div>
        <div className="home-summary-card">
          <span>{t.home.bestCheckout}</span>
          <strong>{summary.bestCheckout}</strong>
          <small>{summary.bestCheckout === "-" ? "-" : t.home.bestFinish}</small>
        </div>
        <div className="home-summary-card">
          <span>{t.home.practiceTime}</span>
          <strong>{summary.practiceTime}</strong>
        </div>
        <div className="home-summary-card">
          <span>{t.home.totalReps}</span>
          <strong>{summary.totalReps}</strong>
        </div>
      </section>

      <section className="home-modes-section">
        <div className="home-section-title">
          <span aria-hidden="true" />
          <h2>{t.home.practiceModes}</h2>
        </div>
        <div className="home-mode-list">
          {items.map((item) => (
            <button
              key={item.title}
              className={`home-mode-card home-mode-${item.tone}`}
              type="button"
              onClick={() => onNavigate(item.screen)}
            >
              <span className="home-mode-art" aria-hidden="true">
                <span>{item.icon}</span>
              </span>
              <span className="home-mode-main">
                {item.badge ? <span className="home-mode-badge">{item.badge}</span> : null}
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </span>
              <span className="home-mode-meta">
                <small>{item.metaLabel}</small>
                <strong>{item.metaValue}</strong>
              </span>
              <span className="home-mode-chevron" aria-hidden="true">›</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
