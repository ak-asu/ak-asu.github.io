import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useAppStore } from '@/store/useAppStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface SceneProps {
  mouseX: number;
  mouseY: number;
}

// 6 orbiting energy particles
function Particles({ shouldAnimate }: { shouldAnimate: boolean }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const elapsed = useRef(0);
  const COUNT = 6;

  useFrame((_, delta) => {
    if (!shouldAnimate) return;
    elapsed.current += delta;
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const angle = elapsed.current * 1.2 + (i / COUNT) * Math.PI * 2;
      const radius = 1.05 + Math.sin(elapsed.current * 0.7 + i) * 0.08;
      mesh.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        Math.sin(elapsed.current * 0.5 + i * 1.2) * 0.3,
      );
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.8 + Math.sin(elapsed.current * 3 + i) * 0.4;
    });
  });

  return (
    <>
      {Array.from({ length: COUNT }).map((_, i) => (
        <mesh key={i} ref={el => { refs.current[i] = el; }}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#00bfff' : '#c49102'}
            emissive={i % 2 === 0 ? '#00bfff' : '#c49102'}
            emissiveIntensity={1.0}
          />
        </mesh>
      ))}
    </>
  );
}

// Hexagonal inner structure (6 spokes + center hex)
function HexCore({ shouldAnimate }: { shouldAnimate: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const elapsed = useRef(0);

  const spokePositions = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => {
      const angle = (i / 6) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(angle) * 0.55, Math.sin(angle) * 0.55, 0);
    }), []);

  useFrame((_, delta) => {
    if (!shouldAnimate) return;
    elapsed.current += delta;
    if (groupRef.current) {
      groupRef.current.rotation.z += delta * 0.25;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Center hexagonal disc */}
      <mesh>
        <cylinderGeometry args={[0.38, 0.38, 0.04, 6]} />
        <meshStandardMaterial
          color="#001020"
          emissive="#003060"
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      {/* Hex edge glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.38, 0.012, 6, 6]} />
        <meshStandardMaterial color="#00bfff" emissive="#00bfff" emissiveIntensity={1.2} transparent opacity={0.9} />
      </mesh>
      {/* 6 spokes */}
      {spokePositions.map((pos, i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[pos.x * 0.5, pos.y * 0.5, 0]}
            rotation={[0, 0, angle + Math.PI / 2]}
          >
            <cylinderGeometry args={[0.008, 0.014, 0.52, 4]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#00bfff' : '#c49102'}
              emissive={i % 2 === 0 ? '#00bfff' : '#c49102'}
              emissiveIntensity={0.8}
              transparent
              opacity={0.85}
            />
          </mesh>
        );
      })}
      {/* 6 outer triangle markers */}
      {spokePositions.map((pos, i) => (
        <mesh key={`tri-${i}`} position={[pos.x, pos.y, 0]}>
          <boxGeometry args={[0.06, 0.06, 0.03]} />
          <meshStandardMaterial
            color="#c49102"
            emissive="#c49102"
            emissiveIntensity={1.0}
            metalness={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

function ArcReactorScene({ mouseX, mouseY }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null); // outer - blue, upright
  const ring2Ref = useRef<THREE.Mesh>(null); // mid - gold, counter-rotate
  const ring3Ref = useRef<THREE.Mesh>(null); // inner - blue, tilted 30°
  const ring4Ref = useRef<THREE.Mesh>(null); // outermost - blue, slow
  const ring5Ref = useRef<THREE.Mesh>(null); // diagonal blue
  const coreRef  = useRef<THREE.Mesh>(null);
  const elapsed  = useRef(0);

  const animationEnabled = useAppStore(s => s.animationEnabled);
  const prefersReduced   = useReducedMotion();
  const shouldAnimate    = animationEnabled && !prefersReduced;

  useFrame((_, delta) => {
    if (!shouldAnimate) return;
    elapsed.current += delta;

    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.55;
    if (ring2Ref.current) ring2Ref.current.rotation.z -= delta * 0.40;
    if (ring3Ref.current) ring3Ref.current.rotation.x += delta * 0.70;
    if (ring4Ref.current) ring4Ref.current.rotation.z += delta * 0.18;
    if (ring5Ref.current) {
      ring5Ref.current.rotation.y += delta * 0.50;
      ring5Ref.current.rotation.z -= delta * 0.25;
    }

    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.2 + Math.sin(elapsed.current * 2.4) * 0.7;
      const scale = 1 + Math.sin(elapsed.current * 1.8) * 0.06;
      coreRef.current.scale.setScalar(scale);
    }

    if (groupRef.current) {
      const targetY =  mouseX * 0.55;
      const targetX = -mouseY * 0.55;
      groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.06;
      groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.06;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 0, 3]}  intensity={3.0} color="#00bfff" />
      <pointLight position={[-3, 2, 1]} intensity={1.5} color="#c49102" />
      <pointLight position={[0, 0, -2]} intensity={0.8} color="#003060" />

      {/* Outermost ring — very thin, slow, ice-blue */}
      <mesh ref={ring4Ref}>
        <torusGeometry args={[2.1, 0.012, 8, 120]} />
        <meshStandardMaterial color="#00bfff" emissive="#00bfff" emissiveIntensity={0.25} transparent opacity={0.5} />
      </mesh>

      {/* Outer ring — arc-blue, upright */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.8, 0.022, 16, 100]} />
        <meshStandardMaterial color="#00bfff" emissive="#00bfff" emissiveIntensity={0.6} transparent opacity={0.85} />
      </mesh>

      {/* Mid ring — gold, tilted, counter-rotate */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 6, 0, 0]}>
        <torusGeometry args={[1.5, 0.018, 16, 100]} />
        <meshStandardMaterial color="#c49102" emissive="#c49102" emissiveIntensity={0.5} transparent opacity={0.65} />
      </mesh>

      {/* Inner arc-blue ring — tilted 30° */}
      <mesh ref={ring3Ref} rotation={[Math.PI / 6, Math.PI / 4, 0]}>
        <torusGeometry args={[1.25, 0.016, 12, 80]} />
        <meshStandardMaterial color="#00bfff" emissive="#00bfff" emissiveIntensity={0.55} transparent opacity={0.7} />
      </mesh>

      {/* Diagonal ring — perpendicular, for depth */}
      <mesh ref={ring5Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.85, 0.014, 12, 60]} />
        <meshStandardMaterial color="#00bfff" emissive="#00bfff" emissiveIntensity={0.7} transparent opacity={0.6} />
      </mesh>

      {/* Hexagonal inner structure */}
      <HexCore shouldAnimate={shouldAnimate} />

      {/* Glowing core sphere */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial color="#00bfff" emissive="#00bfff" emissiveIntensity={1.8} />
      </mesh>

      {/* Core halo — slightly larger, very transparent */}
      <mesh>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color="#00bfff" emissive="#00bfff" emissiveIntensity={0.4} transparent opacity={0.15} />
      </mesh>

      {/* Orbiting particles */}
      <Particles shouldAnimate={shouldAnimate} />
    </group>
  );
}

interface ArcReactor3DProps {
  mouseX: number;
  mouseY: number;
  className?: string;
}

export function ArcReactor3D({ mouseX, mouseY, className = '' }: ArcReactor3DProps) {
  const animationEnabled = useAppStore(s => s.animationEnabled);
  const prefersReduced   = useReducedMotion();

  return (
    <div
      className={`w-full h-full ${className}`}
      style={{ filter: 'drop-shadow(0 0 32px rgba(0,191,255,0.65)) drop-shadow(0 0 8px rgba(196,145,2,0.3))' }}
    >
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 44 }}
        frameloop={animationEnabled && !prefersReduced ? 'always' : 'demand'}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ArcReactorScene mouseX={mouseX} mouseY={mouseY} />
      </Canvas>
    </div>
  );
}
