import { motion } from "framer-motion";
import { useState } from "react";
import {
  ExternalLink,
  Github,
  ChevronLeft,
  ChevronRight,
  Link,
} from "lucide-react";
import { useAudioSystem } from "@/hooks/useAudioSystem";
import projectsDataRaw from "@/data/projects.json";

// Helper function to convert YouTube URLs to embed format
const convertToEmbedUrl = (url: string): string => {
  if (!url) return "";

  // Handle youtu.be short format
  const youtuBeMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (youtuBeMatch) {
    return `https://www.youtube.com/embed/${youtuBeMatch[1]}`;
  }

  // Handle youtube.com/watch?v= format
  const youtubeMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Return empty string for non-YouTube URLs (like LinkedIn)
  if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
    return "";
  }

  return url;
};

// Transform projects data to match component structure
const projectsData = projectsDataRaw.map((project, index) => ({
  id: index + 1,
  title: project.name,
  subtitle: `${project.type.charAt(0).toUpperCase() + project.type.slice(1)} Project`,
  description: project.description,
  tech: project.technologies,
  videoUrl: convertToEmbedUrl(project.media || ""),
  liveUrl: project.url || "#",
}));

export const ProjectsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { playClick, playHover, playWhoosh } = useAudioSystem();

  const currentProject = projectsData[currentIndex];

  const nextProject = () => {
    playWhoosh();
    setCurrentIndex((prev) => (prev + 1) % projectsData.length);
  };

  const prevProject = () => {
    playWhoosh();
    setCurrentIndex(
      (prev) => (prev - 1 + projectsData.length) % projectsData.length,
    );
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center py-16 sm:py-20">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-b from-iron-red-dark/50 via-background to-iron-red-dark/50" />

      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-iron-gold/20 blur-3xl" />
        <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-arc-blue/20 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-2 sm:px-4">
        {/* Main TV Frame */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {/* Outer Frame - Gold metallic */}
          <div
            className="relative p-2 sm:p-3 rounded-xl sm:rounded-2xl"
            style={{
              background:
                "linear-gradient(180deg, hsl(44 90% 55%) 0%, hsl(44 98% 39%) 30%, hsl(44 100% 25%) 100%)",
              boxShadow:
                "0 0 30px hsl(44 98% 39% / 0.3), inset 0 2px 0 hsl(44 90% 70%)",
            }}
          >
            {/* Inner Frame - Red metallic */}
            <div
              className="relative p-3 sm:p-4 rounded-lg sm:rounded-xl"
              style={{
                background:
                  "linear-gradient(180deg, hsl(0 85% 35%) 0%, hsl(0 100% 24%) 50%, hsl(0 100% 15%) 100%)",
              }}
            >
              {/* Screen area with arc blue glow */}
              <div
                className="relative rounded-md sm:rounded-lg overflow-hidden"
                style={{
                  boxShadow:
                    "0 0 20px hsl(195 100% 50% / 0.3), inset 0 0 30px hsl(195 100% 50% / 0.1)",
                  border: "3px solid hsl(195 100% 50% / 0.5)",
                }}
              >
                {/* Screen Content */}
                <div className="bg-background/90 p-3 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Left - Video */}
                    <div className="relative h-48 sm:h-56 md:h-80 lg:h-96 rounded-lg overflow-hidden bg-background border border-arc-blue/30">
                      {currentProject.videoUrl ? (
                        <iframe
                          src={currentProject.videoUrl}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-iron-gold/50">
                          <span className="font-orbitron text-xs sm:text-sm">
                            No preview available
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right - Project Info */}
                    <div className="flex flex-col">
                      {/* Title with links */}
                      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 shrink-0">
                        <motion.h3
                          key={currentProject.id}
                          className="font-orbitron text-lg sm:text-2xl md:text-3xl gold-text flex-1"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {currentProject.title}
                        </motion.h3>

                        {/* Demo and Repo icon links */}
                        <div className="flex gap-1.5 sm:gap-2 shrink-0">
                          {currentProject.liveUrl &&
                            currentProject.liveUrl !== "#" && (
                              <motion.a
                                href={currentProject.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 sm:p-2 rounded-lg border border-arc-blue/50 bg-arc-blue/10 text-arc-blue hover:bg-arc-blue/20 transition-all"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={playClick}
                                onMouseEnter={playHover}
                                title="Live Demo"
                              >
                                <ExternalLink
                                  size={16}
                                  className="sm:w-4.5 sm:h-4.5"
                                />
                              </motion.a>
                            )}
                        </div>
                      </div>

                      <p className="text-iron-gold font-rajdhani text-sm sm:text-base md:text-lg mb-3 sm:mb-4 shrink-0">
                        {currentProject.subtitle}
                      </p>

                      {/* Scrollable Description */}
                      <div className="overflow-y-auto rounded-lg bg-background/50 border border-iron-gold/20 p-3 sm:p-4 mb-3 sm:mb-4 scrollbar-thin scrollbar-track-iron-red-dark scrollbar-thumb-arc-blue/30 h-24 sm:h-28 md:h-32 lg:h-40">
                        <p className="text-foreground/80 font-rajdhani text-sm sm:text-base leading-relaxed">
                          {currentProject.description}
                        </p>
                      </div>

                      {/* Tech Stack */}
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 shrink-0">
                        {currentProject.tech.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-iron-red-dark/50 border border-iron-gold/30 text-iron-gold font-orbitron text-[10px] sm:text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows - Left */}
          <motion.button
            onClick={prevProject}
            onMouseEnter={playHover}
            className="absolute left-2 md:left-0 top-1/2 -translate-y-1/2 md:-translate-x-16 w-10 h-16 sm:w-12 sm:h-20 flex items-center justify-center border-2 border-arc-blue/50 rounded-lg bg-background/30 md:bg-background/50 backdrop-blur-sm text-arc-blue hover:bg-arc-blue/10 transition-all z-20"
            whileHover={{ scale: 1.1, borderColor: "hsl(195 100% 50%)" }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft size={24} className="sm:w-7 sm:h-7" />
          </motion.button>

          {/* Navigation Arrows - Right */}
          <motion.button
            onClick={nextProject}
            onMouseEnter={playHover}
            className="absolute right-2 md:right-0 top-1/2 -translate-y-1/2 md:translate-x-16 w-10 h-16 sm:w-12 sm:h-20 flex items-center justify-center border-2 border-arc-blue/50 rounded-lg bg-background/30 md:bg-background/50 backdrop-blur-sm text-arc-blue hover:bg-arc-blue/10 transition-all z-20"
            whileHover={{ scale: 1.1, borderColor: "hsl(195 100% 50%)" }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight size={24} className="sm:w-7 sm:h-7" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
