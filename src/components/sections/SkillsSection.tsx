import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import {
  useRef,
  useState,
  useMemo,
  useCallback,
  type RefObject,
} from "react";
import * as THREE from "three";
import { useAppStore } from "@/store/useAppStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import skillsDataRaw from "@/data/skills.json";

interface Skill {
  name: string;
  level: string;
  category: string;
  size: number;
  icon: string;
}

type Category =
  | "All"
  | "AI/ML"
  | "Backend"
  | "Frontend"
  | "Cloud/Infra"
  | "Languages"
  | "Mobile";

interface DragState {
  isDragging: boolean;
  lastX: number;
  lastY: number;
  deltaX: number;
  deltaY: number;
}

const CATEGORIES: Category[] = [
  "All",
  "AI/ML",
  "Backend",
  "Frontend",
  "Cloud/Infra",
  "Languages",
  "Mobile",
];

const CAT_COLOR: Record<string, string> = {
  "AI/ML": "#00bfff",
  Backend: "#c49102",
  Frontend: "#00ff88",
  "Cloud/Infra": "#ff6b6b",
  Languages: "#b088ff",
  Mobile: "#ff9f43",
};

const CAT_CHIP_STYLE: Record<
  string,
  { border: string; color: string; activeBg: string }
> = {
  All: {
    border: "rgba(196,145,2,0.3)",
    color: "rgba(196,145,2,0.7)",
    activeBg: "rgba(196,145,2,0.15)",
  },
  "AI/ML": {
    border: "rgba(0,191,255,0.35)",
    color: "rgba(0,191,255,0.75)",
    activeBg: "rgba(0,191,255,0.12)",
  },
  Backend: {
    border: "rgba(196,145,2,0.35)",
    color: "rgba(196,145,2,0.8)",
    activeBg: "rgba(196,145,2,0.12)",
  },
  Frontend: {
    border: "rgba(0,255,136,0.3)",
    color: "rgba(0,255,136,0.75)",
    activeBg: "rgba(0,255,136,0.1)",
  },
  "Cloud/Infra": {
    border: "rgba(255,107,107,0.3)",
    color: "rgba(255,107,107,0.75)",
    activeBg: "rgba(255,107,107,0.1)",
  },
  Languages: {
    border: "rgba(176,136,255,0.3)",
    color: "rgba(176,136,255,0.75)",
    activeBg: "rgba(176,136,255,0.1)",
  },
  Mobile: {
    border: "rgba(255,159,67,0.3)",
    color: "rgba(255,159,67,0.75)",
    activeBg: "rgba(255,159,67,0.1)",
  },
};

function fibonacciSphere(n: number, radius: number): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = phi * i;
    pts.push([
      Math.cos(theta) * r * radius,
      y * radius,
      Math.sin(theta) * r * radius,
    ]);
  }

  return pts;
}

const RADIUS = 2.8;
const skills: Skill[] = skillsDataRaw as Skill[];
const positions = fibonacciSphere(skills.length, RADIUS);

function SkillNode({
  skill,
  position,
  isActive,
  onHover,
  onUnhover,
}: {
  skill: Skill;
  position: [number, number, number];
  isActive: boolean;
  onHover: (skill: Skill, pos: [number, number, number]) => void;
  onUnhover: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = CAT_COLOR[skill.category] ?? "#ffffff";
  const baseRadius = skill.size * 0.07;

  useFrame(() => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    const targetOpacity = isActive ? 0.9 : 0.12;
    mat.opacity += (targetOpacity - mat.opacity) * 0.08;
    mat.emissiveIntensity +=
      ((isActive ? 0.7 : 0.2) - mat.emissiveIntensity) * 0.08;
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(skill, position);
        }}
        onPointerOut={() => onUnhover()}
      >
        <sphereGeometry args={[baseRadius, 14, 14]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.15}
        />
      </mesh>
      {isActive && (
        <Html
          center
          position={[0, baseRadius + 0.1, 0]}
          style={{ pointerEvents: "none" }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "9px",
              color,
              whiteSpace: "nowrap",
              textShadow: `0 0 8px ${color}`,
              opacity: isActive ? 1 : 0,
            }}
          >
            {skill.name}
          </span>
        </Html>
      )}
    </group>
  );
}

function ConstellationScene({
  activeCategory,
  onHover,
  onUnhover,
  dragState,
}: {
  activeCategory: Category;
  onHover: (skill: Skill, pos: [number, number, number]) => void;
  onUnhover: () => void;
  dragState: RefObject<DragState>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const animationEnabled = useAppStore((s) => s.animationEnabled);
  const prefersReduced = useReducedMotion();
  const shouldAnimate = animationEnabled && !prefersReduced;
  const targetRotY = useRef(0);

  useMemo(() => {
    if (activeCategory === "All") {
      targetRotY.current = 0;
      return;
    }

    const catPositions = skills
      .map((s, i) => ({ s, pos: positions[i] }))
      .filter(({ s }) => s.category === activeCategory)
      .map(({ pos }) => pos);

    if (catPositions.length === 0) return;
    const cx =
      catPositions.reduce((acc, pos) => acc + pos[0], 0) /
      catPositions.length;
    const cz =
      catPositions.reduce((acc, pos) => acc + pos[2], 0) /
      catPositions.length;
    targetRotY.current = -Math.atan2(cx, cz);
  }, [activeCategory]);

  useFrame((_, delta) => {
    if (!groupRef.current || !dragState.current) return;

    if (dragState.current.deltaX !== 0 || dragState.current.deltaY !== 0) {
      groupRef.current.rotation.y += dragState.current.deltaX * 0.008;
      groupRef.current.rotation.x += dragState.current.deltaY * 0.008;
      groupRef.current.rotation.x = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, groupRef.current.rotation.x),
      );
      targetRotY.current = groupRef.current.rotation.y;
      dragState.current.deltaX = 0;
      dragState.current.deltaY = 0;
      return;
    }

    if (
      shouldAnimate &&
      activeCategory === "All" &&
      !dragState.current.isDragging
    ) {
      groupRef.current.rotation.y += delta * 0.12;
      targetRotY.current = groupRef.current.rotation.y;
    } else if (!dragState.current.isDragging) {
      groupRef.current.rotation.y +=
        (targetRotY.current - groupRef.current.rotation.y) * 0.05;
    }
  });

  const edges = useMemo(() => {
    const result: {
      points: [THREE.Vector3, THREE.Vector3];
      color: string;
      category: string;
    }[] = [];

    for (let i = 0; i < skills.length; i++) {
      for (let j = i + 1; j < skills.length; j++) {
        if (skills[i].category !== skills[j].category) continue;
        const [ax, ay, az] = positions[i];
        const [bx, by, bz] = positions[j];
        const d = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2 + (az - bz) ** 2);
        if (d > 2.2) continue;
        result.push({
          points: [
            new THREE.Vector3(ax, ay, az),
            new THREE.Vector3(bx, by, bz),
          ],
          color: CAT_COLOR[skills[i].category] ?? "#ffffff",
          category: skills[i].category,
        });
      }
    }

    return result;
  }, []);

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 6]} intensity={1.5} color="#00bfff" />

      {edges.map((e, i) => (
        <Line
          key={i}
          points={e.points}
          color={e.color}
          lineWidth={0.5}
          transparent
          opacity={
            activeCategory === "All" || e.category === activeCategory
              ? 0.18
              : 0.03
          }
        />
      ))}

      {skills.map((skill, i) => (
        <SkillNode
          key={skill.name}
          skill={skill}
          position={positions[i]}
          isActive={activeCategory === "All" || skill.category === activeCategory}
          onHover={onHover}
          onUnhover={onUnhover}
        />
      ))}
    </group>
  );
}

export const SkillsSection = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [hoveredSkill, setHoveredSkill] = useState<Skill | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const dragState = useRef<DragState>({
    isDragging: false,
    lastX: 0,
    lastY: 0,
    deltaX: 0,
    deltaY: 0,
  });
  const animationEnabled = useAppStore((s) => s.animationEnabled);
  const prefersReduced = useReducedMotion();

  const handleHover = useCallback(
    (skill: Skill, _pos: [number, number, number]) => {
      setHoveredSkill(skill);
    },
    [],
  );
  const handleUnhover = useCallback(() => setHoveredSkill(null), []);

  return (
    <section
      className="relative flex h-screen w-full flex-col overflow-hidden"
      style={{ paddingBottom: "28px", paddingTop: "60px" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background via-arc-blue/3 to-background pointer-events-none" />

      <div className="relative z-10 px-4 pt-4 pb-2 sm:px-8">
        <SectionHeader label="technical stack" title="SKILLS" />

        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const s = CAT_CHIP_STYLE[cat];
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="btn-chamfer px-3 py-1.5 font-orbitron text-[9px] uppercase tracking-wider transition-all duration-200"
                style={{
                  border: `1px solid ${s.border}`,
                  color: s.color,
                  background: isActive ? s.activeBg : "rgba(5,8,18,0.5)",
                  boxShadow: isActive ? `0 0 10px ${s.border}` : "none",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="relative z-10 flex-1 cursor-grab active:cursor-grabbing"
        onMouseMove={(e) => {
          setTooltipPos({ x: e.clientX, y: e.clientY });
          if (dragState.current.isDragging) {
            dragState.current.deltaX += e.clientX - dragState.current.lastX;
            dragState.current.lastX = e.clientX;
            dragState.current.deltaY += e.clientY - dragState.current.lastY;
            dragState.current.lastY = e.clientY;
          }
        }}
        onMouseDown={(e) => {
          dragState.current = {
            isDragging: true,
            lastX: e.clientX,
            lastY: e.clientY,
            deltaX: 0,
            deltaY: 0,
          };
        }}
        onMouseUp={() => {
          dragState.current.isDragging = false;
        }}
        onMouseLeave={() => {
          dragState.current.isDragging = false;
        }}
        onTouchStart={(e) => {
          const t = e.touches[0];
          dragState.current = {
            isDragging: true,
            lastX: t.clientX,
            lastY: t.clientY,
            deltaX: 0,
            deltaY: 0,
          };
        }}
        onTouchMove={(e) => {
          const t = e.touches[0];
          if (dragState.current.isDragging) {
            dragState.current.deltaX += t.clientX - dragState.current.lastX;
            dragState.current.lastX = t.clientX;
            dragState.current.deltaY += t.clientY - dragState.current.lastY;
            dragState.current.lastY = t.clientY;
          }
        }}
        onTouchEnd={() => {
          dragState.current.isDragging = false;
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 7], fov: 50 }}
          frameloop={animationEnabled && !prefersReduced ? "always" : "demand"}
          gl={{ alpha: true, antialias: true }}
          style={{ background: "transparent" }}
        >
          <ConstellationScene
            activeCategory={activeCategory}
            onHover={handleHover}
            onUnhover={handleUnhover}
            dragState={dragState}
          />
        </Canvas>

        {hoveredSkill && (
          <div
            className="fixed pointer-events-none z-50"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y,
              transform: "translate(-50%, -120%)",
            }}
          >
            <div
              style={{
                background: "rgba(5,8,18,0.95)",
                border: `1px solid ${CAT_COLOR[hoveredSkill.category] ?? "#00bfff"}40`,
                padding: "8px 14px",
                boxShadow: `0 0 20px ${CAT_COLOR[hoveredSkill.category] ?? "#00bfff"}20`,
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: CAT_COLOR[hoveredSkill.category],
                  marginBottom: "3px",
                }}
              >
                {hoveredSkill.category}
              </div>
              <div
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "13px",
                  color: "#e0ddd8",
                }}
              >
                {hoveredSkill.name}
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "9px",
                  color: "rgba(224,221,216,0.4)",
                  marginTop: "2px",
                }}
              >
                {hoveredSkill.level}
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        className="absolute right-6 bottom-10 z-20"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "9px",
          color: "rgba(0,191,255,0.3)",
          textAlign: "right",
          lineHeight: 1.8,
        }}
      >
        drag - rotate
        <br />
        hover - inspect
      </div>
    </section>
  );
};
