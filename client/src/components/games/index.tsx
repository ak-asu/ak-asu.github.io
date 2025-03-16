import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { TicTacToe } from './TicTacToe';
import { Shuffle } from './Shuffle';
import { DinoRun } from './DinoRun';

type Game = {
  id: string;
  component: React.ReactNode;
  title: string;
};

let gameCardHeight = 480; // Adjusted for game card height
const gameCardWidth = 300; // Adjusted for game card width

export const GameCarousel = () => {
  const games: Game[] = [
    { id: 'tictactoe', component: <TicTacToe />, title: 'Tic Tac Toe' },
    { id: 'shuffle', component: <Shuffle />, title: 'Shuffle Memory' },
    { id: 'dinorun', component: <DinoRun />, title: 'Dino Run' },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
    centerX: 0,
    centerY: 0,
    radius: 0,
  });

  // Update dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      if (carouselRef.current) {
        const width = carouselRef.current.offsetWidth;
        const height = carouselRef.current.offsetHeight;
        // Calculate radius for inner circle of an n-sided polygon
        const radius = (gameCardWidth / 2) / Math.tan(Math.PI / games.length);
        const centerX = width / 2;
        const centerY = height + radius;
        gameCardHeight = Math.min(height, gameCardHeight);
        setDimensions({ width, height, centerX, centerY, radius });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const getItemStyles = (index: number) => {
    const totalItems = games.length;
    const angleStep = 360 / totalItems;
    // Angle positions active card at bottom (θ = 90°)
    const th = (angleStep * (index - activeIndex) + 90) % 360;
    const rad = (th * Math.PI) / 180;
    const x = dimensions.centerX + dimensions.radius * Math.cos(rad);
    const innerCircleY = dimensions.centerY;
    const y = innerCircleY - (gameCardHeight + dimensions.radius) * Math.sin(rad);
    // Rotation aligns card's bottom with circle's tangent
    const rotation = th - 90;
    const isActive = index === activeIndex;
    const zIndex = isActive ? 10 : 1; // Active card on top
    return {
      x: x - gameCardWidth / 2,
      y: y,
      rotateZ: rotation,
      zIndex,
      opacity: 1,
      scale: 1,
    };
  };

  const goToGame = (index: number) => {
    const newIndex = index % games.length;
    console.log('newIndex', newIndex)
    setActiveIndex(newIndex);
    controls.start((i) => getItemStyles(i));
  };

  return (
    <div className="w-full h-full">
      {/* Carousel container with overflow-hidden */}
      <div
        ref={carouselRef}
        className="relative w-full h-[480px] overflow-hidden"
        aria-live="polite"
      >
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            custom={index}
            initial={getItemStyles(index)}
            animate={controls}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="absolute top-0 left-0"
            style={{
              width: `${gameCardWidth}px`,
              height: `${gameCardHeight}px`,
              transformOrigin: '50% 100%', // Rotate around bottom center
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              background: 'var(--background)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}
          >
            <div className="w-full h-full overflow-auto p-4">
              <div className="transform-origin-top">
                {game.component}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {/* Navigation buttons */}
      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={() => goToGame(activeIndex - 1)}
          disabled={activeIndex === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => goToGame(activeIndex + 1)}
          disabled={activeIndex === games.length - 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};
