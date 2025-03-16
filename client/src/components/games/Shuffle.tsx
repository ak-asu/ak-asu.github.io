import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';

type CardType = {
  id: number;
  value: string;
  isFlipped: boolean;
  isTarget: boolean;
  isRevealed: boolean;
}

export const Shuffle = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [gameState, setGameState] = useState<'initial' | 'memorize' | 'flipping' | 'shuffling' | 'playing' | 'won'>('initial');
  const [wins, setWins] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const shuffleTimersRef = useRef<NodeJS.Timeout[]>([]);
  const [swappingCards, setSwappingCards] = useState<[number, number] | null>(null);
  const [shuffleSpeed, setShuffleSpeed] = useState(600); // Initial shuffle speed in ms (slower)
  
  // Initialize or reset the game
  const initializeGame = () => {
    // Clear any existing shuffle timers
    shuffleTimersRef.current.forEach(timer => clearTimeout(timer));
    shuffleTimersRef.current = [];

    // Create array with numbers 1-15 and one random alphabet
    const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const randomAlphabet = alphabets[Math.floor(Math.random() * alphabets.length)];
    const targetPosition = Math.floor(Math.random() * 16);
    
    const newCards: CardType[] = [];
    for (let i = 0; i < 16; i++) {
      newCards.push({
        id: i,
        value: i === targetPosition ? randomAlphabet : String(i + 1),
        isFlipped: true,
        isTarget: i === targetPosition,
        isRevealed: false
      });
    }
    
    setCards(newCards);
    setGameState('memorize');
    setAnnouncement(`Game started. Find the card with letter ${randomAlphabet}.`);
    
    // Longer memorize time (5 seconds) before flipping
    setTimeout(() => {
      // Flip all cards face down
      setCards(prev => prev.map(card => ({ ...card, isFlipped: false })));
      setGameState('flipping');
      setAnnouncement('Cards are flipping...');
    }, 5000);
    
    setTimeout(() => {
      setGameState('shuffling');
      setAnnouncement('Cards are shuffling...');
      performShuffles();
    }, 6000); // 5s for memorizing + 1s for flipping
  };

  // Update shuffle speed based on game outcomes
  useEffect(() => {
    // Skip initial render
    if (gameState === 'initial') return;
    
    // Speed up when winning (min 300ms)
    if (gameState === 'won') {
      setShuffleSpeed(prev => Math.max(300, prev - 50));
    } 
    // Slow down when making mistakes (max 800ms)
    else if (attempts > wins * 2 && attempts > 0) {
      setShuffleSpeed(prev => Math.min(800, prev + 50));
    }
  }, [wins, attempts]);

  // Perform multiple card swaps
  const performShuffles = () => {
    // Do 8-12 random swaps with adjacent cards
    const numSwaps = 8 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < numSwaps; i++) {
      // Schedule each swap with increasing timeouts to create animation
      shuffleTimersRef.current.push(
        setTimeout(() => {
          // Pick a random card
          const idx = Math.floor(Math.random() * 16);
          const row = Math.floor(idx / 4);
          const col = idx % 4;
          
          // Choose a random adjacent direction (up, right, down, left)
          const directions = [
            { dr: -1, dc: 0 }, // up
            { dr: 0, dc: 1 },  // right
            { dr: 1, dc: 0 },  // down
            { dr: 0, dc: -1 }  // left
          ];
          
          // Filter valid directions (that don't go off the board)
          const validDirections = directions.filter(({ dr, dc }) => {
            const newRow = row + dr;
            const newCol = col + dc;
            return newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4;
          });
          
          if (validDirections.length > 0) {
            // Choose a random valid direction
            const { dr, dc } = validDirections[Math.floor(Math.random() * validDirections.length)];
            const newRow = row + dr;
            const newCol = col + dc;
            const newIdx = newRow * 4 + newCol;
            
            // Highlight cards being swapped
            setSwappingCards([idx, newIdx]);
            
            // Swap the cards after a short delay to show the highlight
            setTimeout(() => {
              setCards(prev => {
                const updated = [...prev];
                [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
                return updated;
              });
              
              // Clear the swapping highlight
              setTimeout(() => {
                setSwappingCards(null);
              }, Math.max(100, shuffleSpeed / 3));
            }, Math.max(150, shuffleSpeed / 4));
          }
        }, i * shuffleSpeed) // Using dynamic shuffle speed
      );
    }
    
    // After all swaps are complete, set state to playing
    shuffleTimersRef.current.push(
      setTimeout(() => {
        setGameState('playing');
        setAnnouncement('Find the card with the letter!');
      }, numSwaps * shuffleSpeed + 500) // Additional time after last swap
    );
  };
  
  // Handle card click
  const handleCardClick = (card: CardType) => {
    if (gameState !== 'playing' || card.isRevealed) return;
    
    setAttempts(prev => prev + 1);
    
    // Reveal this card
    setCards(prev => prev.map(c => 
      c.id === card.id ? { ...c, isFlipped: true, isRevealed: true } : c
    ));
    
    // Check if it's the target card
    if (card.isTarget) {
      setWins(prev => prev + 1);
      setGameState('won');
      setAnnouncement('You found it! Congratulations!');
      
      // Reveal all cards
      setTimeout(() => {
        setCards(prev => prev.map(c => ({ ...c, isFlipped: true, isRevealed: true })));
      }, 500);
    } else {
      // If not the target, keep it revealed but announce wrong selection
      setAnnouncement('Try again, that\'s not the letter card!');
    }
  };

  // Format shuffle speed for display (for debugging/info purposes)
  const getShuffleSpeedText = () => {
    if (shuffleSpeed <= 350) return 'Fast';
    if (shuffleSpeed >= 700) return 'Slow';
    return 'Medium';
  };

  // Start the game on initial render
  useEffect(() => {
    initializeGame();
    
    // Cleanup function
    return () => {
      shuffleTimersRef.current.forEach(timer => clearTimeout(timer));
    };
  }, []);

  return (
    <div 
      className="flex flex-col items-center"
      role="region"
      aria-label="Shuffle memory game"
    >
      <div 
        className="mb-4 text-xl font-bold"
        aria-live="polite"
        aria-atomic="true"
      >
        {gameState === 'memorize' && <p>Memorize the cards! (5 seconds)</p>}
        {gameState === 'flipping' && <p>Cards flipping...</p>}
        {gameState === 'shuffling' && <p>Cards shuffling...</p>}
        {gameState === 'playing' && <p>Find the letter card!</p>}
        {gameState === 'won' && <p>You win!</p>}
      </div>
      
      <div 
        className="grid grid-cols-4 gap-2 mb-4"
        role="grid"
        aria-label="Game board"
      >
        {cards.map((card) => (
          <motion.div
            key={card.id}
            className={`w-16 h-16 ${gameState === 'playing' ? 'cursor-pointer' : ''}`}
            onClick={() => handleCardClick(card)}
            role="gridcell"
            aria-label={`Card ${card.id + 1}`}
            tabIndex={gameState === 'playing' ? 0 : -1}
            onKeyPress={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && gameState === 'playing') {
                handleCardClick(card);
              }
            }}
          >
            <motion.div
              className={`relative w-full h-full rounded-md overflow-hidden
                ${swappingCards && (swappingCards[0] === card.id || swappingCards[1] === card.id) 
                  ? 'ring-2 ring-primary shadow-lg' : ''}`}
              animate={{ 
                rotateY: card.isFlipped ? 0 : 180,
                scale: swappingCards && (swappingCards[0] === card.id || swappingCards[1] === card.id) ? 1.1 : 1
              }}
              transition={{ duration: 0.5 }}
            >
              {/* Front of card (showing value only if revealed) */}
              <div 
                className={`absolute w-full h-full flex items-center justify-center 
                  rounded-md text-xl font-bold backface-hidden
                  ${card.isRevealed && card.isTarget ? 'bg-primary' : 'bg-secondary'}`}
              >
                {(card.isRevealed || gameState === 'memorize') && card.value}
              </div>
              
              {/* Back of card */}
              <div 
                className="absolute w-full h-full flex items-center justify-center 
                  bg-gray-400 rounded-md backface-hidden rotate-y-180"
              >
                ?
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
      
      <div className="mb-4">
        <p>Wins: {wins} | Attempts: {attempts} | Difficulty: {getShuffleSpeedText()}</p>
      </div>
      
      <Button 
        onClick={initializeGame}
        aria-label="Start new game"
      >
        New Game
      </Button>
      
      {/* Hidden announcement for screen readers */}
      <div 
        className="sr-only" 
        aria-live="assertive"
        role="status"
      >
        {announcement}
      </div>
    </div>
  );
};
