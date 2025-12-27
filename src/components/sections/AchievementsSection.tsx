import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Award, Trophy, Shield, FileText, Brain, Code } from "lucide-react";
import { ArcReactor } from "@/components/ui/ArcReactor";
import { useAudioSystem } from "@/hooks/useAudioSystem";

const achievementsData = [
  {
    id: 1,
    title: "Open Source Contributor - Top 1%",
    icon: Code,
    color: "hsl(195 100% 50%)",
  },
  {
    id: 2,
    title: "AWS Certified Solutions Architect - Professional",
    icon: Shield,
    color: "hsl(30 100% 50%)",
  },
  {
    id: 3,
    title: "First Place - Global AI Hackathon 2024",
    icon: Trophy,
    color: "hsl(44 98% 50%)",
  },
  {
    id: 4,
    title: "Outstanding UI Interactions Award",
    icon: Award,
    color: "hsl(280 80% 60%)",
  },
  {
    id: 5,
    title: "GitHub Community Star",
    icon: Brain,
    color: "hsl(195 100% 50%)",
  },
  {
    id: 6,
    title: "Patent Holder - Advanced UI Interactions",
    icon: FileText,
    color: "hsl(44 98% 50%)",
  },
];

export const AchievementsSection = () => {
  const [isRevealed, setIsRevealed] = useState(false);
  const { playPowerUp, playHover } = useAudioSystem();

  const handleReveal = () => {
    playPowerUp();
    setIsRevealed(true);
  };

  return (
    <section
      id="achievements"
      className="relative min-h-screen w-full overflow-hidden py-20 flex items-center justify-center"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-iron-red-dark/30 via-background to-iron-red-dark/30" />

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

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-block iron-panel px-8 py-4">
            <h2 className="font-orbitron text-3xl md:text-4xl font-bold arc-text tracking-wider">
              ACHIEVEMENTS UNLOCKED
            </h2>
          </div>
        </motion.div>

        {/* Curtain Container */}
        <div className="relative min-h-[500px]">
          {/* Achievements Grid (Behind curtains) */}
          <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-3 gap-4 p-8">
            {achievementsData.map((achievement, index) => {
              const IconComponent = achievement.icon;
              return (
                <motion.div
                  key={achievement.id}
                  className="iron-panel p-4 flex flex-col items-center justify-center text-center gap-3"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isRevealed ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div
                    className="w-16 h-16 rounded-lg flex items-center justify-center"
                    style={{
                      background: `${achievement.color}20`,
                      border: `2px solid ${achievement.color}`,
                      boxShadow: `0 0 15px ${achievement.color}40`,
                    }}
                  >
                    <IconComponent
                      size={28}
                      style={{ color: achievement.color }}
                    />
                  </div>
                  <p className="font-orbitron text-xs text-iron-gold leading-tight">
                    {achievement.title}
                  </p>
                </motion.div>
              );
            })}
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
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-4"
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
                    <ArcReactor size={80} />
                  </motion.div>
                  <span className="font-orbitron text-sm text-arc-blue uppercase tracking-wider px-4 py-2 bg-background/80 rounded-full border border-arc-blue/50">
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
