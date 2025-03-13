import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useMotionValue } from 'framer-motion';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import skillsData from '@/data/skills.json';
import { Slider } from '@/components/ui/slider';
import { Pause, Play } from 'lucide-react';
import MatrixRain from './MatrixRain';
import SkillIcon from './SkillIcon';
import { AnimationStyle, Skill } from './utils';

const Skills: React.FC = () => {
    const isTechnicalMode = useSelector((state: RootState) => state.mode.isTechnicalMode);
    const animationLevel = useSelector((state: RootState) => state.mode.animationLevel);
    
    const isDarkMode = true;

    const containerRef = useRef<HTMLDivElement>(null);
    const controls = useAnimation();
    const [isPaused, setIsPaused] = useState(false);
    const x = useMotionValue(0);
    const dragging = useRef(false);
    const [speed, setSpeed] = useState(animationLevel === 'expert' ? 30 : animationLevel === 'basic' ? 60 : 45);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [animationStyle, setAnimationStyle] = useState<AnimationStyle>('linear');
    const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
    const [isOverlayHovered, setIsOverlayHovered] = useState(false);

    // Get all unique categories
    const categories = Array.from(
        new Set(
            Object.values(skillsData)
                .flat()
                .map(skill => (skill as Skill).category || 'Other')
        )
    );

    // Filter skills by category if selected
    const filteredSkills = selectedCategory 
        ? Object.values(skillsData).flat().filter((skill: Skill) => (skill.category || 'Other') === selectedCategory)
        : Object.values(skillsData).flat();

    // Duplicate to ensure seamless scrolling
    const allSkills = [...filteredSkills, ...filteredSkills];

    // Get easing function based on selected animation style
    const getAnimationEasing = (): string | number[] => {
        switch (animationStyle) {
            case 'easeInOut': return 'easeInOut';
            case 'bounce': return [0.6, -0.05, 0.01, 0.99];
            case 'spring': return 'spring';
            case 'linear':
            default: return 'linear';
        }
    };

    // Calculate animation duration based on speed
    const getAnimationDuration = () => {
        return speed; // Direct mapping to speed value (30-60)
    };

    useEffect(() => {
        if (isPaused || animationStyle === 'none' || hoveredIcon !== null) {
            controls.stop();
            return;
        }

        const animateScroll = async () => {
            await controls.start({
                x: [0, -50 * allSkills.length / 2],
                transition: {
                    x: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: getAnimationDuration(),
                        ease: getAnimationEasing(),
                    }
                }
            });
        };

        animateScroll();

        return () => {
            controls.stop();
        };
    }, [isPaused, controls, allSkills.length, speed, animationStyle, hoveredIcon]);

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

    // Update color variables based on both technical mode and theme
    const primaryColor = isTechnicalMode 
        ? "#3ddc84" 
        : isDarkMode ? "#73d3e7" : "#1791a3";
        
    const bgColor = isTechnicalMode 
        ? "bg-black" 
        : isDarkMode ? "bg-gray-900" : "bg-gray-50";
        
    const darkBgColor = isTechnicalMode 
        ? "bg-gray-900" 
        : isDarkMode ? "bg-gray-800" : "bg-gray-200";
        
    const textColor = isTechnicalMode 
        ? "text-green-400" 
        : isDarkMode ? "text-palette-teal-light" : "text-palette-teal-DEFAULT";
        
    const borderColor = isTechnicalMode 
        ? "border-green-400" 
        : isDarkMode ? "border-palette-teal-light" : "border-palette-teal-DEFAULT";

    // Function to get button style based on selection
    const getButtonStyle = (currentStyle: string, selectedStyle: string) => {
        return currentStyle === selectedStyle
            ? `bg-palette-teal-DEFAULT text-white`
            : `${darkBgColor} bg-opacity-50`;
    };

    return (
        <div 
            className={`w-full overflow-hidden py-12 relative ${bgColor} min-h-[340px] 
                       border-2 ${borderColor} rounded-xl shadow-lg mx-auto max-w-[95%]
                       my-10`}
            ref={containerRef}
            onMouseDown={handleMouseDown}
        >
            {/* Add decorative corners to main widget */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-current opacity-60 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-current opacity-60 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-current opacity-60 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-current opacity-60 rounded-br-lg"></div>
            
            {/* Matrix-like background */}
            <MatrixRain isDarkMode={isDarkMode} />
            
            {/* Main skills display */}
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
                        <SkillIcon 
                            key={`${skill.name}-${index}`} 
                            skill={skill as Skill} 
                            index={index}
                            isDarkMode={isDarkMode}
                            isTechnicalMode={isTechnicalMode}
                            hoveredIcon={hoveredIcon}
                            setHoveredIcon={setHoveredIcon}
                        />
                    ))}
                </div>
            </motion.div>

            {/* Control panel overlay with dynamic transparency */}
            <div 
                className={`absolute top-3 right-3 ${
                    isTechnicalMode 
                        ? 'bg-black' 
                        : isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
                } 
                ${isOverlayHovered ? 'bg-opacity-60' : 'bg-opacity-20'} 
                ${textColor} font-mono p-4 rounded-lg border-2 ${borderColor} 
                shadow-lg shadow-${primaryColor}/20 
                backdrop-blur-sm w-56 z-10 transition-all duration-300`}
                onMouseEnter={() => setIsOverlayHovered(true)}
                onMouseLeave={() => setIsOverlayHovered(false)}
            >
                {/* Control panel header with decorative corners */}
                <div className="relative mb-4 border-b border-opacity-50 pb-2 border-current">
                    {/* Decorative corners */}
                    <div className="absolute -top-3 -left-3 w-4 h-4 border-t-2 border-l-2 border-current rounded-tl-md"></div>
                    <div className="absolute -top-3 -right-3 w-4 h-4 border-t-2 border-r-2 border-current rounded-tr-md"></div>
                    
                    <div className="flex justify-between items-center">
                        <code className="text-xs">
                            {isPaused ? '[ PAUSED ]' : '[ RUNNING ]'}
                        </code>
                        <div className="flex space-x-2">
                            <button 
                                className='w-6 h-6 rounded-full flex items-center justify-center'
                                onClick={() => setIsPaused(!isPaused)}
                                aria-label={isPaused ? "Play animation" : "Pause animation"}
                            >
                                {isPaused ? 
                                    <Play size={14} className={`${textColor} hover:bg-current`} /> : 
                                    <Pause size={14} className={`${textColor} hover:bg-current`} />
                                }
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Speed control */}
                <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                        <span>SPEED</span>
                        <span>{Math.round((60-speed)/0.3)}%</span>
                    </div>
                    <Slider
                        value={[speed]}
                        min={30}
                        max={60}
                        step={1}
                        onValueChange={(values) => setSpeed(values[0])}
                        className={'[&_[role=slider]]:bg-palette-teal-DEFAULT'}
                    />
                </div>
                
                {/* Animation style selector */}
                <div className="mb-3">
                    <div className="text-xs mb-1">ANIMATION</div>
                    <div className="flex flex-wrap gap-1 mb-1">
                        <button 
                            className={`text-xs px-2 py-1 rounded-sm ${getButtonStyle(animationStyle, 'linear')}`}
                            onClick={() => setAnimationStyle('linear')}
                        >
                            LINEAR
                        </button>
                        <button 
                            className={`text-xs px-2 py-1 rounded-sm ${getButtonStyle(animationStyle, 'easeInOut')}`}
                            onClick={() => setAnimationStyle('easeInOut')}
                        >
                            EASE
                        </button>
                        <button 
                            className={`text-xs px-2 py-1 rounded-sm ${getButtonStyle(animationStyle, 'bounce')}`}
                            onClick={() => setAnimationStyle('bounce')}
                        >
                            BOUNCE
                        </button>
                    </div>
                </div>
                
                {/* Filter by category */}
                <div className="mb-1">
                    <div className="text-xs mb-1">FILTER</div>
                    <div className="flex flex-wrap gap-1">
                        <button 
                            className={`text-xs px-2 py-1 rounded-sm ${getButtonStyle(selectedCategory || 'null', 'null')}`}
                            onClick={() => setSelectedCategory(null)}
                        >
                            ALL
                        </button>
                        {categories.map(category => (
                            <button 
                                key={category}
                                className={`text-xs px-2 py-1 rounded-sm ${getButtonStyle(selectedCategory || '', category)}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Skills;