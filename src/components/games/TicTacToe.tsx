import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useAudioSystem } from "@/hooks/useAudioSystem";

type Player = "X" | "O" | null;
type Board = Player[];

const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // Rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // Columns
  [0, 4, 8],
  [2, 4, 6], // Diagonals
];

export const TicTacToe = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<Player | "draw" | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const { playClick, playSuccess, playBeep } = useAudioSystem();

  const checkWinner = useCallback((newBoard: Board): Player | "draw" | null => {
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (
        newBoard[a] &&
        newBoard[a] === newBoard[b] &&
        newBoard[a] === newBoard[c]
      ) {
        setWinningLine(combo);
        return newBoard[a];
      }
    }
    if (newBoard.every((cell) => cell !== null)) {
      return "draw";
    }
    return null;
  }, []);

  const handleClick = (index: number) => {
    if (board[index] || winner) return;

    playClick();
    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      if (gameWinner !== "draw") playSuccess();
    } else {
      setIsXNext(!isXNext);
    }
  };

  const resetGame = () => {
    playBeep();
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine(null);
  };

  const renderCell = (index: number) => {
    const value = board[index];
    const isWinningCell = winningLine?.includes(index);

    return (
      <motion.button
        key={index}
        onClick={() => handleClick(index)}
        className={`
          relative w-20 h-20 rounded-lg font-orbitron text-3xl font-bold
          border-2 transition-all duration-300
          ${
            isWinningCell
              ? "border-arc-blue bg-arc-blue/20"
              : "border-iron-gold/50 bg-iron-red-dark/50 hover:border-arc-blue hover:bg-iron-red/30"
          }
          ${!value && !winner ? "cursor-pointer" : "cursor-default"}
        `}
        style={
          isWinningCell ? { boxShadow: "0 0 20px hsl(195 100% 50% / 0.5)" } : {}
        }
        whileHover={!value && !winner ? { scale: 1.05 } : {}}
        whileTap={!value && !winner ? { scale: 0.95 } : {}}
      >
        {value && (
          <motion.span
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className={value === "X" ? "text-arc-blue" : "text-iron-gold"}
            style={{
              textShadow:
                value === "X"
                  ? "0 0 15px hsl(195 100% 50%)"
                  : "0 0 15px hsl(44 98% 39%)",
            }}
          >
            {value}
          </motion.span>
        )}
      </motion.button>
    );
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Status Display */}
      <div className="iron-panel px-6 py-3">
        <span className="font-orbitron text-lg uppercase tracking-wider">
          {winner === "draw" ? (
            <span className="text-iron-gold">DRAW - NO WINNER</span>
          ) : winner ? (
            <span
              className="text-arc-blue"
              style={{ textShadow: "0 0 10px hsl(195 100% 50%)" }}
            >
              PLAYER {winner} WINS!
            </span>
          ) : (
            <span className="text-foreground">
              Player{" "}
              <span className={isXNext ? "text-arc-blue" : "text-iron-gold"}>
                {isXNext ? "X" : "O"}
              </span>
              's Turn
            </span>
          )}
        </span>
      </div>

      {/* Game Board */}
      <div
        className="grid grid-cols-3 gap-2 p-4 rounded-xl"
        style={{
          background:
            "linear-gradient(135deg, hsl(0 100% 15% / 0.5), hsl(220 30% 8% / 0.8))",
          border: "2px solid hsl(44 98% 39% / 0.5)",
          boxShadow:
            "0 0 30px hsl(0 100% 24% / 0.3), inset 0 0 20px hsl(0 0% 0% / 0.5)",
        }}
      >
        {board.map((_, index) => renderCell(index))}
      </div>

      {/* Reset Button */}
      <motion.button
        onClick={resetGame}
        className="btn-arc"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {winner ? "PLAY AGAIN" : "RESET GAME"}
      </motion.button>
    </div>
  );
};
