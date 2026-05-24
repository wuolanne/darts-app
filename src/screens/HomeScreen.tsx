import { AppScreen, AroundClockSession, CheckoutAttempt, CheckoutSpeedrunSession } from "../types/models";
import { formatPracticeDuration } from "../utils/time";
import { useI18n } from "../i18n";
import { HomeDashboardCopy, getHomeDashboardCopy } from "../i18n/uiTokens";

const DASH = "—";
const DAY_MS = 24 * 60 * 60 * 1000;

interface HomeSummary {
  streak: number;
  practiceTime: string;
  practiceTimeLabel: string;
  bestFinish: string;
  bestFinishLabel: string;
  bestRangeTime: string;
  bestRangeLabel: string;
  bestAtcOne: string;
  bestAtcTwo: string;
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

function getDateKey(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDaysAgoKey(daysAgo: number): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setTime(date.getTime() - daysAgo * DAY_MS);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isWithinLastSevenDays(value: string): boolean {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setTime(start.getTime() - 6 * DAY_MS);
  return date.getTime() >= start.getTime();
}

function formatHomeMinutes(totalSeconds: number, language: "en" | "fi"): string {
  if (totalSeconds <= 0) {
    return "0 min";
  }

  const roundedMinutes = Math.max(0, Math.round(totalSeconds / 60));
  if (roundedMinutes < 60) {
    return `${roundedMinutes} min`;
  }

  const hours = Math.floor(roundedMinutes / 60);
  const minutes = roundedMinutes % 60;
  if (language === "fi") {
    return minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`;
  }
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

function getBestRangeSession(speedruns: CheckoutSpeedrunSession[]): CheckoutSpeedrunSession | null {
  const completed = speedruns.filter(
    (session) =>
      session.totalActiveSeconds > 0 &&
      session.entries.length > 0 &&
      session.entries.every((entry) => entry.result === "finished")
  );

  if (completed.length === 0) return null;

  return completed.reduce((best, session) =>
    session.totalActiveSeconds < best.totalActiveSeconds ? session : best
  );
}

function getBestAroundClockTime(
  aroundSessions: AroundClockSession[],
  doubleRequirement: 1 | 2
): string {
  const matches = aroundSessions.filter(
    (session) =>
      session.mode === "full_sector" &&
      session.doubleRequirement === doubleRequirement &&
      session.totalActiveSeconds > 0
  );

  if (matches.length === 0) return DASH;

  const best = matches.reduce((lowest, session) =>
    session.totalActiveSeconds < lowest.totalActiveSeconds ? session : lowest
  );

  return formatPracticeDuration(best.totalActiveSeconds);
}

function buildSummary(
  checkoutAttempts: CheckoutAttempt[],
  speedruns: CheckoutSpeedrunSession[],
  aroundSessions: AroundClockSession[],
  language: "en" | "fi",
  copy: HomeDashboardCopy
): HomeSummary {
  const practiceDates = new Set<string>();

  for (const attempt of checkoutAttempts) {
    const key = getDateKey(attempt.timestamp);
    if (key) practiceDates.add(key);
  }

  for (const session of speedruns) {
    const key = getDateKey(session.timestamp);
    if (key) practiceDates.add(key);
  }

  for (const session of aroundSessions) {
    const key = getDateKey(session.timestamp);
    if (key) practiceDates.add(key);
  }

  let streak = 0;
  while (practiceDates.has(getDaysAgoKey(streak))) {
    streak += 1;
  }

  const attemptTime = checkoutAttempts.reduce((sum, attempt) => {
    if (!isWithinLastSevenDays(attempt.timestamp) || attempt.elapsedSeconds === null || attempt.elapsedSeconds <= 0) {
      return sum;
    }
    return sum + attempt.elapsedSeconds;
  }, 0);

  const speedrunTime = speedruns.reduce((sum, session) => {
    if (!isWithinLastSevenDays(session.timestamp) || session.totalActiveSeconds <= 0) {
      return sum;
    }
    return sum + session.totalActiveSeconds;
  }, 0);

  const aroundTime = aroundSessions.reduce((sum, session) => {
    if (!isWithinLastSevenDays(session.timestamp) || session.totalActiveSeconds <= 0) {
      return sum;
    }
    return sum + session.totalActiveSeconds;
  }, 0);

  const finishedCheckouts = checkoutAttempts
    .filter((attempt) => attempt.result === "finished")
    .map((attempt) => attempt.finishNumber);

  const bestFinish = finishedCheckouts.length > 0 ? String(Math.max(...finishedCheckouts)) : DASH;
  const bestRange = getBestRangeSession(speedruns);

  return {
    streak,
    practiceTime: formatHomeMinutes(attemptTime + speedrunTime + aroundTime, language),
    practiceTimeLabel: copy.sevenDays,
    bestFinish,
    bestFinishLabel: bestFinish === DASH ? DASH : copy.checkoutLabel,
    bestRangeTime: bestRange ? formatPracticeDuration(bestRange.totalActiveSeconds) : DASH,
    bestRangeLabel: bestRange ? bestRange.rangeLabel.replace(/-/g, "–") : DASH,
    bestAtcOne: `1xD · ${getBestAroundClockTime(aroundSessions, 1)}`,
    bestAtcTwo: `2xD · ${getBestAroundClockTime(aroundSessions, 2)}`
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
  const { t, resolvedLanguage } = useI18n();
  const homeCopy: HomeDashboardCopy = getHomeDashboardCopy(resolvedLanguage);

  const summary = buildSummary(checkoutAttempts, speedruns, aroundSessions, resolvedLanguage, homeCopy);
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
      metaValue: latestCheckout ? String(latestCheckout.finishNumber) : DASH
    },
    {
      title: t.stats.checkoutTimedRun,
      screen: "speedrun",
      description: t.home.timedRunDescription,
      icon: "T",
      tone: "timer",
      metaLabel: t.home.bestTime,
      metaValue: bestTimedRun !== null ? formatPracticeDuration(bestTimedRun) : DASH
    },
    {
      title: t.stats.aroundTheClock,
      screen: "around-clock",
      description: t.home.aroundDescription,
      icon: "C",
      tone: "clock",
      metaLabel: t.home.latest,
      metaValue: latestAround ? formatPracticeDuration(latestAround.totalActiveSeconds) : DASH
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
        <div className="home-streak-card" aria-label={homeCopy.dayStreak}>
          <span className="home-streak-icon" aria-hidden="true" />
          <strong>{summary.streak}</strong>
          <span>{homeCopy.dayStreak}</span>
        </div>
      </section>

      <section className="home-summary-grid" aria-label={t.home.summary}>
        <div className="home-summary-card">
          <span>{homeCopy.practiceTime}</span>
          <strong>{summary.practiceTime}</strong>
          <small>{summary.practiceTimeLabel}</small>
        </div>
        <div className="home-summary-card">
          <span>{homeCopy.bestFinish}</span>
          <strong>{summary.bestFinish}</strong>
          <small>{summary.bestFinishLabel}</small>
        </div>
        <div className="home-summary-card">
          <span>{homeCopy.bestRange}</span>
          <strong>{summary.bestRangeTime}</strong>
          <small>{summary.bestRangeLabel}</small>
        </div>
        <div className="home-summary-card home-summary-card-atc">
          <span>{homeCopy.bestAtc}</span>
          <strong>{summary.bestAtcOne}</strong>
          <small>{summary.bestAtcTwo}</small>
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
