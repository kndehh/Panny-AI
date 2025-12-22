import axios from "axios";
import { attachAuthInterceptor } from "./interceptor";
import { getServerConfig } from "./config";

const authClient = axios.create({
  baseURL: import.meta.env.DEV
    ? ""
    : import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000",
  withCredentials: true,
});

attachAuthInterceptor(authClient);

function edgeUrl(path: string) {
  const envBase = import.meta.env.VITE_AUTH_API_URL ?? "";
  const serverBase = getServerConfig()?.edge_auth_api_url ?? "";
  const base = envBase || serverBase || "";
  return base ? `${base.replace(/\/$/, "")}/auth_api${path}` : path;
}

function hasEdge() {
  const envBase = import.meta.env.VITE_AUTH_API_URL ?? "";
  const serverBase = getServerConfig()?.edge_auth_api_url ?? "";
  return Boolean(envBase || serverBase);
}

export type Session = {
  userId: string;
  email: string;
  displayName?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
};

export class UnauthenticatedError extends Error {
  constructor(message = "Unauthenticated") {
    super(message);
    this.name = "UnauthenticatedError";
  }
}

function normalizeSession(payload: any): Session | null {
  if (!payload) return null;

  // backend sering balikin { user: {...} }
  const raw = payload.user ?? payload;

  if (!raw) return null;

  const userId =
    raw.userId ??
    raw.user_id ??
    raw.id ??
    raw.uid ??
    raw.sub ??
    null;

  const email = raw.email ?? null;

  if (!userId || !email) return null;

  const displayName =
    raw.displayName ??
    raw.display_name ??
    raw.display ??
    raw.name ??
    "";

  const accessToken = payload.accessToken ?? payload.access_token;
  const refreshToken = payload.refreshToken ?? payload.refresh_token;
  const expiresAt = payload.expiresAt ?? payload.expires_at;

  return {
    userId: String(userId),
    email: String(email),
    displayName: displayName ? String(displayName) : undefined,
    accessToken: accessToken ? String(accessToken) : undefined,
    refreshToken: refreshToken ? String(refreshToken) : undefined,
    expiresAt: typeof expiresAt === "number" ? expiresAt : undefined,
  };
}

export async function fetchSession(): Promise<Session | null> {
  try {
    const url = hasEdge() ? edgeUrl("/me") : "/api/auth/session";
    const res = await authClient.get(url);
    const session = normalizeSession(res.data);

    // kalau backend balikin {user: null} -> normalizeSession null
    return session;
  } catch (err: any) {
    if (err?.response?.status === 401) throw new UnauthenticatedError();
    throw err;
  }
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<Session> {
  const url = hasEdge() ? edgeUrl("/login") : "/api/auth/login";
  const res = await authClient.post(url, payload);
  const s = normalizeSession(res.data) ?? normalizeSession(await fetchSession());

  if (!s) throw new Error("Login succeeded but session is missing");

  try {
    const data = res.data as any;
    if (typeof window !== "undefined") {
      if (data?.accessToken)
        window.localStorage.setItem("supabase.access_token", data.accessToken);
      if (data?.refreshToken)
        window.localStorage.setItem("supabase.refresh_token", data.refreshToken);
    }
  } catch {}

  return s;
}

export async function signup(payload: {
  email: string;
  password: string;
  displayName?: string;
}): Promise<Session> {
  const body: any = { email: payload.email, password: payload.password };
  if (payload.displayName) {
    body.displayName = payload.displayName;
    body.display_name = payload.displayName;
    body.name = payload.displayName;
    body.fullName = payload.displayName;
  }

  const url = hasEdge() ? edgeUrl("/signup") : "/api/auth/signup";
  const res = await authClient.post(url, body);

  // setelah signup, banyak backend tidak langsung “logged in”.
  // jadi ambil session dari server biar akurat.
  const s = normalizeSession(res.data) ?? normalizeSession(await fetchSession());

  if (!s) throw new Error("Signup succeeded but session is missing");

  try {
    const data = res.data as any;
    if (typeof window !== "undefined") {
      if (data?.accessToken)
        window.localStorage.setItem("supabase.access_token", data.accessToken);
      if (data?.refreshToken)
        window.localStorage.setItem("supabase.refresh_token", data.refreshToken);
    }
  } catch {}

  return s;
}

export async function logout(userId?: string): Promise<void> {
  const url = hasEdge() ? edgeUrl("/logout") : "/api/auth/logout";

  let id = userId;
  if (!id) {
    try {
      const s = await fetchSession();
      id = s?.userId;
    } catch {}
  }

  const body: any = {};
  if (id) body.user_id = id;

  try {
    await authClient.post(url, body);
  } finally {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem("supabase.access_token");
        window.localStorage.removeItem("supabase.refresh_token");
        window.localStorage.removeItem("sb:token");
        window.localStorage.removeItem("access_token");
      } catch {}
    }
  }
}
