import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";

export const DinoRun = () => {
  // Game state
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);
  const [isJumping, setIsJumping] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [gameSpeed, setGameSpeed] = useState<number>(5);
  const [obstacles, setObstacles] = useState<
    { id: number; position: number; height: number }[]
  >([]);
  const [gameOver, setGameOver] = useState<boolean>(false);

  // References for animation frames and game loop
  const requestRef = useRef<number | null>(null);
  const lastObstacleTimeRef = useRef<number>(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const dinoRef = useRef<HTMLDivElement>(null);
  const obstacleIntervalRef = useRef<number>(2000); // Milliseconds between obstacles
  const keyHeldRef = useRef<boolean>(false); // Add a reference to track if a key is being held down

  // Jump mechanics
  const jump = useCallback(() => {
    if (!isJumping && isGameRunning && !gameOver && !keyHeldRef.current) {
      setIsJumping(true);
      keyHeldRef.current = true;

      // Reset jumping state after animation completes
      setTimeout(() => {
        setIsJumping(false);
      }, 500); // Jump duration
    }
  }, [isJumping, isGameRunning, gameOver]);

  // Handle key/touch events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === "Space" || e.key === "ArrowUp") && !gameOver) {
        e.preventDefault();
        if (!isGameRunning) {
          setIsGameRunning(true);
          setGameOver(false);
          setObstacles([]);
          setScore(0);
        } else if (!keyHeldRef.current) {
          jump();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "ArrowUp") {
        keyHeldRef.current = false;
      }
    };

    const handleTouch = () => {
      if (!gameOver) {
        if (!isGameRunning) {
          setIsGameRunning(true);
          setGameOver(false);
          setObstacles([]);
          setScore(0);
        } else if (!keyHeldRef.current) {
          jump();
          // For touch, we'll reset the key held state after the jump animation
          setTimeout(() => {
            keyHeldRef.current = false;
          }, 500);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    document.addEventListener("touchstart", handleTouch);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("touchstart", handleTouch);
    };
  }, [isGameRunning, gameOver, jump]);

  // Check for collisions
  const checkCollision = useCallback(() => {
    if (!dinoRef.current) return false;

    const dinoRect = dinoRef.current.getBoundingClientRect();

    for (const obstacle of obstacles) {
      const obstacleElement = document.getElementById(
        `obstacle-${obstacle.id}`,
      );
      if (obstacleElement) {
        const obstacleRect = obstacleElement.getBoundingClientRect();

        // Check if rectangles overlap
        if (
          !(
            dinoRect.right < obstacleRect.left ||
            dinoRect.left > obstacleRect.right ||
            dinoRect.bottom < obstacleRect.top ||
            dinoRect.top > obstacleRect.bottom
          )
        ) {
          return true;
        }
      }
    }

    return false;
  }, [obstacles]);

  // Main game loop
  const gameLoop = useCallback(
    (timestamp: number) => {
      if (!isGameRunning) return;

      // Update score
      setScore((prevScore) => {
        const newScore = prevScore + 1;
        if (newScore > highScore) {
          setHighScore(newScore);
        }
        return newScore;
      });

      // Increase game speed over time - more gradual increase
      if (score > 0 && score % 1000 === 0) {
        setGameSpeed((prevSpeed) => Math.min(prevSpeed + 0.25, 12));
        obstacleIntervalRef.current = Math.max(
          obstacleIntervalRef.current - 50,
          1200,
        );
      }

      // Generate new obstacles - ensure proper spacing
      if (
        timestamp - lastObstacleTimeRef.current >
        obstacleIntervalRef.current
      ) {
        // Only add a new obstacle if the rightmost obstacle has moved far enough
        const lastObstacle = obstacles[obstacles.length - 1];
        const canAddObstacle = !lastObstacle || lastObstacle.position < 70;

        if (canAddObstacle) {
          lastObstacleTimeRef.current = timestamp;
          // Random height between 25-40 (short enough to jump over)
          const height = Math.floor(Math.random() * 16) + 25;
          // Start exactly at the right edge (0% from right)
          setObstacles((prev) => [
            ...prev,
            { id: Date.now(), position: 0, height },
          ]);
        }
      }

      // Move obstacles from right to left
      setObstacles(
        (prev) =>
          prev
            .map((obstacle) => ({
              ...obstacle,
              position: obstacle.position + gameSpeed / 5,
            }))
            .filter((obstacle) => obstacle.position < 110), // Remove obstacles that have moved past the left edge
      );

      // Check for collisions
      if (checkCollision()) {
        setIsGameRunning(false);
        setGameOver(true);
        return;
      }

      requestRef.current = requestAnimationFrame(gameLoop);
    },
    [isGameRunning, score, highScore, gameSpeed, obstacles, checkCollision],
  );

  // Start/stop game loop
  useEffect(() => {
    if (isGameRunning) {
      requestRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isGameRunning, gameLoop]);

  // Reset game
  const resetGame = () => {
    setIsGameRunning(true);
    setGameOver(false);
    setObstacles([]);
    setScore(0);
    setGameSpeed(5);
    obstacleIntervalRef.current = 2000;
  };

  return (
    <div
      className="flex flex-col items-center w-full"
      role="region"
      aria-label="Dino Run Game"
    >
      <div className="mb-4 space-x-4">
        <span className="text-lg font-bold">Score: {score}</span>
        <span className="text-lg font-bold">High Score: {highScore}</span>
      </div>

      <div
        ref={gameAreaRef}
        className="relative w-full h-48 border-b-2 border-gray-400 bg-white dark:bg-gray-800 overflow-hidden"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === " " || e.key === "ArrowUp") && !isJumping) {
            e.preventDefault();
            jump();
          }
        }}
      >
        {/* Character - simple block */}
        <motion.div
          ref={dinoRef}
          className="absolute bottom-0 left-10 w-6 h-6 bg-black dark:bg-white"
          animate={{
            bottom: isJumping ? "70px" : "0px",
          }}
          transition={{
            type: "tween",
            duration: 0.25,
            ease: "linear",
          }}
          style={{ borderRadius: "2px" }}
          role="img"
          aria-label="Character"
        />

        {/* Obstacles - thin towers */}
        {obstacles.map((obstacle) => (
          <div
            id={`obstacle-${obstacle.id}`}
            key={obstacle.id}
            className="absolute bottom-0 w-3 bg-gray-700 dark:bg-gray-300"
            style={{
              right: `${obstacle.position}%`,
              height: `${obstacle.height}px`,
              borderRadius: "1px",
            }}
            role="img"
            aria-label="Obstacle"
          />
        ))}

        {/* Ground */}
        <div className="absolute bottom-0 w-full h-1 bg-gray-400" />

        {/* Game over overlay */}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-center text-white bg-black p-4 rounded shadow-lg">
              <h2 className="text-2xl font-bold mb-2">Game Over</h2>
              <p className="mb-4">Your Score: {score}</p>
              <Button onClick={resetGame}>Play Again</Button>
            </div>
          </div>
        )}

        {/* Start game prompt */}
        {!isGameRunning && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-4 rounded shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Chrome Dino Run</h2>
              <p className="mb-4">
                Press Space, Up Arrow, or Tap to Start/Jump
              </p>
              <Button onClick={() => setIsGameRunning(true)}>Start Game</Button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>Press Space Bar, Arrow Up, or Tap to jump</p>
      </div>

      {/* Hidden announcement for screen readers */}
      <div className="sr-only" aria-live="assertive" role="status">
        {gameOver
          ? `Game over. Your score is ${score}`
          : isGameRunning
            ? `Game running. Score: ${score}`
            : "Press Space to start"}
      </div>
    </div>
  );
};
