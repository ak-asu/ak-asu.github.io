import React from "react";
import { motion, AnimationControls } from "framer-motion";
import CurtainSprite from "./CurtainSprite";

interface CurtainProps {
  side: "left" | "right";
  controls: AnimationControls;
}

const Curtain: React.FC<CurtainProps> = ({ side, controls }) => {
  const curtainVariants = {
    closed: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.8,
      },
    },
    open: {
      x: side === "left" ? "-100%" : "100%",
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15,
        duration: 1,
      },
    },
  };

  return (
    <motion.div
      key={`curtain-${side}`}
      custom={side === "left"}
      variants={curtainVariants}
      initial="closed"
      animate={controls}
      className={`
        absolute ${side === "left" ? "left-0" : "right-0"} top-0 w-1/2 h-full z-20 overflow-hidden
        ${
          side === "left"
            ? "bg-gradient-to-r from-palette-teal/40 to-palette-teal-light/30 dark:from-palette-teal-dark/50 dark:to-palette-teal/40"
            : "bg-gradient-to-l from-palette-teal/40 to-palette-teal-light/30 dark:from-palette-teal-dark/50 dark:to-palette-teal/40"
        }
      `}
    >
      <CurtainSprite side={side} />
      <div className='absolute inset-0 bg-[url("/curtain-pattern.png")] bg-repeat'></div>
      <div
        className={`absolute inset-y-0 ${side === "left" ? "right-0" : "left-0"} w-8 shadow-[inset_${side === "left" ? "-" : ""}15px_0_10px_rgba(0,0,0,0.3)] dark:shadow-[inset_${side === "left" ? "-" : ""}15px_0_10px_rgba(0,0,0,0.5)]`}
      ></div>
    </motion.div>
  );
};

export default Curtain;
