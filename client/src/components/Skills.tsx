import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import skillsData from '@/data/skills.json';
import Image from 'next/image';
import { Tooltip } from '@/components/ui/tooltip';

interface Skill {
    name: string;
    level: string;
    icon: string;
}

const levelToPercentage = (level: string): number => {
    switch (level.toLowerCase()) {
        case 'beginner': return 25;
        case 'intermediate': return 60;
        case 'advanced': return 85;
        case 'expert': return 95;
        default: return 50;
    }
};

const Skills: React.FC = () => {
    const isTechnicalMode = useSelector((state: RootState) => state.mode.isTechnicalMode);
    const animationLevel = useSelector((state: RootState) => 
        state.mode.animationLevel || 'medium');
    
    const containerRef = useRef<HTMLDivElement>(null);
    const controls = useAnimation();
    const [isPaused, setIsPaused] = useState(false);
    const x = useMotionValue(0);
    const dragX = useMotionValue(0);
    const dragging = useRef(false);

    // Flatten all skills into a single array and duplicate to ensure seamless scrolling
    const allSkills = [
        ...Object.values(skillsData).flat(),
        ...Object.values(skillsData).flat(),
    ];

    useEffect(() => {
        if (isPaused) return;

        const animateScroll = async () => {
            while (!isPaused) {
                await controls.start({
                    x: [0, -50 * allSkills.length / 2],
                    transition: {
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: animationLevel === 'expert' ? 30 : animationLevel === 'medium' ? 45 : 60,
                            ease: "linear"
                        }
                    }
                });
            }
        };

        animateScroll();

        return () => {
            controls.stop();
        };
    }, [isPaused, controls, allSkills.length, animationLevel]);

    const handleDragStart = () => {
        setIsPaused(true);
        dragging.current = true;
    };

    const handleDragEnd = () => {
        setIsPaused(false);
        dragging.current = false;
    };

    const handleMouseDown = () => {
        setIsPaused(true);
    };

    const handleMouseUp = () => {
        if (!dragging.current) {
            setIsPaused(false);
        }
    };

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    // Determine render style based on mode
    const SkillIcon: React.FC<{ skill: Skill, index: number }> = ({ skill, index }) => {
        const proficiency = levelToPercentage(skill.level);
        const yOffset = index % 2 === 0 ? -20 : 20; // Create zig-zag pattern
        
        return (
            <motion.div 
                className="relative mx-6 my-4"
                initial={{ y: yOffset }}
                style={{ y: yOffset }}
                whileHover={{ 
                    scale: 1.2, 
                    transition: { duration: 0.2 } 
                }}
            >
                <Tooltip content={`${skill.name} - ${skill.level} (${proficiency}%)`}>
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full overflow-hidden bg-gray-300">
                            {/* Colored progress circle */}
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                <circle 
                                    cx="50" 
                                    cy="50" 
                                    r="45" 
                                    fill="none" 
                                    stroke={isTechnicalMode ? "#3ddc84" : "#4299e1"} 
                                    strokeWidth="10"
                                    strokeDasharray={`${proficiency * 2.83} ${283 - proficiency * 2.83}`}
                                    strokeDashoffset="70" // Start from top
                                    transform="rotate(-90 50 50)"
                                />
                            </svg>
                        </div>
                        
                        {/* Skill icon */}
                        <div className="absolute inset-0 flex items-center justify-center p-3">
                            <Image 
                                src={`/icons/${skill.icon}`} 
                                alt={skill.name}
                                width={40}
                                height={40}
                            />
                        </div>
                    </div>
                </Tooltip>
            </motion.div>
        );
    };

    return (
        <div 
            className="w-full overflow-hidden py-12 bg-opacity-50 relative"
            ref={containerRef}
            onMouseDown={handleMouseDown}
        >
            <h2 className={`text-3xl font-bold mb-8 text-center ${
                isTechnicalMode ? 'text-green-400' : 'text-indigo-600'
            }`}>
                Skills & Technologies
            </h2>

            <motion.div
                className="flex items-center"
                animate={controls}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                style={{ x }}
            >
                <div className="flex items-center">
                    {allSkills.map((skill, index) => (
                        <SkillIcon key={`${skill.name}-${index}`} skill={skill} index={index} />
                    ))}
                </div>
            </motion.div>

            {/* Technical mode overlay */}
            {isTechnicalMode && (
                <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-xs text-green-400 font-mono p-2 rounded">
                    <code>
                        {isPaused ? '[ Animation: PAUSED ]' : '[ Animation: RUNNING ]'}
                    </code>
                </div>
            )}
        </div>
    );
};

export default Skills