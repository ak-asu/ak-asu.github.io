import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Volume2, VolumeX, Sun, Music } from "lucide-react";
import { ArcReactor } from "./ArcReactor";
import { useAudioSystem } from "@/hooks/useAudioSystem";

export const ModeToggle = () => {
  const {
    viewMode,
    toggleViewMode,
    soundEnabled,
    toggleSound,
    animationLevel,
    setAnimationLevel,
  } = useAppStore();
  const { playToggle, playClick } = useAudioSystem();

  return (
    <motion.div
      className="fixed top-24 right-6 z-50 flex flex-col gap-3"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      {/* Mode Toggle Switch */}
      <div className="relative flex items-center bg-gradient-to-r from-iron-red-dark via-iron-red to-iron-red-dark border-2 border-iron-gold rounded-full p-1 shadow-gold">
        {/* Toggle Options */}
        <button
          onClick={() => {
            if (viewMode !== "terminal") {
              playToggle();
              toggleViewMode();
            }
          }}
          className={`relative z-10 px-3 py-1.5 font-orbitron text-[10px] uppercase tracking-wider transition-colors duration-300 ${
            viewMode === "terminal" ? "text-foreground" : "text-iron-gold/50"
          }`}
        >
          Terminal
        </button>

        {/* Arc Reactor Center */}
        <div className="relative z-20 mx-1">
          <ArcReactor size={28} />
        </div>

        <button
          onClick={() => {
            if (viewMode !== "visual") {
              playToggle();
              toggleViewMode();
            }
          }}
          className={`relative z-10 px-3 py-1.5 font-orbitron text-[10px] uppercase tracking-wider transition-colors duration-300 ${
            viewMode === "visual" ? "text-foreground" : "text-iron-gold/50"
          }`}
        >
          Visual 3D
        </button>

        {/* Sliding Background */}
        <motion.div
          className="absolute top-1 bottom-1 w-[45%] bg-arc-blue/20 border border-arc-blue/50 rounded-full"
          animate={{
            x: viewMode === "terminal" ? 4 : "calc(100% - 4px)",
            left: viewMode === "terminal" ? 0 : "auto",
            right: viewMode === "visual" ? 0 : "auto",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ boxShadow: "0 0 10px hsl(195 100% 50% / 0.3)" }}
        />
      </div>

      {/* Control Buttons Row */}
      <div className="flex items-center justify-center gap-2">
        {/* Sound Toggle */}
        <motion.button
          onClick={() => {
            playClick();
            toggleSound();
          }}
          className={`p-2 rounded-lg border transition-all duration-300 ${
            soundEnabled
              ? "border-arc-blue bg-arc-blue/20 text-arc-blue shadow-arc"
              : "border-iron-gold/50 bg-iron-red-dark text-iron-gold/50 hover:border-iron-gold hover:text-iron-gold"
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title={soundEnabled ? "Sound & Music ON" : "Sound & Music OFF"}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </motion.button>

        {/* Music indicator */}
        <motion.div
          className={`p-2 rounded-lg border transition-all duration-300 ${
            soundEnabled
              ? "border-arc-blue/50 bg-arc-blue/10 text-arc-blue"
              : "border-iron-gold/30 bg-iron-red-dark/50 text-iron-gold/30"
          }`}
          animate={soundEnabled ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Music size={16} />
        </motion.div>
      </div>

      {/* Animation Level Dropdown */}
      <div className="glass-panel rounded-lg p-2">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="font-orbitron text-[9px] uppercase text-iron-gold">
            Animation
          </span>
          <span className="font-orbitron text-[9px] uppercase text-arc-blue">
            {animationLevel}
          </span>
        </div>
        <div className="flex gap-1">
          {(["low", "medium", "high"] as const).map((level) => (
            <button
              key={level}
              onClick={() => setAnimationLevel(level)}
              className={`flex-1 py-1 px-2 rounded text-[8px] uppercase font-orbitron transition-all duration-300 ${
                animationLevel === level
                  ? "bg-arc-blue/30 text-arc-blue border border-arc-blue/50"
                  : "bg-iron-red-dark/50 text-iron-gold/50 hover:text-iron-gold"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
