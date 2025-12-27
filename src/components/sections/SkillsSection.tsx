import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  Code,
  Database,
  Palette,
  Terminal,
  Cloud,
  GitBranch,
} from "lucide-react";
import { useAudioSystem } from "@/hooks/useAudioSystem";

// Skills data
const skillsData = [
  {
    name: "Python",
    icon: Code,
    category: "backend",
    color: "hsl(195 100% 50%)",
  },
  {
    name: "Docker",
    icon: Cloud,
    category: "tools",
    color: "hsl(195 100% 50%)",
  },
  { name: "AWS", icon: Cloud, category: "tools", color: "hsl(44 98% 39%)" },
  { name: "Git", icon: GitBranch, category: "tools", color: "hsl(0 100% 24%)" },
  {
    name: "Figma",
    icon: Palette,
    category: "frontend",
    color: "hsl(330 80% 50%)",
  },
  {
    name: "React",
    icon: Code,
    category: "frontend",
    color: "hsl(195 100% 50%)",
  },
  {
    name: "TypeScript",
    icon: Code,
    category: "frontend",
    color: "hsl(210 80% 50%)",
  },
  {
    name: "Node.js",
    icon: Terminal,
    category: "backend",
    color: "hsl(120 40% 45%)",
  },
  {
    name: "PostgreSQL",
    icon: Database,
    category: "backend",
    color: "hsl(210 60% 45%)",
  },
  { name: "Vue", icon: Code, category: "frontend", color: "hsl(153 47% 49%)" },
  {
    name: "MongoDB",
    icon: Database,
    category: "backend",
    color: "hsl(120 50% 35%)",
  },
  {
    name: "Kubernetes",
    icon: Cloud,
    category: "tools",
    color: "hsl(210 80% 50%)",
  },
];

type Category = "all" | "frontend" | "backend" | "tools";

// Matrix Rain Effect Component
const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars =
      "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(10, 15, 25, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "hsl(195 100% 50% / 0.3)";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 opacity-40" />;
};

// Skill Badge Component
const SkillBadge = ({
  skill,
  index,
}: {
  skill: (typeof skillsData)[0];
  index: number;
}) => {
  const IconComponent = skill.icon;

  return (
    <motion.div
      className="relative group flex-shrink-0"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.1, zIndex: 10 }}
    >
      {/* Hexagon shape */}
      <div className="relative w-28 h-32 flex flex-col items-center justify-center">
        {/* Hexagon background */}
        <div
          className="absolute inset-0 transition-all duration-300 group-hover:shadow-arc"
          style={{
            clipPath:
              "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            background:
              "linear-gradient(180deg, hsl(0 100% 24%) 0%, hsl(0 100% 15%) 100%)",
          }}
        />

        {/* Hexagon border */}
        <div
          className="absolute inset-[2px] transition-all duration-300"
          style={{
            clipPath:
              "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            background:
              "linear-gradient(180deg, hsl(44 98% 50%) 0%, hsl(44 98% 30%) 100%)",
          }}
        />

        {/* Hexagon inner */}
        <div
          className="absolute inset-[4px] flex flex-col items-center justify-center gap-2 transition-all duration-300"
          style={{
            clipPath:
              "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            background:
              "linear-gradient(180deg, hsl(0 100% 28%) 0%, hsl(0 100% 18%) 100%)",
          }}
        >
          <IconComponent
            size={28}
            style={{ color: skill.color }}
            className="drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
          />
          <span className="font-orbitron text-xs uppercase text-iron-gold tracking-wide">
            {skill.name}
          </span>
        </div>

        {/* Arc glow on hover */}
        <motion.div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-arc-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: "0 0 15px hsl(195 100% 50%)" }}
        />
      </div>
    </motion.div>
  );
};

export const SkillsSection = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(50);
  const { playClick, playHover, playToggle } = useAudioSystem();

  const categories = [
    { id: "all" as const, label: "All Systems" },
    { id: "frontend" as const, label: "Frontend" },
    { id: "backend" as const, label: "Backend" },
    { id: "tools" as const, label: "Tools" },
  ];

  const filteredSkills =
    activeCategory === "all"
      ? skillsData
      : skillsData.filter((s) => s.category === activeCategory);

  // Duplicate for infinite scroll
  const duplicatedSkills = [
    ...filteredSkills,
    ...filteredSkills,
    ...filteredSkills,
  ];

  return (
    <section
      id="skills"
      className="relative min-h-screen w-full overflow-hidden py-20"
    >
      {/* Matrix Background */}
      <MatrixRain />

      {/* Circuit pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <svg className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <pattern
              id="circuitSkills"
              patternUnits="userSpaceOnUse"
              width="50"
              height="50"
            >
              <path
                d="M25 0 L25 25 M0 25 L50 25"
                stroke="hsl(44 98% 39%)"
                strokeWidth="0.5"
                fill="none"
              />
              <circle
                cx="25"
                cy="25"
                r="2"
                fill="hsl(195 100% 50%)"
                opacity="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuitSkills)" />
        </svg>
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-block">
            <div className="iron-panel px-8 py-4">
              <h2 className="font-orbitron text-3xl md:text-4xl font-bold arc-text tracking-wider">
                CAPABILITIES
              </h2>
              <p className="font-orbitron text-sm text-iron-gold/70 mt-1 uppercase tracking-widest">
                Mark XLII // Systems Analysis
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filter Controls */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4 mb-12 px-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className="iron-panel flex items-center gap-2 px-4 py-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  playClick();
                  setActiveCategory(cat.id);
                }}
                onMouseEnter={playHover}
                className={`px-4 py-2 font-orbitron text-xs uppercase tracking-wider rounded transition-all duration-300 ${
                  activeCategory === cat.id
                    ? "bg-arc-blue/20 text-arc-blue border border-arc-blue/50 shadow-arc"
                    : "text-iron-gold/70 hover:text-iron-gold"
                }`}
              >
                {cat.label}
              </button>
            ))}

            {/* Pause button */}
            <button
              onClick={() => {
                playToggle();
                setIsPaused(!isPaused);
              }}
              className="ml-4 w-10 h-10 rounded-full border-2 border-iron-gold flex items-center justify-center text-iron-gold hover:border-arc-blue hover:text-arc-blue transition-colors"
            >
              {isPaused ? "▶" : "❚❚"}
            </button>

            {/* Speed control */}
            <div className="flex items-center gap-2 ml-4">
              <span className="text-iron-gold/70 font-orbitron text-xs">
                THROTTLE
              </span>
              <input
                type="range"
                min="20"
                max="100"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-20 accent-arc-blue"
              />
              <span className="text-arc-blue font-orbitron text-xs">
                {speed}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* Skills Carousel */}
        <div className="relative overflow-hidden py-8">
          <motion.div
            className="flex gap-6"
            animate={isPaused ? {} : { x: ["0%", "-33.33%"] }}
            transition={{
              x: {
                duration: 100 - speed + 10,
                repeat: Infinity,
                ease: "linear",
              },
            }}
            onHoverStart={() => setIsPaused(true)}
            onHoverEnd={() => setIsPaused(false)}
          >
            {duplicatedSkills.map((skill, index) => (
              <SkillBadge
                key={`${skill.name}-${index}`}
                skill={skill}
                index={index}
              />
            ))}
          </motion.div>
        </div>

        {/* Status Bar */}
        <motion.div
          className="flex items-center justify-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <div className="iron-panel px-6 py-2 flex items-center gap-3">
            <div
              className="w-2 h-2 rounded-full bg-arc-blue animate-pulse"
              style={{ boxShadow: "0 0 10px hsl(195 100% 50%)" }}
            />
            <span className="font-orbitron text-xs text-arc-blue uppercase tracking-wider">
              System Online // J.A.R.V.I.S. Connected
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
