import { useState, useRef, useEffect } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { TicTacToe } from './TicTacToe';
import { Shuffle } from './Shuffle';
import { DinoRun } from './DinoRun';

type Game = {
  id: string;
  component: React.ReactNode;
  title: string;
};

export const GameCarousel = () => {
  // List of available games
  const games: Game[] = [
    { id: 'tictactoe', component: <TicTacToe />, title: 'Tic Tac Toe' },
    { id: 'shuffle', component: <Shuffle />, title: 'Shuffle Memory' },
    { id: 'dinorun', component: <DinoRun />, title: 'Dino Run' }
  ];

  const [activeIndex, setActiveIndex] = useState(1); // Start with middle game (Shuffle)
  const [dragStartX, setDragStartX] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  // Calculate carousel dimensions
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
    centerX: 0,
    centerY: 0,
    radius: 0
  });

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (carouselRef.current) {
        const width = carouselRef.current.offsetWidth;
        const height = carouselRef.current.offsetHeight;
        setDimensions({
          width,
          height,
          centerX: width / 2,
          centerY: height - 100, // Position center point at bottom to show only upper half
          radius: Math.min(width, height) * 0.55 // Larger radius for semi-circle
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Calculate positions and opacity for each game
  const getItemStyles = (index: number) => {
    const totalItems = games.length;
    
    // Calculate angle based on active index (semi-circle)
    const angleStep = Math.PI / (totalItems - 1); // Distribute items across 180 degrees (π radians)
    
    // Map active index to the middle of the semi-circle
    const middleIndex = Math.floor(totalItems / 2);
    const shiftedIndex = index - activeIndex + middleIndex;
    
    // Keep index within bounds
    const normalizedIndex = Math.max(0, Math.min(shiftedIndex, totalItems - 1));
    
    // Calculate angle for semi-circle (from 0 to π)
    const angle = Math.PI * normalizedIndex / (totalItems - 1);
    
    // Calculate position on semi-circle (upper half)
    const x = dimensions.centerX + Math.cos(angle) * dimensions.radius - 150; // Adjust for item width
    const y = dimensions.centerY - Math.sin(angle) * dimensions.radius; // Only upper half (negative sin)
    
    // Calculate opacity and scale based on position
    // Items at bottom (active) have full opacity
    const distance = Math.abs(index - activeIndex);
    const maxDistance = Math.floor(totalItems / 2);
    const opacity = Math.max(1 - (distance * 0.5) / maxDistance, 0.3);
    const scale = Math.max(1 - (distance * 0.15), 0.8);
    
    // Items in center should have higher z-index
    const zIndex = totalItems - distance;
    
    // If item is completely out of range, hide it
    const isVisible = normalizedIndex >= 0 && normalizedIndex < totalItems;
    
    return {
      x,
      y,
      opacity: isVisible ? opacity : 0,
      scale,
      zIndex,
      // Rotate items to match arc position
      rotateZ: (angle - Math.PI/2) * 20, // Rotate based on position in arc
      display: isVisible ? 'block' : 'none'
    };
  };

  // Handle dragging with improved rotation
  const handleDragStart = (_: any, info: PanInfo) => {
    setDragStartX(info.point.x);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const dragEndX = info.point.x;
    const dragDelta = dragEndX - dragStartX;
    
    // If drag distance is significant, change active index
    if (Math.abs(dragDelta) > 50) {
      if (dragDelta > 0 && activeIndex > 0) {
        // Dragged right - go to previous item
        setActiveIndex(activeIndex - 1);
      } else if (dragDelta < 0 && activeIndex < games.length - 1) {
        // Dragged left - go to next item
        setActiveIndex(activeIndex + 1);
      }
    }
    
    // Animate to final position
    controls.start(i => getItemStyles(i));
  };

  // More responsive drag behavior
  const handleDrag = (_: any, info: PanInfo) => {
    const dragDelta = info.offset.x;
    const dragAmount = dragDelta / 100; // Convert pixel drag to rotation amount
    
    // Apply a temporary visual rotation based on drag amount
    controls.start(i => {
      const baseStyle = getItemStyles(i);
      return {
        ...baseStyle,
        x: baseStyle.x - dragAmount * 15,
        rotateZ: baseStyle.rotateZ + dragAmount * 3
      };
    });
  };

  // Handle navigation with buttons
  const goToGame = (index: number) => {
    if (index >= 0 && index < games.length) {
      setActiveIndex(index);
      controls.start(i => getItemStyles(i));
    }
  };

  return (
    <div className="w-full h-full px-4 py-8">
      <h2 className="text-xl font-semibold text-center mb-4">
        {games[activeIndex].title}
      </h2>
      
      {/* Carousel container - configured for upper half circle */}
      <div 
        ref={carouselRef}
        className="relative w-full h-[550px] overflow-visible"
        aria-live="polite"
      >
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            custom={index}
            initial={getItemStyles(index)}
            animate={controls}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            className="absolute top-0 left-0 w-[300px] h-[500px] origin-center cursor-grab active:cursor-grabbing"
            style={{
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              background: 'var(--background)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              transformStyle: 'preserve-3d',
              perspective: '1000px'
            }}
          >
            <div className="w-full h-full overflow-auto p-4">
              <div className="scale-[0.85] transform-origin-top">
                {game.component}
              </div>
            </div>
            {/* Display title on hover for non-active items */}
            {index !== activeIndex && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity duration-300"
              >
                <h3 className="text-white text-xl font-bold">{game.title}</h3>
              </div>
            )}
          </motion.div>
        ))}
        
        {/* Active item indicator at bottom center */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
          {games.map((game, index) => (
            <button
              key={`dot-${game.id}`}
              className={`w-3 h-3 rounded-full ${
                index === activeIndex ? 'bg-primary' : 'bg-gray-300'
              }`}
              onClick={() => goToGame(index)}
              aria-label={`Go to ${game.title}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
