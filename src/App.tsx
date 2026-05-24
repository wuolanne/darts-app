import { useEffect, useState } from "react";
import { ThemeProvider } from "./theme/ThemeContext";
import { I18nProvider } from "./i18n";
import { HomeScreen } from "./screens/HomeScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { QuickCheckoutPracticeScreen } from "./screens/QuickCheckoutPracticeScreen";
import { CheckoutSpeedrunScreen } from "./screens/CheckoutSpeedrunScreen";
import { AroundTheClockScreen } from "./screens/AroundTheClockScreen";
import { CheckoutLibraryScreen } from "./screens/CheckoutLibraryScreen";
import { StatsScreen } from "./screens/StatsScreen";
import { ThrowPaceOnboarding } from "./screens/ThrowPaceOnboarding";
import { AppScreen, AroundClockSession, CheckoutAttempt, CheckoutSpeedrunSession, UserSettings } from "./types/models";
import { DEFAULT_SETTINGS, readSettings, writeSettings } from "./storage/settings";
import {
  appendAroundClockSession,
  appendCheckoutAttempt,
  appendCheckoutSpeedrun,
  readAroundClockSessions,
  readCheckoutAttempts,
  readCheckoutSpeedruns
} from "./storage/trainingData";

function AppBody({
  screen,
  setScreen,
  settings,
  setSettings,
  checkoutAttempts,
  setCheckoutAttempts,
  speedruns,
  setSpeedruns,
  aroundSessions,
  setAroundSessions
}: {
  screen: AppScreen;
  setScreen: (screen: AppScreen) => void;
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
  checkoutAttempts: CheckoutAttempt[];
  setCheckoutAttempts: (attempts: CheckoutAttempt[]) => void;
  speedruns: CheckoutSpeedrunSession[];
  setSpeedruns: (sessions: CheckoutSpeedrunSession[]) => void;
  aroundSessions: AroundClockSession[];
  setAroundSessions: (sessions: AroundClockSession[]) => void;
}) {
  if (screen === "home") {
    return (
      <HomeScreen
        onNavigate={setScreen}
        checkoutAttempts={checkoutAttempts}
        speedruns={speedruns}
        aroundSessions={aroundSessions}
      />
    );
  }
  if (screen === "settings") {
    return (
      <SettingsScreen
        settings={settings}
        onUpdateSettings={setSettings}
        onBack={() => setScreen("home")}
      />
    );
  }
  if (screen === "quick-checkout") {
    return (
      <QuickCheckoutPracticeScreen
        settings={settings}
        onBack={() => setScreen("home")}
        onSaveAttempt={(attempt) => {
          const next = appendCheckoutAttempt(attempt);
          setCheckoutAttempts(next);
        }}
      />
    );
  }
  if (screen === "speedrun") {
    return (
      <CheckoutSpeedrunScreen
        onBack={() => setScreen("home")}
        settings={settings}
        previousSessions={speedruns}
        onSaveSession={(session) => {
          const next = appendCheckoutSpeedrun(session);
          setSpeedruns(next);
        }}
      />
    );
  }
  if (screen === "around-clock") {
    return (
      <AroundTheClockScreen
        onBack={() => setScreen("home")}
        settings={settings}
        previousSessions={aroundSessions}
        onSaveSession={(session) => {
          const next = appendAroundClockSession(session);
          setAroundSessions(next);
        }}
      />
    );
  }
  if (screen === "checkout-library") {
    return (
      <CheckoutLibraryScreen
        onBack={() => setScreen("home")}
        preferredDouble={settings.preferredDouble}
      />
    );
  }
  return (
    <StatsScreen
      onBack={() => setScreen("home")}
      checkoutAttempts={checkoutAttempts}
      speedruns={speedruns}
      aroundSessions={aroundSessions}
      settings={settings}
    />
  );
}

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("home");
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [checkoutAttempts, setCheckoutAttempts] = useState<CheckoutAttempt[]>([]);
  const [speedruns, setSpeedruns] = useState<CheckoutSpeedrunSession[]>([]);
  const [aroundSessions, setAroundSessions] = useState<AroundClockSession[]>([]);

  useEffect(() => {
    setSettings(readSettings());
    setCheckoutAttempts(readCheckoutAttempts());
    setSpeedruns(readCheckoutSpeedruns());
    setAroundSessions(readAroundClockSessions());
    setSettingsLoaded(true);
  }, []);

  useEffect(() => {
    writeSettings(settings);
  }, [settings]);

  return (
    <I18nProvider requestedLanguage={settings.languageMode}>
      <ThemeProvider requestedMode={settings.themeMode}>
        <main className="app-shell">
          {settingsLoaded &&
          !settings.throwPaceOnboardingCompleted &&
          settings.throwPace.mode === "not_set" &&
          !settings.throwPace.secondsPerThree ? (
            <ThrowPaceOnboarding settings={settings} onComplete={setSettings} />
          ) : (
            <AppBody
              screen={screen}
              setScreen={setScreen}
              settings={settings}
              setSettings={setSettings}
              checkoutAttempts={checkoutAttempts}
              setCheckoutAttempts={setCheckoutAttempts}
              speedruns={speedruns}
              setSpeedruns={setSpeedruns}
              aroundSessions={aroundSessions}
              setAroundSessions={setAroundSessions}
            />
          )}
        </main>
      </ThemeProvider>
    </I18nProvider>
  );
}
