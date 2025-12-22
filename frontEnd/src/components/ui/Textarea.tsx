import { forwardRef, type TextareaHTMLAttributes } from "react";

const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      {...props}
      className={`rounded-2xl border border-[var(--surface-lines)] bg-[var(--surface)] px-3 py-2 text-[var(--text-primary)] outline-none transition dark:bg-white/5 dark:text-white ${
        className ?? ""
      }`}
    />
  );
});

Textarea.displayName = "Textarea";

export default Textarea;
