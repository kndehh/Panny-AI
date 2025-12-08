import type { TextareaHTMLAttributes } from "react";

export default function Textarea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      className={`rounded-2xl border border-[var(--surface-lines)] bg-[var(--surface)] px-3 py-2 text-[var(--text-primary)] outline-none transition dark:bg-white/5 dark:text-white ${
        props.className ?? ""
      }`}
    />
  );
}
