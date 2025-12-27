import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Sphere, RoundedBox } from "@react-three/drei";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import * as THREE from "three";
import { useAudioSystem } from "@/hooks/useAudioSystem";

const workData = [
  {
    id: 1,
    role: "Senior Software Engineer",
    company: "Stark Industries",
    location: "New York, NY",
    period: "2018 - Present",
    highlights: [
      "Led development of Jarvis AI integration",
      "Optimized armor OS performance by 40%",
      "Collaborated with Avengers on threat response systems",
    ],
    active: true,
  },
  {
    id: 2,
    role: "Software Developer",
    company: "Hammer Tech",
    location: "Los Angeles, CA",
    period: "2015 - 2018",
    highlights: [
      "Developed core defense algorithms",
      "Improved CI/CD pipeline efficiency by 60%",
      "Mentored junior developers on best practices",
    ],
    active: false,
  },
  {
    id: 3,
    role: "Junior Engineer",
    company: "Advanced Idea Mechanics",
    location: "Boston, MA",
    period: "2013 - 2015",
    highlights: [
      "Built automated testing frameworks",
      "Contributed to neural network research",
      "Received innovation award for UI improvements",
    ],
    active: false,
  },
];

// Projector ball component on the edges
const ProjectorBall = ({
  position,
  isSelected,
  onClick,
  index,
}: {
  position: [number, number, number];
  isSelected: boolean;
  onClick: () => void;
  index: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2 + index) * 0.05;
      meshRef.current.scale.setScalar(
        isSelected ? 1.3 + pulse : hovered ? 1.15 : 1,
      );
    }
    if (glowRef.current) {
      glowRef.current.rotation.z = state.clock.elapsedTime;
    }
  });

  return (
    <group position={position}>
      {/* Outer glow ring */}
      <mesh ref={glowRef} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.5, 0.02, 8, 32]} />
        <meshBasicMaterial
          color={isSelected ? "#00BFFF" : "#C49102"}
          transparent
          opacity={isSelected ? 0.8 : 0.4}
        />
      </mesh>

      {/* Main ball */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial
          color={isSelected ? "#00BFFF" : "#1a1a2e"}
          emissive={isSelected ? "#00BFFF" : hovered ? "#C49102" : "#00BFFF"}
          emissiveIntensity={isSelected ? 1.2 : hovered ? 0.6 : 0.3}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Inner core glow */}
      <Sphere args={[0.15, 16, 16]}>
        <meshBasicMaterial
          color={isSelected ? "#00BFFF" : "#C49102"}
          transparent
          opacity={isSelected ? 1 : 0.6}
        />
      </Sphere>

      {/* Energy beam to center when selected */}
      {isSelected && (
        <mesh position={[2.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.08, 5, 8]} />
          <meshBasicMaterial color="#00BFFF" transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
};

// Interactive 3D Hologram Card
const HologramCard = ({
  work,
  isActive,
}: {
  work: (typeof workData)[0];
  isActive: boolean;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { gl } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });

  useFrame(() => {
    if (groupRef.current && !isDragging) {
      // Auto-rotate slowly when not dragging
      groupRef.current.rotation.y += 0.003;
    }
  });

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setIsDragging(true);
    lastMousePos.current = { x: e.point?.x || 0, y: e.point?.y || 0 };
    gl.domElement.style.cursor = "grabbing";
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    gl.domElement.style.cursor = "grab";
  };

  const handlePointerMove = (e: any) => {
    if (!isDragging || !groupRef.current) return;

    const deltaX = (e.point?.x || 0) - lastMousePos.current.x;
    const deltaY = (e.point?.y || 0) - lastMousePos.current.y;

    groupRef.current.rotation.y += deltaX * 0.5;
    groupRef.current.rotation.x -= deltaY * 0.5;

    // Clamp X rotation
    groupRef.current.rotation.x = Math.max(
      -0.5,
      Math.min(0.5, groupRef.current.rotation.x),
    );

    lastMousePos.current = { x: e.point?.x || 0, y: e.point?.y || 0 };
  };

  return (
    <group
      ref={groupRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      {/* Main card body */}
      <RoundedBox args={[4, 2.8, 0.1]} radius={0.1} smoothness={4}>
        <meshStandardMaterial
          color="#0a1628"
          transparent
          opacity={0.85}
          metalness={0.5}
          roughness={0.3}
        />
      </RoundedBox>

      {/* Glowing border frame */}
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[4.1, 2.9]} />
        <meshBasicMaterial
          color="#00BFFF"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Edge glow lines */}
      {/* Top */}
      <mesh position={[0, 1.4, 0.06]}>
        <boxGeometry args={[4, 0.02, 0.02]} />
        <meshBasicMaterial color="#00BFFF" />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -1.4, 0.06]}>
        <boxGeometry args={[4, 0.02, 0.02]} />
        <meshBasicMaterial color="#C49102" />
      </mesh>
      {/* Left */}
      <mesh position={[-2, 0, 0.06]}>
        <boxGeometry args={[0.02, 2.8, 0.02]} />
        <meshBasicMaterial color="#00BFFF" />
      </mesh>
      {/* Right */}
      <mesh position={[2, 0, 0.06]}>
        <boxGeometry args={[0.02, 2.8, 0.02]} />
        <meshBasicMaterial color="#00BFFF" />
      </mesh>

      {/* Corner accents */}
      {[
        [-1.9, 1.3],
        [1.9, 1.3],
        [-1.9, -1.3],
        [1.9, -1.3],
      ].map(([x, y], i) => (
        <Sphere key={i} args={[0.05, 16, 16]} position={[x, y, 0.08]}>
          <meshBasicMaterial color={i < 2 ? "#00BFFF" : "#C49102"} />
        </Sphere>
      ))}

      {/* Content via Html */}
      <Html
        position={[0, 0, 0.1]}
        transform
        occlude
        style={{
          width: "380px",
          pointerEvents: "none",
        }}
      >
        <div
          className="text-center select-none"
          style={{ transform: "scale(0.9)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-left">
              <h3 className="font-orbitron text-lg text-foreground leading-tight">
                {work.role}
              </h3>
              <p className="font-rajdhani text-iron-gold text-sm">
                {work.company}
              </p>
              <p className="font-rajdhani text-foreground/50 text-xs">
                {work.location}
              </p>
            </div>
            <div className="text-right">
              <p className="font-orbitron text-arc-blue text-xs">
                {work.period}
              </p>
              {work.active && (
                <div className="flex items-center gap-1 mt-1 px-2 py-0.5 bg-arc-blue/20 border border-arc-blue/50 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-arc-blue animate-pulse" />
                  <span className="font-orbitron text-[10px] text-arc-blue">
                    ACTIVE
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-arc-blue/50 to-transparent my-2" />

          <ul className="space-y-1 text-left">
            {work.highlights.map((highlight, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-foreground/80 font-rajdhani text-xs"
              >
                <span className="text-arc-blue">▸</span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>

          <p className="mt-3 font-orbitron text-[10px] text-iron-gold/50 uppercase tracking-wider">
            Drag to rotate hologram
          </p>
        </div>
      </Html>

      {/* Hologram scan lines effect */}
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={[3.9, 2.7]} />
        <meshBasicMaterial
          transparent
          opacity={0.05}
          color="#00BFFF"
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// 3D Scene with edge projectors
const WorkScene = ({
  selectedId,
  onSelect,
  selectedWork,
}: {
  selectedId: number;
  onSelect: (id: number) => void;
  selectedWork: (typeof workData)[0];
}) => {
  // Left side positions only (3 balls)
  const leftPositions: [number, number, number][] = [
    [-5, 1.5, 0],
    [-5, 0, 0],
    [-5, -1.5, 0],
  ];

  return (
    <Canvas camera={{ position: [0, 0, 7], fov: 50 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 5]} intensity={1} color="#00BFFF" />
      <pointLight position={[-5, 0, 3]} intensity={0.8} color="#C49102" />
      <pointLight position={[5, 0, 3]} intensity={0.5} color="#00BFFF" />
      <spotLight
        position={[0, 5, 5]}
        angle={0.5}
        penumbra={1}
        intensity={0.5}
        color="#00BFFF"
      />

      {/* Left side projector balls - only 3 */}
      {workData.map((work, index) => (
        <ProjectorBall
          key={work.id}
          position={leftPositions[index]}
          isSelected={selectedId === work.id}
          onClick={() => onSelect(work.id)}
          index={index}
        />
      ))}

      {/* Central 3D Hologram Card */}
      <group position={[0.5, 0, 0]}>
        <HologramCard work={selectedWork} isActive={selectedId > 0} />
      </group>

      {/* Grid lines for depth */}
      {Array.from({ length: 11 }).map((_, i) => (
        <mesh key={i} position={[0, -2.5 + i * 0.5, -3]} rotation={[0, 0, 0]}>
          <boxGeometry args={[14, 0.003, 0.003]} />
          <meshBasicMaterial color="#00BFFF" transparent opacity={0.08} />
        </mesh>
      ))}
    </Canvas>
  );
};

export const WorkSection = () => {
  const [selectedId, setSelectedId] = useState(1);
  const selectedWork = workData.find((w) => w.id === selectedId) || workData[0];
  const { playClick, playHover, playBeep } = useAudioSystem();

  const handleSelect = (id: number) => {
    playBeep();
    setSelectedId(id);
  };

  return (
    <section className="relative h-screen w-full overflow-hidden flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-arc-blue/5 to-background" />

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-30"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 191, 255, 0.03) 2px, rgba(0, 191, 255, 0.03) 4px)",
        }}
      />

      {/* Header */}
      <motion.div
        className="relative z-10 text-center pt-24 pb-4"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-block iron-panel px-8 py-4">
          <h2 className="font-orbitron text-2xl md:text-3xl font-bold arc-text tracking-wider">
            WORK EXPERIENCE
          </h2>
          <p className="font-orbitron text-xs text-iron-gold/70 mt-1 uppercase tracking-widest">
            Select Node • Drag Hologram to Rotate
          </p>
        </div>
      </motion.div>

      {/* 3D Canvas */}
      <div className="flex-1 relative z-10 cursor-grab">
        <WorkScene
          selectedId={selectedId}
          onSelect={handleSelect}
          selectedWork={selectedWork}
        />
      </div>

      {/* Side labels for projector balls */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 space-y-12">
        {workData.map((work) => (
          <motion.button
            key={work.id}
            onClick={() => handleSelect(work.id)}
            onMouseEnter={playHover}
            className={`text-left transition-all duration-300 ${
              selectedId === work.id
                ? "opacity-100"
                : "opacity-50 hover:opacity-80"
            }`}
            whileHover={{ x: 5 }}
          >
            <p
              className={`font-orbitron text-xs ${selectedId === work.id ? "text-arc-blue" : "text-iron-gold"}`}
            >
              {work.period}
            </p>
            <p className="font-rajdhani text-sm text-foreground/80">
              {work.company}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-4">
        {workData.map((work) => (
          <button
            key={work.id}
            onClick={() => handleSelect(work.id)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              selectedId === work.id
                ? "bg-arc-blue scale-125 shadow-[0_0_10px_rgba(0,191,255,0.8)]"
                : "bg-iron-gold/40 hover:bg-iron-gold/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
};
