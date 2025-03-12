import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Skill {
    name: string;
    level: string;
    icon: string;
    category?: string;
}

interface SkillIconProps {
    skill: Skill;
    index: number;
    isDarkMode: boolean;
    isTechnicalMode: boolean;
    hoveredIcon: string | null;
    setHoveredIcon: (value: string | null) => void;
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

// Function to determine vertical position for icons
const getVerticalOffset = (index: number): number => {
    // Create a 3-row pattern: -40px, 0px, +40px
    const position = index % 3;
    return position === 0 ? -20 : position === 1 ? 80 : 160;
};

const SkillIcon: React.FC<SkillIconProps> = ({ 
    skill, 
    index, 
    isDarkMode, 
    isTechnicalMode,
    hoveredIcon,
    setHoveredIcon
}) => {
    const proficiency = levelToPercentage(skill.level);
    const yOffset = getVerticalOffset(index);
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
                        side="right"  
                        align="center"
                        alignOffset={0}
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

export default SkillIcon;
