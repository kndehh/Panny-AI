import { Suspense, useRef, useEffect, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import OrganicBlob from "../three/OrganicBlob";

function FloatingParticles({
  mouseRef,
}: {
  mouseRef?: MutableRefObject<{ x: number; y: number } | null>;
}) {
  const meshRef = useRef<any>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.03;
      meshRef.current.rotation.x += delta * 0.02;
      // parallax based on mouse
      if (mouseRef && mouseRef.current) {
        const targetX = (mouseRef.current.x - 0.5) * 2; // -1 to 1
        const targetY = (mouseRef.current.y - 0.5) * -2;
        meshRef.current.position.x +=
          (targetX - meshRef.current.position.x) * delta * 0.6;
        meshRef.current.position.y +=
          (targetY - meshRef.current.position.y) * delta * 0.6;
      }
    }
  });
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <icosahedronGeometry args={[4, 4]} />
      {/* @ts-expect-error React Three Fiber types are not resolving meshStandardMaterial props in bundler mode */}
      <meshStandardMaterial transparent opacity={0.25} color="#93BFC7" />
    </mesh>
  );
}

export default function ThreeSceneWrapper() {
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const isCoarse =
      window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    if (isCoarse) return; // disable parallax on mobile
    const handler = (e: PointerEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener("pointermove", handler);
    return () => window.removeEventListener("pointermove", handler);
  }, []);

  return (
    <div
      className="absolute inset-0 pointer-events-none -z-10 blur-[45px] opacity-60"
      aria-hidden
    >
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight intensity={0.2} position={[10, 10, 5]} />
        <fog attach="fog" args={["#ECF4E8", 8, 18]} />
        <Suspense fallback={<Html>Loading...</Html>}>
          <OrganicBlob color={"#93BFC7"} />
          <FloatingParticles mouseRef={mouseRef} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
