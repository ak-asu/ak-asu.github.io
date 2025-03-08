import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useMotionValue } from 'framer-motion';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import skillsData from '@/data/skills.json';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import { Pause, Play, ChevronRight } from 'lucide-react';

// Add animation style types and easing functions
type AnimationStyle = 'linear' | 'easeInOut' | 'bounce' | 'spring' | 'none';

interface Skill {
    name: string;
    level: string;
    icon: string;
    category?: string;
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

const MatrixRain: React.FC<{isDarkMode: boolean}> = ({ isDarkMode }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Matrix rain characters
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$+-*/><{}[]";
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops: number[] = [];

        // Initialize drops
        for (let i = 0; i < columns; i++) {
            drops[i] = Math.random() * -100;
        }

        const draw = () => {
            // Semi-transparent background to create fade effect - adjust based on theme
            ctx.fillStyle = isDarkMode 
                ? 'rgba(0, 0, 0, 0.05)' 
                : 'rgba(185, 199, 210, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Set text color based on theme
            ctx.fillStyle = isDarkMode ? '#1791a3' : '#73d3e7';
            ctx.font = `${fontSize}px monospace`;

            // Loop over each drop
            for (let i = 0; i < drops.length; i++) {
                // Choose random character
                const text = chars[Math.floor(Math.random() * chars.length)];
                
                // Draw character
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

const Skills: React.FC = () => {
    const isTechnicalMode = useSelector((state: RootState) => state.mode.isTechnicalMode);
    const animationLevel = useSelector((state: RootState) => 
        state.mode.animationLevel || 'medium');
    
    const isDarkMode = true;

    const containerRef = useRef<HTMLDivElement>(null);
    const controls = useAnimation();
    const [isPaused, setIsPaused] = useState(false);
    const x = useMotionValue(0);
    const dragging = useRef(false);
    const [speed, setSpeed] = useState(animationLevel === 'expert' ? 30 : animationLevel === 'basic' ? 60 : 45);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    // Add animation style state
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

    // Create a function to determine vertical position for icons
    const getVerticalOffset = (index: number): number => {
        // Create a 3-row pattern: -40px, 0px, +40px
        const position = index % 3;
        return position === 0 ? -20 : position === 1 ? 80 : 160;
    };

    // Determine render style based on mode and theme
    const SkillIcon: React.FC<{ skill: Skill, index: number }> = ({ skill, index }) => {
        const proficiency = levelToPercentage(skill.level);
        const yOffset = getVerticalOffset(index); // Use the vertical offset function
        const isHovered = hoveredIcon === `${skill.name}-${index}`;
        
        return (
            <motion.div 
                className="relative mx-8 my-4"
                initial={{ y: yOffset }}
                style={{ y: yOffset }}
                whileHover={{ 
                    scale: 1.3, 
                    filter: "brightness(1.3)",
                    transition: { duration: 0.2 } 
                }}
                onHoverStart={() => setHoveredIcon(`${skill.name}-${index}`)}
                onHoverEnd={() => setHoveredIcon(null)}
            >
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <div className={`relative w-16 h-16 transition-all duration-300 ${
                                isHovered ? `ring-2 ring-offset-2 ${isDarkMode ? 'ring-offset-gray-900' : 'ring-offset-white'} ring-palette-teal-DEFAULT` : ''
                            }`}>
                                <div className={`absolute inset-0 rounded-full overflow-hidden ${
                                    isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
                                }`}>
                                    {/* Colored progress circle */}
                                    <svg className="w-full h-full" viewBox="0 0 100 100">
                                        <circle 
                                            cx="50" 
                                            cy="50" 
                                            r="45" 
                                            fill="none" 
                                            stroke={isTechnicalMode ? "#3ddc84" : isDarkMode ? "#73d3e7" : "#1791a3"} 
                                            strokeWidth="10"
                                            strokeDasharray={`${proficiency * 2.83} ${283 - proficiency * 2.83}`}
                                            strokeDashoffset="70" // Start from top
                                            transform="rotate(-90 50 50)"
                                        />
                                    </svg>
                                </div>
                                
                                {/* Skill icon */}
                                <div className="absolute inset-0 flex items-center justify-center p-3">
                                    {/* {<Image 
                                        src={`/icons/${skill.icon}`} 
                                        alt={skill.name}
                                        width={40}
                                        height={40}
                                        priority={index < 10} // Prioritize loading for first few icons
                                    />} */}
                                </div>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent 
                            className={`cyberpunk-tooltip rounded-lg ${
                                isDarkMode 
                                    ? 'bg-gray-900 border-palette-teal-light text-palette-teal-light' 
                                    : 'bg-gray-100 border-palette-teal-DEFAULT text-palette-teal-DEFAULT'
                            } border-2`}
                            sideOffset={12}
                            // Restrict tooltip positioning to left or right only
                            side="right"  
                            align="center"
                            alignOffset={0}
                            // If right side doesn't have space, use best fit positioning
                            avoidCollisions={true}
                        >
                            <div className="relative px-5 py-3">
                                {/* Corner decorations - now with rounded corners */}
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-current rounded-tl-md"></div>
                                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-current rounded-tr-md"></div>
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-current rounded-bl-md"></div>
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-current rounded-br-md"></div>
                                
                                {/* Content */}
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center gap-1">
                                        <ChevronRight size={14} className={isTechnicalMode ? 'text-green-400' : 'text-palette-teal-DEFAULT'} />
                                        <span className="font-bold tracking-wider uppercase">{skill.name}</span>
                                        <ChevronRight size={14} className={isTechnicalMode ? 'text-green-400' : 'text-palette-teal-DEFAULT'} />
                                    </div>
                                    
                                    <div className="mt-2 w-full bg-gray-800 h-1.5 rounded-sm overflow-hidden">
                                        <div 
                                            className={`h-full ${isTechnicalMode ? 'bg-green-400' : 'bg-palette-teal-DEFAULT'}`}
                                            style={{ width: `${proficiency}%` }}
                                        ></div>
                                    </div>
                                    
                                    <div className="mt-1 flex justify-between w-full text-xs opacity-90">
                                        <span className="tracking-wider">{skill.level}</span>
                                        <span className="font-mono">{proficiency}%</span>
                                    </div>
                                    
                                    {skill.category && (
                                        <span className="mt-1 text-xs opacity-75 px-2 py-0.5 rounded-sm bg-current bg-opacity-10">
                                            {skill.category.toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </motion.div>
        );
    };

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
            
            {/* Matrix-like background - pass isDarkMode instead of isTechnicalMode */}
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
                        <SkillIcon key={`${skill.name}-${index}`} skill={skill as Skill} index={index} />
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