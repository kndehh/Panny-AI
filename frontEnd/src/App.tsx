import { useEffect, useState, startTransition } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence, MotionConfig } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Journal from "./pages/Journal";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import SignIn from "./pages/SignIn";
import Logout from "./pages/Logout";
import FloatingNavbar from "./components/FloatingNavbar";
import AnimatedCursor from "./components/AnimatedCursor";
import useTheme from "./hooks/useTheme";
import useSound from "./hooks/useSound";
import PageTransitionWrapper from "./components/PageTransitionWrapper";
import LoadingScreen from "./components/LoadingScreen";
import { usePannyStore } from "./store/usePannyStore";
import { motion, AnimatePresence as FMAnimatePresence } from "framer-motion";
import { Toaster } from "sonner";
import { useInactivityLogout } from "./hooks/useInactivityLogout";
import "./App.css";

// One shared QueryClient for the whole app; keep it outside render to avoid re-creating.
const queryClient = new QueryClient();

function App() {
  useTheme();
  useSound();
  useInactivityLogout();
  const theme = usePannyStore((s) => s.theme);

  const [ready, setReady] = useState(false);
  const [showThemeSpinner, setShowThemeSpinner] = useState(false);

  const gradientStyle = {
    backgroundImage:
      "radial-gradient(circle at top, var(--glow-one), transparent 55%)," +
      "radial-gradient(circle at 80% 15%, var(--glow-two), transparent 50%)," +
      "linear-gradient(180deg, var(--bg-gradient-top), var(--bg-base))",
  };

  // Keep the toggle button, but disable zen music playback completely.
  const setZenMusicEnabled = (_enabled: boolean) => {
    // Intentionally no-op (audio removed)
    return;
  };

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 900);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    startTransition(() => setShowThemeSpinner(true));
    const t = window.setTimeout(() => {
      if (cancelled) return;
      startTransition(() => setShowThemeSpinner(false));
    }, 450);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <MotionConfig reducedMotion="never">
          <div className="soft-scroll relative min-h-screen overflow-hidden bg-transparent">
            <div
              className="fixed inset-0 -z-30 app-backdrop"
              style={gradientStyle}
            />
            <div className="noise-layer" aria-hidden />
            <div className="pointer-events-none fixed inset-0 -z-20 opacity-70">
              <div className="absolute -left-32 top-24 h-64 w-64 rounded-full bg-[var(--glow-one)] blur-[120px]" />
              <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-[var(--glow-two)] blur-[140px]" />
            </div>

            {/* Toggle stays, but it won’t start any audio now */}
            <FloatingNavbar onSoundToggle={setZenMusicEnabled} />

            <AnimatedCursor />

            <Toaster
              position="bottom-center"
              theme={theme}
              toastOptions={{
                style: {
                  background:
                    theme === "dark"
                      ? "rgba(30, 30, 30, 0.95)"
                      : "rgba(255, 255, 255, 0.95)",
                  border:
                    theme === "dark"
                      ? "1px solid rgba(255, 255, 255, 0.1)"
                      : "1px solid rgba(0, 0, 0, 0.1)",
                  color: theme === "dark" ? "#fff" : "#1a1a1a",
                  backdropFilter: "blur(10px)",
                },
              }}
            />

            <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-28 md:px-8 md:pt-44">
              <Routes>
                <Route
                  path="/"
                  element={
                    <PageTransitionWrapper>
                      <Home />
                    </PageTransitionWrapper>
                  }
                />
                <Route
                  path="/chat"
                  element={
                    <PageTransitionWrapper>
                      <Chat />
                    </PageTransitionWrapper>
                  }
                />
                <Route
                  path="/journal"
                  element={
                    <PageTransitionWrapper>
                      <Journal />
                    </PageTransitionWrapper>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <PageTransitionWrapper>
                      <Settings />
                    </PageTransitionWrapper>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <PageTransitionWrapper>
                      <Login />
                    </PageTransitionWrapper>
                  }
                />
                <Route
                  path="/signin"
                  element={
                    <PageTransitionWrapper>
                      <SignIn />
                    </PageTransitionWrapper>
                  }
                />
                <Route
                  path="/logout"
                  element={
                    <PageTransitionWrapper>
                      <Logout />
                    </PageTransitionWrapper>
                  }
                />
              </Routes>
            </main>

            <FMAnimatePresence>
              {showThemeSpinner && (
                <motion.div
                  key="theme-spinner"
                  className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-base)]/80 backdrop-blur"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <motion.div
                    className="h-14 w-14 rounded-full border-4 border-[var(--surface-lines)] border-t-panny-green1"
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      ease: "linear",
                    }}
                    aria-label="Switching theme"
                  />
                </motion.div>
              )}
            </FMAnimatePresence>

            <AnimatePresence>{!ready && <LoadingScreen />}</AnimatePresence>

            {/* audio element removed */}
          </div>
        </MotionConfig>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
