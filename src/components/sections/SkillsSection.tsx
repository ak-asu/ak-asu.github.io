import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import skillsDataRaw from "@/data/skills.json";

// Category color mapping
const getCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    Languages: "hsl(195 100% 50%)",
    "Front-End": "hsl(280 80% 60%)",
    Frameworks: "hsl(44 98% 39%)",
    Databases: "hsl(120 50% 50%)",
    Tools: "hsl(0 100% 50%)",
    OS: "hsl(210 60% 50%)",
    Cloud: "hsl(30 100% 50%)",
  };
  return colorMap[category] || "hsl(195 100% 50%)";
};

// Transform skills data to include colors
const skillsData = skillsDataRaw.map((skill) => ({
  name: skill.name,
  icon: skill.icon,
  category: skill.category,
  level: skill.level,
  color: getCategoryColor(skill.category),
}));

export const SkillsSection = () => {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const toggleFlip = (index: number) => {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Auto-scroll with bidirectional scrolling (matching AchievementsSection)
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    let isAutoScrolling = true;
    let isProgrammaticScroll = false;
    let lastScrollTop = scrollContainer.scrollTop;
    let scrollDirection: "down" | "up" = "down";

    const scrollInterval = setInterval(() => {
      if (!scrollContainer || !isAutoScrolling) return;

      isProgrammaticScroll = true;
      const scrollSpeed = 1;

      if (scrollDirection === "down") {
        scrollContainer.scrollTop += scrollSpeed;
        if (
          scrollContainer.scrollTop + scrollContainer.clientHeight >=
          scrollContainer.scrollHeight - 5
        ) {
          scrollDirection = "up";
        }
      } else {
        scrollContainer.scrollTop -= scrollSpeed;
        if (scrollContainer.scrollTop <= 5) {
          scrollDirection = "down";
        }
      }

      lastScrollTop = scrollContainer.scrollTop;

      setTimeout(() => {
        isProgrammaticScroll = false;
      }, 10);
    }, 30);

    const handleScroll = () => {
      if (isProgrammaticScroll) return;
      if (Math.abs(scrollContainer.scrollTop - lastScrollTop) > 0) {
        isAutoScrolling = false;
      }
      lastScrollTop = scrollContainer.scrollTop;
    };

    const handleUserInput = () => {
      isAutoScrolling = false;
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (scrollContainer && !scrollContainer.contains(event.target as Node)) {
        isAutoScrolling = true;
        const currentScroll = scrollContainer.scrollTop;
        const maxScroll =
          scrollContainer.scrollHeight - scrollContainer.clientHeight;
        const scrollPosition = maxScroll > 0 ? currentScroll / maxScroll : 0;
        scrollDirection = scrollPosition < 0.5 ? "down" : "up";
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    scrollContainer.addEventListener("touchstart", handleUserInput, {
      passive: true,
    });
    scrollContainer.addEventListener("wheel", handleUserInput, {
      passive: true,
    });
    document.addEventListener("click", handleClickOutside);

    return () => {
      clearInterval(scrollInterval);
      scrollContainer.removeEventListener("scroll", handleScroll);
      scrollContainer.removeEventListener("touchstart", handleUserInput);
      scrollContainer.removeEventListener("wheel", handleUserInput);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <section
      id="skills"
      className="relative min-h-screen w-full overflow-hidden py-8 flex items-center justify-center"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-b from-iron-red-dark/30 via-background to-iron-red-dark/30" />

      {/* Circuit background */}
      <div className="absolute inset-0 opacity-20">
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
                strokeWidth="0.3"
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

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6">
        {/* Scrollable Skills Grid */}
        <div className="relative min-h-75 sm:min-h-100 md:min-h-125">
          <div
            ref={scrollContainerRef}
            className="absolute inset-0 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-iron-red-dark scrollbar-thumb-arc-blue/30 p-4 sm:p-6 md:p-8"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {skillsData.map((skill, index) => {
                const isFlipped = flippedCards.has(index);
                return (
                  <motion.div
                    key={skill.name}
                    className="relative cursor-pointer min-h-24 sm:min-h-28"
                    style={{ perspective: "600px" }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => toggleFlip(index)}
                  >
                    <motion.div
                      className="relative w-full h-full"
                      style={{ transformStyle: "preserve-3d" }}
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                      {/* Front Face */}
                      <div
                        className="iron-panel absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 sm:p-4"
                        style={{ backfaceVisibility: "hidden" }}
                      >
                        <img
                          src={`${import.meta.env.BASE_URL}${skill.icon.startsWith("/") ? skill.icon.slice(1) : skill.icon}`}
                          alt={skill.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                        />
                        <span
                          className="font-orbitron text-[10px] sm:text-xs text-center leading-tight"
                          style={{ color: skill.color }}
                        >
                          {skill.name}
                        </span>
                      </div>

                      {/* Back Face */}
                      <div
                        className="iron-panel absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 sm:p-4"
                        style={{
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                          borderColor: skill.color,
                          boxShadow: `0 0 12px ${skill.color}40`,
                        }}
                      >
                        <span
                          className="font-orbitron text-[10px] sm:text-xs font-bold uppercase tracking-wider"
                          style={{ color: skill.color }}
                        >
                          {skill.category}
                        </span>
                        <span className="font-rajdhani text-xs sm:text-sm text-foreground/80">
                          {skill.level}
                        </span>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
