import type { ReactNode } from "react";

export default function Tooltip({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="relative group inline-flex">
      {children}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded-2xl">
        {label}
      </div>
    </div>
  );
}
