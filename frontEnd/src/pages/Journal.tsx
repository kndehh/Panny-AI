import { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { useSession } from "../hooks/useSession";
import { getChatSessions } from "../api/chat";
import { usePannyStore } from "../store/usePannyStore";

type JournalEntry = {
  id: string;
  title: string;
  mood: string;
  tone: string;
  excerpt: string;
  time: string;
  href: string;
};

// Analyze messages to extract mood
function analyzeMood(messages: any[]): string {
  if (!messages || messages.length === 0) return "Reflective";

  const text = messages.map((m) => m.text?.toLowerCase() || "").join(" ");

  if (
    text.includes("happy") ||
    text.includes("great") ||
    text.includes("wonderful")
  )
    return "Joyful";
  if (
    text.includes("anxious") ||
    text.includes("stress") ||
    text.includes("worried")
  )
    return "Tense";
  if (text.includes("sad") || text.includes("down") || text.includes("tired"))
    return "Tender";
  if (
    text.includes("curious") ||
    text.includes("wonder") ||
    text.includes("think")
  )
    return "Curious";
  if (
    text.includes("grateful") ||
    text.includes("thank") ||
    text.includes("appreciate")
  )
    return "Grateful";

  return "Serene";
}

// Get tone based on time of day
function getTone(timestamp: string): string {
  const date = new Date(timestamp);
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) return "Fresh";
  if (hour >= 12 && hour < 17) return "Grounded";
  if (hour >= 17 && hour < 21) return "Warm";
  return "Soft";
}

// Get session title based on time
function getSessionTitle(timestamp: string): string {
  const date = new Date(timestamp);
  const day = date.toLocaleDateString("en-US", { weekday: "short" });
  const hour = date.getHours();

  let timeLabel = "Night thoughts";
  if (hour >= 5 && hour < 12) timeLabel = "Morning pages";
  else if (hour >= 12 && hour < 17) timeLabel = "Midday reset";
  else if (hour >= 17 && hour < 21) timeLabel = "Twilight walk";

  return `${day} · ${timeLabel}`;
}

// Calculate mood palette percentages
function calculateMoodPalette(
  entries: JournalEntry[]
): { mood: string; percentage: number }[] {
  if (entries.length === 0) return [];

  const moodCounts: Record<string, number> = {};
  entries.forEach((e) => {
    moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
  });

  const total = entries.length;
  return Object.entries(moodCounts)
    .map(([mood, count]) => ({
      mood,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 4);
}

// Transform API sessions to journal entries
function transformToEntries(sessions: any[]): JournalEntry[] {
  if (!sessions || !Array.isArray(sessions)) return [];

  return sessions.map((session: any) => {
    const messages = session.messages || [];
    const lastUserMessage = [...messages]
      .reverse()
      .find((m: any) => m.role === "user");
    const excerpt =
      lastUserMessage?.text || "Continue your mindful conversation...";

    return {
      id: session.id,
      title: getSessionTitle(session.updated_at),
      mood: analyzeMood(messages),
      tone: getTone(session.updated_at),
      excerpt: excerpt.length > 80 ? excerpt.slice(0, 80) + "..." : excerpt,
      time: new Date(session.updated_at).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      href: `/chat?session=${session.id}`,
    };
  });
}

function normalizeLocalSessions(
  sessionsById: Record<string, any[]>
): Array<{ id: string; updated_at: string; messages: any[] }> {
  const entries = Object.entries(sessionsById || {})
    .filter(([_, msgs]) => Array.isArray(msgs) && msgs.length > 0)
    .map(([id, msgs]) => {
      const lastTs = Math.max(...msgs.map((m) => Number(m.timestamp) || 0), 0);
      return {
        id,
        updated_at: new Date(lastTs || Date.now()).toISOString(),
        messages: msgs,
      };
    })
    .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
  return entries;
}

export default function Journal() {
  const navigate = useNavigate();
  const { sessionQuery } = useSession();
  const isLoggedIn = !!sessionQuery.data;
  const localSessionsById = usePannyStore((s) => s.chatSessions);

  // Use React Query for caching and automatic background refresh
const sessionsQuery = useQuery({
  queryKey: ["journal-sessions"],
  queryFn: async () => {
    const res = await getChatSessions();
    return res?.sessions || [];
  },
  enabled: isLoggedIn,
  retry: 0,
  refetchOnWindowFocus: false,
  staleTime: 30 * 1000,
  gcTime: 5 * 60 * 1000,
});

  // Memoize transformed entries to avoid recomputing on every render
  const entries = useMemo(() => {
    const apiEntries = transformToEntries(sessionsQuery.data || []);
    if (apiEntries.length > 0) return apiEntries;
    const localNormalized = normalizeLocalSessions(localSessionsById);
    return transformToEntries(localNormalized);
  }, [sessionsQuery.data, localSessionsById]);

  const moodPalette = useMemo(() => calculateMoodPalette(entries), [entries]);

  const handleOpenSession = (href: string) => {
    navigate(href);
  };

  const loading = sessionQuery.isLoading || sessionsQuery.isLoading;

  // Not logged in state (but allow local journal fallback)
  if (!isLoggedIn && !sessionQuery.isLoading && entries.length === 0) {
    return (
      <div className="space-y-8">
        <header className="rounded-[28px] border border-[var(--surface-lines)] bg-[var(--surface)] p-6">
          <h1 className="text-3xl font-semibold text-[var(--text-primary)] dark:text-white">
            Journal constellation
          </h1>
          <p className="mt-2 text-[var(--text-secondary)] dark:text-white/70">
            Archive of every soft conversation, mood tag, and somatic check-in.
          </p>
        </header>
        <div className="flex flex-col items-center justify-center rounded-[32px] border border-[var(--surface-lines)] bg-[var(--surface)] p-12 text-center">
          <div className="mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-panny-green1/30 to-panny-green2/30 flex items-center justify-center">
            <svg
              className="h-8 w-8 text-panny-green1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-[var(--text-primary)] dark:text-white">
            Your journal awaits
          </h3>
          <p className="mt-2 max-w-sm text-[var(--text-tertiary)] dark:text-white/50">
            Log in to view your conversation history and mood patterns.
          </p>
          <Button
            className="mt-6 bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-900"
            onClick={() => navigate("/login")}
          >
            Log in to continue
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading || sessionQuery.isLoading) {
    return (
      <div className="space-y-8">
        <header className="rounded-[28px] border border-[var(--surface-lines)] bg-[var(--surface)] p-6">
          <h1 className="text-3xl font-semibold text-[var(--text-primary)] dark:text-white">
            Journal constellation
          </h1>
          <p className="mt-2 text-[var(--text-secondary)] dark:text-white/70">
            Loading your conversations...
          </p>
        </header>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-panny-green1 border-t-transparent" />
        </div>
      </div>
    );
  }

  // Empty state (logged in but no entries)
  if (entries.length === 0) {
    return (
      <div className="space-y-8">
        <header className="rounded-[28px] border border-[var(--surface-lines)] bg-[var(--surface)] p-6">
          <h1 className="text-3xl font-semibold text-[var(--text-primary)] dark:text-white">
            Journal constellation
          </h1>
          <p className="mt-2 text-[var(--text-secondary)] dark:text-white/70">
            Archive of every soft conversation, mood tag, and somatic check-in.
          </p>
        </header>
        <div className="flex flex-col items-center justify-center rounded-[32px] border border-[var(--surface-lines)] bg-[var(--surface)] p-12 text-center">
          <div className="mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-panny-green1/30 to-panny-green2/30 flex items-center justify-center">
            <svg
              className="h-8 w-8 text-panny-green1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-[var(--text-primary)] dark:text-white">
            No conversations yet
          </h3>
          <p className="mt-2 max-w-sm text-[var(--text-tertiary)] dark:text-white/50">
            Start chatting with Panny to build your journal constellation.
          </p>
          <Button
            className="mt-6 bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-900"
            onClick={() => navigate("/chat")}
          >
            Start a conversation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="rounded-[28px] border border-[var(--surface-lines)] bg-[var(--surface)] p-6">
        <h1 className="text-3xl font-semibold text-[var(--text-primary)] dark:text-white">
          Journal constellation
        </h1>
        <p className="mt-2 text-[var(--text-secondary)] dark:text-white/70">
          Archive of every soft conversation, mood tag, and somatic check-in.
        </p>
      </header>
      <section className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4 rounded-[28px] border border-[var(--surface-lines)] bg-[var(--surface)] p-6"
        >
          <h2 className="text-xl text-[var(--text-primary)] dark:text-white">
            Mood palette
          </h2>
          <div className="flex flex-wrap gap-3 text-sm text-[var(--text-secondary)] dark:text-white/80">
            {moodPalette.length > 0 ? (
              moodPalette.map((item, idx) => (
                <Badge
                  key={item.mood}
                  className={
                    idx === 0
                      ? "bg-panny-green1/60 text-slate-900"
                      : "bg-[var(--surface-muted)] dark:bg-white/15"
                  }
                >
                  {item.mood} · {item.percentage}%
                </Badge>
              ))
            ) : (
              <p className="text-sm text-[var(--text-tertiary)]">
                Start conversations to see your mood patterns
              </p>
            )}
          </div>
          <p className="text-sm text-[var(--text-tertiary)] dark:text-white/60">
            {moodPalette.length > 0
              ? `Panny notices you feel most ${moodPalette[0]?.mood.toLowerCase()} lately.`
              : "Chat with Panny to discover your mood patterns."}
          </p>
        </motion.div>
        <div className="space-y-4">
          {entries.map((entry, idx) => (
            <motion.article
              key={entry.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-[32px] border border-[var(--surface-lines)] bg-[var(--surface)] p-6 text-[var(--text-secondary)] dark:border-white/8 dark:bg-white/6 dark:text-white/80"
            >
              <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-tertiary)] dark:text-white/50">
                <span>{entry.time}</span>
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: "var(--text-tertiary)" }}
                />
                <span>{entry.title}</span>
              </div>
              <p className="mt-3 text-2xl text-[var(--text-primary)] dark:text-white">
                {entry.excerpt}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.4em] text-[var(--text-tertiary)] dark:text-white/60">
                <span>Mood · {entry.mood}</span>
                <span>Tone · {entry.tone}</span>
              </div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  className="border-[var(--surface-lines)] text-xs text-[var(--text-primary)] dark:border-white/20 dark:text-white"
                  onClick={() => handleOpenSession(entry.href)}
                >
                  Open session
                </Button>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}
