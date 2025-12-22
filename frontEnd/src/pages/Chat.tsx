import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { usePannyStore, type PannyState } from "../store/usePannyStore";
import MessageInput from "../components/MessageInput";
import type { Message } from "../store/usePannyStore";
import { v4 as uuidv4 } from "uuid";
import { sendChat, getChatHistory, saveChatHistory } from "../api/chat";
import ChatBubble from "../components/ChatBubble";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { useSession } from "../hooks/useSession";

const quickPrompts = ["Hello Panny", "Motivate me", "Quotes of the day"];

function formatTimeGMT7(): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const gmt7 = new Date(utc + 7 * 3600000);
  return gmt7.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getDefaultInsight(): string {
  return "Start a conversation with Panny to receive personalized insights.";
}

function getSessionTitle(): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const gmt7 = new Date(utc + 7 * 3600000);
  const hour = gmt7.getHours();

  if (hour >= 5 && hour < 12) return "Morning reflection";
  if (hour >= 12 && hour < 17) return "Afternoon pause";
  if (hour >= 17 && hour < 21) return "Evening wind-down";
  return "Night thoughts";
}

export default function Chat() {
  const history = usePannyStore((s: PannyState) => s.chatHistory);
  const addMessage = usePannyStore((s: PannyState) => s.addMessage);
  const prependMessages = usePannyStore((s: PannyState) => s.prependMessages);
  const setCurrentSessionId = usePannyStore(
    (s: PannyState) => s.setCurrentSessionId
  );
  const upsertSessionMessages = usePannyStore(
    (s: PannyState) => s.upsertSessionMessages
  );
  const setChatHistory = usePannyStore((s) => s.setChatHistory);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const [currentTime, setCurrentTime] = useState(formatTimeGMT7());
  const [sessionCount, setSessionCount] = useState(1);

  const [sessionInsight, setSessionInsight] = useState(getDefaultInsight());
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const lastInsightMsgCount = useRef(0);

  const didWarn401 = useRef(false);
  const didLoadForSession = useRef<string | null>(null);

  const { sessionQuery } = useSession();
  const user = sessionQuery.data;
  const canUseApi = !!user;

  const userName = user?.displayName || user?.email?.split("@")[0] || "";

const getActiveSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("session");
  if (fromUrl) return fromUrl;

  const newId = uuidv4();
  params.set("session", newId);
  window.history.replaceState(
    {},
    "",
    `${window.location.pathname}?${params.toString()}`
  );
  return newId;
};

  const loadLocal = useCallback(
    (sessionId: string) => {
      const local = usePannyStore.getState().chatSessions?.[sessionId];
      if (local && local.length > 0) setChatHistory(local);
    },
    [setChatHistory]
  );

  const generateAIInsight = useCallback(
    async (messages: Message[]) => {
      if (!canUseApi) return;

      const userMessages = messages.filter((m) => m.role === "user");
      if (userMessages.length === 0) {
        setSessionInsight(getDefaultInsight());
        return;
      }

      if (userMessages.length === lastInsightMsgCount.current) return;
      lastInsightMsgCount.current = userMessages.length;

      setIsGeneratingInsight(true);
      try {
        const conversationSummary = messages
          .slice(-10)
          .map((m) => `${m.role === "user" ? "User" : "Panny"}: ${m.text}`)
          .join("\n");

        const { reply } = await sendChat({
          prompt: `Based on this brief conversation, write a short empathetic insight (1-2 sentences max) about what the user might be feeling or processing. Be warm and supportive. Do not ask questions, just observe:\n\n${conversationSummary}\n\nInsight:`,
          sessionId: getActiveSessionId(),
        });

        const cleanReply = (reply || "").replace(/^insight:\s*/i, "").trim();
        if (cleanReply) setSessionInsight(cleanReply);
      } catch {
        setSessionInsight(getDefaultInsight());
      } finally {
        setIsGeneratingInsight(false);
      }
    },
    [canUseApi]
  );

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(formatTimeGMT7()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [history.length]);

  useEffect(() => {
    const userCount = history.filter((m) => m.role === "user").length;
    if (userCount > 0 && (userCount === 1 || userCount % 2 === 0)) {
      const timer = setTimeout(() => generateAIInsight(history), 1000);
      return () => clearTimeout(timer);
    }
  }, [history, generateAIInsight]);

  useEffect(() => {
    if (sessionQuery.isLoading) return;

    const sessionId = getActiveSessionId();
    setCurrentSessionId(sessionId);

    if (didLoadForSession.current === `${sessionId}:${String(canUseApi)}`) return;
    didLoadForSession.current = `${sessionId}:${String(canUseApi)}`;

    if (!canUseApi) {
      loadLocal(sessionId);
      return;
    }

    (async () => {
      try {
        const res = await getChatHistory(sessionId, true);
        const msgs = res?.session?.messages || [];
        if (msgs.length > 0) {
          setChatHistory(msgs);
          upsertSessionMessages(sessionId, msgs);
          generateAIInsight(msgs);
        }

        if (Array.isArray(res?.sessions)) {
          setSessionCount(res.sessions.length + 1);
        }
      } catch (err) {
        const status = (err as any)?.response?.status as number | undefined;

        if (status === 401) {
          if (!didWarn401.current) {
            didWarn401.current = true;
            toast.error("Please log in to view your chat history.");
          }
          loadLocal(sessionId);
          return;
        }

        loadLocal(sessionId);
      }
    })();
  }, [
    canUseApi,
    sessionQuery.isLoading,
    setCurrentSessionId,
    setChatHistory,
    upsertSessionMessages,
    generateAIInsight,
    loadLocal,
  ]);

  async function send(text: string) {
    const t = text.trim();
    if (!t) return;

    const sessionId = getActiveSessionId();

    const m: Message = {
      id: uuidv4(),
      role: "user",
      text: t,
      timestamp: Date.now(),
    };

    addMessage(m);
    setIsTyping(true);

    let replyMessage: Message | null = null;

    try {
      const contextPrompt = userName
        ? `[User's name is ${userName}. Address them by name occasionally.]\n\n${t}`
        : t;

      const resp = await sendChat({ prompt: contextPrompt, sessionId });
      const reply = resp?.reply;

      const r: Message = {
        id: uuidv4(),
        role: "assistant",
        text: reply || "I'm here and listening.",
        timestamp: Date.now(),
      };

      addMessage(r);
      replyMessage = r;
    } catch (err) {
      const status = (err as any)?.response?.status as number | undefined;

      const r: Message = {
        id: uuidv4(),
        role: "assistant",
        text:
          status === 401
            ? "You're signed out. Please log in again to continue."
            : "I couldn't reach the server. Please try again.",
        timestamp: Date.now(),
      };

      addMessage(r);
      replyMessage = r;
    } finally {
      setIsTyping(false);
    }

    const latest = usePannyStore.getState().chatHistory;
    const toSave = latest.length
      ? latest
      : replyMessage
      ? [...history, m, replyMessage]
      : [...history, m];

    upsertSessionMessages(sessionId, toSave);

    if (!canUseApi) return;

    try {
      const resp = await saveChatHistory({
        sessionId,
        messages: toSave as any,
      });

      if (resp && resp.warning) {
        toast.warning(
          "Chat saving is not configured on the server. Your messages will remain local."
        );
      }
    } catch (err) {
      const status = (err as any)?.response?.status as number | undefined;
      if (status === 401) {
        if (!didWarn401.current) {
          didWarn401.current = true;
          toast.error("Please log in again to save chat history.");
        }
        return;
      }
      toast.error("Failed to save chat history. Your chat will remain local.");
    }
  }

  async function startNewChat() {
    const currentSessionId = getActiveSessionId();

    if (history.length > 0 && canUseApi) {
      try {
        const resp = await saveChatHistory({
          sessionId: currentSessionId,
          messages: history as any,
        });

        if (resp && resp.warning) {
          toast.warning(
            "Chat saving is not configured on the server. Your messages will remain local."
          );
        }
      } catch {}
    }

    setChatHistory([]);
    lastInsightMsgCount.current = 0;
    setSessionInsight(getDefaultInsight());
    setSessionCount((c) => c + 1);

    const newSessionId = uuidv4();
    window.history.pushState({}, "", `/chat?session=${newSessionId}`);
    setCurrentSessionId(newSessionId);
    upsertSessionMessages(newSessionId, []);
    didLoadForSession.current = null;
  }

  const sessionTitle = getSessionTitle();

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 rounded-[28px] border border-[var(--surface-lines)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <Badge className="bg-[var(--surface-muted)] text-[var(--text-primary)] dark:bg-white/10 dark:text-white">
            Live channel
          </Badge>
          <Button
            variant="outline"
            className="flex items-center gap-2 border-panny-green1/50 text-panny-green1 hover:bg-panny-green1/10"
            onClick={startNewChat}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Chat
          </Button>
        </div>
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-3xl font-semibold text-[var(--text-primary)] dark:text-white">
            Chat with Panny
          </h1>
          <p className="text-[var(--text-secondary)] dark:text-white/60">
            Adaptive mirror · grounded tone
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="flex min-h-[520px] flex-col overflow-hidden rounded-[32px] border border-[var(--surface-lines)] bg-[var(--surface)]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--surface-lines)] px-4 py-4 text-sm text-[var(--text-secondary)] dark:text-white/70">
            <span>
              Session {sessionCount} · {sessionTitle}
            </span>
            <span className="font-mono text-[var(--text-primary)] dark:text-white">
              {currentTime}
            </span>
          </div>

          <div
            ref={scrollRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              if (el.scrollTop < 40 && !loadingOlder && history.length > 0) {
                setLoadingOlder(true);
                setTimeout(() => {
                  const older = new Array(4).fill(0).map((_, i) => ({
                    id: uuidv4(),
                    role: "assistant" as const,
                    text: `Older thought ${i + 1}`,
                    timestamp: Date.now() - (i + 1) * 3600 * 1000,
                  }));
                  prependMessages(older);
                  setLoadingOlder(false);
                  el.scrollTop = 140;
                }, 700);
              }
            }}
            className="flex-1 overflow-auto px-4 py-6 sm:px-6"
          >
            {history.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-panny-green1/30 to-panny-green2/30">
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
                <h3 className="text-lg font-medium text-[var(--text-primary)] dark:text-white">
                  Start your mindful session
                </h3>
                <p className="mt-2 max-w-xs text-sm text-[var(--text-tertiary)] dark:text-white/50">
                  Share what's on your mind. Panny is here to listen and reflect
                  with you.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((m: Message) => (
                  <ChatBubble key={m.id} m={m} />
                ))}
              </div>
            )}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="mt-4 flex w-28 items-center gap-1 rounded-full bg-[var(--surface-muted)] px-3 py-2 text-[var(--text-secondary)] dark:bg-white/10 dark:text-white/70"
              >
                <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-primary)] dark:bg-white" />
                <span className="delay-100 h-2 w-2 animate-bounce rounded-full bg-[var(--text-primary)] dark:bg-white" />
                <span className="delay-200 h-2 w-2 animate-bounce rounded-full bg-[var(--text-primary)] dark:bg-white" />
              </motion.div>
            )}
          </div>

          <div className="border-t border-[var(--surface-lines)] px-3 py-4 sm:px-4">
            <MessageInput onSend={send} />
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[28px] border border-[var(--surface-lines)] bg-[var(--surface)] p-5">
            <p className="text-sm uppercase tracking-[0.4em] text-[var(--text-tertiary)] dark:text-white/50">
              Quick prompts
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {quickPrompts.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  className="border-[var(--surface-lines)] text-left text-xs text-[var(--text-primary)] dark:border-white/20 dark:text-white"
                  onClick={() => send(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-[var(--surface-lines)] bg-gradient-to-br from-[var(--surface)]/90 to-[var(--surface-strong)]/90 p-6 text-sm text-[var(--text-secondary)] dark:text-white/80">
            <div className="flex items-center gap-2">
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--text-tertiary)] dark:text-white/50">
                AI Session insight
              </p>
              {isGeneratingInsight && (
                <div className="h-2 w-2 animate-pulse rounded-full bg-panny-green1" />
              )}
            </div>
            <p className="mt-3 text-lg text-[var(--text-primary)] dark:text-white">
              {isGeneratingInsight ? (
                <span className="animate-pulse">Analyzing your conversation...</span>
              ) : (
                sessionInsight
              )}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
