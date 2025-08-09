import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Confetti from "react-confetti";
import useWindowSize from "../../hooks/use-window-size";
import Curtain from "./Curtain";
import AchievementInfo from "./AchievementInfo";
import { getAnimationLevel, AnimationLevel } from "@/lib/types";
import { Medal } from "lucide-react";

const WallOfFame: React.FC = () => {
  const { animationLevel } = useSelector((state: RootState) => state.mode);
  const [isOpen, setIsOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [userInteracting, setUserInteracting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const curtainContainerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useWindowSize();
  const leftCurtainControls = useAnimation();
  const rightCurtainControls = useAnimation();

  // Click outside handler with event delegation
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        curtainContainerRef.current &&
        !curtainContainerRef.current.contains(event.target as Node)
      ) {
        setUserInteracting(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleCurtain = useCallback(async () => {
    if (!isOpen) {
      setIsOpen(true);
      // Only show confetti if animation level is not Low
      if (animationLevel !== AnimationLevel.Low) {
        setShowConfetti(true);
      }
      setIsHovered(false);
      await Promise.all([
        leftCurtainControls.start("open"),
        rightCurtainControls.start("open"),
      ]);
      if (animationLevel !== AnimationLevel.Low) {
        const confettiTimeout = setTimeout(() => {
          setShowConfetti(false);
        }, 3000);
        return () => clearTimeout(confettiTimeout);
      }
    } else {
      await Promise.all([
        leftCurtainControls.start("closed"),
        rightCurtainControls.start("closed"),
      ]);
      setIsOpen(false);
      setUserInteracting(false);
    }
  }, [isOpen, leftCurtainControls, rightCurtainControls, animationLevel]);

  const handleUserInteraction = useCallback((isInteracting: boolean) => {
    setUserInteracting(isInteracting);
  }, []);

  return (
    <>
      {/* Render confetti outside main container to avoid overflow clipping */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Confetti
            width={width}
            height={height * 0.8}
            recycle={false}
            numberOfPieces={getAnimationLevel(animationLevel, {
              min: 100,
              max: 500,
            })}
            confettiSource={{
              x: width / 2,
              y: height / 3,
              w: 0,
              h: 0,
            }}
          />
        </div>
      )}
      <div
        ref={curtainContainerRef}
        className="relative w-full h-[72vh] flex items-center justify-center overflow-hidden
                rounded-2xl shadow-xl border bg-card border-palette-teal/20 dark:border-palette-teal/10"
      >
        {!isOpen && (
          <motion.div
            className="absolute z-30 cursor-pointer rounded-full"
            onClick={toggleCurtain}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            <h2
              className={`flex items-center justify-center text-4xl md:text-6xl font-extrabold rounded-full w-20 h-20 md:w-28 md:h-28
                bg-card text-palette-teal shadow-2xl relative ${isHovered ? "animated-border" : "border-2 border-palette-teal"}`}
            >
              <Medal size={40} />
              {isHovered && (
                <span className="absolute inset-0 rounded-full border-2 animate-border-spin" />
              )}
            </h2>
          </motion.div>
        )}
        <Curtain side="left" controls={leftCurtainControls} />
        <Curtain side="right" controls={rightCurtainControls} />
        <div className="absolute inset-0 z-10 p-4 md:p-8 rounded-2xl bg-background">
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <div className="w-full h-full overflow-hidden">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-palette-teal">
                      Achievement Credits
                    </h2>
                    <button
                      onClick={toggleCurtain}
                      aria-label="Close achievements"
                      className="p-2 rounded-full bg-palette-teal text-white hover:bg-palette-teal-light"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="h-[calc(100%-3rem)] rounded-lg shadow-lg overflow-hidden bg-card">
                    <AchievementInfo
                      onUserInteract={handleUserInteraction}
                      userInteracting={userInteracting}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default WallOfFame;
