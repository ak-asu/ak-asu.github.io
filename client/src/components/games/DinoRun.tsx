import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';

export const DinoRun = () => {
  // Game state
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);
  const [isJumping, setIsJumping] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [gameSpeed, setGameSpeed] = useState<number>(5);
  const [obstacles, setObstacles] = useState<{ id: number; position: number }[]>([]);
  const [gameOver, setGameOver] = useState<boolean>(false);

  // References for animation frames and game loop
  const requestRef = useRef<number | null>(null);
  const lastObstacleTimeRef = useRef<number>(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const dinoRef = useRef<HTMLDivElement>(null);
  const obstacleIntervalRef = useRef<number>(1500); // Milliseconds between obstacles

  // Jump mechanics
  const jump = useCallback(() => {
    if (!isJumping && isGameRunning && !gameOver) {
      setIsJumping(true);
      
      // Reset jumping state after animation completes
      setTimeout(() => {
        setIsJumping(false);
      }, 500); // Jump duration
    }
  }, [isJumping, isGameRunning, gameOver]);

  // Handle key/touch events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.key === 'ArrowUp') && !gameOver) {
        e.preventDefault();
        if (!isGameRunning) {
          setIsGameRunning(true);
          setGameOver(false);
          setObstacles([]);
          setScore(0);
        } else {
          jump();
        }
      }
    };

    const handleTouch = () => {
      if (!gameOver) {
        if (!isGameRunning) {
          setIsGameRunning(true);
          setGameOver(false);
          setObstacles([]);
          setScore(0);
        } else {
          jump();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('touchstart', handleTouch);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('touchstart', handleTouch);
    };
  }, [isGameRunning, gameOver, jump]);

  // Check for collisions
  const checkCollision = useCallback(() => {
    if (!dinoRef.current) return false;
    
    const dinoRect = dinoRef.current.getBoundingClientRect();
    
    for (const obstacle of obstacles) {
      const obstacleElement = document.getElementById(`obstacle-${obstacle.id}`);
      if (obstacleElement) {
        const obstacleRect = obstacleElement.getBoundingClientRect();
        
        // Check if rectangles overlap
        if (!(dinoRect.right < obstacleRect.left || 
              dinoRect.left > obstacleRect.right || 
              dinoRect.bottom < obstacleRect.top || 
              dinoRect.top > obstacleRect.bottom)) {
          return true;
        }
      }
    }
    
    return false;
  }, [obstacles]);

  // Main game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (!isGameRunning) return;

    // Update score
    setScore(prevScore => {
      const newScore = prevScore + 1;
      if (newScore > highScore) {
        setHighScore(newScore);
      }
      return newScore;
    });

    // Increase game speed over time
    if (score > 0 && score % 500 === 0) {
      setGameSpeed(prevSpeed => Math.min(prevSpeed + 0.5, 15));
      obstacleIntervalRef.current = Math.max(obstacleIntervalRef.current - 100, 800);
    }

    // Generate new obstacles
    if (timestamp - lastObstacleTimeRef.current > obstacleIntervalRef.current) {
      lastObstacleTimeRef.current = timestamp;
      setObstacles(prev => [...prev, { id: Date.now(), position: 100 }]);
    }

    // Move obstacles
    setObstacles(prev => 
      prev
        .map(obstacle => ({ ...obstacle, position: obstacle.position - gameSpeed / 10 }))
        .filter(obstacle => obstacle.position > -10) // Remove obstacles that have moved off-screen
    );

    // Check for collisions
    if (checkCollision()) {
      setIsGameRunning(false);
      setGameOver(true);
      return;
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [isGameRunning, score, highScore, gameSpeed, checkCollision]);

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
    obstacleIntervalRef.current = 1500;
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
          if ((e.key === ' ' || e.key === 'ArrowUp') && !isJumping) {
            e.preventDefault();
            jump();
          }
        }}
      >
        {/* Dino character */}
        <motion.div
          ref={dinoRef}
          className="absolute bottom-0 left-10 w-12 h-12 bg-black dark:bg-white"
          animate={{
            bottom: isJumping ? '100px' : '0px'
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 15
          }}
          style={{ borderRadius: '4px' }}
          role="img"
          aria-label="Dinosaur character"
        />

        {/* Obstacles */}
        {obstacles.map(obstacle => (
          <div
            id={`obstacle-${obstacle.id}`}
            key={obstacle.id}
            className="absolute bottom-0 w-6 h-16 bg-green-600"
            style={{ 
              right: `${obstacle.position}%`,
              borderRadius: '2px'
            }}
            role="img"
            aria-label="Cactus obstacle"
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
              <h2 className="text-2xl font-bold mb-4">Dino Run</h2>
              <p className="mb-4">Press Space, Up Arrow, or Tap to Start/Jump</p>
              <Button onClick={() => setIsGameRunning(true)}>Start Game</Button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>Press Space Bar, Arrow Up, or Tap to jump</p>
      </div>

      {/* Hidden announcement for screen readers */}
      <div 
        className="sr-only" 
        aria-live="assertive"
        role="status"
      >
        {gameOver ? `Game over. Your score is ${score}` : isGameRunning ? `Game running. Score: ${score}` : 'Press Space to start'}
      </div>
    </div>
  );
};
