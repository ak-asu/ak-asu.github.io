import { useState } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { HudOverlay } from "@/components/ui/HudOverlay";
import { HeroSection } from "@/components/sections/HeroSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { WorkSection } from "@/components/sections/WorkSection";
import { EducationSection } from "@/components/sections/EducationSection";
import { AchievementsSection } from "@/components/sections/AchievementsSection";
import { GamesSection } from "@/components/sections/GamesSection";
import { Terminal } from "@/components/terminal/Terminal";
import { JarvisChat } from "@/components/chat/JarvisChat";
import { useAppStore } from "@/store/useAppStore";
import { motion, AnimatePresence } from "framer-motion";
const sectionVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { viewMode, activeSection } = useAppStore();

  // Show loading screen on initial load
  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  // Terminal Mode
  if (viewMode === "terminal") {
    return (
      <div className="relative h-screen bg-background overflow-hidden">
        <ModeToggle />
        <Terminal />
      </div>
    );
  }

  // Render active section component
  const renderSection = () => {
    switch (activeSection) {
      case "home":
        return <HeroSection />;
      case "skills":
        return <SkillsSection />;
      case "projects":
        return <ProjectsSection />;
      case "work":
        return <WorkSection />;
      case "education":
        return <EducationSection />;
      case "achievements":
        return <AchievementsSection />;
      case "games":
        return <GamesSection />;
      default:
        return <HeroSection />;
    }
  };

  return (
    <div className="relative h-screen bg-background overflow-hidden">
      {/* HUD Overlay */}
      <HudOverlay />

      {/* Navigation */}
      <Navbar />

      {/* Mode Toggle & Controls */}
      <ModeToggle />

      {/* Active Section with Animation */}
      <AnimatePresence mode="wait">
        <motion.main
          key={activeSection}
          className="h-full w-full"
          variants={sectionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {renderSection()}
        </motion.main>
      </AnimatePresence>

      {/* JARVIS AI Chat */}
      <JarvisChat />
    </div>
  );
};

export default Index;
