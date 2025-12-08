export default function Switch({
  checked = false,
  onChange,
}: {
  checked?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange && onChange(!checked)}
      className={`h-7 w-12 rounded-full p-1 transition-colors ${
        checked
          ? "bg-panny-green2/80"
          : "bg-[var(--surface-muted)] dark:bg-white/10"
      }`}
    >
      <div
        className={`h-5 w-5 rounded-full bg-white transition-transform ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}
