import { setTokenGetter } from "./interceptor";

/**
 * Helper to register a Supabase session token getter so Axios attaches
 * Authorization: Bearer <token> automatically.
 *
 * Usage (supabase-js v2):
 *   import { createClient } from '@supabase/supabase-js'
 *   import { registerSupabaseToken } from './api/registerSupabaseToken'
 *   const supabase = createClient(...)
 *   registerSupabaseToken(supabase)
 */
export function registerSupabaseToken(supabase: any) {
  setTokenGetter(async () => {
    try {
      // supabase-js v2
      if (typeof supabase.auth?.getSession === "function") {
        const { data } = await supabase.auth.getSession();
        return data?.session?.access_token ?? null;
      }

      // Fallback: try to read from local storage (if user stored it)
      if (typeof window !== "undefined") {
        return (
          window.localStorage.getItem("supabase.access_token") ||
          window.localStorage.getItem("sb:token") ||
          null
        );
      }
      return null;
    } catch (e) {
      return null;
    }
  });
}

export function registerLocalTokenGetter() {
  setTokenGetter(async () => {
    if (typeof window === "undefined") return null;
    return (
      window.localStorage.getItem("supabase.access_token") ||
      window.localStorage.getItem("sb:token") ||
      window.localStorage.getItem("access_token") ||
      null
    );
  });
}

export default registerSupabaseToken;
