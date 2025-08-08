import React, { useEffect, useRef } from "react";

interface MatrixRainProps {
  isDarkMode: boolean;
}

const MatrixRain: React.FC<MatrixRainProps> = ({ isDarkMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$+-*/><{}[]";
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }
    const draw = () => {
      // Semi-transparent background to create fade effect - adjust based on theme
      ctx.fillStyle = isDarkMode
        ? "rgba(0, 0, 0, 0.05)"
        : "rgba(185, 199, 210, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Set text color based on theme
      ctx.fillStyle = isDarkMode ? "#1791a3" : "#0f5f6b";
      ctx.font = `${fontSize}px monospace`;
      // Loop over each drop
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        // Reset drop when it reaches bottom
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        // Move drop
        drops[i]++;
      }
    };
    const interval = setInterval(draw, 70);
    return () => {
      clearInterval(interval);
    };
  }, [isDarkMode]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none"
    />
  );
};

export default MatrixRain;
