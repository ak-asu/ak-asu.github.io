import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";

type TileColor = "tap" | "avoid" | "neutral";

interface Tile {
  id: number;
  color: TileColor;
  position: number; // Y position from top
}

export const ColorTap = () => {
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [speed, setSpeed] = useState<number>(2000); // Milliseconds between tiles
  const [missedTaps, setMissedTaps] = useState<number>(0);

  const nextTileIdRef = useRef<number>(0);
  const lastTileTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const missedTapTilesRef = useRef<Set<number>>(new Set());

  // Color configuration
  const colors = {
    tap: "bg-green-500 hover:bg-green-600",
    avoid: "bg-red-500 hover:bg-red-600",
    neutral: "bg-blue-400 hover:bg-blue-500",
  };

  const colorLabels = {
    tap: "TAP!",
    avoid: "AVOID!",
    neutral: "—",
  };

  // Generate random tile color with weighted probability
  const generateTileColor = (): TileColor => {
    const rand = Math.random();
    if (rand < 0.45) return "tap"; // 45% chance to tap
    if (rand < 0.75) return "avoid"; // 30% chance to avoid
    return "neutral"; // 25% chance neutral
  };

  // Start or restart game
  const startGame = useCallback(() => {
    setIsGameRunning(true);
    setGameOver(false);
    setScore(0);
    setTiles([]);
    setSpeed(2000);
    setMissedTaps(0);
    missedTapTilesRef.current.clear();
    nextTileIdRef.current = 0;
    lastTileTimeRef.current = Date.now();
  }, []);

  // Handle tile tap
  const handleTileTap = useCallback(
    (tile: Tile) => {
      if (!isGameRunning || gameOver) return;

      if (tile.color === "tap") {
        // Correct tap
        setScore((prev) => prev + 1);
        setTiles((prev) => prev.filter((t) => t.id !== tile.id));
        missedTapTilesRef.current.delete(tile.id);
      } else if (tile.color === "avoid") {
        // Wrong tap - game over
        setGameOver(true);
        setIsGameRunning(false);
        if (score > highScore) {
          setHighScore(score);
        }
      } else {
        // Neutral tap - no penalty, just remove
        setTiles((prev) => prev.filter((t) => t.id !== tile.id));
      }
    },
    [isGameRunning, gameOver, score, highScore],
  );

  // Game loop - spawn tiles
  useEffect(() => {
    if (!isGameRunning || gameOver) return;

    const spawnTile = () => {
      const now = Date.now();
      if (now - lastTileTimeRef.current >= speed) {
        const newTile: Tile = {
          id: nextTileIdRef.current++,
          color: generateTileColor(),
          position: 0,
        };
        setTiles((prev) => [...prev, newTile]);
        lastTileTimeRef.current = now;

        // Track tap tiles that need to be tapped
        if (newTile.color === "tap") {
          missedTapTilesRef.current.add(newTile.id);
        }
      }

      animationFrameRef.current = requestAnimationFrame(spawnTile);
    };

    animationFrameRef.current = requestAnimationFrame(spawnTile);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isGameRunning, gameOver, speed]);

  // Remove tiles that went off screen and check for missed taps
  const handleTileComplete = useCallback(
    (tileId: number, color: TileColor) => {
      setTiles((prev) => prev.filter((t) => t.id !== tileId));

      // Check if this was a tap tile that was missed
      if (
        color === "tap" &&
        missedTapTilesRef.current.has(tileId) &&
        !gameOver
      ) {
        // Missed a tap tile - game over
        setGameOver(true);
        setIsGameRunning(false);
        if (score > highScore) {
          setHighScore(score);
        }
        missedTapTilesRef.current.delete(tileId);
      } else {
        missedTapTilesRef.current.delete(tileId);
      }
    },
    [gameOver, score, highScore],
  );

  // Increase speed based on score
  useEffect(() => {
    if (score > 0 && score % 5 === 0) {
      setSpeed((prev) => Math.max(800, prev - 100)); // Min speed 800ms
    }
  }, [score]);

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem("colorTapHighScore");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // Save high score to localStorage
  useEffect(() => {
    if (score > highScore) {
      localStorage.setItem("colorTapHighScore", score.toString());
    }
  }, [score, highScore]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2">
      {/* Game Info */}
      <div className="w-full flex justify-between items-center mb-2 text-sm">
        <div className="flex flex-col">
          <span className="font-bold text-palette-teal">Score: {score}</span>
          <span className="text-xs text-muted-foreground">
            High: {highScore}
          </span>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div>Speed: {((2000 - speed) / 1200) * 100 + 100}%</div>
        </div>
      </div>

      {/* Game Area */}
      <div
        ref={gameAreaRef}
        className="relative w-full h-[340px] bg-muted/30 rounded-lg border-2 border-border overflow-hidden"
      >
        {/* Instructions / Game Over Overlay */}
        {!isGameRunning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/95 z-20">
            <div className="text-center space-y-4 px-4">
              {gameOver ? (
                <>
                  <h2 className="text-2xl font-bold text-destructive">
                    Game Over!
                  </h2>
                  <p className="text-lg">Final Score: {score}</p>
                  {score === highScore && score > 0 && (
                    <p className="text-sm text-palette-teal font-semibold">
                      🎉 New High Score!
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold">ColorTap</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-8 h-8 bg-green-500 rounded"></div>
                      <span>TAP these tiles!</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-8 h-8 bg-red-500 rounded"></div>
                      <span>DON'T TAP these tiles!</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-8 h-8 bg-blue-400 rounded"></div>
                      <span>Optional (no penalty)</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Speed increases every 5 points
                  </p>
                </>
              )}
              <Button onClick={startGame} variant="default" className="mt-4">
                {gameOver ? "Play Again" : "Start Game"}
              </Button>
            </div>
          </div>
        )}

        {/* Tiles */}
        <AnimatePresence>
          {tiles.map((tile) => (
            <motion.div
              key={tile.id}
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 380, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                y: {
                  duration: 3,
                  ease: "linear",
                },
                opacity: {
                  duration: 0.2,
                },
              }}
              onAnimationComplete={() => handleTileComplete(tile.id, tile.color)}
              onClick={() => handleTileTap(tile)}
              className={`absolute left-1/2 -translate-x-1/2 w-16 h-16 rounded-lg shadow-lg cursor-pointer
                ${colors[tile.color]}
                flex items-center justify-center text-white font-bold text-sm
                transition-transform hover:scale-110 active:scale-95
                border-2 border-white/20
              `}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {colorLabels[tile.color]}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Running indicator */}
        {isGameRunning && !gameOver && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
            Tap green, avoid red!
          </div>
        )}
      </div>

      {/* Color Legend */}
      <div className="w-full mt-2 flex justify-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Tap</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Avoid</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-400 rounded"></div>
          <span>Optional</span>
        </div>
      </div>
    </div>
  );
};
