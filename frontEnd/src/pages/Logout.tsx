import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

// Logout page: triggers logout on mount and offers a manual retry.
export default function Logout() {
  const navigate = useNavigate();
  const { logoutMutation } = useSession();

  useEffect(() => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        // stay on page with success state; user can navigate away
      },
    });
  }, [logoutMutation]);

  const isPending = logoutMutation.isPending;
  const error = logoutMutation.error as {
    response?: { data?: { message?: string } };
  } | null;
  const message = error?.response?.data?.message;

  return (
    <div className="grid place-items-center">
      <Card className="w-full max-w-md space-y-4 text-[var(--text-primary)] dark:text-white">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Signing you out</h1>
          <p className="text-sm text-[var(--text-secondary)] dark:text-white/70">
            Flask session will be cleared on the server; cookies are
            invalidated.
          </p>
        </div>
        {isPending && (
          <p className="text-sm text-[var(--text-secondary)]">Working...</p>
        )}
        {message && <p className="text-sm text-red-500">{message}</p>}
        {!isPending && !message && (
          <p className="text-sm text-[var(--text-secondary)]">
            You have been logged out.
          </p>
        )}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/")}>
            Home
          </Button>
          <Button
            variant="solid"
            disabled={isPending}
            onClick={() => logoutMutation.mutate(undefined)}
          >
            {isPending ? "Logging out..." : "Retry logout"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
