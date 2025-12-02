import { motion } from "framer-motion";

export default function AnimatedToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="rounded-2xl bg-[var(--surface-muted)] p-2 dark:bg-white/10"
    >
      <motion.div
        animate={{ x: checked ? 14 : 0 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="relative h-5 w-10 rounded-full bg-white"
      >
        <motion.div
          className="h-4 w-4 rounded-full bg-panny-green2 absolute top-1 left-1"
          layout
        />
      </motion.div>
    </button>
  );
}
