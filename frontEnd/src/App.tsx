import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence, MotionConfig } from "framer-motion";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Journal from "./pages/Journal";
import Settings from "./pages/Settings";
import FloatingNavbar from "./components/FloatingNavbar";
import AnimatedCursor from "./components/AnimatedCursor";
import useTheme from "./hooks/useTheme";
import useSound from "./hooks/useSound";
import PageTransitionWrapper from "./components/PageTransitionWrapper";
import LoadingScreen from "./components/LoadingScreen";
import "./App.css";

function App() {
  useTheme();
  useSound();
  const [ready, setReady] = useState(false);
  const gradientStyle = {
    backgroundImage:
      "radial-gradient(circle at top, var(--glow-one), transparent 55%)," +
      "radial-gradient(circle at 80% 15%, var(--glow-two), transparent 50%)," +
      "linear-gradient(180deg, var(--bg-gradient-top), var(--bg-base))",
  };

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 900);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <BrowserRouter>
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
          <FloatingNavbar />
          <AnimatedCursor />
          <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-14 pt-28 md:px-8">
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
            </Routes>
          </main>
          <AnimatePresence>{!ready && <LoadingScreen />}</AnimatePresence>
        </div>
      </MotionConfig>
    </BrowserRouter>
  );
}

export default App;
