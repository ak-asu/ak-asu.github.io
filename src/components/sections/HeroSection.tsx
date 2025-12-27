import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import heroImage from "@/assets/hero-ironman.png";
import { ArcReactor } from "@/components/ui/ArcReactor";

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
        <div className="absolute inset-0 bg-gradient-to-br from-iron-red-dark via-background to-iron-red-dark/50" />

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

      {/* Large "IRON MAN" Background Text */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none"
        style={{ x: bgX, y: bgY }}
      >
        <h1 className="font-orbitron text-[15vw] font-black text-iron-gold/5 select-none tracking-wider">
          IRON MAN
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
          alt="Iron Man Mark 42"
          className="max-h-[70vh] w-auto object-contain drop-shadow-2xl"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ filter: "drop-shadow(0 0 30px hsl(195 100% 50% / 0.3))" }}
        />
      </motion.div>

      {/* Left Text Content */}
      <motion.div
        className="absolute left-8 md:left-16 lg:left-24 top-1/2 -translate-y-1/2 z-20"
        style={{ x: textX, y: textY }}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <motion.p
          className="text-iron-gold text-lg md:text-xl font-rajdhani italic mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Hey,
        </motion.p>
        <motion.p
          className="text-iron-gold text-xl md:text-2xl font-rajdhani italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          I'm <span className="text-foreground font-semibold">Tony Stark</span>{" "}
          AKA
        </motion.p>
        <motion.p
          className="text-arc-blue text-2xl md:text-3xl font-rajdhani italic font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{ textShadow: "0 0 20px hsl(195 100% 50% / 0.5)" }}
        >
          Iron Man
        </motion.p>
      </motion.div>

      {/* Right Content - Status Indicators */}
      <motion.div
        className="absolute right-8 md:right-16 lg:right-24 top-1/2 -translate-y-1/2 z-20 flex flex-col items-end gap-6"
        style={{
          x: useTransform(smoothMouseX, [-0.5, 0.5], [-15, 15]),
          y: textY,
        }}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        {/* Identity Verified Badge */}
        <motion.div
          className="flex items-center gap-2 px-4 py-2 glass-panel rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <span className="text-iron-gold text-xs font-orbitron uppercase">
            Identity Verified
          </span>
          <div className="w-5 h-5 rounded-full bg-arc-blue/20 border border-arc-blue flex items-center justify-center">
            <svg
              className="w-3 h-3 text-arc-blue"
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

        {/* System Online Badge */}
        <motion.div
          className="flex items-center gap-2 px-4 py-2 glass-panel rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          <div
            className="w-2 h-2 rounded-full bg-arc-blue animate-pulse"
            style={{ boxShadow: "0 0 10px hsl(195 100% 50%)" }}
          />
          <span className="text-arc-blue text-xs font-orbitron uppercase">
            System Online
          </span>
        </motion.div>

        {/* Role Text */}
        <motion.div
          className="text-right mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          <p className="text-foreground text-xl md:text-2xl font-rajdhani">
            Digital Designer
          </p>
          <p className="text-iron-gold text-lg md:text-xl font-rajdhani">
            & Illustrator
          </p>
        </motion.div>
      </motion.div>

      {/* Bottom System Status */}
      <motion.div
        className="absolute bottom-8 left-8 md:left-16 flex items-center gap-3 z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
      >
        <div className="w-2 h-2 rounded-full bg-arc-blue animate-pulse" />
        <span className="text-arc-blue text-xs font-orbitron uppercase tracking-wider">
          System Online
        </span>
        <div className="h-px w-20 bg-gradient-to-r from-arc-blue to-transparent" />
      </motion.div>

      {/* Floating Arc Reactor Decorations */}
      <motion.div
        className="absolute bottom-20 right-20 z-0 opacity-30"
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
