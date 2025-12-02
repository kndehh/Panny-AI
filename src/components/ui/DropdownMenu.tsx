import type { ReactNode } from "react";

export default function DropdownMenu({
  label,
  items,
}: {
  label: ReactNode;
  items: { label: string; onClick: () => void }[];
}) {
  return (
    <div className="group relative inline-block">
      <button
        type="button"
        className="rounded-2xl bg-[var(--surface-muted)] px-3 py-1 text-[var(--text-primary)] dark:bg-white/10 dark:text-white"
      >
        {label}
      </button>
      <div className="absolute right-0 mt-2 hidden min-w-[160px] rounded-2xl border border-[var(--surface-lines)] bg-[var(--surface)] p-2 text-[var(--text-primary)] group-hover:block dark:bg-white/5 dark:text-white">
        {items.map((it) => (
          <button
            key={it.label}
            onClick={it.onClick}
            type="button"
            className="w-full rounded-2xl p-2 text-left transition hover:bg-[var(--surface-muted)] dark:hover:bg-white/10"
          >
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}
