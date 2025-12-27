import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArcReactor } from "./ArcReactor";

const bootSequence = [
  { text: "INITIALIZING SYSTEM...", delay: 0 },
  { text: "LOADING J.A.R.V.I.S. PROTOCOLS...", delay: 400 },
  { text: "SCANNING BIOMETRICS...", delay: 800 },
  { text: "ARC REACTOR: ONLINE", delay: 1200 },
  { text: "WEAPONS SYSTEMS: STANDBY", delay: 1500 },
  { text: "FLIGHT SYSTEMS: CALIBRATED", delay: 1800 },
  { text: "HUD INTERFACE: ACTIVE", delay: 2100 },
  { text: "ALL SYSTEMS OPERATIONAL", delay: 2400 },
];

export const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [currentLine, setCurrentLine] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    // Boot sequence text
    bootSequence.forEach((item, index) => {
      setTimeout(() => {
        setCurrentLine(index + 1);
      }, item.delay);
    });

    // Complete loading
    const completeTimeout = setTimeout(() => {
      setIsComplete(true);
      setTimeout(onComplete, 500);
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Scanlines overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,hsl(var(--arc-blue)/0.1)_2px,hsl(var(--arc-blue)/0.1)_4px)]" />
          </div>

          {/* HUD corners */}
          <div className="absolute top-8 left-8 w-24 h-24 border-l-2 border-t-2 border-iron-red/60" />
          <div className="absolute top-8 right-8 w-24 h-24 border-r-2 border-t-2 border-iron-red/60" />
          <div className="absolute bottom-8 left-8 w-24 h-24 border-l-2 border-b-2 border-iron-red/60" />
          <div className="absolute bottom-8 right-8 w-24 h-24 border-r-2 border-b-2 border-iron-red/60" />

          <div className="flex flex-col items-center gap-8 px-4">
            {/* Arc Reactor */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <ArcReactor size={120} />
            </motion.div>

            {/* Title */}
            <motion.h1
              className="font-orbitron text-3xl md:text-4xl text-iron-gold tracking-[0.3em]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              STARK INDUSTRIES
            </motion.h1>

            {/* Boot sequence terminal */}
            <motion.div
              className="w-full max-w-lg bg-background/80 border border-arc-blue/30 p-4 font-jetbrains text-xs md:text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="space-y-1 h-48 overflow-hidden">
                {bootSequence.slice(0, currentLine).map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-arc-blue">&gt;</span>
                    <span
                      className={
                        index === bootSequence.length - 1 &&
                        currentLine === bootSequence.length
                          ? "text-green-400"
                          : "text-arc-blue/80"
                      }
                    >
                      {item.text}
                    </span>
                    {index === currentLine - 1 && (
                      <motion.span
                        className="inline-block w-2 h-4 bg-arc-blue"
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-arc-blue/60 text-xs">
                  <span>LOADING</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1 bg-arc-blue/20 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-arc-blue to-iron-gold"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Status indicator */}
            <motion.div
              className="flex items-center gap-2 text-arc-blue/60 font-jetbrains text-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-arc-blue"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span>SYSTEM BOOT IN PROGRESS</span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
