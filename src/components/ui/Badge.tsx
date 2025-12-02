import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

export default function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs uppercase tracking-[0.3em] text-[var(--text-primary)] dark:text-white ${className}`}
    >
      {children}
    </span>
  );
}
