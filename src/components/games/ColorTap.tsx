import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioSystem } from "@/hooks/useAudioSystem";

const COLORS = [
  { name: "RED", bg: "hsl(0 100% 24%)", text: "hsl(0 100% 50%)" },
  { name: "GOLD", bg: "hsl(44 98% 30%)", text: "hsl(44 98% 50%)" },
  { name: "BLUE", bg: "hsl(195 100% 30%)", text: "hsl(195 100% 50%)" },
  { name: "GREEN", bg: "hsl(120 70% 25%)", text: "hsl(120 70% 50%)" },
];

type GameState = "idle" | "playing" | "ended";

export const ColorTap = () => {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [targetColor, setTargetColor] = useState(COLORS[0]);
  const [displayedColor, setDisplayedColor] = useState(COLORS[0]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const timerRef = useRef<number | null>(null);
  const scoreRef = useRef<number>(score);
  const { playClick, playSuccess, playBeep, playPowerUp } = useAudioSystem();

  const generateRound = useCallback(() => {
    const randomTarget = COLORS[Math.floor(Math.random() * COLORS.length)];
    const randomDisplay = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTargetColor(randomTarget);
    setDisplayedColor(randomDisplay);
  }, []);

  const startGame = () => {
    playPowerUp();
    setGameState("playing");
    setScore(0);
    setTimeLeft(30);
    generateRound();
  };

  const handleColorClick = (colorName: string) => {
    if (gameState !== "playing") return;

    // The trick: match the TARGET color name, not what color the text is displayed in
    if (colorName === targetColor.name) {
      playSuccess();
      setScore((prev) => prev + 1);
      setFeedback("correct");
    } else {
      playBeep();
      setScore((prev) => Math.max(0, prev - 1));
      setFeedback("wrong");
    }

    setTimeout(() => setFeedback(null), 200);
    generateRound();
  };

  useEffect(() => {
    if (gameState === "playing") {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Update high score using latest score from ref, then end game
            setHighScore((hs) => Math.max(hs, scoreRef.current));
            setGameState("ended");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState]);

  useEffect(() => {
    // keep scoreRef current for use inside interval callbacks
    scoreRef.current = score;
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      {/* Score & Timer */}
      <div className="flex items-center justify-between w-full gap-4">
        <div className="iron-panel p-2 flex-1 text-center">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Score
          </div>
          <div
            className="font-orbitron text-xl text-arc-blue"
            style={{ textShadow: "0 0 10px hsl(195 100% 50%)" }}
          >
            {score}
          </div>
        </div>
        <div className="iron-panel p-2 flex-1 text-center">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Time
          </div>
          <div
            className={`font-orbitron text-xl ${timeLeft <= 10 ? "text-iron-red-light animate-pulse" : "text-iron-gold"}`}
          >
            {timeLeft}s
          </div>
        </div>
        <div className="iron-panel p-2 flex-1 text-center">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Best
          </div>
          <div className="font-orbitron text-xl text-iron-gold">
            {highScore}
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div
        className={`
          relative w-full aspect-square max-w-xs rounded-xl flex items-center justify-center
          transition-all duration-200
          ${feedback === "correct" ? "ring-4 ring-green-500" : ""}
          ${feedback === "wrong" ? "ring-4 ring-red-500" : ""}
        `}
        style={{
          background:
            "linear-gradient(135deg, hsl(0 100% 15% / 0.5), hsl(220 30% 8% / 0.8))",
          border: "3px solid hsl(44 98% 39% / 0.5)",
          boxShadow:
            "0 0 30px hsl(0 100% 24% / 0.3), inset 0 0 30px hsl(0 0% 0% / 0.5)",
        }}
      >
        <AnimatePresence mode="wait">
          {gameState === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center p-6"
            >
              <h3 className="font-orbitron text-xl text-iron-gold mb-4">
                COLOR TAP
              </h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Tap the color that matches the{" "}
                <span className="text-arc-blue">WORD</span>, not the text color!
              </p>
              <motion.button
                onClick={startGame}
                className="btn-arc"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                START GAME
              </motion.button>
            </motion.div>
          )}

          {gameState === "playing" && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="mb-2 text-xs text-muted-foreground uppercase tracking-wider">
                Tap the color:
              </div>
              <motion.div
                key={`${targetColor.name}-${displayedColor.name}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="font-orbitron text-5xl font-bold"
                style={{
                  color: displayedColor.text,
                  textShadow: `0 0 20px ${displayedColor.text}`,
                }}
              >
                {targetColor.name}
              </motion.div>
            </motion.div>
          )}

          {gameState === "ended" && (
            <motion.div
              key="ended"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center p-6"
            >
              <h3 className="font-orbitron text-xl text-iron-gold mb-2">
                GAME OVER
              </h3>
              <div
                className="font-orbitron text-4xl text-arc-blue mb-2"
                style={{ textShadow: "0 0 15px hsl(195 100% 50%)" }}
              >
                {score}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {score >= highScore && score > 0
                  ? "NEW HIGH SCORE!"
                  : "Points Scored"}
              </p>
              <motion.button
                onClick={startGame}
                className="btn-arc"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                PLAY AGAIN
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Color Buttons */}
      {gameState === "playing" && (
        <motion.div
          className="grid grid-cols-4 gap-3 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {COLORS.map((color) => (
            <motion.button
              key={color.name}
              onClick={() => handleColorClick(color.name)}
              className="aspect-square rounded-lg font-orbitron text-xs font-bold uppercase transition-all"
              style={{
                background: color.bg,
                border: `2px solid ${color.text}`,
                color: color.text,
                boxShadow: `0 0 15px ${color.bg}`,
              }}
              whileHover={{ scale: 1.1, boxShadow: `0 0 25px ${color.text}` }}
              whileTap={{ scale: 0.9 }}
            >
              {color.name}
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
};
