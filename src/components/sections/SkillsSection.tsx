import { useState, useEffect, useRef } from "react";
import { useHoneycombLayout } from "@/hooks/useHoneycombLayout";
import { PhysicsEngine } from "@/components/skills/PhysicsEngine";
import { HoneycombLayout } from "@/components/skills/HoneycombLayout";
import { SkillsViewport } from "@/components/skills/SkillsViewport";
import { useAppStore } from "@/store/useAppStore";
import skillsDataRaw from "@/data/skills.json";

// Category color mapping
const getCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    Languages: "hsl(195 100% 50%)", // Arc Blue
    "Front-End": "hsl(280 80% 60%)", // Purple
    Frameworks: "hsl(44 98% 39%)", // Iron Gold
    Databases: "hsl(120 50% 50%)", // Green
    Tools: "hsl(0 100% 50%)", // Red
    OS: "hsl(210 60% 50%)", // Sky Blue
    Cloud: "hsl(30 100% 50%)", // Orange
  };
  return colorMap[category] || "hsl(195 100% 50%)";
};

// Transform skills data to include colors
const skillsData = skillsDataRaw.map((skill) => ({
  name: skill.name,
  icon: skill.icon,
  category: skill.category,
  color: getCategoryColor(skill.category),
}));

export const SkillsSection = () => {
  const animationEnabled = useAppStore((state) => state.animationEnabled);
  // Responsive hexagon sizing and viewport calculations
  const [hexSize, setHexSize] = useState(108); // 3x the original 36
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const updateSizes = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // Hexagon sizing - 3x larger than before
      let newHexSize = 108; // Desktop: 3x36
      if (screenWidth < 640) {
        newHexSize = 84; // Mobile: 3x28
      } else if (screenWidth < 1024) {
        newHexSize = 96; // Tablet: 3x32
      }

      setHexSize(newHexSize);

      // Use full screen dimensions as viewport
      setViewportSize({
        width: screenWidth,
        height: screenHeight,
      });
    };

    updateSizes();
    window.addEventListener("resize", updateSizes);
    return () => window.removeEventListener("resize", updateSizes);
  }, []);

  // Generate honeycomb layout with all skills (no filtering)
  const { positions, structureRadius, boundaryRadius } = useHoneycombLayout({
    hexRadius: hexSize,
    totalNodes: skillsData.length,
  });

  return (
    <section
      id="skills"
      className="relative min-h-screen w-full overflow-hidden py-20"
    >
      {/* Animated Digital Background - CSS only, no canvas */}
      <div className="absolute inset-0 bg-linear-to-b from-background via-arc-blue/5 to-background" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(195 100% 50% / 0.1) 2px, hsl(195 100% 50% / 0.1) 4px),
                           repeating-linear-gradient(90deg, transparent, transparent 2px, hsl(195 100% 50% / 0.1) 2px, hsl(195 100% 50% / 0.1) 4px)`,
          animation: "matrix-scan 20s linear infinite",
        }}
      />

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
        {/* Honeycomb Physics Viewport */}
        <SkillsViewport width={viewportSize.width} height={viewportSize.height}>
          <PhysicsEngine
            structureRadius={structureRadius}
            boundaryRadius={
              Math.max(viewportSize.width, viewportSize.height) / 2
            }
            isActive={true}
            animationEnabled={animationEnabled}
          >
            <HoneycombLayout
              skills={skillsData}
              positions={positions}
              hexSize={hexSize}
            />
          </PhysicsEngine>
        </SkillsViewport>
      </div>
    </section>
  );
};
