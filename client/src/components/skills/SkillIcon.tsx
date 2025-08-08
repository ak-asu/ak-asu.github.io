import React, { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { getVerticalOffset, levelToPercentage, Skill } from "./utils";

const BASE_URL = import.meta.env.VITE_PUBLIC_URL || "/Portfolio";

interface SkillIconProps {
  skill: Skill;
  index: number;
  isDarkMode: boolean;
  hoveredIcon: string | null;
  setHoveredIcon: (value: string | null) => void;
  isPaused?: boolean;
}

const SkillIcon: React.FC<SkillIconProps> = ({
  skill,
  index,
  isDarkMode,
  hoveredIcon,
  setHoveredIcon,
  isPaused = false,
}) => {
  const proficiency = levelToPercentage(skill.level);
  const yOffset = getVerticalOffset(index);
  const iconId = `${skill.name}-${index}`;
  const isHovered = hoveredIcon === iconId;
  const controls = useAnimation();
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPaused) {
      controls.stop();
      return;
    }
    // Updated animation to be more subtle and varied for each icon
    const amplitude = 3 + (index % 4) * 1.5;
    const duration = 1.8 + (index % 5) * 0.3;
    const delay = (index % 6) * 0.1;
    controls.start({
      y: [yOffset, yOffset + amplitude, yOffset, yOffset - amplitude, yOffset],
      transition: {
        duration: duration,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
        delay: delay,
      },
    });
    return () => {
      controls.stop();
    };
  }, [controls, index, isPaused, yOffset]);

  // Handle hover state separately from animation state
  const handlePointerEnter = () => {
    setHoveredIcon(iconId);
  };

  const handlePointerLeave = () => {
    setHoveredIcon(null);
  };

  return (
    <div className="relative mx-8 my-4">
      <motion.div
        ref={iconRef}
        initial={{ y: yOffset }}
        animate={controls}
        style={{ y: yOffset }}
        whileHover={{
          scale: 1.3,
          filter: "brightness(1.3)",
          transition: { duration: 0.2 },
        }}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        className="cursor-pointer"
      >
        <div
          className={`relative w-16 h-16 transition-all duration-300 ${
            isHovered
              ? `ring-2 ring-offset-2 ${isDarkMode ? "ring-offset-gray-900" : "ring-offset-white"} ring-palette-teal-DEFAULT`
              : ""
          }`}
        >
          <div
            className={`absolute inset-0 rounded-full overflow-hidden ${
              isDarkMode ? "bg-gray-800" : "bg-gray-200"
            }`}
          >
            {/* Colored progress circle */}
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {/* Background circle track */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={isDarkMode ? "#374151" : "#d1d5db"}
                strokeWidth="10"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={isDarkMode ? "#73d3e7" : "#1791a3"}
                strokeWidth="10"
                strokeDasharray={`${proficiency * 2.83} ${283 - proficiency * 2.83}`}
                strokeDashoffset="70"
                transform="rotate(-90 50 50)"
              />
            </svg>
          </div>
          <div className="absolute inset-0 flex items-center justify-center p-3">
            <img
              src={`${BASE_URL}${skill.icon}`}
              alt={skill.name}
              className="w-10 h-10 object-contain"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SkillIcon;
