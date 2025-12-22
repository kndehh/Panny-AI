import { useEffect } from "react";
import { logout } from "../api/auth";
import {
  clearPersistedSession,
  isPersistedSessionExpired,
  loadPersistedSession,
  touchPersistedSessionActivity,
} from "../utils/persistedSession";

// Logs out only if the app hasn't been opened/used for 30 days.
// Otherwise, refreshes should keep the user signed-in.
export function useInactivityLogout() {
  useEffect(() => {
    const persisted = loadPersistedSession();
    if (persisted && isPersistedSessionExpired(persisted)) {
      clearPersistedSession();
      // Best-effort server logout; ignore failures.
      logout().catch(() => undefined);
    }

    let lastTouch = 0;
    const touch = () => {
      const now = Date.now();
      // Throttle writes to localStorage.
      if (now - lastTouch < 15_000) return;
      lastTouch = now;
      touchPersistedSessionActivity();
    };

    const events: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "scroll",
      "focus",
    ];
    events.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    const onVisibility = () => {
      if (document.visibilityState === "visible") touch();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Initial touch on mount.
    touch();

    return () => {
      events.forEach((e) => window.removeEventListener(e, touch));
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
}
