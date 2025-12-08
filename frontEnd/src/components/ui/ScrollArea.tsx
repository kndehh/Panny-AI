import type { ReactNode } from "react";

export default function ScrollArea({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`overflow-auto ${className}`}>{children}</div>;
}
