import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";

type GameColor = "blue" | "green" | "red";

export const ColorTap = () => {
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [currentColor, setCurrentColor] = useState<GameColor>("blue");
  const [level, setLevel] = useState<number>(1);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestReactionTime, setBestReactionTime] = useState<number | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const colorChangeTimeRef = useRef<number>(0);
  const waitingForTapRef = useRef<boolean>(false);

  // Game parameters that change with difficulty
  const getDelayRange = (level: number): [number, number] => {
    // Initial range: 1000-2000ms, increases by 200ms per level
    const minDelay = 1000 + (level - 1) * 200;
    const maxDelay = 2000 + (level - 1) * 200;
    return [minDelay, Math.min(maxDelay, 5000)]; // Cap at 5 seconds
  };

  const getDisplayTime = (level: number): number => {
    // Starts at 1500ms, decreases by 70ms per level, min 800ms
    return Math.max(800, 1500 - (level - 1) * 70);
  };

  // Get random delay within range
  const getRandomDelay = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Generate random color (50% green, 50% red)
  const getRandomColor = (): "green" | "red" => {
    return Math.random() < 0.5 ? "green" : "red";
  };

  // Start or restart game
  const startGame = useCallback(() => {
    setIsGameRunning(true);
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setCurrentColor("blue");
    setReactionTime(null);
    waitingForTapRef.current = false;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Start first round after a short delay
    timeoutRef.current = setTimeout(() => {
      startRound(1);
    }, 1000);
  }, []);

  // Start a new round
  const startRound = useCallback((currentLevel: number) => {
    const [minDelay, maxDelay] = getDelayRange(currentLevel);
    const delay = getRandomDelay(minDelay, maxDelay);

    // Wait random time, then show green or red
    timeoutRef.current = setTimeout(() => {
      const color = getRandomColor();
      setCurrentColor(color);
      colorChangeTimeRef.current = Date.now();
      waitingForTapRef.current = true;

      // Set timeout for color to return to blue
      const displayTime = getDisplayTime(currentLevel);
      timeoutRef.current = setTimeout(() => {
        if (waitingForTapRef.current) {
          // Time's up
          if (color === "green") {
            // Missed tapping green - game over
            endGame();
          } else {
            // Correctly avoided red - continue
            waitingForTapRef.current = false;
            setCurrentColor("blue");
            setReactionTime(null);
            // Next round with same level
            startRound(currentLevel);
          }
        }
      }, displayTime);
    }, delay);
  }, []);

  // End game
  const endGame = useCallback(() => {
    setGameOver(true);
    setIsGameRunning(false);
    waitingForTapRef.current = false;
    setCurrentColor("blue");

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("colorTapHighScore", score.toString());
    }
  }, [score, highScore]);

  // Handle screen tap
  const handleTap = useCallback(() => {
    if (!isGameRunning || gameOver || !waitingForTapRef.current) return;

    const color = currentColor;

    if (color === "green") {
      // Correct tap on green
      const reaction = Date.now() - colorChangeTimeRef.current;
      setReactionTime(reaction);

      // Update best reaction time
      if (bestReactionTime === null || reaction < bestReactionTime) {
        setBestReactionTime(reaction);
      }

      waitingForTapRef.current = false;

      // Clear the display timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Increase score
      const newScore = score + 1;
      setScore(newScore);

      // Increase level every 5 successful taps
      const newLevel = Math.floor(newScore / 5) + 1;
      setLevel(newLevel);

      // Go back to blue and start next round
      setCurrentColor("blue");

      timeoutRef.current = setTimeout(() => {
        setReactionTime(null);
        startRound(newLevel);
      }, 500);

    } else if (color === "red") {
      // Wrong tap on red - game over
      waitingForTapRef.current = false;
      endGame();
    }
  }, [isGameRunning, gameOver, currentColor, score, bestReactionTime, startRound, endGame]);

  // Load high score and best reaction time from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem("colorTapHighScore");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }

    const savedBestReaction = localStorage.getItem("colorTapBestReaction");
    if (savedBestReaction) {
      setBestReactionTime(parseInt(savedBestReaction, 10));
    }
  }, []);

  // Save best reaction time to localStorage
  useEffect(() => {
    if (bestReactionTime !== null) {
      localStorage.setItem("colorTapBestReaction", bestReactionTime.toString());
    }
  }, [bestReactionTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Color classes for the game area
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
  };

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
        <div className="text-center flex-1">
          <span className="text-xs text-muted-foreground">
            Level: {level}
          </span>
        </div>
        <div className="text-right text-xs text-muted-foreground flex flex-col items-end">
          {reactionTime && (
            <div className="text-palette-teal font-semibold">
              {reactionTime}ms
            </div>
          )}
          {bestReactionTime && (
            <div>Best: {bestReactionTime}ms</div>
          )}
        </div>
      </div>

      {/* Game Area */}
      <motion.div
        onClick={handleTap}
        animate={{
          backgroundColor:
            currentColor === "blue" ? "rgb(59, 130, 246)" :
            currentColor === "green" ? "rgb(34, 197, 94)" :
            "rgb(239, 68, 68)"
        }}
        transition={{ duration: 0.1 }}
        className={`relative w-full h-[340px] rounded-lg border-2 border-border overflow-hidden cursor-pointer
          flex items-center justify-center select-none
        `}
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
                  <p className="text-sm text-muted-foreground">
                    Level Reached: {level}
                  </p>
                  {score === highScore && score > 0 && (
                    <p className="text-sm text-palette-teal font-semibold">
                      New High Score!
                    </p>
                  )}
                  {reactionTime && (
                    <p className="text-xs text-muted-foreground">
                      Last reaction: {reactionTime}ms
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold">ColorTap Reflex</h2>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      Test your reflexes!
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-8 h-8 bg-green-500 rounded"></div>
                        <span>TAP when GREEN</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-8 h-8 bg-red-500 rounded"></div>
                        <span>DON'T TAP when RED</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded"></div>
                        <span>Wait for the color change</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Difficulty increases every 5 points
                  </p>
                </>
              )}
              <Button onClick={startGame} variant="default" className="mt-4">
                {gameOver ? "Play Again" : "Start Game"}
              </Button>
            </div>
          </div>
        )}

        {/* Game running - show current state */}
        {isGameRunning && !gameOver && (
          <div className="text-white text-4xl font-bold drop-shadow-lg">
            {currentColor === "blue" && "Ready..."}
            {currentColor === "green" && "TAP!"}
            {currentColor === "red" && "DON'T TAP!"}
          </div>
        )}
      </motion.div>

      {/* Instructions */}
      <div className="w-full mt-2 text-center text-xs text-muted-foreground">
        {isGameRunning ? (
          <span>Tap the screen when it turns green!</span>
        ) : (
          <span>A simple reflex game - tap green, avoid red</span>
        )}
      </div>
    </div>
  );
};
