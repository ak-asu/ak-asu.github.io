import { memo } from "react";
import { motion } from "framer-motion";

interface Skill {
  name: string;
  icon: string;
  category: string;
  color: string;
}

interface SkillHexagonProps {
  skill: Skill;
  x: number;
  y: number;
  size: number;
  index: number;
}

export const SkillHexagon = memo(function SkillHexagon({
  skill,
  x,
  y,
  size,
  index,
}: SkillHexagonProps) {
  return (
    <motion.div
      className="absolute group"
      style={{
        width: size,
        height: size * 1.15,
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: "translate(-50%, -50%)",
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.02,
        ease: "easeOut",
      }}
    >
      {/* Background Layer */}
      <div
        className="absolute inset-0 bg-linear-to-br from-iron-red to-iron-red/80"
        style={{
          clipPath:
            "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        }}
      />

      {/* Border Layer - colored by category */}
      <div
        className="absolute inset-0.5 group-hover:brightness-150 transition-all duration-300"
        style={{
          clipPath:
            "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          background: skill.color,
          opacity: 0.4,
        }}
      />

      {/* Content Layer */}
      <div
        className="absolute inset-1 bg-linear-to-br from-iron-red to-background flex flex-col items-center justify-center gap-1 transition-shadow duration-300"
        style={{
          clipPath:
            "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          boxShadow: `0 0 0 0 transparent`,
        }}
      >
        <img
          src={skill.icon}
          alt={skill.name}
          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain transition-transform duration-300 group-hover:scale-110"
        />
        <span
          className="text-[10px] sm:text-xs md:text-sm font-orbitron text-center px-1 leading-tight transition-colors duration-300"
          style={{
            color: skill.color,
          }}
        >
          {skill.name}
        </span>
      </div>

      {/* Hover Glow Indicator - colored by category */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 opacity-0 group-hover:opacity-100 rounded-full transition-all duration-300"
        style={{
          background: skill.color,
          boxShadow: `0 0 15px ${skill.color}`,
        }}
      />
    </motion.div>
  );
});
