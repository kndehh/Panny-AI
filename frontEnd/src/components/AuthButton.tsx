import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import Dialog from "./ui/Dialog";
import { useSession } from "../hooks/useSession";

// Session-aware CTA: routes to login page or confirms logout via dialog (no alerts).
export default function AuthButton() {
  const navigate = useNavigate();
  const { sessionQuery, logoutMutation, isAuthenticated } = useSession();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const label = useMemo(() => {
    if (sessionQuery.isLoading) return "Begin Session"; // initial probe
    return isAuthenticated ? "Logout" : "Login";
  }, [sessionQuery.isLoading, isAuthenticated]);

  const handleClick = () => {
    if (sessionQuery.isLoading) return;
    if (isAuthenticated) {
      setConfirmOpen(true);
    } else {
      navigate("/login", { replace: false });
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={handleClick}
        aria-busy={sessionQuery.isLoading}
        disabled={logoutMutation.isPending}
      >
        {label}
      </Button>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <div className="space-y-3">
          <p className="text-lg font-semibold text-[var(--text-primary)] dark:text-white">
            Logout?
          </p>
          <p className="text-sm text-[var(--text-secondary)] dark:text-white/70">
            You can log back in anytime.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="solid"
              disabled={logoutMutation.isPending}
              onClick={() => {
                logoutMutation.mutate(undefined, {
                  onSuccess: () => setConfirmOpen(false),
                });
              }}
            >
              {logoutMutation.isPending ? "Signing out..." : "Logout"}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
