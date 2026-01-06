import { useState, lazy, Suspense } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { HudOverlay } from "@/components/ui/HudOverlay";
import { HeroSection } from "@/components/sections/HeroSection";
import { Terminal } from "@/components/terminal/Terminal";
import { JarvisChat } from "@/components/chat/JarvisChat";
import { useAppStore } from "@/store/useAppStore";
import { motion, AnimatePresence } from "framer-motion";

// Lazy load heavy sections to reduce initial bundle size and memory usage
const SkillsSection = lazy(() =>
  import("@/components/sections/SkillsSection").then((m) => ({
    default: m.SkillsSection,
  })),
);
const ProjectsSection = lazy(() =>
  import("@/components/sections/ProjectsSection").then((m) => ({
    default: m.ProjectsSection,
  })),
);
const WorkSection = lazy(() =>
  import("@/components/sections/WorkSection").then((m) => ({
    default: m.WorkSection,
  })),
);
const EducationSection = lazy(() =>
  import("@/components/sections/EducationSection").then((m) => ({
    default: m.EducationSection,
  })),
);
const AchievementsSection = lazy(() =>
  import("@/components/sections/AchievementsSection").then((m) => ({
    default: m.AchievementsSection,
  })),
);
const GamesSection = lazy(() =>
  import("@/components/sections/GamesSection").then((m) => ({
    default: m.GamesSection,
  })),
);

// Fallback component for lazy loaded sections
const SectionFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 rounded-full border-2 border-arc-blue/30" />
      <div className="absolute inset-0 rounded-full border-2 border-arc-blue border-t-transparent animate-spin" />
    </div>
  </div>
);
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
        return (
          <Suspense fallback={<SectionFallback />}>
            <SkillsSection />
          </Suspense>
        );
      case "projects":
        return (
          <Suspense fallback={<SectionFallback />}>
            <ProjectsSection />
          </Suspense>
        );
      case "work":
        return (
          <Suspense fallback={<SectionFallback />}>
            <WorkSection />
          </Suspense>
        );
      case "education":
        return (
          <Suspense fallback={<SectionFallback />}>
            <EducationSection />
          </Suspense>
        );
      case "achievements":
        return (
          <Suspense fallback={<SectionFallback />}>
            <AchievementsSection />
          </Suspense>
        );
      case "games":
        return (
          <Suspense fallback={<SectionFallback />}>
            <GamesSection />
          </Suspense>
        );
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
