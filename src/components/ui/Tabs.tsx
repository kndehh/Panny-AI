import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function Tabs({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2 rounded-3xl border border-[var(--surface-lines)] bg-[var(--surface-muted)] p-2 dark:border-white/10 dark:bg-white/5">
      {children}
    </div>
  );
}

const MotionButton = motion.button;

type TabProps = {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
};

export function Tab({ active = false, children, onClick }: TabProps) {
  return (
    <MotionButton
      type="button"
      onClick={onClick}
      layout
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className={`relative flex-1 overflow-hidden rounded-2xl px-3 py-2 text-left ${
        active
          ? "text-black shadow-sm dark:text-white"
          : "text-[var(--text-secondary)] dark:text-white/70"
      }`}
    >
      {active && (
        <motion.span
          layoutId="tab-active-bg"
          className="absolute inset-0 rounded-2xl bg-white dark:bg-white/10"
          transition={{ type: "spring", stiffness: 280, damping: 30 }}
        />
      )}
      <span className="relative z-10 block">{children}</span>
    </MotionButton>
  );
}
