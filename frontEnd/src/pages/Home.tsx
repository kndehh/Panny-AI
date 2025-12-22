import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ThreeSceneWrapper from "../components/ThreeSceneWrapper";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { usePannyStore } from "../store/usePannyStore";

const rituals = [
  {
    title: "Arrive",
    detail: "30s grounding breath with spatial audio and soft pulses.",
  },
  {
    title: "Reflect",
    detail: "Guided prompt rotates daily based on your journal tone.",
  },
  {
    title: "Release",
    detail: "Panny rewrites worries into gentle affirmations.",
  },
];

// Helper to format Jakarta time (GMT+7)
function getJakartaDateTime() {
  const now = new Date();
  const jakartaTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
  );

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const dayName = days[jakartaTime.getDay()];
  const day = jakartaTime.getDate();
  const month = months[jakartaTime.getMonth()];
  const hours = jakartaTime.getHours().toString().padStart(2, "0");
  const minutes = jakartaTime.getMinutes().toString().padStart(2, "0");
  const seconds = jakartaTime.getSeconds().toString().padStart(2, "0");

  return `${dayName}, ${day} ${month} · ${hours}:${minutes}:${seconds}`;
}

// Helper to format total journaling/chat time
function formatTotalTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m total`;
  }
  return `${minutes} min total`;
}

const insights = [
  {
    title: "Journal resonance",
    body: "“You are most open at twilight. I will save new rituals for those hours.”",
  },
  {
    title: "Somatic reminder",
    body: "Neck + chest hold tension today. I scheduled a 2 min guided release.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const totalJournalingTimeStored = usePannyStore((s) => s.totalJournalingTime);
  const sessionStartTime = usePannyStore((s) => s.sessionStartTime);
  const [jakartaTime, setJakartaTime] = useState(getJakartaDateTime());
  const [currentSessionTime, setCurrentSessionTime] = useState(0);

  // Update Jakarta time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setJakartaTime(getJakartaDateTime());
      // Update current session time if session is active
      if (sessionStartTime) {
        setCurrentSessionTime(Date.now() - sessionStartTime);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Calculate total journaling/chat time (stored + current session)
  const totalJournalingTime = totalJournalingTimeStored + currentSessionTime;

  const signals = [
    {
      label: "Today's date & time",
      value: jakartaTime,
      accent: "from-panny-green1/50 to-panny-green2/30",
    },
    {
      label: "Mood blend",
      value: "Warm · Reflective",
      accent: "from-[#F4C4F3]/30 to-[#FC67FA]/10",
    },
    {
      label: "Total journaling time",
      value:
        totalJournalingTime > 0
          ? formatTotalTime(totalJournalingTime)
          : "No sessions yet",
      accent: "from-[#2AFADF]/30 to-[#4C83FF]/10",
    },
  ];

  return (
    <main className="relative overflow-visible">
      <ThreeSceneWrapper />
      <section className="relative z-10 space-y-16 sm:space-y-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="grid gap-8 rounded-[32px] border border-[var(--surface-lines)] bg-[var(--surface)] p-6 shadow-[0_40px_120px_rgba(4,8,15,0.35)] backdrop-blur-3xl dark:bg-[var(--surface)] md:p-8 lg:grid-cols-[minmax(0,1fr)_420px]"
        >
          <div className="space-y-7">
            <Badge className="bg-[var(--surface-muted)] text-[var(--text-primary)] dark:bg-white/10 dark:text-white">
              Soft launch · Ritual 008
            </Badge>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-[var(--text-primary)] dark:text-white lg:text-5xl">
                Panny holds space for your mind, breath, and quieter questions.
              </h1>
              <p className="text-lg text-[var(--text-secondary)] dark:text-white/70">
                Streaming ambient howls, mindful prompts, and a responsive AI
                core that mirrors the calm studio you deserve.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-panny-green1 text-slate-900"
                onClick={() => navigate("/chat")}
              >
                Begin a gentle chat
              </Button>
              <Button
                variant="outline"
                className="border-[var(--surface-lines)] bg-transparent text-[var(--text-primary)] dark:border-white/20 dark:text-white"
                onClick={() => navigate("/journal")}
              >
                Preview journal ritual
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {signals.map((signal) => (
                <div
                  key={signal.label}
                  className={`rounded-2xl border border-[var(--surface-lines)] bg-gradient-to-br ${signal.accent} p-4 text-sm text-[var(--text-primary)] dark:text-white`}
                >
                  <p className="text-[var(--text-tertiary)] dark:text-white/60">
                    {signal.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold">{signal.value}</p>
                </div>
              ))}
            </div>
          </div>
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.9 }}
            className="relative overflow-hidden rounded-[28px] border border-[var(--surface-lines)] bg-[var(--surface)] p-6"
          >
            <div className="text-sm uppercase tracking-[0.35em] text-[var(--text-tertiary)] dark:text-white/60">
              Now playing
            </div>
            <div className="mt-4 text-2xl font-semibold text-[var(--text-primary)] dark:text-white">
              “Soft bloom wave”
            </div>
            <p className="mt-2 text-[var(--text-secondary)] dark:text-white/70">
              A layered pad that syncs with the organic blob light.
            </p>
            <div className="mt-6 space-y-4">
              {rituals.map((ritual, idx) => (
                <motion.div
                  key={ritual.title}
                  className="rounded-2xl bg-[var(--surface-muted)] p-4 dark:bg-white/10"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 + 0.3 }}
                >
                  <p className="text-sm text-[var(--text-tertiary)] dark:text-white/60">
                    {ritual.title}
                  </p>
                  <p className="text-[var(--text-primary)] dark:text-white">
                    {ritual.detail}
                  </p>
                </motion.div>
              ))}
            </div>
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute -right-4 top-6 h-16 w-16 rounded-full bg-panny-green1/40 blur-2xl"
            />
          </motion.div>
        </motion.div>

        <section className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4 rounded-[28px] border border-[var(--surface-lines)] bg-[var(--surface)] p-6"
          >
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] dark:text-white">
              Daily insight
            </h2>
            {insights.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl bg-[var(--surface-muted)] p-4 text-[var(--text-secondary)] dark:bg-white/8 dark:text-white/80"
              >
                <p className="text-sm text-[var(--text-tertiary)] dark:text-white/60">
                  {card.title}
                </p>
                <p className="mt-2 text-lg text-[var(--text-primary)] dark:text-white">
                  {card.body}
                </p>
              </div>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-[28px] border border-[var(--surface-lines)] bg-gradient-to-br from-[var(--surface)]/90 to-[var(--surface-strong)]/80 p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-[var(--text-secondary)] dark:text-white/70">
              <p className="text-sm uppercase tracking-[0.4em]">
                Ritual timeline
              </p>
              <span>GMT +2</span>
            </div>
            <div className="mt-6 space-y-6">
              {rituals.map((block, idx) => (
                <div key={block.title} className="flex gap-4">
                  <div className="flex flex-col items-center text-xs text-[var(--text-tertiary)] dark:text-white/40">
                    <span>{idx === 0 ? "Now" : `+${idx * 12}m`}</span>
                    <span className="my-2 h-12 w-px bg-[var(--surface-lines)]" />
                  </div>
                  <div className="flex-1 rounded-2xl bg-[var(--surface-muted)] p-4 dark:bg-white/10">
                    <p className="text-sm uppercase tracking-[0.4em] text-[var(--text-tertiary)] dark:text-white/60">
                      {block.title}
                    </p>
                    <p className="mt-2 text-[var(--text-secondary)] dark:text-white/80">
                      {block.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      </section>
    </main>
  );
}
