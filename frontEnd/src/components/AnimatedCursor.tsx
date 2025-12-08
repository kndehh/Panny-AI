import { useEffect, useState } from "react";

export default function AnimatedCursor() {
  const [pos, setPos] = useState({ x: -999, y: -999 });
  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div
      className="cursor-ring"
      style={{
        left: pos.x,
        top: pos.y,
        boxShadow: "0 6px 20px rgba(147,191,199,0.25)",
      }}
    />
  );
}
