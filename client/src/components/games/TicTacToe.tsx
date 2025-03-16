import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';

type Player = 'X' | 'O' | null;

export const TicTacToe = () => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [score, setScore] = useState({ X: 0, O: 0 });
  const [announcement, setAnnouncement] = useState('');

  const calculateWinner = (squares: Player[]): Player => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (i: number) => {
    if (board[i] || calculateWinner(board)) return;

    const newBoard = board.slice();
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const winner = calculateWinner(newBoard);
    if (winner) {
      setScore({ ...score, [winner]: score[winner] + 1 });
      setAnnouncement(`Player ${winner} wins!`);
    } else if (newBoard.every(square => square)) {
      setAnnouncement("It's a draw!");
    } else {
      setAnnouncement(`Next player: ${!isXNext ? 'X' : 'O'}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, i: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(i);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setAnnouncement('Game reset. Player X starts.');
  };

  const winner = calculateWinner(board);
  const status = winner 
    ? `Winner: ${winner}` 
    : board.every(square => square) 
    ? "It's a draw!" 
    : `Next player: ${isXNext ? 'X' : 'O'}`;

  return (
    <div 
      className="flex flex-col items-center"
      role="region"
      aria-label="Tic Tac Toe game"
    >
      <div 
        className="mb-4 text-xl font-bold"
        aria-live="polite"
        aria-atomic="true"
      >
        {status}
      </div>
      <div 
        className="grid grid-cols-3 gap-2 mb-4"
        role="grid"
        aria-label="Game board"
      >
        {board.map((square, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleClick(i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            className="w-20 h-20 bg-secondary text-2xl font-bold flex items-center justify-center rounded"
            disabled={!!square || !!winner}
            role="gridcell"
            aria-label={`${square || 'Empty'} cell ${i + 1}`}
            tabIndex={0}
          >
            {square}
          </motion.button>
        ))}
      </div>
      <div 
        className="mb-4"
        aria-live="polite"
      >
        <div>Score:</div>
        <div>X: {score.X} - O: {score.O}</div>
      </div>
      <Button 
        onClick={resetGame}
        aria-label="Reset game"
      >
        Reset Game
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