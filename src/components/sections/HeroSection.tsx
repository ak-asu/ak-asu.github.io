import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useAnimation,
} from "framer-motion";
import { useRef, useEffect } from "react";
import heroImage from "@/assets/hero-ironman.png";
import { ArcReactor } from "@/components/ui/ArcReactor";
import { Github, Linkedin, Globe, Code, ChevronDown } from "lucide-react";
import contactData from "@/data/contact.json";

export const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse position for parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Parallax transforms
  const bgX = useTransform(smoothMouseX, [-0.5, 0.5], [20, -20]);
  const bgY = useTransform(smoothMouseY, [-0.5, 0.5], [20, -20]);
  const heroX = useTransform(smoothMouseX, [-0.5, 0.5], [-30, 30]);
  const heroY = useTransform(smoothMouseY, [-0.5, 0.5], [-20, 20]);
  const textX = useTransform(smoothMouseX, [-0.5, 0.5], [15, -15]);
  const textY = useTransform(smoothMouseY, [-0.5, 0.5], [10, -10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  // Arrow animation controls
  const arrowControls = useAnimation();

  useEffect(() => {
    let mounted = true;
    // Calculate positions for each icon center
    // Mobile: icon=32px, gap=9px | Desktop: icon=40px, gap=12px
    // Positions: icon_center = (icon_width + gap) * index + startOffset
    const iconWidth = 32; // w-8 = 2rem = 32px (mobile baseline)
    const gap = 20; // slightly increased from 8px
    const startOffset = 8; // slightly decreased from 16px
    const positions = [
      startOffset, // Icon 0: 14px
      iconWidth + gap + startOffset, // Icon 1: 55px
      2 * (iconWidth + gap) + startOffset, // Icon 2: 96px
      3 * (iconWidth + gap) + startOffset, // Icon 3: 137px
    ];

    const run = async () => {
      while (mounted) {
        for (let i = 0; i < positions.length; i++) {
          if (!mounted) return;
          // Move to next icon
          await arrowControls.start({
            left: positions[i],
            transition: { duration: 0.35, ease: "easeInOut" },
          });
          if (!mounted) return;
          // Bounce three times above the icon
          await arrowControls.start({
            y: [0, -12, 0, -8, 0],
            transition: {
              duration: 0.9,
              times: [0, 0.25, 0.5, 0.75, 1],
              repeat: 2,
              repeatDelay: 0.08,
            },
          });
        }
      }
    };

    run();
    return () => {
      mounted = false;
      arrowControls.stop();
    };
  }, [arrowControls]);

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative h-screen w-full overflow-hidden flex items-center justify-center"
    >
      {/* Animated Background Layers */}
      <motion.div className="absolute inset-0 z-0" style={{ x: bgX, y: bgY }}>
        {/* Circuit pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern
                id="circuit"
                patternUnits="userSpaceOnUse"
                width="20"
                height="20"
              >
                <path
                  d="M10 0 L10 10 M0 10 L20 10"
                  stroke="hsl(195 100% 50%)"
                  strokeWidth="0.3"
                  fill="none"
                  opacity="0.5"
                />
                <circle
                  cx="10"
                  cy="10"
                  r="1"
                  fill="hsl(195 100% 50%)"
                  opacity="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)" />
          </svg>
        </div>

        {/* Gradient background */}
        <div className="absolute inset-0 bg-linear-to-br from-iron-red-dark via-background to-iron-red-dark/50" />

        {/* Decorative swoosh shapes */}
        <motion.div
          className="absolute -left-20 top-1/4 w-96 h-96 rounded-full bg-iron-gold/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -right-20 bottom-1/4 w-96 h-96 rounded-full bg-arc-blue/10 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </motion.div>

      {/* Large "DEVELOPER" Background Text */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none"
        style={{ x: bgX, y: bgY }}
      >
        <h1 className="font-orbitron text-[15vw] font-black text-iron-gold/5 select-none tracking-wider">
          DEVELOPER
        </h1>
      </motion.div>

      {/* Hero Image */}
      <motion.div
        className="absolute z-10 w-full h-full flex items-center justify-center"
        style={{ x: heroX, y: heroY }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <motion.img
          src={heroImage}
          alt="Hero Portrait"
          className="max-h-[50vh] sm:max-h-[60vh] md:max-h-[70vh] w-auto object-contain drop-shadow-2xl"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ filter: "drop-shadow(0 0 30px hsl(195 100% 50% / 0.3))" }}
        />
      </motion.div>

      {/* Left Text Content */}
      <motion.div
        className="absolute left-4 sm:left-8 md:left-16 lg:left-24 top-1/2 -translate-y-1/2 z-20"
        style={{ x: textX, y: textY }}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <motion.p
          className="text-iron-gold text-sm sm:text-lg md:text-xl font-rajdhani italic mb-1 sm:mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Hey,
        </motion.p>
        <motion.p
          className="text-iron-gold text-base sm:text-xl md:text-2xl font-rajdhani italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          I'm{" "}
          <span className="text-foreground font-semibold">Aakash Khepar</span>
        </motion.p>
        <motion.p
          className="text-arc-blue text-lg sm:text-2xl md:text-3xl font-rajdhani italic font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{ textShadow: "0 0 20px hsl(195 100% 50% / 0.5)" }}
        >
          Full-Stack Developer
        </motion.p>
      </motion.div>

      {/* Right Content - Status Indicators */}
      <motion.div
        className="absolute right-4 sm:right-8 md:right-16 lg:right-24 top-1/2 -translate-y-1/2 z-20 flex flex-col items-end gap-3 sm:gap-6"
        style={{
          x: useTransform(smoothMouseX, [-0.5, 0.5], [-15, 15]),
          y: textY,
        }}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        {/* ASU Student Badge */}
        <motion.div
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 glass-panel rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <span className="text-iron-gold text-[10px] sm:text-xs font-orbitron uppercase whitespace-nowrap">
            ASU Graduate Student
          </span>
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-arc-blue/20 border border-arc-blue flex items-center justify-center">
            <svg
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-arc-blue"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </motion.div>

        {/* Role Text */}
        <motion.div
          className="text-right mt-2 sm:mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          <p className="text-foreground text-base sm:text-xl md:text-2xl font-rajdhani">
            Software Engineer
          </p>
          <p className="text-iron-gold text-sm sm:text-lg md:text-xl font-rajdhani">
            & AI/ML Enthusiast
          </p>
        </motion.div>
      </motion.div>

      {/* Social Media Links */}
      <motion.div
        className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 md:left-16 flex items-center gap-2 sm:gap-3 z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
      >
        <div className="relative">
          <motion.div
            initial={{ left: 8, y: 0 }}
            animate={arrowControls}
            className="absolute -top-8 left-0 w-6 h-6 flex items-center justify-center pointer-events-none z-30"
          >
            <ChevronDown
              className="w-20 h-20 text-arc-blue drop-shadow-[0_8px_24px_rgba(29,78,216,0.25)]"
              strokeWidth={4}
            />
          </motion.div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={contactData.github}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg glass-panel border border-iron-gold/30 hover:border-arc-blue/60 transition-all duration-300"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4 sm:w-5 sm:h-5 text-iron-gold group-hover:text-arc-blue transition-colors duration-300" />
              <div
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ boxShadow: "0 0 15px hsl(195 100% 50% / 0.3)" }}
              />
            </a>
            <a
              href={contactData.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg glass-panel border border-iron-gold/30 hover:border-arc-blue/60 transition-all duration-300"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4 sm:w-5 sm:h-5 text-iron-gold group-hover:text-arc-blue transition-colors duration-300" />
              <div
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ boxShadow: "0 0 15px hsl(195 100% 50% / 0.3)" }}
              />
            </a>
            <a
              href={contactData.devpost}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg glass-panel border border-iron-gold/30 hover:border-arc-blue/60 transition-all duration-300"
              aria-label="Devpost"
            >
              <Code className="w-4 h-4 sm:w-5 sm:h-5 text-iron-gold group-hover:text-arc-blue transition-colors duration-300" />
              <div
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ boxShadow: "0 0 15px hsl(195 100% 50% / 0.3)" }}
              />
            </a>
            <a
              href={contactData.website}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg glass-panel border border-iron-gold/30 hover:border-arc-blue/60 transition-all duration-300"
              aria-label="Website"
            >
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-iron-gold group-hover:text-arc-blue transition-colors duration-300" />
              <div
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ boxShadow: "0 0 15px hsl(195 100% 50% / 0.3)" }}
              />
            </a>
          </div>
        </div>
      </motion.div>

      {/* Floating Arc Reactor Decorations */}
      <motion.div
        className="absolute bottom-20 right-20 z-0 opacity-30 hidden sm:block"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <ArcReactor size={100} />
      </motion.div>

      {/* HUD Lines */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg className="w-full h-full" preserveAspectRatio="none">
          <motion.line
            x1="0"
            y1="50%"
            x2="15%"
            y2="50%"
            stroke="hsl(195 100% 50%)"
            strokeWidth="1"
            strokeDasharray="5,5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          />
          <motion.line
            x1="85%"
            y1="50%"
            x2="100%"
            y2="50%"
            stroke="hsl(195 100% 50%)"
            strokeWidth="1"
            strokeDasharray="5,5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          />
        </svg>
      </div>
    </section>
  );
};
