import type { ReactNode } from "react";
import { motion } from "framer-motion";

export default function Dialog({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 10, opacity: 0 }}
        className="glass p-6 rounded-3xl z-50 min-w-[320px] max-w-lg"
      >
        {children}
      </motion.div>
    </div>
  );
}
