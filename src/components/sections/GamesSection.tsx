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
    <section className="relative h-full w-full flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-iron-red-dark/20 to-background" />

      {/* Decorative Grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--iron-gold) / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--iron-gold) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Main Arcade Cabinet */}
      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full">
        {/* Arcade Header */}
        <motion.div
          className="iron-panel px-8 py-4 mb-6 flex items-center gap-4"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Gamepad2
            className="w-6 h-6 text-arc-blue"
            style={{ filter: "drop-shadow(0 0 8px hsl(195 100% 50%))" }}
          />
          <h2 className="font-orbitron text-2xl md:text-3xl gold-text uppercase tracking-wider">
            Games Arcade
          </h2>
          <div
            className="w-2 h-2 rounded-full bg-arc-blue animate-pulse"
            style={{ boxShadow: "0 0 10px hsl(195 100% 50%)" }}
          />
        </motion.div>

        {/* Game Navigation */}
        <motion.div
          className="flex items-center gap-4 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            onClick={prevGame}
            onMouseEnter={playHover}
            className="iron-panel p-3 hover:bg-iron-red/50 transition-colors"
            whileHover={{
              scale: 1.1,
              boxShadow: "0 0 20px hsl(195 100% 50% / 0.4)",
            }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-6 h-6 text-iron-gold" />
          </motion.button>

          <div className="iron-panel px-6 py-3 min-w-[200px] text-center">
            <div
              className="font-orbitron text-lg text-arc-blue uppercase tracking-wider"
              style={{ textShadow: "0 0 10px hsl(195 100% 50%)" }}
            >
              {games[activeGameIndex].name}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {games[activeGameIndex].description}
            </div>
          </div>

          <motion.button
            onClick={nextGame}
            onMouseEnter={playHover}
            className="iron-panel p-3 hover:bg-iron-red/50 transition-colors"
            whileHover={{
              scale: 1.1,
              boxShadow: "0 0 20px hsl(195 100% 50% / 0.4)",
            }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-6 h-6 text-iron-gold" />
          </motion.button>
        </motion.div>

        {/* Game Dots Indicator */}
        <div className="flex gap-2 mb-6">
          {games.map((game, index) => (
            <motion.button
              key={game.id}
              onClick={() => {
                playClick();
                setActiveGameIndex(index);
              }}
              onMouseEnter={playHover}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === activeGameIndex
                  ? "bg-arc-blue"
                  : "bg-iron-gold/40 hover:bg-iron-gold"
              }`}
              style={
                index === activeGameIndex
                  ? { boxShadow: "0 0 10px hsl(195 100% 50%)" }
                  : {}
              }
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>

        {/* Game Cabinet Frame */}
        <motion.div
          className="relative w-full"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {/* Outer Frame */}
          <div
            className="absolute -inset-3 rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, hsl(44 98% 39%), hsl(44 98% 25%), hsl(44 98% 39%))",
              boxShadow: "0 0 30px hsl(44 98% 39% / 0.4)",
            }}
          />

          {/* Inner Frame */}
          <div
            className="absolute -inset-1 rounded-xl"
            style={{
              background:
                "linear-gradient(180deg, hsl(0 100% 20%), hsl(0 100% 12%))",
            }}
          />

          {/* Screen */}
          <div
            className="relative rounded-lg p-8 min-h-[450px] flex items-center justify-center scanlines"
            style={{
              background:
                "linear-gradient(180deg, hsl(220 30% 8%), hsl(220 35% 5%))",
              border: "3px solid hsl(44 98% 39% / 0.6)",
              boxShadow:
                "inset 0 0 50px hsl(195 100% 50% / 0.1), 0 0 20px hsl(0 0% 0% / 0.5)",
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
                className="relative z-10 w-full flex justify-center"
              >
                <ActiveGame />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Cabinet Bottom Decoration */}
          <div className="flex justify-center gap-4 mt-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full"
                style={{
                  background: i === 1 ? "hsl(195 100% 50%)" : "hsl(44 98% 39%)",
                  boxShadow:
                    i === 1
                      ? "0 0 10px hsl(195 100% 50%)"
                      : "0 0 5px hsl(44 98% 39%)",
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
