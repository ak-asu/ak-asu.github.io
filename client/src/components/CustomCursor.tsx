import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { AnimationLevel, getAnimationLevel } from "@/lib/types";

export const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const { animationLevel, isTechnicalMode } = useSelector(
    (state: RootState) => state.mode,
  );

  // Adjust cursor size based on animation level
  const cursorSize = getAnimationLevel(animationLevel, { min: 16, max: 32 });

  useEffect(() => {
    // Show cursor only after component mounts to prevent rendering at position 0,0
    setTimeout(() => setIsVisible(true), 100);

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });

      // Check if cursor is over interactive elements
      const target = e.target as HTMLElement;
      const isInteractive =
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.tagName === "INPUT" ||
        target.closest("button") !== null ||
        target.closest("a") !== null ||
        target.closest('[role="button"]') !== null ||
        target.classList.contains("interactive");

      setIsHovered(isInteractive);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", updateMousePosition);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  // Get animation properties based on animation level
  const getAnimationProps = () => {
    switch (animationLevel) {
      case AnimationLevel.High:
        return {
          transition: {
            type: "spring",
            stiffness: 500,
            damping: 28,
            mass: 0.5,
          },
        };
      case "medium":
        return {
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 20,
          },
        };
      default:
        return {
          transition: {
            duration: 0.1,
          },
        };
    }
  };

  // Don't render if not visible (prevents initial flash at 0,0)
  if (!isVisible) return null;

  return (
    <motion.div
      className="pointer-events-none fixed z-[9999] select-none"
      animate={{
        x: mousePosition.x - cursorSize / 2,
        y: mousePosition.y - cursorSize / 2,
        scale: isHovered ? 1.5 : 1,
      }}
      {...getAnimationProps()}
      style={{
        width: cursorSize,
        height: cursorSize,
        mixBlendMode: "difference",
      }}
    >
      <motion.div
        className="h-full w-full rounded-full"
        style={{
          backgroundColor: isTechnicalMode
            ? "rgb(51, 255, 51)"
            : "rgb(255, 255, 255)",
          opacity: 0.4,
        }}
      />
      <motion.div
        className="absolute top-0 left-0 h-full w-full rounded-full border-2"
        style={{
          borderColor: isTechnicalMode
            ? "rgb(51, 255, 51)"
            : "rgb(255, 255, 255)",
        }}
      />
    </motion.div>
  );
};
