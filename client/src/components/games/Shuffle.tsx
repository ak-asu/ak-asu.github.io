import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';

type CardType = {
  id: number;
  value: string;
  isFlipped: boolean;
  isTarget: boolean;
}

export const Shuffle = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [gameState, setGameState] = useState<'initial' | 'memorize' | 'flipping' | 'shuffling' | 'playing' | 'won'>('initial');
  const [wins, setWins] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const shuffleTimersRef = useRef<NodeJS.Timeout[]>([]);

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
        isTarget: i === targetPosition
      });
    }
    
    setCards(newCards);
    setGameState('memorize');
    setAnnouncement(`Game started. Find the card with letter ${randomAlphabet}.`);
    
    // Schedule the next states
    setTimeout(() => {
      setGameState('flipping');
      setAnnouncement('Cards are flipping...');
    }, 3000);
    
    setTimeout(() => {
      setGameState('shuffling');
      setAnnouncement('Cards are shuffling...');
      performShuffles();
    }, 4000); // 3s for memorizing + 1s for flipping
  };

  // Perform multiple card swaps
  const performShuffles = () => {
    // Initial cards state
    let currentCards = [...cards];
    
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
            
            // Swap the cards
            setCards(prev => {
              const updated = [...prev];
              [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
              return updated;
            });
          }
        }, i * 500) // Each swap takes 0.5 seconds
      );
    }
    
    // After all swaps are complete, set state to playing
    shuffleTimersRef.current.push(
      setTimeout(() => {
        setGameState('playing');
        setAnnouncement('Find the card with the letter!');
      }, numSwaps * 500 + 500) // Additional time after last swap
    );
  };
  
  // Handle card click
  const handleCardClick = (card: CardType) => {
    if (gameState !== 'playing') return;
    
    setAttempts(prev => prev + 1);
    
    // Flip the card temporarily
    setCards(prev => prev.map(c => 
      c.id === card.id ? { ...c, isFlipped: true } : c
    ));
    
    // Check if it's the target card
    if (card.isTarget) {
      setWins(prev => prev + 1);
      setGameState('won');
      setAnnouncement('You found it! Congratulations!');
      
      // Reveal all cards
      setTimeout(() => {
        setCards(prev => prev.map(c => ({ ...c, isFlipped: true })));
      }, 500);
    } else {
      // If not the target, flip back after a short delay
      setTimeout(() => {
        setCards(prev => prev.map(c => 
          c.id === card.id ? { ...c, isFlipped: false } : c
        ));
        setAnnouncement('Try again, that\'s not the letter card!');
      }, 1000);
    }
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
        {gameState === 'memorize' && <p>Memorize the cards! (3 seconds)</p>}
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
            className="w-16 h-16 cursor-pointer"
            onClick={() => gameState === 'playing' && handleCardClick(card)}
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
              className="relative w-full h-full"
              animate={{ rotateY: card.isFlipped ? 0 : 180 }}
              transition={{ duration: 0.5 }}
            >
              {/* Front of card (showing value) */}
              <div 
                className={`absolute w-full h-full flex items-center justify-center 
                  rounded-md text-xl font-bold backface-hidden
                  ${card.isTarget ? 'bg-primary' : 'bg-secondary'}`}
              >
                {card.value}
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
        <p>Wins: {wins} | Attempts: {attempts}</p>
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
