import type { ReactNode } from "react";
import { motion } from "framer-motion";

export default function PillButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="rounded-3xl px-4 py-2 bg-panny-green1 text-black"
    >
      {children}
    </motion.button>
  );
}
