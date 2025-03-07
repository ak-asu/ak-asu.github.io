import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import achievements from '@/data/achievements.json';
import Confetti from 'react-confetti';
import useWindowSize from '../../hooks/use-window-size';


const CurtainedAchievements: React.FC = () => {
    const { animationLevel, isTechnicalMode } = useSelector((state: RootState) => state.mode);

    const [isOpen, setIsOpen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [autoScrolling, setAutoScrolling] = useState(true);
    const [userInteracting, setUserInteracting] = useState(false);

    const creditsRef = useRef<HTMLDivElement>(null);
    const curtainContainerRef = useRef<HTMLDivElement>(null);
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

    // Auto-scrolling effect
    useEffect(() => {
        let animationId: number;
        const scrollCredits = () => {
            if (!creditsRef.current || !autoScrolling || userInteracting) return;

            const { scrollHeight, clientHeight, scrollTop } = creditsRef.current;

            // Reset to top when reached bottom
            if (scrollTop >= scrollHeight - clientHeight - 1) {
                creditsRef.current.scrollTop = 0;
            } else {
                creditsRef.current.scrollTop += 1;
            }

            animationId = requestAnimationFrame(scrollCredits);
        };

        if (isOpen && autoScrolling && !userInteracting) {
            animationId = requestAnimationFrame(scrollCredits);
        }

        return () => {
            if (animationId) cancelAnimationFrame(animationId);
        };
    }, [isOpen, autoScrolling, userInteracting]);

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
        if (!userInteracting) {
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
                    ${isTechnicalMode ? 'scrollbar-thumb-green-400 scrollbar-track-gray-800' : 'scrollbar-thumb-blue-400 scrollbar-track-gray-200'}
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
                    ${isTechnicalMode ? 'text-green-400' : 'text-blue-600'}
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
                            ${isTechnicalMode ? 'bg-gray-800 text-green-400' : 'bg-white text-gray-800'}
                        `}
                                    >
                                        <div className="relative w-24 h-24 flex-shrink-0">
                                            {/* {<Image
                                src={achievement.image}
                                alt={achievement.title}
                                fill
                                sizes="(max-width: 768px) 24vw, 96px"
                                style={{ objectFit: "contain" }}
                                className="rounded"
                                priority={false}
                            />} */}
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
                                    ${isTechnicalMode ? 'text-yellow-300' : 'text-amber-600'}
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
                relative w-full h-screen flex items-center justify-center overflow-hidden
                ${isTechnicalMode ? 'bg-gray-900' : 'bg-gray-100'}
            `}
        >
            {/* Confetti celebration effect */}
            {showConfetti && isOpen && (
                <Confetti
                    width={width}
                    height={height}
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
                            ? 'bg-gray-800 text-green-400 border-2 border-green-500'
                            : 'bg-white text-blue-700 border-2 border-blue-500'}
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
                    absolute left-0 top-0 w-1/2 h-full z-20
                    ${isTechnicalMode
                        ? 'bg-gradient-to-r from-gray-900 to-gray-800 border-r border-green-500'
                        : 'bg-gradient-to-r from-blue-700 to-blue-600'}
                `}
            />

            {/* Right Curtain */}
            <motion.div
                custom={false}
                variants={curtainVariants}
                initial="closed"
                animate={rightCurtainControls}
                className={`
                    absolute right-0 top-0 w-1/2 h-full z-20
                    ${isTechnicalMode
                        ? 'bg-gradient-to-l from-gray-900 to-gray-800 border-l border-green-500'
                        : 'bg-gradient-to-l from-blue-700 to-blue-600'}
                `}
            />

            {/* Content behind curtains */}
            <div className={`
                absolute inset-0 z-10 p-4 md:p-8 
                ${isTechnicalMode ? 'bg-gray-900' : 'bg-gray-100'}
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
                                        ${isTechnicalMode ? 'text-green-400' : 'text-blue-700'}
                                    `}>
                                        Achievement Credits
                                    </h2>
                                    <button
                                        onClick={toggleCurtain}
                                        className={`
                                            p-2 rounded-full
                                            ${isTechnicalMode
                                                ? 'bg-gray-800 text-green-400 hover:bg-gray-700'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'}
                                        `}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className={`
                                    h-[calc(100%-3rem)] rounded-lg shadow-lg overflow-hidden
                                    ${isTechnicalMode ? 'bg-black' : 'bg-gray-50'}
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
