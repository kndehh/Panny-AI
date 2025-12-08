import { motion } from "framer-motion";

import type { Message } from "../store/usePannyStore";

export default function ChatBubble({ m }: { m: Message }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className={`max-w-2xl rounded-2xl p-3 ${
        m.role === "user"
          ? "self-end bg-panny-green1 text-slate-900 dark:text-black"
          : "self-start bg-[var(--surface-muted)] text-[var(--text-primary)] dark:bg-white/10 dark:text-white"
      }`}
    >
      {m.text}
    </motion.div>
  );
}
