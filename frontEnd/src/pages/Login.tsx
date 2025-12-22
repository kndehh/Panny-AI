import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import { toast } from "sonner";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

type LocationState = { from?: string } | null;

// Dedicated login page (separate from sign up).
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginMutation, sessionQuery } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Manual validation instead of browser defaults
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          toast.success("Welcome back! 🌿");
          const redirectTo = (location.state as LocationState)?.from ?? "/";
          navigate(redirectTo, { replace: true });
        },
        onError: (err: unknown) => {
          const maybeAxios = err as {
            response?: { data?: { error?: string; message?: string } };
          };
          const message =
            maybeAxios?.response?.data?.error ??
            maybeAxios?.response?.data?.message ??
            "Login failed. Please check your credentials.";
          toast.error(message);
          setError(message);
        },
      }
    );
  };

  return (
    <div className="relative min-h-screen px-4 pb-10 pt-28 sm:px-6 sm:py-12 overflow-x-hidden">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-1 pb-4 sm:hidden"></div>
      <div className="mx-auto max-w-4xl overflow-hidden rounded-[32px] border border-[var(--surface-lines)] bg-[var(--surface)]/95 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.25)] backdrop-blur sm:p-10 dark:bg-[var(--surface)]">
        <div className="relative z-10 mx-auto flex max-w-3xl flex-col gap-8 text-[var(--text-primary)]">
          <header className="space-y-2 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">
              Welcome back
            </p>
            <h1 className="text-4xl font-bold leading-snug text-[var(--text-primary)] md:text-5xl">
              Log in
            </h1>
            <p className="text-sm text-[var(--text-tertiary)]">
              Pick up your calm sessions.
            </p>
          </header>

          <form
            className="relative z-10 w-full space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-white/5"
            onSubmit={onSubmit}
            noValidate
          >
            <div className="flex justify-between gap-[52px] items-center">
              <label className="text-[var(--text-secondary)] text-lg">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="johndoe@gmail.com"
                autoComplete="email"
                className="bg-slate-50 text-slate-900 placeholder:text-slate-400 dark:bg-white/5 dark:text-white dark:placeholder:text-white/50 w-full py-2"
              />
            </div>
            <div className="flex justify-between gap-4 items-center">
              <label className="text-[var(--text-secondary)] text-lg">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="bg-slate-50 text-slate-900 placeholder:text-slate-400 dark:bg-white/5 dark:text-white dark:placeholder:text-white/50 w-full py-2"
              />
            </div>
            {error && (
              <div
                className="flex items-center justify-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-center"
                role="alert"
              >
                <svg
                  className="h-5 w-5 text-red-500 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm text-red-500">{error}</span>
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-900 shadow-[0_12px_40px_rgba(59,211,176,0.35)] flex items-center justify-center gap-2"
              disabled={loginMutation.isPending || sessionQuery.isLoading}
            >
              {loginMutation.isPending && (
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
              {loginMutation.isPending ? "Signing in..." : "Log in"}
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--text-tertiary)]">
            New here?{" "}
            <button
              className="font-semibold text-emerald-700"
              onClick={() => navigate("/signin")}
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
