import { motion } from "framer-motion";
import type { ButtonHTMLAttributes, MouseEvent } from "react";
import useSound from "../../hooks/useSound";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "ghost" | "outline";
};

const MotionButton = motion.button;

export default function Button({
  variant = "solid",
  className = "",
  children,
  type,
  ...props
}: ButtonProps) {
  const { playHover } = useSound();
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 font-medium";
  const styles =
    variant === "solid"
      ? `bg-panny-green1 text-slate-900 dark:text-black shadow-sm ${className}`
      : variant === "ghost"
      ? `bg-transparent text-[var(--text-primary)] dark:text-white/90 ${className}`
      : `bg-transparent border border-[var(--surface-lines)] text-[var(--text-primary)] dark:border-white/10 dark:text-white ${className}`;

  const hoverShadow = "hover:shadow-[0_16px_60px_rgba(147,191,199,0.12)]";
  function ripple(e: MouseEvent<HTMLButtonElement>) {
    const el = e.currentTarget;
    const r = document.createElement("span");
    r.className = "ripple";
    const rect = el.getBoundingClientRect();
    r.style.left = `${e.clientX - rect.left}px`;
    r.style.top = `${e.clientY - rect.top}px`;
    r.style.position = "absolute";
    r.style.transform = "translate(-50%, -50%)";
    r.style.width = "12px";
    r.style.height = "12px";
    r.style.borderRadius = "9999px";
    r.style.background = "rgba(255,255,255,0.12)";
    r.style.pointerEvents = "none";
    el.appendChild(r);
    setTimeout(() => r.remove(), 600);
  }

  return (
    <MotionButton
      {...props}
      type={type ?? "button"}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 320, damping: 18 }}
      onMouseEnter={() => playHover()}
      onClick={(e) => {
        ripple(e);
        props.onClick?.(e as any);
      }}
      className={`${base} ${styles} ${hoverShadow} relative overflow-hidden`}
    >
      {children}
    </MotionButton>
  );
}
