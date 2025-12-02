import { useEffect, useRef } from "react";
import { Howl } from "howler";
import { usePannyStore } from "../store/usePannyStore";

export default function useSound() {
  const soundEnabled = usePannyStore((s) => s.soundEnabled);
  const bgRef = useRef<Howl | null>(null);

  useEffect(() => {
    // background ambient
    bgRef.current = new Howl({
      src: ["https://actions.google.com/sounds/v1/ambiences/soft_pad.ogg"],
      loop: true,
      volume: 0.05,
    });
    if (soundEnabled) bgRef.current.play();
    return () => {
      bgRef.current?.stop();
      bgRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (soundEnabled) bgRef.current?.play();
    else bgRef.current?.pause();
  }, [soundEnabled]);

  function playHover() {
    if (!soundEnabled) return;
    const s = new Howl({
      src: ["https://actions.google.com/sounds/v1/buttons/beep_short.ogg"],
      volume: 0.05,
    });
    s.play();
  }

  return { playHover };
}
