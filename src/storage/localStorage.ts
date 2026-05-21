const PREFIX = "darts_practice_mvp_";

const key = (raw: string) => `${PREFIX}${raw}`;

export function readJson<T>(rawKey: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key(rawKey));
    if (!value) {
      return fallback;
    }
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(rawKey: string, value: T): void {
  localStorage.setItem(key(rawKey), JSON.stringify(value));
}
