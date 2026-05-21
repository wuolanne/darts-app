import {
  AroundClockSession,
  CheckoutAttempt,
  CheckoutSpeedrunSession
} from "../types/models";
import { readJson, writeJson } from "./localStorage";

const CHECKOUT_ATTEMPTS_KEY = "checkout_attempts";
const SPEEDRUN_KEY = "checkout_speedrun_sessions";
const AROUND_KEY = "around_clock_sessions";

export function readCheckoutAttempts(): CheckoutAttempt[] {
  return readJson<CheckoutAttempt[]>(CHECKOUT_ATTEMPTS_KEY, []);
}

export function writeCheckoutAttempts(attempts: CheckoutAttempt[]): void {
  writeJson(CHECKOUT_ATTEMPTS_KEY, attempts);
}

export function appendCheckoutAttempt(attempt: CheckoutAttempt): CheckoutAttempt[] {
  const all = readCheckoutAttempts();
  const next = [attempt, ...all].slice(0, 2500);
  writeCheckoutAttempts(next);
  return next;
}

export function readCheckoutSpeedruns(): CheckoutSpeedrunSession[] {
  return readJson<CheckoutSpeedrunSession[]>(SPEEDRUN_KEY, []);
}

export function writeCheckoutSpeedruns(sessions: CheckoutSpeedrunSession[]): void {
  writeJson(SPEEDRUN_KEY, sessions);
}

export function appendCheckoutSpeedrun(
  session: CheckoutSpeedrunSession
): CheckoutSpeedrunSession[] {
  const all = readCheckoutSpeedruns();
  const next = [session, ...all].slice(0, 1200);
  writeCheckoutSpeedruns(next);
  return next;
}

export function readAroundClockSessions(): AroundClockSession[] {
  const loaded = readJson<AroundClockSession[]>(AROUND_KEY, []);
  return loaded.map((session) => ({
    ...session,
    estimatedDarts: session.estimatedDarts ?? null,
    throwPaceSecondsPerThree: session.throwPaceSecondsPerThree ?? null
  }));
}

export function writeAroundClockSessions(sessions: AroundClockSession[]): void {
  writeJson(AROUND_KEY, sessions);
}

export function appendAroundClockSession(
  session: AroundClockSession
): AroundClockSession[] {
  const all = readAroundClockSessions();
  const next = [session, ...all].slice(0, 1200);
  writeAroundClockSessions(next);
  return next;
}
