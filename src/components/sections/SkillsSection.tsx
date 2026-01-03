import { useState, useEffect, useRef } from "react";
import { useHoneycombLayout } from "@/hooks/useHoneycombLayout";
import { PhysicsEngine } from "@/components/skills/PhysicsEngine";
import { HoneycombLayout } from "@/components/skills/HoneycombLayout";
import { SkillsViewport } from "@/components/skills/SkillsViewport";
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

export const SkillsSection = () => {
  // Responsive hexagon sizing and viewport calculations
  const [hexSize, setHexSize] = useState(108); // 3x the original 36
  const [viewportSize, setViewportSize] = useState({ width: 500, height: 500 });

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

      // Calculate actual structure size for 31 skills
      // Level 0: 1 node, Level 1: 6 nodes, Level 2: 12 nodes, Level 3: 12 nodes = 31 total
      // Using corrected honeycomb spacing
      const maxLevel = 3;
      const horizontalSpacing = newHexSize * 0.75;
      const verticalSpacing = newHexSize * 0.866;
      // Max distance is roughly level * max(horizontal, vertical) + hexRadius for padding
      const structureRadius =
        maxLevel * Math.max(horizontalSpacing, verticalSpacing) + newHexSize;

      // Boundary is 1.75x structure radius (where it bounces)
      const boundaryRadius = structureRadius * 1.75;

      // Viewport is 0.75x of the inscribed square in the boundary circle
      // Inscribed square side = diameter / √2
      const inscribedSquareSide = (boundaryRadius * 2) / Math.sqrt(2);
      const viewportDimension = inscribedSquareSide * 0.75;

      // Apply screen constraints - keep window smaller
      const maxWidth = Math.min(screenWidth * 0.7, 500); // Max 500px
      const maxHeight = Math.min(screenHeight * 0.5, 500); // Max 500px

      const finalWidth = Math.min(viewportDimension, maxWidth);
      const finalHeight = Math.min(viewportDimension, maxHeight);

      setViewportSize({
        width: Math.floor(finalWidth),
        height: Math.floor(finalHeight),
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
        {/* Honeycomb Physics Viewport */}
        <SkillsViewport width={viewportSize.width} height={viewportSize.height}>
          <PhysicsEngine
            structureRadius={structureRadius}
            boundaryRadius={boundaryRadius}
            isActive={true}
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
