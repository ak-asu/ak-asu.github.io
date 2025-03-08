import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import achievements from '@/data/achievements.json';
import Confetti from 'react-confetti';
import useWindowSize from '../../hooks/use-window-size';

// Curtain sprite component
const CurtainSprite: React.FC<{side: 'left' | 'right', isTechnicalMode: boolean}> = ({ side, isTechnicalMode }) => {
    const spriteCount = 8; // Number of sprite elements
    
    return (
        <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: spriteCount }).map((_, index) => (
                <div 
                    key={index}
                    className={`
                        absolute top-0 h-full w-1
                        ${side === 'left' ? 'left-0' : 'right-0'}
                        ${isTechnicalMode ? 'bg-palette-teal-light/20' : 'bg-white/20'}
                    `}
                    style={{
                        left: side === 'left' ? `${(index + 1) * (100 / (spriteCount + 2))}%` : undefined,
                        right: side === 'right' ? `${(index + 1) * (100 / (spriteCount + 2))}%` : undefined,
                        height: '100%',
                        boxShadow: isTechnicalMode 
                            ? '0 0 15px rgba(115, 211, 231, 0.4)' 
                            : '0 0 15px rgba(255, 255, 255, 0.4)'
                    }}
                />
            ))}
        </div>
    );
};

const CurtainedAchievements: React.FC = () => {
    const { animationLevel, isTechnicalMode } = useSelector((state: RootState) => state.mode);

    const [isOpen, setIsOpen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [autoScrolling, setAutoScrolling] = useState(true);
    const [userInteracting, setUserInteracting] = useState(false);
    const [scrollingToTop, setScrollingToTop] = useState(false);

    const creditsRef = useRef<HTMLDivElement>(null);
    const curtainContainerRef = useRef<HTMLDivElement>(null);
    const scrollAnimationRef = useRef<number | null>(null);
    const { width, height } = useWindowSize();

    const leftCurtainControls = useAnimation();
    const rightCurtainControls = useAnimation();

    // Animation variants
    const curtainVariants = {
        closed: (isLeft: boolean) => ({
            x: isLeft ? 0 : 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 20,
                duration: 0.8
            }
        }),
        open: (isLeft: boolean) => ({
            x: isLeft ? '-100%' : '100%',
            transition: {
                type: "spring",
                stiffness: 80,
                damping: 15,
                duration: 1
            }
        })
    };

    // Smooth scroll to top function
    const scrollToTop = (duration: number = 1500) => {
        if (!creditsRef.current) return;
        
        setScrollingToTop(true);
        
        const startPosition = creditsRef.current.scrollTop;
        const startTime = performance.now();
        
        const animateScroll = (timestamp: number) => {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth deceleration and acceleration
            const easeInOutCubic = (t: number): number => 
                t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            
            const easedProgress = easeInOutCubic(progress);
            
            if (creditsRef.current) {
                creditsRef.current.scrollTop = startPosition * (1 - easedProgress);
            }
            
            if (progress < 1) {
                scrollAnimationRef.current = requestAnimationFrame(animateScroll);
            } else {
                setScrollingToTop(false);
                setAutoScrolling(true);
            }
        };
        
        scrollAnimationRef.current = requestAnimationFrame(animateScroll);
    };

    // Clean up any animations on unmount
    useEffect(() => {
        return () => {
            if (scrollAnimationRef.current) {
                cancelAnimationFrame(scrollAnimationRef.current);
            }
        };
    }, []);

    // Auto-scrolling effect
    useEffect(() => {
        let animationId: number;
        const scrollCredits = () => {
            if (!creditsRef.current || !autoScrolling || userInteracting || scrollingToTop) return;

            const { scrollHeight, clientHeight, scrollTop } = creditsRef.current;
            
            // Check if we've reached the bottom
            if (scrollTop >= scrollHeight - clientHeight - 1) {
                // Cancel the current animation
                if (animationId) cancelAnimationFrame(animationId);
                
                // Scroll back to top smoothly
                scrollToTop();
            } else {
                // Normal scrolling behavior
                creditsRef.current.scrollTop += 1;
                animationId = requestAnimationFrame(scrollCredits);
            }
        };

        if (isOpen && autoScrolling && !userInteracting && !scrollingToTop) {
            animationId = requestAnimationFrame(scrollCredits);
        }

        return () => {
            if (animationId) cancelAnimationFrame(animationId);
        };
    }, [isOpen, autoScrolling, userInteracting, scrollingToTop]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isOpen &&
                curtainContainerRef.current &&
                !curtainContainerRef.current.contains(event.target as Node)
            ) {
                setUserInteracting(false);
                setAutoScrolling(true);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Toggle curtain open/closed
    const toggleCurtain = async () => {
        if (!isOpen) {
            setIsOpen(true);
            setShowConfetti(true);
            await Promise.all([
                leftCurtainControls.start("open"),
                rightCurtainControls.start("open")
            ]);

            // Hide confetti after 3 seconds
            setTimeout(() => {
                setShowConfetti(false);
            }, 3000);
        } else {
            await Promise.all([
                leftCurtainControls.start("closed"),
                rightCurtainControls.start("closed")
            ]);
            setIsOpen(false);
            setAutoScrolling(true);
            setUserInteracting(false);
        }
    };

    // Handle scroll interaction
    const handleScroll = () => {
        if (!userInteracting && !scrollingToTop) {
            setUserInteracting(true);
            setAutoScrolling(false);
        }
    };

    // Render all achievements in a credit-roll style
    const renderAchievementCredits = () => {
        return (
            <div
                ref={creditsRef}
                className={`
                    h-full overflow-y-auto px-6 py-8 scrollbar-thin
                    ${isTechnicalMode ? 'scrollbar-thumb-palette-slate scrollbar-track-palette-gray-dark' : 'scrollbar-thumb-palette-teal scrollbar-track-palette-gray-light'}
                `}
                onWheel={handleScroll}
                onTouchStart={() => setUserInteracting(true)}
                onTouchEnd={() => setTimeout(() => setUserInteracting(false), 3000)}
                onMouseDown={() => setUserInteracting(true)}
                onMouseUp={() => setTimeout(() => setUserInteracting(false), 3000)}
            >
                <div className="space-y-16 pb-32">
                    {/* Update the code to handle the achievements array structure correctly */}
                    {Object.entries(
                        // Group achievements by type
                        achievements.reduce((acc: Record<string, any[]>, item: any) => {
                            const type = item.type || 'other';
                            if (!acc[type]) acc[type] = [];
                            acc[type].push(item);
                            return acc;
                        }, {})
                    ).map(([category, items]) => (
                        <div key={category} className="mb-12">
                            <motion.h3
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className={`
                    text-2xl font-bold mb-6 text-center capitalize
                    ${isTechnicalMode ? 'text-palette-teal-light' : 'text-palette-teal'}
                `}
                            >
                                {category}
                            </motion.h3>

                            <div className="space-y-10">
                                {items.map((achievement, index) => (
                                    <motion.div
                                        key={`${category}-${index}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            delay: 0.2 * index,
                                            type: "spring",
                                            stiffness: animationLevel === 'expert' ? 100 : 50
                                        }}
                                        className={`
                            p-6 rounded-lg shadow-lg flex flex-col md:flex-row items-center gap-6
                            ${isTechnicalMode ? 'bg-palette-gray-dark text-palette-teal-light' : 'bg-white text-palette-gray-dark'}
                        `}
                                    >
                                        <div className="relative w-24 h-24 flex-shrink-0">
                                            {/* Image placeholder */}
                                        </div>
                                        <div className="flex-grow text-center md:text-left">
                                            <h4 className="text-xl font-bold mb-2">{achievement.title}</h4>
                                            <p className="text-base opacity-90 mb-2">{achievement.description}</p>
                                            <div className="flex justify-center md:justify-start items-center gap-2">
                                                <span className="font-semibold">
                                                    Points:
                                                </span>
                                                <span className={`
                                    text-lg font-bold
                                    ${isTechnicalMode ? 'text-palette-teal-light' : 'text-palette-teal'}
                                `}>
                                                    {achievement.points}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

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
            {/* Confetti celebration effect */}
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

            {/* Left Curtain */}
            <motion.div
                custom={true}
                variants={curtainVariants}
                initial="closed"
                animate={leftCurtainControls}
                className={`
                    absolute left-0 top-0 w-1/2 h-full z-20 overflow-hidden
                    ${isTechnicalMode
                        ? 'bg-gradient-to-r from-palette-gray-dark to-[#333333] border-r border-palette-teal-light'
                        : 'bg-gradient-to-r from-palette-teal to-palette-teal-light'}
                `}
            >
                <CurtainSprite side="left" isTechnicalMode={isTechnicalMode} />
                <div className={`
                    absolute inset-0 
                    ${isTechnicalMode 
                        ? 'bg-[url("/curtain-pattern-dark.png")] opacity-10' 
                        : 'bg-[url("/curtain-pattern.png")] opacity-20'}
                    bg-repeat
                `}></div>
                <div className="absolute inset-y-0 right-0 w-8 shadow-[inset_-15px_0_10px_rgba(0,0,0,0.3)]"></div>
            </motion.div>

            {/* Right Curtain */}
            <motion.div
                custom={false}
                variants={curtainVariants}
                initial="closed"
                animate={rightCurtainControls}
                className={`
                    absolute right-0 top-0 w-1/2 h-full z-20 overflow-hidden
                    ${isTechnicalMode
                        ? 'bg-gradient-to-l from-palette-gray-dark to-[#333333] border-l border-palette-teal-light'
                        : 'bg-gradient-to-l from-palette-teal to-palette-teal-light'}
                `}
            >
                <CurtainSprite side="right" isTechnicalMode={isTechnicalMode} />
                <div className={`
                    absolute inset-0
                    ${isTechnicalMode 
                        ? 'bg-[url("/curtain-pattern-dark.png")] opacity-10' 
                        : 'bg-[url("/curtain-pattern.png")] opacity-20'}
                    bg-repeat
                `}></div>
                <div className="absolute inset-y-0 left-0 w-8 shadow-[inset_15px_0_10px_rgba(0,0,0,0.3)]"></div>
            </motion.div>

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
                                    {renderAchievementCredits()}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CurtainedAchievements;