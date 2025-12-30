import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  Code,
  Database,
  Palette,
  Terminal,
  Cloud,
  GitBranch,
  type LucideIcon,
} from "lucide-react";
import { useAudioSystem } from "@/hooks/useAudioSystem";
import skillsDataRaw from "@/data/skills.json";

// Icon mapping based on category
const getIconForCategory = (category: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    Languages: Code,
    "Front-End": Code,
    Frameworks: Terminal,
    Databases: Database,
    Tools: GitBranch,
    OS: Terminal,
    Cloud: Cloud,
  };
  return iconMap[category] || Code;
};

// Category color mapping
const getCategoryColor = (category: string) => {
  const colorMap: Record<string, string> = {
    Languages: "hsl(195 100% 50%)",
    "Front-End": "hsl(280 80% 60%)",
    Frameworks: "hsl(44 98% 39%)",
    Databases: "hsl(120 50% 35%)",
    Tools: "hsl(0 100% 24%)",
    OS: "hsl(210 60% 45%)",
    Cloud: "hsl(30 100% 50%)",
  };
  return colorMap[category] || "hsl(195 100% 50%)";
};

// Map category to filter type
const mapCategoryToFilter = (category: string): string => {
  const categoryMap: Record<string, string> = {
    Languages: "backend",
    "Front-End": "frontend",
    Frameworks: "backend",
    Databases: "backend",
    Tools: "tools",
    OS: "tools",
    Cloud: "tools",
  };
  return categoryMap[category] || "tools";
};

// Transform skills data to match component structure
const skillsData = skillsDataRaw.map((skill) => ({
  name: skill.name,
  icon: getIconForCategory(skill.category),
  category: mapCategoryToFilter(skill.category),
  color: getCategoryColor(skill.category),
}));

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

      ctx.fillStyle = "hsl(195 100% 50% / 0.5)";
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

  return <canvas ref={canvasRef} className="absolute inset-0 opacity-60" />;
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
      className="relative group shrink-0"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      {/* Hexagon shape */}
      <div className="relative w-20 h-24 sm:w-24 sm:h-28 md:w-28 md:h-32 flex flex-col items-center justify-center">
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
          className="absolute inset-0.5 transition-all duration-300 group-hover:brightness-150"
          style={{
            clipPath:
              "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            background:
              "linear-gradient(180deg, hsl(44 98% 50%) 0%, hsl(44 98% 30%) 100%)",
          }}
        />

        {/* Hexagon inner */}
        <div
          className="absolute inset-1 flex flex-col items-center justify-center gap-2 transition-all duration-300"
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
            className="drop-shadow-lg transition-all duration-300 group-hover:brightness-150 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
          />
          <span className="font-orbitron text-[10px] sm:text-xs uppercase text-iron-gold tracking-wide text-center px-1">
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
  const [currentX, setCurrentX] = useState(0);
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
      <div className="absolute inset-0 bg-linear-to-b from-background via-transparent to-background pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-block">
            <div className="iron-panel px-4 sm:px-8 py-3 sm:py-4">
              <h2 className="font-orbitron text-2xl sm:text-3xl md:text-4xl font-bold arc-text tracking-wider">
                CAPABILITIES
              </h2>
              <p className="font-orbitron text-xs sm:text-sm text-iron-gold/70 mt-1 uppercase tracking-widest">
                Mark XLII // Systems Analysis
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filter Controls */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-8 sm:mb-12 px-2 sm:px-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className="iron-panel flex flex-wrap items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  playClick();
                  setActiveCategory(cat.id);
                }}
                onMouseEnter={playHover}
                className={`px-2 sm:px-4 py-1.5 sm:py-2 font-orbitron text-[10px] sm:text-xs uppercase tracking-wider rounded transition-all duration-300 whitespace-nowrap ${
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
              className="ml-1 sm:ml-4 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-iron-gold flex items-center justify-center text-iron-gold hover:border-arc-blue hover:text-arc-blue transition-colors text-xs sm:text-sm"
            >
              {isPaused ? "▶" : "❚❚"}
            </button>
          </div>
        </motion.div>

        {/* Skills Carousel */}
        <div className="relative overflow-hidden py-4 sm:py-8">
          <motion.div
            className="flex gap-3 sm:gap-4 md:gap-6"
            animate={
              isPaused ? { x: `${currentX}%` } : { x: ["0%", "-33.33%"] }
            }
            initial={{ x: "0%" }}
            transition={{
              x: {
                duration: 30,
                repeat: Infinity,
                ease: "linear",
                repeatType: "loop",
              },
            }}
            onUpdate={(latest) => {
              if (typeof latest.x === "string") {
                const xValue = parseFloat(latest.x);
                if (!isNaN(xValue)) {
                  setCurrentX(xValue);
                }
              }
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
      </div>
    </section>
  );
};
