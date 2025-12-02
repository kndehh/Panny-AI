import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePannyStore, type PannyState } from "../store/usePannyStore";
import MessageInput from "../components/MessageInput";
import type { Message } from "../store/usePannyStore";
import { v4 as uuidv4 } from "uuid";
import ChatBubble from "../components/ChatBubble";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";

const quickPrompts = [
  "Hold space for a jittery morning",
  "Reflect on tonight’s win",
  "Rewrite my inner critic",
];

export default function Chat() {
  const history = usePannyStore((s: PannyState) => s.chatHistory);
  const addMessage = usePannyStore((s: PannyState) => s.addMessage);
  const prependMessages = usePannyStore((s: PannyState) => s.prependMessages);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);

  useEffect(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [history.length]);

  function send(text: string) {
    const t = text.trim();
    if (!t) return;
    const m: Message = {
      id: uuidv4(),
      role: "user",
      text: t,
      timestamp: Date.now(),
    };
    addMessage(m);
    setIsTyping(true);
    setTimeout(() => {
      const r: Message = {
        id: uuidv4(),
        role: "assistant",
        text: "That sounds lovely. Tell me more.",
        timestamp: Date.now(),
      };
      addMessage(r);
      setIsTyping(false);
    }, 1100);
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 rounded-[28px] border border-[var(--surface-lines)] bg-[var(--surface)] p-5 sm:p-6">
        <Badge className="bg-[var(--surface-muted)] text-[var(--text-primary)] dark:bg-white/10 dark:text-white">
          Live channel
        </Badge>
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
            <span>Session 12 · Gentle inquiry</span>
            <span className="text-[var(--text-primary)] dark:text-white">
              00:18:12
            </span>
          </div>
          <div
            ref={scrollRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              if (el.scrollTop < 40 && !loadingOlder) {
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
            className="flex-1 space-y-4 overflow-auto px-4 py-6 sm:px-6"
          >
            {history.map((m: Message) => (
              <ChatBubble key={m.id} m={m} />
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="flex w-28 items-center gap-1 rounded-full bg-[var(--surface-muted)] px-3 py-2 text-[var(--text-secondary)] dark:bg-white/10 dark:text-white/70"
              >
                <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-primary)] dark:bg-white" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-primary)] delay-100 dark:bg-white" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-primary)] delay-200 dark:bg-white" />
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
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--text-tertiary)] dark:text-white/50">
              Session insight
            </p>
            <p className="mt-3 text-lg text-[var(--text-primary)] dark:text-white">
              You open up after two reflective responses. I will slow my cadence
              and mirror your breathing pattern.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
