import type { Session } from "../api/auth";

const SESSION_KEY = "panny.session.v1";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export type PersistedSession = {
  session: Session;
  savedAt: number;
  lastActiveAt: number;
};

function safeParse(json: string): unknown {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function loadPersistedSession(): PersistedSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  const parsed = safeParse(raw) as Partial<PersistedSession> | null;
  if (!parsed?.session || !parsed?.savedAt || !parsed?.lastActiveAt) return null;
  return parsed as PersistedSession;
}

export function isPersistedSessionExpired(p: PersistedSession): boolean {
  return Date.now() - p.lastActiveAt > THIRTY_DAYS_MS;
}

export function clearPersistedSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}

export function savePersistedSession(session: Session) {
  if (typeof window === "undefined") return;
  const now = Date.now();
  const payload: PersistedSession = {
    session,
    savedAt: now,
    lastActiveAt: now,
  };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
}

export function touchPersistedSessionActivity() {
  if (typeof window === "undefined") return;
  const current = loadPersistedSession();
  if (!current) return;
  const next: PersistedSession = {
    ...current,
    lastActiveAt: Date.now(),
  };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
}
