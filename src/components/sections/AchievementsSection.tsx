import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  Award,
  Trophy,
  Shield,
  FileText,
  Brain,
  Code,
  type LucideIcon,
} from "lucide-react";
import { ArcReactor } from "@/components/ui/ArcReactor";
import { useAudioSystem } from "@/hooks/useAudioSystem";
import achievementsDataRaw from "@/data/achievements.json";

// Icon mapping based on achievement type
const getIconForType = (type: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    recognition: Trophy,
    certification: Shield,
    course: FileText,
    workshop: Brain,
    hackathon: Award,
  };
  return iconMap[type] || Award;
};

// Color mapping based on achievement type
const getColorForType = (type: string) => {
  const colorMap: Record<string, string> = {
    recognition: "hsl(44 98% 50%)",
    certification: "hsl(30 100% 50%)",
    course: "hsl(195 100% 50%)",
    workshop: "hsl(280 80% 60%)",
    hackathon: "hsl(120 60% 50%)",
  };
  return colorMap[type] || "hsl(195 100% 50%)";
};

// Transform achievements data to match component structure and sort by date ascending
const achievementsData = achievementsDataRaw
  .slice()
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  .map((achievement, index) => ({
    id: index + 1,
    title: achievement.title,
    icon: getIconForType(achievement.type),
    color: getColorForType(achievement.type),
    image: achievement.image,
  }));

export const AchievementsSection = () => {
  const [isRevealed, setIsRevealed] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { playPowerUp, playHover } = useAudioSystem();

  const handleReveal = () => {
    playPowerUp();
    setIsRevealed(true);
  };

  // Auto-scroll functionality with bidirectional scrolling
  useEffect(() => {
    if (!isRevealed || !scrollContainerRef.current) return;

    const scrollContainer = scrollContainerRef.current;
    let isAutoScrolling = true;
    let isProgrammaticScroll = false;
    let lastScrollTop = scrollContainer.scrollTop;
    let scrollDirection: "down" | "up" = "down"; // Start scrolling down

    // Auto-scroll interval
    const scrollInterval = setInterval(() => {
      if (!scrollContainer || !isAutoScrolling) return;

      isProgrammaticScroll = true;
      const scrollSpeed = 1;

      // Scroll in current direction
      if (scrollDirection === "down") {
        scrollContainer.scrollTop += scrollSpeed;

        // Check if reached bottom
        if (
          scrollContainer.scrollTop + scrollContainer.clientHeight >=
          scrollContainer.scrollHeight - 5
        ) {
          scrollDirection = "up"; // Reverse direction
        }
      } else {
        scrollContainer.scrollTop -= scrollSpeed;

        // Check if reached top
        if (scrollContainer.scrollTop <= 5) {
          scrollDirection = "down"; // Reverse direction
        }
      }

      lastScrollTop = scrollContainer.scrollTop;

      // Reset flag after a short delay
      setTimeout(() => {
        isProgrammaticScroll = false;
      }, 10);
    }, 30);

    // Detect user scroll
    const handleScroll = () => {
      if (isProgrammaticScroll) return;

      // User is scrolling manually - pause auto-scroll
      if (Math.abs(scrollContainer.scrollTop - lastScrollTop) > 0) {
        isAutoScrolling = false;
      }
      lastScrollTop = scrollContainer.scrollTop;
    };

    // Detect user touch/wheel
    const handleUserInput = () => {
      isAutoScrolling = false;
    };

    // Resume on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (scrollContainer && !scrollContainer.contains(event.target as Node)) {
        isAutoScrolling = true;

        // Determine direction based on current position
        const currentScroll = scrollContainer.scrollTop;
        const maxScroll =
          scrollContainer.scrollHeight - scrollContainer.clientHeight;
        const scrollPosition = currentScroll / maxScroll;

        // If in top half, scroll down; if in bottom half, scroll up
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
  }, [isRevealed]);

  return (
    <section
      id="achievements"
      className="relative min-h-screen w-full overflow-hidden py-8 flex items-center justify-center"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-b from-iron-red-dark/30 via-background to-iron-red-dark/30" />

      {/* Circuit background */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <pattern
              id="circuitAch"
              patternUnits="userSpaceOnUse"
              width="40"
              height="40"
            >
              <path
                d="M20 0 L20 20 M0 20 L40 20"
                stroke="hsl(44 98% 39%)"
                strokeWidth="0.3"
                fill="none"
              />
              <rect
                x="18"
                y="18"
                width="4"
                height="4"
                fill="hsl(195 100% 50%)"
                opacity="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuitAch)" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6">
        {/* Curtain Container */}
        <div className="relative min-h-75 sm:min-h-100 md:min-h-125">
          {/* Achievements Grid (Behind curtains) */}
          <div
            ref={scrollContainerRef}
            className="absolute inset-0 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-iron-red-dark scrollbar-thumb-arc-blue/30 p-4 sm:p-6 md:p-8"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 sm:gap-4">
              {achievementsData.map((achievement, index) => {
                const IconComponent = achievement.icon;
                return (
                  <motion.div
                    key={achievement.id}
                    className="iron-panel relative overflow-hidden p-3 sm:p-4 flex flex-col items-center justify-center text-center gap-2 sm:gap-3 min-h-32 sm:min-h-36 md:min-h-40"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isRevealed ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    {/* Translucent background image if present */}
                    {achievement.image && (
                      <div className="absolute inset-0 opacity-40">
                        <img
                          src={`${import.meta.env.BASE_URL}${achievement.image.startsWith("/") ? achievement.image.slice(1) : achievement.image}`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Icon area - always reserve space so title doesn't shift when icon is absent */}
                    <div
                      className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg flex items-center justify-center shrink-0"
                      style={
                        achievement.image
                          ? undefined
                          : {
                              background: `${achievement.color}20`,
                              border: `2px solid ${achievement.color}`,
                              boxShadow: `0 0 15px ${achievement.color}40`,
                            }
                      }
                    >
                      {!achievement.image && (
                        <IconComponent
                          size={28}
                          style={{ color: achievement.color }}
                          className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
                        />
                      )}
                    </div>
                    <p className="relative font-orbitron text-[10px] sm:text-xs text-accent leading-tight line-clamp-3">
                      {achievement.title}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Curtains */}
          <AnimatePresence>
            {!isRevealed && (
              <>
                {/* Left Curtain */}
                <motion.div
                  className="absolute top-0 left-0 w-1/2 h-full z-20"
                  initial={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  style={{
                    background:
                      "linear-gradient(90deg, hsl(44 90% 45%) 0%, hsl(44 98% 39%) 20%, hsl(0 100% 24%) 40%, hsl(0 100% 20%) 100%)",
                    borderRight: "4px solid hsl(44 98% 50%)",
                    boxShadow: "inset 0 0 50px hsl(0 0% 0% / 0.5)",
                  }}
                >
                  {/* Metallic pattern lines */}
                  <div className="absolute inset-0 opacity-30">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-full h-px bg-iron-gold/50"
                        style={{ top: `${i * 10 + 5}%` }}
                      />
                    ))}
                  </div>
                </motion.div>

                {/* Right Curtain */}
                <motion.div
                  className="absolute top-0 right-0 w-1/2 h-full z-20"
                  initial={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  style={{
                    background:
                      "linear-gradient(270deg, hsl(44 90% 45%) 0%, hsl(44 98% 39%) 20%, hsl(0 100% 24%) 40%, hsl(0 100% 20%) 100%)",
                    borderLeft: "4px solid hsl(44 98% 50%)",
                    boxShadow: "inset 0 0 50px hsl(0 0% 0% / 0.5)",
                  }}
                >
                  {/* Metallic pattern lines */}
                  <div className="absolute inset-0 opacity-30">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-full h-px bg-iron-gold/50"
                        style={{ top: `${i * 10 + 5}%` }}
                      />
                    ))}
                  </div>
                </motion.div>

                {/* Center Arc Reactor Button */}
                <motion.button
                  onClick={handleReveal}
                  onMouseEnter={playHover}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-3 sm:gap-4"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="relative"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <ArcReactor size={60} className="sm:w-20 sm:h-20" />
                  </motion.div>
                  <span className="font-orbitron text-xs sm:text-sm text-arc-blue uppercase tracking-wider px-3 sm:px-4 py-1.5 sm:py-2 bg-background/80 rounded-full border border-arc-blue/50">
                    Reveal Achievements
                  </span>
                </motion.button>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
