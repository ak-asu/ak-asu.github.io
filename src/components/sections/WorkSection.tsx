import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { Html, Sphere, RoundedBox } from "@react-three/drei";
import { motion } from "framer-motion";
import { useState, useRef, memo } from "react";
import * as THREE from "three";
import { useAudioSystem } from "@/hooks/useAudioSystem";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAppStore } from "@/store/useAppStore";
import { formatPeriod, isCurrentlyActive } from "@/lib/dateUtils";
import workDataRaw from "@/data/work.json";

// Transform work data to match component structure
const workData = workDataRaw.map((work, index) => ({
  id: index + 1,
  role: work.position,
  company: work.company,
  location: work.location,
  period: formatPeriod(work.startDate, work.endDate),
  highlights: work.description,
  active: isCurrentlyActive(work.endDate),
}));

// 2D Card Component for when animations are disabled
const WorkCard2D = memo(function WorkCard2D({
  work,
}: {
  work: (typeof workData)[0];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div
        className="px-6 py-5 rounded-lg h-full flex flex-col"
        style={{
          background:
            "linear-gradient(180deg, rgba(0, 100, 24, 0.15) 0%, rgba(0, 0, 0, 0.3) 100%)",
          border: "2px solid rgba(0, 191, 255, 0.3)",
          boxShadow: "0 0 20px rgba(0, 191, 255, 0.2)",
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3 mb-4">
          <div className="text-left">
            <h3 className="font-orbitron text-base sm:text-lg text-foreground leading-tight">
              {work.role}
            </h3>
            <p className="font-rajdhani text-iron-gold text-sm sm:text-base mt-1">
              {work.company}
            </p>
            <p className="font-rajdhani text-foreground/50 text-xs sm:text-sm">
              {work.location}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="font-orbitron text-arc-blue text-xs sm:text-sm">
              {work.period}
            </p>
            {work.active && (
              <div className="flex items-center gap-1 mt-1 px-2 py-1 bg-arc-blue/20 border border-arc-blue/50 rounded-full">
                <div className="w-2 h-2 rounded-full bg-arc-blue animate-pulse" />
                <span className="font-orbitron text-[10px] sm:text-xs text-arc-blue">
                  ACTIVE
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-linear-to-r from-transparent via-arc-blue/50 to-transparent my-3" />

        <ul className="space-y-2 text-left flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-arc-blue/30">
          {work.highlights.map((highlight, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-foreground/80 font-rajdhani text-sm sm:text-base leading-relaxed"
            >
              <span className="text-arc-blue text-base sm:text-lg shrink-0">
                ▸
              </span>
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
});

// Interactive 3D Hologram Card
const HologramCard = memo(function HologramCard({
  work,
  isActive,
}: {
  work: (typeof workData)[0];
  isActive: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const isMobile = useIsMobile();
  const animationEnabled = useAppStore((state) => state.animationEnabled);

  useFrame(() => {
    if (groupRef.current && animationEnabled) {
      // Auto-rotate when animations are on
      groupRef.current.rotation.y += 0.003;
    } else if (groupRef.current && !animationEnabled) {
      // Reset to neutral position when animations are off
      groupRef.current.rotation.y = 0;
      groupRef.current.rotation.x = 0;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Content via Html */}
      <Html
        position={[0, 0, 0.1]}
        transform
        occlude
        style={{
          width: isMobile ? "190px" : "380px",
          height: "32vh",
          pointerEvents: "auto",
        }}
      >
        <div
          className="text-center select-none px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg h-full flex flex-col"
          style={{
            background:
              "linear-gradient(180deg, rgba(0, 100, 24, 0.15) 0%, rgba(0, 0, 0, 0.3) 100%)",
            border: "2px solid rgba(0, 191, 255, 0.3)",
            boxShadow: "0 0 20px rgba(0, 191, 255, 0.2)",
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-1 mb-1">
            <div className="text-left">
              <h3 className="font-orbitron text-[7px] sm:text-xs text-foreground leading-tight">
                {work.role}
              </h3>
              <p className="font-rajdhani text-iron-gold text-[6px] sm:text-[10px] mt-0.5">
                {work.company}
              </p>
              <p className="font-rajdhani text-foreground/50 text-[5px] sm:text-[8px]">
                {work.location}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="font-orbitron text-arc-blue text-[5px] sm:text-[8px]">
                {work.period}
              </p>
              {work.active && (
                <div className="flex items-center gap-0.5 mt-0.5 px-1 py-0.5 bg-arc-blue/20 border border-arc-blue/50 rounded-full">
                  <div className="w-1 h-1 rounded-full bg-arc-blue animate-pulse" />
                  <span className="font-orbitron text-[4px] sm:text-[7px] text-arc-blue">
                    ACTIVE
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-linear-to-r from-transparent via-arc-blue/50 to-transparent my-0.5" />

          <ul
            className="space-y-0.5 text-left flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-arc-blue/30 select-text"
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            {work.highlights.map((highlight, index) => (
              <li
                key={index}
                className="flex items-start gap-1 text-foreground/80 font-rajdhani text-[6px] sm:text-[10px] leading-snug"
              >
                <span className="text-arc-blue text-[7px] sm:text-[10px] shrink-0">
                  ▸
                </span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      </Html>
    </group>
  );
});

// Scene content component to use hooks
const SceneContent = ({
  selectedWork,
}: {
  selectedWork: (typeof workData)[0];
}) => {
  const isMobile = useIsMobile();

  return (
    <>
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

      {/* Central 3D Hologram Card */}
      <group
        position={isMobile ? [0, -0.3, 0] : [0.5, 0, 0]}
        scale={isMobile ? 1.3 : 1}
      >
        <HologramCard work={selectedWork} isActive={true} />
      </group>

      {/* Grid lines for depth */}
      {Array.from({ length: 11 }).map((_, i) => (
        <mesh key={i} position={[0, -2.5 + i * 0.5, -3]} rotation={[0, 0, 0]}>
          <boxGeometry args={[14, 0.003, 0.003]} />
          <meshBasicMaterial color="#00BFFF" transparent opacity={0.08} />
        </mesh>
      ))}
    </>
  );
};

// 3D Scene with hologram
const WorkScene = ({
  selectedWork,
  animationEnabled,
}: {
  selectedWork: (typeof workData)[0];
  animationEnabled: boolean;
}) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 50 }}
      style={{ width: "100%", height: "100%" }}
      frameloop={animationEnabled ? "always" : "demand"}
    >
      <SceneContent selectedWork={selectedWork} />
    </Canvas>
  );
};

export const WorkSection = () => {
  const [selectedId, setSelectedId] = useState(1);
  const selectedWork = workData.find((w) => w.id === selectedId) || workData[0];
  const { playClick, playHover, playBeep } = useAudioSystem();
  const animationEnabled = useAppStore((state) => state.animationEnabled);

  const handleSelect = (id: number) => {
    playBeep();
    setSelectedId(id);
  };

  const nextWork = () => {
    playBeep();
    const currentIndex = workData.findIndex((w) => w.id === selectedId);
    const nextIndex = (currentIndex + 1) % workData.length;
    setSelectedId(workData[nextIndex].id);
  };

  const prevWork = () => {
    playBeep();
    const currentIndex = workData.findIndex((w) => w.id === selectedId);
    const prevIndex = (currentIndex - 1 + workData.length) % workData.length;
    setSelectedId(workData[prevIndex].id);
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex flex-col py-8 sm:py-16 md:py-20">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-b from-background via-arc-blue/5 to-background" />

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-30"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 191, 255, 0.03) 2px, rgba(0, 191, 255, 0.03) 4px)",
        }}
      />

      {/* 3D Canvas or 2D Card */}
      <div className="relative z-10 p-4 h-105 lg:h-140 items-center justify-center flex">
        {animationEnabled ? (
          <WorkScene
            selectedWork={selectedWork}
            animationEnabled={animationEnabled}
          />
        ) : (
          <WorkCard2D work={selectedWork} />
        )}
      </div>

      {/* Clickable labels on left side - Desktop only */}
      <div className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 flex-col gap-3">
        {workData.map((work) => (
          <motion.button
            key={work.id}
            onClick={() => handleSelect(work.id)}
            onMouseEnter={playHover}
            className={`text-left transition-all duration-300 ${
              selectedId === work.id
                ? "opacity-100"
                : "opacity-60 hover:opacity-90"
            }`}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            <p
              className={`font-orbitron text-[10px] mb-0.5 ${
                selectedId === work.id ? "text-arc-blue" : "text-iron-gold"
              }`}
            >
              {work.period}
            </p>
            <p
              className={`font-rajdhani text-sm font-medium ${
                selectedId === work.id
                  ? "text-foreground"
                  : "text-foreground/80"
              }`}
            >
              {work.company}
            </p>
            <p className="font-rajdhani text-[10px] text-foreground/50">
              {work.location}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden absolute bottom-12 left-0 right-0 z-20 flex items-center justify-center gap-4 px-4">
        <motion.button
          onClick={prevWork}
          className="w-10 h-10 flex items-center justify-center border-2 border-arc-blue/50 rounded-lg bg-background/50 text-arc-blue"
          whileTap={{ scale: 0.95 }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </motion.button>

        <div className="flex flex-col items-center gap-1 min-w-37.5">
          <p className="font-rajdhani text-sm text-foreground font-medium text-center">
            {selectedWork.company}
          </p>
          <p className="font-orbitron text-[10px] text-arc-blue">
            {selectedWork.period}
          </p>
        </div>

        <motion.button
          onClick={nextWork}
          className="w-10 h-10 flex items-center justify-center border-2 border-arc-blue/50 rounded-lg bg-background/50 text-arc-blue"
          whileTap={{ scale: 0.95 }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </motion.button>
      </div>
    </section>
  );
};
