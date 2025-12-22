import type { FormEvent } from "react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import { toast } from "sonner";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

type LocationState = { from?: string } | null;

// Dedicated sign-up page (separate from login).
export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signupMutation, sessionQuery } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);

  const COOLDOWN_MS = 60 * 1000; // 60 seconds

  useEffect(() => {
    try {
      const key = `panny.signup.cooldown:${email}`;
      const raw =
        typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
      const until = raw ? Number(raw) : null;
      if (until && !Number.isNaN(until) && until > Date.now())
        setCooldownUntil(until);
      else setCooldownUntil(null);
    } catch (e) {
      setCooldownUntil(null);
    }
  }, [email]);

  useEffect(() => {
    if (!cooldownUntil) return;
    const t = setInterval(() => {
      if (!cooldownUntil) return clearInterval(t);
      if (Date.now() >= cooldownUntil) {
        setCooldownUntil(null);
        clearInterval(t);
      } else {
        // force re-render for countdown
        setCooldownUntil((c) => (c ? c : null));
      }
    }, 1000);
    return () => clearInterval(t);
  }, [cooldownUntil]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Manual validation instead of browser defaults
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!password) {
      toast.error("Please enter a password");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      setError("Passwords do not match");
      return;
    }

    signupMutation.mutate(
      { email, password, displayName: name },
      {
        onSuccess: () => {
          toast.success("Account created! Welcome to Panny 🌿");
          try {
            const key = `panny.signup.cooldown:${email}`;
            if (typeof window !== "undefined")
              window.localStorage.removeItem(key);
          } catch (_) {}
          const redirectTo = (location.state as LocationState)?.from ?? "/";
          navigate(redirectTo, { replace: true });
        },
        onError: (err: unknown) => {
          console.error("Signup error:", err);
          const maybeAxios = err as {
            response?: { status?: number; data?: any };
          };

          // Prefer structured server-side messages when available
          const serverData = maybeAxios?.response?.data;
          let message = "Sign up failed. Please try again.";
          if (serverData) {
            // Common fields from APIs: error, message, detail
            message =
              serverData.error ??
              serverData.message ??
              serverData.detail ??
              JSON.stringify(serverData);
          }

          // Prefer rate-limit friendly message when applicable
          const status = maybeAxios?.response?.status;
          if (status === 429 || serverData?.error === "rate_limited") {
            const serverMsg =
              serverData?.message || serverData?.error || message;
            message = `${status} — Rate limit exceeded. ${serverMsg}`;
            // set a short client-side cooldown to prevent repeated attempts
            try {
              const key = `panny.signup.cooldown:${email}`;
              const until = Date.now() + COOLDOWN_MS;
              if (typeof window !== "undefined")
                window.localStorage.setItem(key, String(until));
              setCooldownUntil(until);
            } catch (_) {}
            // If the server returned a dev hint (e.g., to set SUPABASE_SERVICE_KEY), show it.
            if (serverData?.hint) {
              toast.error(`${message} — ${serverData.hint}`);
              setError(`${message} — ${serverData.hint}`);
              return;
            }
          } else if (status) {
            // Include HTTP status for clarity
            message = `${status} — ${message}`;
          }

          toast.error(message);
          setError(message);
        },
      }
    );
  };

  return (
    <div className="relative min-h-screen px-4 pb-2 pt-8 sm:px-6 sm:py-1">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-1 pb-4 sm:hidden"></div>
      <div className="mx-auto max-w-4xl overflow-hidden rounded-[32px] border border-[var(--surface-lines)] bg-[var(--surface)]/95 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.25)] backdrop-blur sm:p-10 dark:bg-[var(--surface)]">
        <div className="relative z-10 mx-auto flex max-w-3xl flex-col gap-8 text-[var(--text-primary)]">
          <header className="space-y-2 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">
              Welcome
            </p>
            <h1 className="text-4xl font-bold leading-snug text-[var(--text-primary)] md:text-5xl">
              Sign up
            </h1>
            <p className="text-sm text-[var(--text-tertiary)]">
              See what Panny is capable of for free.
            </p>
          </header>

          <form
            className="relative z-10 w-full space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-white/5"
            onSubmit={onSubmit}
            noValidate
          >
            <div className="flex justify-between gap-[46px] items-center">
              <label className="text-[var(--text-secondary)] text-lg">
                Name
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                autoComplete="name"
                className="bg-slate-50 text-slate-900 placeholder:text-slate-400 dark:bg-white/5 dark:text-white dark:placeholder:text-white/50 w-full py-2"
              />
            </div>
            <div className="flex justify-between gap-[52px] items-center">
              <label className="text-[var(--text-secondary)] text-lg">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="johndoe@example.com"
                autoComplete="email"
                className="bg-slate-50 text-slate-900 placeholder:text-slate-400 dark:bg-white/5 dark:text-white dark:placeholder:text-white/50 w-full py-2"
              />
            </div>
            <div className="flex flex-col justify-between gap-[4px]">
              <label className="text-[var(--text-secondary)] text-lg text-left">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="bg-slate-50 text-slate-900 placeholder:text-slate-400 dark:bg-white/5 dark:text-white dark:placeholder:text-white/50 w-full py-2"
              />
            </div>
            <div className="flex flex-col justify-between gap-[4px]">
              <label className="text-[var(--text-secondary)] text-lg text-left">
                Verify Password
              </label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="bg-slate-50 text-slate-900 placeholder:text-slate-400 dark:bg-white/5 dark:text-white dark:placeholder:text-white/50 w-full py-2"
              />
            </div>
            {error && (
              <p className="text-sm text-red-500" role="alert">
                {error}
              </p>
            )}
            {cooldownUntil && (
              <p className="text-sm text-yellow-400" role="status">
                Too many attempts. Please wait{" "}
                {Math.ceil((cooldownUntil - Date.now()) / 1000)}s and try again.
              </p>
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-900 shadow-[0_12px_40px_rgba(59,211,176,0.35)] flex items-center justify-center gap-2"
              disabled={
                signupMutation.isPending ||
                sessionQuery.isLoading ||
                Boolean(cooldownUntil)
              }
            >
              {signupMutation.isPending && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              {signupMutation.isPending ? "Creating..." : "Sign up"}
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--text-tertiary)]">
            Already have an account?{" "}
            <button
              className="font-semibold text-emerald-700"
              onClick={() => navigate("/login")}
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
