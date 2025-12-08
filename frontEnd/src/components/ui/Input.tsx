import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`rounded-2xl border border-[var(--surface-lines)] bg-[var(--surface)] px-3 py-2 text-[var(--text-primary)] outline-none transition focus:ring-2 focus:ring-panny-green2/40 dark:bg-white/5 dark:text-white ${className}`}
    />
  );
}
