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
import { getAnimationLevel, ThemeMode } from '@/lib/types';

const Skills: React.FC = () => {
  const animationLevel = useSelector((state: RootState) => state.mode.animationLevel);
  const themeMode = useSelector((state: RootState) => state.mode.themeMode);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [isPaused, setIsPaused] = useState(false);
  const x = useMotionValue(0);
  const dragging = useRef(false);
  const [speed, setSpeed] = useState(getAnimationLevel(animationLevel, { min: 30, max: 60 }));
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [animationStyle, setAnimationStyle] = useState<AnimationStyle>('linear');
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const [isOverlayHovered, setIsOverlayHovered] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const categories = Array.from(new Set(Object.values(skillsData).flat().map(skill => skill.category || 'Other')));
  const filteredSkills = selectedCategory
    ? Object.values(skillsData).flat().filter(skill => (skill.category || 'Other') === selectedCategory)
    : Object.values(skillsData).flat();

  const getAnimationEasing = (): string | number[] => {
    switch (animationStyle) {
      case 'easeInOut': return 'easeInOut';
      case 'bounce': return [0.6, -0.05, 0.01, 0.99];
      case 'linear':
      default: return 'linear';
    }
  };

  // Create a wrapper ref to measure the actual content width
  const contentRef = useRef<HTMLDivElement>(null);
  const animationProgressRef = useRef(0);
  const currentPositionRef = useRef(0);

  // Effect to initialize measurements
  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
    
    requestAnimationFrame(() => {
      if (contentRef.current) {
        setContentWidth(contentRef.current.scrollWidth);
      }
    });
  }, []);

  // Main animation effect
  useEffect(() => {
    if (isPaused || hoveredIcon !== null) {
      controls.stop();
      return;
    }

    if (containerWidth <= 0 || contentWidth <= 0) {
      return; // Don't animate if we don't have valid measurements
    }

    // Get current x position if animation is already running
    const currentX = x.get();
    if (currentX !== 0) {
      currentPositionRef.current = currentX;
    }

    // Calculate total distance and remaining distance
    const totalDistance = contentWidth + containerWidth;
    const remainingDistance = currentPositionRef.current <= 0 
      ? Math.abs(currentPositionRef.current) + contentWidth
      : totalDistance - (currentPositionRef.current - containerWidth);
    
    // Adjust duration based on remaining distance
    const fullDuration = 15 + (60 - speed) / 3; // Full animation duration in seconds
    const remainingDuration = (remainingDistance / totalDistance) * fullDuration;

    // Calculate the end position (should be -contentWidth)
    const animateToPosition = -contentWidth;
    
    // Create animation sequence
    const sequence = async () => {
      // First animate remaining portion of current cycle
      await controls.start({
        x: animateToPosition,
        transition: {
          duration: remainingDuration,
          ease: getAnimationEasing(),
        }
      });
      
      // Then continue with infinite cycles from right to left
      await controls.start({
        x: [containerWidth, animateToPosition],
        transition: {
          duration: fullDuration,
          ease: getAnimationEasing(),
          repeat: Infinity,
        }
      });
    };
    
    sequence();

    return () => {
      // Save current position before stopping
      currentPositionRef.current = x.get();
      controls.stop();
    };
  }, [isPaused, hoveredIcon, containerWidth, contentWidth, speed, animationStyle, filteredSkills.length]);

  // Update container width on window resize with debounce
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (containerRef.current) {
          setContainerWidth(containerRef.current.offsetWidth);
        }
        
        if (contentRef.current) {
          setContentWidth(contentRef.current.scrollWidth);
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Reset animation when filter changes
  useEffect(() => {
    // Reset position reference when filters change
    currentPositionRef.current = containerWidth;
    
    // Allow a frame for the DOM to update with new content
    requestAnimationFrame(() => {
      if (contentRef.current) {
        setContentWidth(contentRef.current.scrollWidth);
      }
    });
  }, [filteredSkills]);

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

  const primaryColor = themeMode !== ThemeMode.Light ? "#73d3e7" : "#1791a3";
  const bgColor = themeMode !== ThemeMode.Light ? "bg-gray-900" : "bg-gray-50";
  const darkBgColor = themeMode !== ThemeMode.Light ? "bg-gray-800" : "bg-gray-200";
  const textColor = themeMode !== ThemeMode.Light ? "text-palette-teal-light" : "text-palette-teal-DEFAULT";
  const borderColor = themeMode !== ThemeMode.Light ? "border-palette-teal-light" : "border-palette-teal-DEFAULT";

  // Function to get button style based on selection
  const getButtonStyle = (currentStyle: string, selectedStyle: string) => {
    return currentStyle === selectedStyle
      ? `bg-palette-teal-DEFAULT text-white`
      : `${darkBgColor} bg-opacity-50`;
  };

  return (
    <div
      className={`w-full overflow-hidden py-12 relative ${bgColor} min-h-[360px] 
        border-2 ${borderColor} rounded-xl shadow-lg mx-auto max-w-[95%] my-10`}
      ref={containerRef}
      onMouseDown={handleMouseDown}
    >
      <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-current opacity-60 rounded-tl-lg"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-current opacity-60 rounded-tr-lg"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-current opacity-60 rounded-bl-lg"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-current opacity-60 rounded-br-lg"></div>
      <MatrixRain isDarkMode={themeMode !== ThemeMode.Light} />
      <div className="relative">
        <motion.div
          className="flex items-center"
          animate={controls}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          style={{ x }}
          ref={contentRef}
        >
          <div className="flex items-center">
            {filteredSkills.map((skill, index) => (
              <SkillIcon
                key={`${skill.name}-${index}`}
                skill={skill as Skill}
                index={index}
                isDarkMode={themeMode !== ThemeMode.Light}
                hoveredIcon={hoveredIcon}
                setHoveredIcon={setHoveredIcon}
                isPaused={isPaused}
              />
            ))}
          </div>
        </motion.div>
      </div>
      {/* Control panel overlay with dynamic transparency */}
      <div
        className={`absolute top-3 right-3 ${themeMode !== ThemeMode.Light ? 'bg-gray-800' : 'bg-gray-200'} 
          ${isOverlayHovered ? 'bg-opacity-60' : 'bg-opacity-20'} 
          ${textColor} font-mono p-4 rounded-lg border-2 ${borderColor} 
          shadow-lg shadow-${primaryColor}/20 
          backdrop-blur-sm w-56 z-10 transition-all duration-300`}
        onMouseEnter={() => setIsOverlayHovered(true)}
        onMouseLeave={() => setIsOverlayHovered(false)}
      >
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
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span>SPEED</span>
            <span>{Math.round((speed - 30) / 0.3)}%</span>
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
        <div className="mb-3">
          <div className="text-xs mb-1">ANIMATION</div>
          <div className="flex flex-wrap gap-1 mb-1">
            {['easeInOut', 'bounce', 'linear'].map(style => (
              <button
                key={style}
                className={`text-xs px-2 py-1 rounded-sm ${getButtonStyle(animationStyle, style)}`}
                onClick={() => setAnimationStyle(style as AnimationStyle)}
              >
                {style.toUpperCase()}
              </button>
            )
            )}
          </div>
        </div>
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