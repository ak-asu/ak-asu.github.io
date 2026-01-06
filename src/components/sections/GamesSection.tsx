import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TicTacToe } from "@/components/games/TicTacToe";
import { ColorTap } from "@/components/games/ColorTap";
import { ChevronLeft, ChevronRight, Gamepad2 } from "lucide-react";
import { useAudioSystem } from "@/hooks/useAudioSystem";

const games = [
  {
    id: "tictactoe",
    name: "TIC TAC TOE",
    component: TicTacToe,
    description: "Classic X vs O battle",
  },
  {
    id: "colortap",
    name: "COLOR TAP",
    component: ColorTap,
    description: "Test your reflexes",
  },
];

export const GamesSection = () => {
  const [activeGameIndex, setActiveGameIndex] = useState(0);
  const { playClick, playHover, playWhoosh } = useAudioSystem();

  const nextGame = () => {
    playWhoosh();
    setActiveGameIndex((prev) => (prev + 1) % games.length);
  };

  const prevGame = () => {
    playWhoosh();
    setActiveGameIndex((prev) => (prev - 1 + games.length) % games.length);
  };

  const ActiveGame = games[activeGameIndex].component;

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center px-4 py-16 sm:py-20 md:py-24 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-linear-to-b from-background via-iron-red-dark/20 to-background" />

      {/* Main Arcade Cabinet */}
      <div className="relative z-10 flex flex-col items-center max-w-xl w-full">
        {/* Game Cabinet Frame */}
        <motion.div
          className="relative w-full "
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {/* Outer Frame (reduced) */}
          <div
            className="absolute -inset-1 rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, hsl(44 98% 39%), hsl(44 98% 25%), hsl(44 98% 39%))",
              boxShadow: "0 0 18px hsl(44 98% 39% / 0.35)",
            }}
          />

          {/* Inner Frame (reduced) */}
          <div
            className="absolute -inset-0.5 rounded-xl"
            style={{
              background:
                "linear-gradient(180deg, hsl(0 100% 20%), hsl(0 100% 12%))",
            }}
          />

          {/* Screen */}
          <div
            className="relative rounded-lg p-1 h-110 flex items-center justify-center scanlines"
            style={{
              background:
                "linear-gradient(180deg, hsl(220 30% 8%), hsl(220 35% 5%))",
              border: "2px solid hsl(44 98% 39% / 0.6)",
              boxShadow:
                "inset 0 0 30px hsl(195 100% 50% / 0.08), 0 0 12px hsl(0 0% 0% / 0.45)",
            }}
          >
            {/* Screen Glow Effect */}
            <div
              className="absolute inset-0 rounded-lg opacity-30 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, hsl(195 100% 50% / 0.2) 0%, transparent 70%)",
              }}
            />

            {/* Game Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={games[activeGameIndex].id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="relative z-10 w-full h-full flex items-center justify-center overflow-hidden"
              >
                <ActiveGame />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
        {/* Game Navigation */}
        <motion.div
          className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            onClick={prevGame}
            onMouseEnter={playHover}
            className="p-1 sm:p-1 rounded-md bg-transparent"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-iron-gold" />
          </motion.button>

          <div className="px-2 text-center">
            <div
              className="font-orbitron text-xs sm:text-sm md:text-sm text-arc-blue uppercase tracking-wider"
              style={{ textShadow: "0 0 6px hsl(195 100% 50%)" }}
            >
              {games[activeGameIndex].name}
            </div>
            <div className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">
              {games[activeGameIndex].description}
            </div>
          </div>

          <motion.button
            onClick={nextGame}
            onMouseEnter={playHover}
            className="p-1 sm:p-1 rounded-md bg-transparent"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-iron-gold" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
