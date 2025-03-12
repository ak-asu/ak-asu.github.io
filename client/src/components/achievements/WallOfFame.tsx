import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Confetti from 'react-confetti';
import useWindowSize from '../../hooks/use-window-size';
import Curtain from './Curtain';
import AchievementCredits from './AchievementCredits';

const WallOfFame: React.FC = () => {
    const { animationLevel, isTechnicalMode } = useSelector((state: RootState) => state.mode);

    const [isOpen, setIsOpen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [userInteracting, setUserInteracting] = useState(false);

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

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Toggle curtain open/closed with optimizations
    const toggleCurtain = useCallback(async () => {
        if (!isOpen) {
            setIsOpen(true);
            setShowConfetti(true);
            await Promise.all([
                leftCurtainControls.start("open"),
                rightCurtainControls.start("open")
            ]);

            // Hide confetti after 3 seconds
            const confettiTimeout = setTimeout(() => {
                setShowConfetti(false);
            }, 3000);

            return () => clearTimeout(confettiTimeout);
        } else {
            await Promise.all([
                leftCurtainControls.start("closed"),
                rightCurtainControls.start("closed")
            ]);
            setIsOpen(false);
            setUserInteracting(false);
        }
    }, [isOpen, leftCurtainControls, rightCurtainControls]);

    const handleUserInteraction = useCallback((isInteracting: boolean) => {
        setUserInteracting(isInteracting);
    }, []);

    return (
        <div
            ref={curtainContainerRef}
            className={`
                relative w-full h-[80vh] flex items-center justify-center overflow-hidden
                rounded-2xl shadow-xl border
                ${isTechnicalMode 
                    ? 'bg-palette-gray-dark border-palette-teal-light/30' 
                    : 'bg-palette-gray-light border-palette-teal/20'}
            `}
        >
            {/* Confetti celebration effect - conditionally rendered */}
            {showConfetti && isOpen && (
                <Confetti
                    width={width}
                    height={height * 0.8}
                    recycle={false}
                    numberOfPieces={animationLevel === 'expert' ? 500 : animationLevel === 'medium' ? 200 : 100}
                />
            )}

            {/* Closed curtain title */}
            {!isOpen && (
                <motion.div
                    className="absolute z-30 cursor-pointer"
                    onClick={toggleCurtain}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <h2 className={`
                        text-4xl md:text-6xl font-extrabold text-center px-8 py-6 rounded-lg shadow-2xl
                        ${isTechnicalMode
                            ? 'bg-palette-gray-dark text-palette-teal-light border-2 border-palette-teal-light'
                            : 'bg-white text-palette-teal border-2 border-palette-teal'}
                    `}>
                        Achievements
                    </h2>
                </motion.div>
            )}

            {/* Curtains */}
            <Curtain side="left" controls={leftCurtainControls} />
            <Curtain side="right" controls={rightCurtainControls} />

            {/* Content behind curtains */}
            <div className={`
                absolute inset-0 z-10 p-4 md:p-8 rounded-2xl
                ${isTechnicalMode ? 'bg-palette-gray-dark' : 'bg-palette-gray-light'}
            `}>
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
                                    <h2 className={`
                                        text-2xl md:text-3xl font-bold
                                        ${isTechnicalMode ? 'text-palette-teal-light' : 'text-palette-teal'}
                                    `}>
                                        Achievement Credits
                                    </h2>
                                    <button
                                        onClick={toggleCurtain}
                                        aria-label="Close achievements"
                                        className={`
                                            p-2 rounded-full
                                            ${isTechnicalMode
                                                ? 'bg-palette-gray-dark text-palette-teal-light hover:bg-[#333333]'
                                                : 'bg-palette-teal text-white hover:bg-palette-teal-light'}
                                        `}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className={`
                                    h-[calc(100%-3rem)] rounded-lg shadow-lg overflow-hidden
                                    ${isTechnicalMode ? 'bg-black' : 'bg-white'}
                                `}>
                                    <AchievementCredits 
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
    );
};

export default WallOfFame;