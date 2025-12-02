import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-base)] text-[var(--text-primary)] dark:bg-[#04080F] dark:text-white"
    >
      <motion.div
        animate={{
          scale: [1, 1.06, 1],
          boxShadow: [
            "0 0 40px rgba(203,243,187,0.25)",
            "0 0 70px rgba(147,191,199,0.4)",
            "0 0 40px rgba(203,243,187,0.25)",
          ],
        }}
        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        className="rounded-[32px] border border-[var(--surface-lines)] bg-gradient-to-br from-[var(--surface)] via-[var(--surface-strong)]/80 to-transparent px-8 py-6"
      >
        Calibrating calm
      </motion.div>
    </motion.div>
  );
}
