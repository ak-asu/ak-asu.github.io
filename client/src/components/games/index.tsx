import React, { useState, useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { TicTacToe } from "./TicTacToe";
import { Shuffle } from "./Shuffle";
import { DinoRun } from "./DinoRun";

type Game = {
  id: string;
  component: React.ReactNode;
  title: string;
};

const gameCardHeight = 480;
const gameCardWidth = 300;

export const GameCarousel = () => {
  const games: Game[] = [
    { id: "tictactoe", component: <TicTacToe />, title: "Tic Tac Toe" },
    { id: "shuffle", component: <Shuffle />, title: "Shuffle Memory" },
    { id: "dinorun", component: <DinoRun />, title: "Dino Run" },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [containerWidth, setContainerWidth] = useState(0);

  // Update container width when resized
  useEffect(() => {
    const updateDimensions = () => {
      if (carouselRef.current) {
        setContainerWidth(carouselRef.current.offsetWidth);
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToGame(activeIndex - 1);
      } else if (e.key === "ArrowRight") {
        goToGame(activeIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex]);

  const getItemStyles = (index: number) => {
    const isActive = index === activeIndex;
    // Position items horizontally, centered in container
    const xOffset = (containerWidth - gameCardWidth) / 2;
    const x = xOffset + (index - activeIndex) * containerWidth;

    return {
      x,
      opacity: isActive ? 1 : 0, // Only show active item
      scale: isActive ? 1 : 0.8,
      zIndex: isActive ? 10 : 1,
    };
  };

  const goToGame = (index: number) => {
    if (index < 0 || index >= games.length) return;
    setActiveIndex(index);
    controls.start((i) => getItemStyles(i));
  };

  // Use a more straightforward sizing and positioning approach
  useEffect(() => {
    controls.start((i) => getItemStyles(i));
  }, [containerWidth]);

  return (
    <div className="w-full h-full relative flex justify-center">
      {/* Constrained width container for the carousel */}
      <div className="relative max-w-[400px] w-full h-[480px] flex items-center justify-center">
        {/* Carousel container */}
        <div
          ref={carouselRef}
          className="relative w-full h-full overflow-hidden flex items-center justify-center"
          aria-live="polite"
        >
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              custom={index}
              initial={{ opacity: 0 }}
              animate={{
                x: (index - activeIndex) * containerWidth,
                opacity: index === activeIndex ? 1 : 0,
                scale: index === activeIndex ? 1 : 0.8,
                zIndex: index === activeIndex ? 10 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                restDelta: 0.001,
              }}
              className="absolute"
              style={{
                width: `${gameCardWidth}px`,
                height: `${gameCardHeight}px`,
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                background: "var(--background)",
                border: "1px solid var(--border)",
                overflow: "hidden",
                visibility:
                  Math.abs(index - activeIndex) <= 1 ? "visible" : "hidden",
              }}
            >
              <div className="w-full h-full overflow-auto p-4">
                <h3 className="text-xl font-bold mb-4">{game.title}</h3>
                <div>{game.component}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Left arrow button - improved styling */}
        <button
          onClick={() => goToGame(activeIndex - 1)}
          disabled={activeIndex === 0}
          className="absolute left-[-20px] top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 dark:bg-card/90 shadow-md flex items-center justify-center disabled:opacity-30 z-20 border border-palette-teal/20 text-foreground dark:text-foreground transition-all
            hover:bg-palette-teal/20 hover:text-white hover:border-palette-teal
            focus:bg-palette-teal/30 focus:text-white focus:border-palette-teal
            "
          aria-label="Previous game"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Right arrow button - improved styling */}
        <button
          onClick={() => goToGame(activeIndex + 1)}
          disabled={activeIndex === games.length - 1}
          className="absolute right-[-20px] top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 dark:bg-card/90 shadow-md flex items-center justify-center disabled:opacity-30 z-20 border border-palette-teal/20 text-foreground dark:text-foreground transition-all
            hover:bg-palette-teal/20 hover:text-white hover:border-palette-teal
            focus:bg-palette-teal/30 focus:text-white focus:border-palette-teal
            "
          aria-label="Next game"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {/* Progress indicators */}
        <div className="absolute bottom-[-30px] left-0 right-0 flex justify-center gap-2">
          {games.map((_, index) => (
            <button
              key={index}
              onClick={() => goToGame(index)}
              className={`w-2 h-2 rounded-full border border-palette-teal/30 transition-all duration-200 focus:outline-none
                ${index === activeIndex ? "bg-palette-teal scale-125 ring-2 ring-palette-teal/40" : "bg-muted-foreground/30"}
                hover:bg-palette-teal/70 hover:scale-110 hover:ring-2 hover:ring-palette-teal/40
                focus:bg-palette-teal focus:scale-125 focus:ring-2 focus:ring-palette-teal/60
              `}
              aria-label={`Go to game ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
