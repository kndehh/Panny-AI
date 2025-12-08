import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { usePannyStore } from "../store/usePannyStore";
import useSound from "../hooks/useSound";
import Switch from "./ui/Switch";
import Button from "./ui/Button";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Chat", to: "/chat" },
  { label: "Journal", to: "/journal" },
  { label: "Settings", to: "/settings" },
];

export default function FloatingNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = usePannyStore((s) => s.theme);
  const setTheme = usePannyStore((s) => s.setTheme);
  const sound = usePannyStore((s) => s.soundEnabled);
  const setSound = usePannyStore((s) => s.setSound);

  const [offset, setOffset] = useState(0);
  const { playHover } = useSound();
  useEffect(() => {
    const handler = () => setOffset(window.scrollY / 12);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-40 flex justify-center px-3 sm:px-4">
      <motion.div
        layout
        animate={{ y: offset }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        className="pointer-events-auto w-full max-w-5xl rounded-[28px] border border-[var(--surface-lines)] bg-[var(--surface)]/95 px-3 py-3 text-sm shadow-[0_24px_70px_rgba(4,8,15,0.18)] backdrop-blur-2xl dark:bg-[var(--surface)] sm:px-4"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-2 text-[var(--text-primary)] dark:text-white">
            <Link
              to="/"
              className="font-semibold tracking-wide transition active:scale-95"
            >
              Panny
            </Link>
            <div className="hidden h-1.5 w-1.5 rounded-full bg-panny-green1 sm:block" />
            <p className="text-xs text-[var(--text-muted)]">
              Soft AI companion
            </p>
          </div>
          <nav className="order-3 flex w-full items-center gap-1 overflow-x-auto rounded-3xl bg-[var(--surface-muted)] p-1 text-xs font-medium text-[var(--text-muted)] shadow-inner dark:bg-white/5 md:order-none md:flex-1">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="relative flex-1 min-w-[80px] whitespace-nowrap rounded-2xl px-3 py-1.5 text-center transition active:scale-95"
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
          </nav>
          <div className="flex w-full flex-col gap-2 text-[10px] uppercase tracking-[0.28em] text-[var(--text-muted)] md:w-auto md:flex-row md:items-center">
            <div className="flex flex-1 items-center justify-between gap-2 rounded-2xl bg-[var(--surface-muted)] px-3 py-1 dark:bg-white/5 md:flex-none">
              <span>Theme</span>
              <Switch
                checked={theme === "dark"}
                onChange={(v) => setTheme(v ? "dark" : "light")}
              />
            </div>
            <div className="flex flex-1 items-center justify-between gap-2 rounded-2xl bg-[var(--surface-muted)] px-3 py-1 dark:bg-white/5 md:flex-none">
              <span>Sound</span>
              <Switch checked={sound} onChange={(v) => setSound(v)} />
            </div>
            <Button
              className="w-full whitespace-nowrap bg-panny-green1 px-5 py-2 text-xs font-semibold text-slate-900 dark:text-black md:w-auto"
              onClick={() => {
                playHover();
                navigate("/chat");
              }}
            >
              Begin session
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
