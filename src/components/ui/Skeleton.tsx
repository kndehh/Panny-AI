export default function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-[var(--surface-muted)] dark:bg-white/5 ${className}`}
    />
  );
}
