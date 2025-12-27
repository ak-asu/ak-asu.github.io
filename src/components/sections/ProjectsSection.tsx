import { motion } from "framer-motion";
import { useState } from "react";
import { ExternalLink, Github, ChevronLeft, ChevronRight } from "lucide-react";
import { useAudioSystem } from "@/hooks/useAudioSystem";

// Sample projects data
const projectsData = [
  {
    id: 1,
    title: "Quantum Odyssey",
    subtitle: "VR Game - Project 01",
    description:
      "Immersive VR game developed for Oculus Quest, featuring advanced physics, procedural generation, and hand tracking. Explore alien worlds and solve puzzles in this ambitious space adventure.",
    tech: ["Unity", "C#", "Oculus SDK", "Vulkan", "Blender"],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    liveUrl: "#",
    repoUrl: "#",
  },
  {
    id: 2,
    title: "Neural Canvas",
    subtitle: "AI Art Platform - Project 02",
    description:
      "An AI-powered creative platform that transforms text descriptions into stunning visual artwork using state-of-the-art diffusion models and neural networks.",
    tech: ["Python", "PyTorch", "React", "FastAPI", "AWS"],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    liveUrl: "#",
    repoUrl: "#",
  },
  {
    id: 3,
    title: "CryptoVault",
    subtitle: "DeFi Dashboard - Project 03",
    description:
      "Comprehensive cryptocurrency portfolio tracker and DeFi dashboard with real-time analytics, cross-chain support, and automated yield optimization strategies.",
    tech: ["TypeScript", "Next.js", "Web3.js", "GraphQL", "Solidity"],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    liveUrl: "#",
    repoUrl: "#",
  },
];

export const ProjectsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayMode, setDisplayMode] = useState<"video" | "description">(
    "video",
  );
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
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center pt-16">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-iron-red-dark/50 via-background to-iron-red-dark/50" />

      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-iron-gold/20 blur-3xl" />
        <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-arc-blue/20 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4">
        {/* Main TV Frame */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {/* Outer Frame - Gold metallic */}
          <div
            className="relative p-3 rounded-2xl"
            style={{
              background:
                "linear-gradient(180deg, hsl(44 90% 55%) 0%, hsl(44 98% 39%) 30%, hsl(44 100% 25%) 100%)",
              boxShadow:
                "0 0 30px hsl(44 98% 39% / 0.3), inset 0 2px 0 hsl(44 90% 70%)",
            }}
          >
            {/* Inner Frame - Red metallic */}
            <div
              className="relative p-4 rounded-xl"
              style={{
                background:
                  "linear-gradient(180deg, hsl(0 85% 35%) 0%, hsl(0 100% 24%) 50%, hsl(0 100% 15%) 100%)",
              }}
            >
              {/* Screen area with arc blue glow */}
              <div
                className="relative rounded-lg overflow-hidden"
                style={{
                  boxShadow:
                    "0 0 20px hsl(195 100% 50% / 0.3), inset 0 0 30px hsl(195 100% 50% / 0.1)",
                  border: "3px solid hsl(195 100% 50% / 0.5)",
                }}
              >
                {/* Screen Content */}
                <div className="bg-background/90 p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Left - Video/Description */}
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-background border border-arc-blue/30">
                      {displayMode === "video" ? (
                        <iframe
                          src={currentProject.videoUrl}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="p-4 h-full flex items-center">
                          <p className="text-foreground/80 font-rajdhani">
                            {currentProject.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right - Project Info */}
                    <div className="flex flex-col justify-center">
                      <motion.h3
                        key={currentProject.id}
                        className="font-orbitron text-2xl md:text-3xl gold-text mb-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {currentProject.title}
                      </motion.h3>
                      <p className="text-iron-gold font-rajdhani text-lg mb-6">
                        {currentProject.subtitle}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-3">
                        <motion.a
                          href={currentProject.liveUrl}
                          className="btn-iron flex items-center justify-center gap-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={playClick}
                          onMouseEnter={playHover}
                        >
                          <ExternalLink size={16} />
                          Live Demo
                        </motion.a>
                        <motion.a
                          href={currentProject.repoUrl}
                          className="btn-iron flex items-center justify-center gap-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={playClick}
                          onMouseEnter={playHover}
                        >
                          <Github size={16} />
                          Repository
                        </motion.a>
                      </div>
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2 mt-6">
                    {currentProject.tech.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 rounded-full bg-iron-red-dark/50 border border-iron-gold/30 text-iron-gold font-orbitron text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <motion.button
            onClick={prevProject}
            onMouseEnter={playHover}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 w-12 h-20 flex items-center justify-center border-2 border-arc-blue/50 rounded-lg bg-background/50 text-arc-blue hover:bg-arc-blue/10 transition-all"
            whileHover={{ scale: 1.1, borderColor: "hsl(195 100% 50%)" }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft size={28} />
          </motion.button>

          <motion.button
            onClick={nextProject}
            onMouseEnter={playHover}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 w-12 h-20 flex items-center justify-center border-2 border-arc-blue/50 rounded-lg bg-background/50 text-arc-blue hover:bg-arc-blue/10 transition-all"
            whileHover={{ scale: 1.1, borderColor: "hsl(195 100% 50%)" }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight size={28} />
          </motion.button>
        </motion.div>

        {/* Controls Panel */}
        <motion.div
          className="mt-6 flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="iron-panel px-6 py-3 flex flex-wrap items-center justify-center gap-4">
            <span className="font-orbitron text-xs text-iron-gold uppercase">
              Display Mode
            </span>

            <button
              onClick={() => {
                playClick();
                prevProject();
              }}
              onMouseEnter={playHover}
              className="btn-iron text-xs py-2"
            >
              Previous Project
            </button>

            {/* Video/Description Toggle */}
            <div className="flex items-center gap-2 px-4 py-2 bg-iron-red-dark rounded-full border border-iron-gold">
              <span
                className={`font-orbitron text-xs uppercase ${displayMode === "video" ? "text-arc-blue" : "text-iron-gold/50"}`}
              >
                Video
              </span>
              <button
                onClick={() => {
                  playClick();
                  setDisplayMode(
                    displayMode === "video" ? "description" : "video",
                  );
                }}
                className="w-12 h-6 rounded-full bg-iron-gold/20 border border-iron-gold relative"
              >
                <motion.div
                  className="absolute top-1 w-4 h-4 rounded-full bg-iron-gold"
                  animate={{ left: displayMode === "video" ? 4 : 24 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              </button>
            </div>

            <button
              onClick={() => {
                playClick();
                nextProject();
              }}
              onMouseEnter={playHover}
              className="btn-iron text-xs py-2"
            >
              Next Project
            </button>
          </div>

          {/* Description Panel */}
          <div className="iron-panel px-6 py-4 max-w-2xl text-center">
            <h4 className="font-orbitron text-sm text-arc-blue uppercase mb-2">
              Description
            </h4>
            <p className="text-foreground/80 font-rajdhani">
              {currentProject.description}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
