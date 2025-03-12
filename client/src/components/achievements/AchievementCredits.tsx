import React, { useRef, useEffect, memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import achievements from '@/data/achievements.json';

interface AchievementCreditsProps {
    onUserInteract: (isInteracting: boolean) => void;
    userInteracting: boolean;
}

interface Achievement {
    title: string;
    description: string;
    points: number;
    type: string;
    [key: string]: any;
}

// Memoized achievement item component to prevent unnecessary re-renders
const AchievementItem = memo(({
    achievement,
    index,
    animationLevel
}: {
    achievement: Achievement;
    index: number;
    animationLevel: string;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
            delay: 0.2 * index,
            type: "spring",
            stiffness: animationLevel === 'expert' ? 100 : 50
        }}
        className='p-6 rounded-lg shadow-lg flex flex-col md:flex-row items-center gap-6 bg-white text-palette-gray-dark'
    >
        <div className="relative w-24 h-24 flex-shrink-0">
            {/* Image placeholder */}
        </div>
        <div className="flex-grow text-center md:text-left">
            <h4 className="text-xl font-bold mb-2">{achievement.title}</h4>
            <p className="text-base opacity-90 mb-2">{achievement.description}</p>
            <div className="flex justify-center md:justify-start items-center gap-2">
                <span className="font-semibold">Points:</span>
                <span className='text-lg font-bold text-palette-teal'>
                    {achievement.points}
                </span>
            </div>
        </div>
    </motion.div>
));

AchievementItem.displayName = 'AchievementItem';

// Calculate and memoize grouped achievements
const useGroupedAchievements = () => {
    return React.useMemo(() => {
        return achievements.reduce((acc: Record<string, Achievement[]>, item: Achievement) => {
            const type = item.type || 'other';
            if (!acc[type]) acc[type] = [];
            acc[type].push(item);
            return acc;
        }, {});
    }, []);
};

const AchievementCredits: React.FC<AchievementCreditsProps> = ({
    onUserInteract,
    userInteracting
}) => {
    const { animationLevel } = useSelector((state: RootState) => state.mode);
    const creditsRef = useRef<HTMLDivElement>(null);
    const scrollAnimationRef = useRef<number | null>(null);
    const groupedAchievements = useGroupedAchievements();
    const isScrollingToTopRef = useRef<boolean>(false);
    const [autoScrolling, setAutoScrolling] = React.useState(true);
    const [scrollingToTop, setScrollingToTop] = React.useState(false);

    // Smooth scroll to top function with performance optimizations
    const scrollToTopCallback = useCallback((duration: number = 1500) => {
        if (!creditsRef.current) return;
        // Cancel any existing animation first to prevent conflicts
        if (scrollAnimationRef.current) {
            cancelAnimationFrame(scrollAnimationRef.current);
        }        
        setScrollingToTop(true);
        const startPosition = creditsRef.current.scrollTop;
        const startTime = performance.now();
        // Easing function moved outside the animation loop for better performance
        const easeInOutCubic = (t: number): number =>
            t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const animateScroll = (timestamp: number) => {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeInOutCubic(progress);    
            if (creditsRef.current) {
                creditsRef.current.scrollTop = startPosition * (1 - easedProgress);
            }            
            if (progress < 1) {
                scrollAnimationRef.current = requestAnimationFrame(animateScroll);
            } else {
                // Animation complete
                scrollAnimationRef.current = null;
                setScrollingToTop(false);
                setAutoScrolling(true);
            }
        };        
        // Start the animation
        scrollAnimationRef.current = requestAnimationFrame(animateScroll);
        // This return value will only be used if the component unmounts during animation
        // No need for the timeout as we're already handling completion in the animation loop
        return () => {
            if (scrollAnimationRef.current) {
                cancelAnimationFrame(scrollAnimationRef.current);
                scrollAnimationRef.current = null;
            }
        };
    }, []);

    // Auto-scrolling effect - optimized with requestAnimationFrame
    useEffect(() => {
        setAutoScrolling(!userInteracting)
        let animationId: number;
        let lastTimestamp: number = 0;
        const scrollStep = 1; // pixels per frame

        const scrollCredits = (timestamp: number) => {
            if (!creditsRef.current || !autoScrolling || userInteracting) {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
                animationId = requestAnimationFrame(scrollCredits);
                return;
            }

            const { scrollHeight, clientHeight, scrollTop } = creditsRef.current;

            // Throttle scrolling to improve performance
            if (timestamp - lastTimestamp > 16) { // ~60fps
                lastTimestamp = timestamp;

                // Check if we've reached the bottom and not already in the process of scrolling to top
                if (scrollTop >= scrollHeight - clientHeight - 1 && !scrollingToTop && !isScrollingToTopRef.current) {
                    isScrollingToTopRef.current = true;

                    // Scroll back to top smoothly
                    scrollToTopCallback();

                    // Reset flag after the scrolling animation completes
                    setTimeout(() => {
                        isScrollingToTopRef.current = false;
                    }, 1500); // Match the duration of the scrollToTop function
                } else if (!scrollingToTop && !isScrollingToTopRef.current) {
                    // Only perform normal scroll if we're not already scrolling to top
                    creditsRef.current.scrollTop += scrollStep;
                }
            }

            animationId = requestAnimationFrame(scrollCredits);
        };

        // Start the animation
        animationId = requestAnimationFrame(scrollCredits);

        return () => {
            if (animationId) cancelAnimationFrame(animationId);
        };
    }, [autoScrolling, userInteracting, scrollingToTop, scrollToTopCallback]);

    // Clean up any animations on unmount
    useEffect(() => {
        return () => {
            if (scrollAnimationRef.current) {
                cancelAnimationFrame(scrollAnimationRef.current);
            }
        };
    }, []);

    // Handle scroll interaction with debounce
    const handleScroll = React.useCallback(() => {
        if (!userInteracting && !scrollingToTop) {
            onUserInteract(true);
        }
    }, [onUserInteract, userInteracting, scrollingToTop]);

    // Event handlers with debounced reset
    const handleInteractionStart = React.useCallback(() => {
        onUserInteract(true);
    }, [onUserInteract]);

    const handleInteractionEnd = React.useCallback(() => {
        setTimeout(() => onUserInteract(false), 3000);
    }, [onUserInteract]);

    return (
        <div
            ref={creditsRef}
            className='h-full overflow-y-auto px-6 py-8 scrollbar-thin scrollbar-thumb-palette-teal scrollbar-track-palette-gray-light'
            onWheel={handleScroll}
            onTouchStart={handleInteractionStart}
            onTouchEnd={handleInteractionEnd}
            onMouseDown={handleInteractionStart}
            onMouseUp={handleInteractionEnd}
        >
            <div className="space-y-16 pb-32">
                {Object.entries(groupedAchievements).map(([category, items]) => (
                    <div key={category} className="mb-12">
                        <motion.h3
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className='text-2xl font-bold mb-6 text-center capitalize text-palette-teal'>
                            {category}
                        </motion.h3>

                        <div className="space-y-10">
                            {items.map((achievement, index) => (
                                <AchievementItem
                                    key={`${category}-${index}`}
                                    achievement={achievement}
                                    index={index}
                                    animationLevel={animationLevel}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default memo(AchievementCredits);
