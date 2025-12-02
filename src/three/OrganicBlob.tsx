import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function OrganicBlob({ color = "#93BFC7" }: { color?: string }) {
  const ref = useRef<any>();
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.02;
    ref.current.scale.x = 1 + Math.sin(state.clock.elapsedTime / 5) * 0.06;
    ref.current.scale.y = 1 + Math.cos(state.clock.elapsedTime / 6) * 0.05;
  });
  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <sphereGeometry args={[3.4, 64, 64]} />
      {/* @ts-expect-error React Three Fiber types are not resolving meshStandardMaterial props in bundler mode */}
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.25}
        metalness={0.1}
        roughness={0.3}
        emissive={color}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}
