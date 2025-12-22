import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usePannyStore } from "../store/usePannyStore";
import { useSession } from "../hooks/useSession";
import Switch from "./ui/Switch";
import Button from "./ui/Button";
import logo from "../img/PannyonPage.png";

// Nav items will be dynamically filtered based on auth state
const baseNavItems = [
  { label: "Home", to: "/", auth: "all" },
  { label: "Chat", to: "/chat", auth: "all" },
  { label: "Journal", to: "/journal", auth: "all" },
  { label: "Settings", to: "/settings", auth: "all" },
];

type FloatingNavbarProps = {
  onSoundToggle: (enabled: boolean) => void;
};

// Navbar now hosts auth + zen controls so they live with primary nav.
export default function FloatingNavbar({ onSoundToggle }: FloatingNavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = usePannyStore((s) => s.theme);
  const setTheme = usePannyStore((s) => s.setTheme);
  const sound = usePannyStore((s) => s.soundEnabled);
  const setSound = usePannyStore((s) => s.setSound);
  const [fabOpen, setFabOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { sessionQuery, logoutMutation, isAuthenticated } = useSession();

  const userName =
    sessionQuery.data?.displayName ||
    sessionQuery.data?.email?.split("@")[0] ||
    "User";

  // Auto-close the mobile tray when the route changes so it doesn't linger across pages.
  // Using useLayoutEffect to avoid the React 19 cascading render warning
  useEffect(() => {
    if (fabOpen) {
      setFabOpen(false);
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFabToggle = () => setFabOpen((v) => !v);

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setShowLogoutDialog(false);
        navigate("/");
      },
    });
  };

  return (
    <>
      {/* Logout Confirmation Dialog */}
      <AnimatePresence>
        {showLogoutDialog && (
          <motion.div
            key="logout-dialog-backdrop"
            className="fixed inset-0 z-[100] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowLogoutDialog(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative z-10 mx-4 w-full max-w-sm rounded-[24px] border border-[var(--surface-lines)] bg-[var(--surface)] p-6 shadow-2xl"
            >
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                  <svg
                    className="h-6 w-6 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] dark:text-white">
                  Log out of Panny?
                </h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)] dark:text-white/60">
                  Are you sure you want to log out from your account?
                </p>
                <div className="mt-6 flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-[var(--surface-lines)] text-[var(--text-primary)] dark:border-white/20 dark:text-white"
                    onClick={() => setShowLogoutDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-red-500 text-white hover:bg-red-600"
                    onClick={confirmLogout}
                  >
                    Log out
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop navbar */}
      <div className="desktop-nav pointer-events-none fixed top-3 z-40 hidden w-full justify-center px-3 lg:flex lg:px-4">
        <motion.div
          layout
          className="pointer-events-auto w-full max-w-6xl rounded-[28px] border border-[var(--surface-lines)] bg-[var(--surface)]/95 px-4 py-3 text-sm shadow-[0_24px_70px_rgba(4,8,15,0.18)] backdrop-blur-2xl dark:bg-[var(--surface)]"
        >
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-2 text-center text-[var(--text-primary)] dark:text-white sm:flex-row sm:items-center sm:gap-3 sm:text-left">
              <Link
                to="/"
                className="flex items-center gap-2 transition active:scale-95"
              >
                <img src={logo} alt="Panny" className="h-11 w-auto" />
                <div className="hidden h-1.5 w-1.5 rounded-full bg-panny-green1 sm:block" />
              </Link>
              <p className="text-xs text-[var(--text-muted)]">
                Soft AI companion
              </p>
              <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:ml-auto sm:w-auto sm:justify-end">
                <TogglePill label="Theme">
                  <Switch
                    checked={theme === "dark"}
                    onChange={(v) => setTheme(v ? "dark" : "light")}
                  />
                </TogglePill>
                <TogglePill label="Sound">
                  <Switch
                    checked={sound}
                    onChange={(v) => {
                      setSound(v);
                      onSoundToggle(v);
                    }}
                    aria-label="Toggle sound and background music"
                  />
                </TogglePill>
              </div>
            </div>

            <div className="hidden sm:block">
              <NavLinks
                locationPath={location.pathname}
                isAuthenticated={isAuthenticated}
                userName={userName}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile fixed logo + fab */}
      <div className="mobile-nav lg:hidden">
        <Link
          to="/"
          className="pointer-events-auto fixed left-4 top-4 z-40 block active:scale-95"
          aria-label="Go to home"
        >
          <img src={logo} alt="Panny" className="h-14 w-14 object-contain" />
        </Link>
        <motion.button
          type="button"
          className="pointer-events-auto fixed right-4 top-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface)]/95 shadow-lg ring-1 ring-[var(--surface-lines)] backdrop-blur"
          onClick={handleFabToggle}
          aria-label="Toggle navigation"
        >
          {fabOpen ? (
            <span className="relative h-6 w-6">
              <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rotate-45 rounded-full bg-[var(--text-primary)]" />
              <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 -rotate-45 rounded-full bg-[var(--text-primary)]" />
            </span>
          ) : (
            <span className="flex h-6 w-6 flex-col justify-between">
              <span className="h-[2px] w-full rounded-full bg-[var(--text-primary)]" />
              <span className="h-[2px] w-full rounded-full bg-[var(--text-primary)]" />
              <span className="h-[2px] w-full rounded-full bg-[var(--text-primary)]" />
            </span>
          )}
        </motion.button>

        <AnimatePresence>
          {fabOpen && (
            <motion.div
              key="mobile-nav-sheet"
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFabOpen(false)}
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                className="mx-4 mt-16 rounded-[24px] border border-[var(--surface-lines)] bg-[var(--surface)]/97 p-4 text-sm shadow-[0_24px_70px_rgba(4,8,15,0.35)] backdrop-blur"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-[var(--text-primary)]">
                  <div className="flex items-center gap-2">
                    <Link
                      to="/"
                      className="font-semibold tracking-wide"
                      onClick={() => setFabOpen(false)}
                    >
                      Panny
                    </Link>
                    <div className="h-1.5 w-1.5 rounded-full bg-panny-green1" />
                  </div>
                  <div className="flex w-full flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
                    <TogglePill label="Theme">
                      <Switch
                        checked={theme === "dark"}
                        onChange={(v) => setTheme(v ? "dark" : "light")}
                      />
                    </TogglePill>
                    <TogglePill label="Sound">
                      <Switch
                        checked={sound}
                        onChange={(v) => {
                          setSound(v);
                          onSoundToggle(v);
                        }}
                        aria-label="Toggle sound and background music"
                      />
                    </TogglePill>
                  </div>
                </div>
                <NavLinks
                  locationPath={location.pathname}
                  onNavigate={() => setFabOpen(false)}
                  orientation="vertical"
                  isAuthenticated={isAuthenticated}
                  userName={userName}
                  onLogout={handleLogout}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

type NavLinksProps = {
  locationPath: string;
  onNavigate?: () => void;
  orientation?: "horizontal" | "vertical";
  isAuthenticated: boolean;
  userName: string;
  onLogout: () => void;
};

function NavLinks({
  locationPath,
  onNavigate,
  orientation = "horizontal",
  isAuthenticated,
  userName,
  onLogout,
}: NavLinksProps) {
  const vertical = orientation === "vertical";

  // Build nav items based on auth state
  const navItems = [
    ...baseNavItems,
    ...(isAuthenticated
      ? []
      : [
          { label: "Login", to: "/login", auth: "guest" },
          { label: "Sign up", to: "/signin", auth: "guest" },
        ]),
  ];
  return (
    <nav
      className={`flex w-full ${
        vertical ? "flex-col" : "items-center"
      } gap-1 rounded-3xl bg-[var(--surface-muted)] p-1 text-xs font-medium text-[var(--text-muted)] shadow-inner dark:bg-white/5`}
    >
      {navItems.map((item) => {
        const active = locationPath === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={`relative ${
              vertical ? "w-full" : "flex-1 min-w-[80px]"
            } whitespace-nowrap rounded-2xl px-3 py-2 text-center transition active:scale-95`}
          >
            {active && (
              <motion.span
                layoutId="nav-pill"
                className="absolute inset-0 rounded-2xl bg-white text-black dark:bg-white/80"
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 30,
                }}
              />
            )}
            <span
              className={`relative z-10 ${
                active
                  ? "text-black"
                  : "text-[var(--text-muted)] dark:text-white/80"
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
      {isAuthenticated && (
        <>
          <div
            className={`${
              vertical ? "w-full" : "flex-1 min-w-[80px]"
            } whitespace-nowrap rounded-2xl px-3 py-2 text-center text-panny-green1`}
          >
            Hi, {userName}
          </div>
          <button
            onClick={() => {
              onNavigate?.();
              onLogout();
            }}
            className={`relative ${
              vertical ? "w-full" : "flex-1 min-w-[80px]"
            } whitespace-nowrap rounded-2xl px-3 py-2 text-center transition active:scale-95 text-red-400 hover:bg-red-500/10`}
          >
            Logout
          </button>
        </>
      )}
    </nav>
  );
}

function TogglePill({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-[var(--surface-muted)] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)] dark:bg-white/5">
      <span>{label}</span>
      {children}
    </div>
  );
}
