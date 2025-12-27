import { motion } from "framer-motion";

export const HudOverlay = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {/* Scanline effect */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,hsl(var(--arc-blue)/0.3)_2px,hsl(var(--arc-blue)/0.3)_4px)]" />
      </div>

      {/* Corner brackets - Top Left */}
      <div className="absolute top-4 left-4 w-20 h-20">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-arc-blue to-transparent" />
        <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-arc-blue to-transparent" />
        <motion.div
          className="absolute top-2 left-2 text-[10px] font-jetbrains text-arc-blue/60"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          SYS:ONLINE
        </motion.div>
      </div>

      {/* Corner brackets - Top Right */}
      <div className="absolute top-4 right-4 w-20 h-20">
        <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-l from-arc-blue to-transparent" />
        <div className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-arc-blue to-transparent" />
        <motion.div
          className="absolute top-2 right-2 text-[10px] font-jetbrains text-arc-blue/60 text-right"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        >
          J.A.R.V.I.S.
        </motion.div>
      </div>

      {/* Corner brackets - Bottom Left */}
      <div className="absolute bottom-4 left-4 w-20 h-20">
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-arc-blue to-transparent" />
        <div className="absolute bottom-0 left-0 w-[2px] h-full bg-gradient-to-t from-arc-blue to-transparent" />
      </div>

      {/* Corner brackets - Bottom Right */}
      <div className="absolute bottom-4 right-4 w-20 h-20">
        <div className="absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-l from-arc-blue to-transparent" />
        <div className="absolute bottom-0 right-0 w-[2px] h-full bg-gradient-to-t from-arc-blue to-transparent" />
      </div>

      {/* Left side data strip */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-3">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 + 0.5 }}
          >
            <motion.div
              className="w-1 h-1 rounded-full bg-arc-blue"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            />
            <div className="w-8 h-[1px] bg-arc-blue/40" />
          </motion.div>
        ))}
      </div>

      {/* Right side data strip */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-3">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 + 0.5 }}
          >
            <div className="w-8 h-[1px] bg-arc-blue/40" />
            <motion.div
              className="w-1 h-1 rounded-full bg-arc-blue"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            />
          </motion.div>
        ))}
      </div>

      {/* Top center status bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-4">
        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-arc-blue/60" />
        <motion.div
          className="flex items-center gap-2 text-[10px] font-jetbrains text-arc-blue/60"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400/80" />
          <span>STARK INDUSTRIES HUD v3.7</span>
        </motion.div>
        <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-arc-blue/60" />
      </div>

      {/* Bottom center data readout */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-3">
        <motion.div
          className="text-[9px] font-jetbrains text-arc-blue/40 tracking-wider"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          PWR: 100% | SHIELD: ACTIVE | THREAT: NONE
        </motion.div>
      </div>

      {/* Horizontal scan line */}
      <motion.div
        className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-arc-blue/30 to-transparent"
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Circular target reticle - subtle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vmin] h-[60vmin] opacity-[0.03]">
        <div className="absolute inset-0 rounded-full border border-arc-blue" />
        <div className="absolute inset-[15%] rounded-full border border-arc-blue/60" />
        <div className="absolute inset-[30%] rounded-full border border-arc-blue/30" />
        {/* Crosshairs */}
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-arc-blue/20" />
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-arc-blue/20" />
      </div>
    </div>
  );
};
