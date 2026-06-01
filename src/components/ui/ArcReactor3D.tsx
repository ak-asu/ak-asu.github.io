import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useAppStore } from "@/store/useAppStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SceneProps {
  mouseX: number;
  mouseY: number;
}

function ArcReactorScene({ mouseX, mouseY }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const elapsed = useRef(0);

  const animationEnabled = useAppStore((s) => s.animationEnabled);
  const prefersReduced = useReducedMotion();
  const shouldAnimate = animationEnabled && !prefersReduced;

  useFrame((_, delta) => {
    if (!shouldAnimate) return;
    elapsed.current += delta;

    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.55;
    if (ring2Ref.current) ring2Ref.current.rotation.z -= delta * 0.85;
    if (ring3Ref.current) ring3Ref.current.rotation.x += delta * 0.35;

    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.9 + Math.sin(elapsed.current * 2.2) * 0.65;
    }

    if (groupRef.current) {
      const targetY = mouseX * 0.6;
      const targetX = -mouseY * 0.6;
      groupRef.current.rotation.y +=
        (targetY - groupRef.current.rotation.y) * 0.06;
      groupRef.current.rotation.x +=
        (targetX - groupRef.current.rotation.x) * 0.06;
    }
  });

  const arcMat = (opacity: number, emissive?: number) => (
    <meshStandardMaterial
      color="#00bfff"
      emissive="#00bfff"
      emissiveIntensity={emissive ?? 0.45}
      transparent
      opacity={opacity}
    />
  );

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 0, 3]} intensity={2.5} color="#00bfff" />
      <pointLight position={[-3, 2, 1]} intensity={1.2} color="#c49102" />

      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.8, 0.024, 16, 100]} />
        {arcMat(0.8)}
      </mesh>

      <mesh ref={ring2Ref} position={[0, 0, -0.3]}>
        <torusGeometry args={[1.4, 0.018, 16, 100]} />
        {arcMat(0.6)}
      </mesh>

      <mesh
        ref={ring3Ref}
        position={[0, 0, -0.6]}
        rotation={[Math.PI / 4, 0, 0]}
      >
        <torusGeometry args={[1.0, 0.016, 16, 100]} />
        <meshStandardMaterial
          color="#c49102"
          emissive="#c49102"
          emissiveIntensity={0.4}
          transparent
          opacity={0.55}
        />
      </mesh>

      <mesh ref={coreRef}>
        <sphereGeometry args={[0.26, 32, 32]} />
        <meshStandardMaterial
          color="#00bfff"
          emissive="#00bfff"
          emissiveIntensity={1.4}
        />
      </mesh>
    </group>
  );
}

interface ArcReactor3DProps {
  mouseX: number;
  mouseY: number;
  className?: string;
}

export function ArcReactor3D({
  mouseX,
  mouseY,
  className = "",
}: ArcReactor3DProps) {
  const animationEnabled = useAppStore((s) => s.animationEnabled);
  const prefersReduced = useReducedMotion();

  return (
    <div
      className={`w-full h-full ${className}`}
      style={{ filter: "drop-shadow(0 0 24px rgba(0,191,255,0.55))" }}
    >
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 44 }}
        frameloop={animationEnabled && !prefersReduced ? "always" : "demand"}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ArcReactorScene mouseX={mouseX} mouseY={mouseY} />
      </Canvas>
    </div>
  );
}
