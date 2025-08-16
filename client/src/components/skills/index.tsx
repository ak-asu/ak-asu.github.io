import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation, useMotionValue } from "framer-motion";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import skillsData from "@/data/skills.json";
import { Slider } from "@/components/ui/slider";
import { Pause, Play } from "lucide-react";
import MatrixRain from "./MatrixRain";
import SkillIcon from "./SkillIcon";
import { Skill } from "./utils";
import { getAnimationLevel, ThemeMode, AnimationLevel } from "@/lib/types";

const Skills: React.FC = () => {
  const animationLevel = useSelector(
    (state: RootState) => state.mode.animationLevel,
  );
  const themeMode = useSelector((state: RootState) => state.mode.themeMode);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const isMounted = useRef(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const [speed, setSpeed] = useState(
    getAnimationLevel(animationLevel, { min: 30, max: 60 }),
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const [isOverlayHovered, setIsOverlayHovered] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [needsScrolling, setNeedsScrolling] = useState(false);
  const categories = Array.from(
    new Set(
      Object.values(skillsData)
        .flat()
        .map((skill) => skill.category || "Other"),
    ),
  );

  // Create a separate ref for the content area to handle hover independently
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Improved filtering logic to handle categories more robustly
  const filteredSkills = React.useMemo(() => {
    const allSkills = Object.values(skillsData).flat();
    if (!selectedCategory) {
      return allSkills;
    }
    return allSkills.filter((skill) => {
      const skillCategory = skill.category || "Other";
      return skillCategory === selectedCategory;
    });
  }, [selectedCategory]);

  // Create a wrapper ref to measure the actual content width
  const contentRef = useRef<HTMLDivElement>(null);
  // const animationProgressRef = useRef(0);
  const currentPositionRef = useRef(0);
  // const lastScrollPosition = useRef(0);
  const lastAnimationTimeRef = useRef(0);

  // Fix measurement logic and improve scrolling detection
  useEffect(() => {
    if (!containerRef.current) return;

    setContainerWidth(containerRef.current.offsetWidth);

    requestAnimationFrame(() => {
      setTimeout(() => {
        if (!contentRef.current || !containerRef.current) return;

        currentPositionRef.current = 0;
        x.set(0);

        if (contentRef.current.children.length > 0) {
          const singleSetWidth = contentRef.current.children[0].scrollWidth;
          setContentWidth(singleSetWidth);
          const shouldScroll =
            singleSetWidth > containerRef.current.offsetWidth;
          setNeedsScrolling(shouldScroll);
        }
      }, 50);
    });
  }, [filteredSkills, x]);

  // Store position when hovering starts
  useEffect(() => {
    if (isHovered || isPaused) {
      currentPositionRef.current = x.get();
      lastAnimationTimeRef.current = Date.now();
    }
  }, [isHovered, isPaused, x]);

  // Improved animation effect for continuous scrolling
  useEffect(() => {
    controls.stop();

    if (
      !isMounted.current ||
      (isPaused && !isHovered) ||
      containerWidth <= 0 ||
      contentWidth <= 0 ||
      !needsScrolling
    ) {
      return;
    }

    if (filteredSkills.length === 0) {
      return;
    }

    if (isHovered) {
      return;
    }

    // Calculate pixels per second based on speed setting (higher speed = more pixels per second)
    // Map speed range (30-60) to pixels per second (50-200)
    const pixelsPerSecond = 50 + ((speed - 30) / 30) * 150;

    // Calculate duration based on content width and pixels per second
    // This ensures consistent movement speed regardless of content width
    const duration = contentWidth / pixelsPerSecond;

    let startPosition = 0;
    let remainingDuration = duration;

    if (currentPositionRef.current !== 0) {
      startPosition = currentPositionRef.current;
      // Calculate what fraction of the distance is remaining
      const fractionRemaining = (startPosition + contentWidth) / contentWidth;
      remainingDuration = duration * fractionRemaining;

      if (remainingDuration <= 0 || remainingDuration > duration) {
        startPosition = 0;
        remainingDuration = duration;
      }
    }

    // Rest of animation code remains the same
    controls
      .start({
        x: [startPosition, -contentWidth],
        transition: {
          duration: remainingDuration,
          ease: "linear",
          onComplete: () => {
            if (isMounted.current && !isPaused && !isHovered) {
              controls.start({
                x: [0, -contentWidth],
                transition: {
                  duration: duration,
                  ease: "linear",
                  repeat: Infinity,
                  repeatType: "loop",
                },
              });
            }
          },
        },
      })
      .catch((err) => {
        // console.error("Animation error:", err);
      });

    return () => {
      currentPositionRef.current = x.get();
    };
  }, [
    isPaused,
    isHovered,
    containerWidth,
    contentWidth,
    speed,
    needsScrolling,
    filteredSkills,
  ]);

  // Update container width on window resize with debounce
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (containerRef.current && contentRef.current) {
          const containerSize = containerRef.current.offsetWidth;
          setContainerWidth(containerSize);

          const singleSetWidth = contentRef.current.children[0].scrollWidth;
          setContentWidth(singleSetWidth);
          setNeedsScrolling(singleSetWidth > containerSize);
        }
      }, 100);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  const handleDragStart = (event: any, info: any) => {
    dragStartX.current = x.get();
    setIsPaused(true);
    dragging.current = true;
    currentPositionRef.current = x.get();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  const handleDragEnd = (event: any, info: any) => {
    currentPositionRef.current = x.get();
    dragging.current = false;
    if (needsScrolling) {
      setIsPaused(false);
    }
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
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Handle content area hover separately from container hover
  const handleContentMouseEnter = () => {
    currentPositionRef.current = x.get();
    setIsHovered(true);
  };

  const handleContentMouseLeave = () => {
    setIsHovered(false);
  };

  // Remove the mouse enter/leave handlers from the container
  // and don't stop scrolling when hovering over the control panel
  const handleOverlayMouseEnter = () => {
    setIsOverlayHovered(true);
  };

  const handleOverlayMouseLeave = () => {
    setIsOverlayHovered(false);
  };

  const handleCategoryChange = (category: string | null) => {
    controls.stop();
    x.set(0);
    currentPositionRef.current = 0;
    setSelectedCategory(category);
  };

  const primaryColor = themeMode !== ThemeMode.Light ? "#73d3e7" : "#1791a3";
  const bgColor = themeMode !== ThemeMode.Light ? "bg-gray-900" : "bg-gray-50";
  const darkBgColor =
    themeMode !== ThemeMode.Light ? "bg-gray-800" : "bg-gray-200";
  const textColor =
    themeMode !== ThemeMode.Light
      ? "text-palette-teal-light"
      : "text-palette-teal-DEFAULT";
  const borderColor =
    themeMode !== ThemeMode.Light
      ? "border-palette-teal-light"
      : "border-palette-teal-DEFAULT";

  const getButtonStyle = (currentStyle: string, selectedStyle: string) => {
    return currentStyle === selectedStyle
      ? `bg-palette-teal-DEFAULT text-white`
      : `${darkBgColor} bg-opacity-50`;
  };

  // Calculate pixels per second for display in UI
  const getSpeedDisplayValue = () => {
    // Map speed range (30-60) to pixels per second (50-200)
    const pixelsPerSecond = 50 + ((speed - 30) / 30) * 150;
    return `${Math.round(pixelsPerSecond)} px/s`;
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
      {animationLevel !== AnimationLevel.Low && (
        <MatrixRain isDarkMode={themeMode !== ThemeMode.Light} />
      )}

      {/* Add hover handlers to this div specifically */}
      <div
        className="relative"
        ref={scrollAreaRef}
        onMouseEnter={handleContentMouseEnter}
        onMouseLeave={handleContentMouseLeave}
      >
        <motion.div
          className="flex items-center"
          animate={needsScrolling ? controls : {}}
          drag={needsScrolling ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          style={{ x }}
          ref={contentRef}
        >
          {filteredSkills.length > 0 ? (
            <>
              <div className="flex items-center">
                {filteredSkills.map((skill, index) => (
                  <SkillIcon
                    key={`${skill.name}-${index}`}
                    skill={skill as Skill}
                    index={index}
                    isDarkMode={themeMode !== ThemeMode.Light}
                    hoveredIcon={hoveredIcon}
                    setHoveredIcon={setHoveredIcon}
                    isPaused={dragging.current || isPaused || isHovered}
                    animationLevel={animationLevel}
                  />
                ))}
              </div>
              {needsScrolling && (
                <div className="flex items-center">
                  {filteredSkills.map((skill, index) => (
                    <SkillIcon
                      key={`${skill.name}-dup-${index}`}
                      skill={skill as Skill}
                      index={index}
                      isDarkMode={themeMode !== ThemeMode.Light}
                      hoveredIcon={hoveredIcon}
                      setHoveredIcon={setHoveredIcon}
                      isPaused={dragging.current || isPaused || isHovered}
                      animationLevel={animationLevel}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className={`px-8 py-4 text-center ${textColor}`}>
              No skills found for this category.
            </div>
          )}
        </motion.div>
      </div>

      {/* Control panel with fixed cursor styles */}
      <div
        className={`absolute top-3 right-3 ${themeMode !== ThemeMode.Light ? "bg-gray-800" : "bg-gray-200"} 
          ${isOverlayHovered ? "bg-opacity-60" : "bg-opacity-20"} 
          ${textColor} font-mono p-4 rounded-lg border-2 ${borderColor} 
          shadow-lg shadow-${primaryColor}/20 
          backdrop-blur-sm w-56 z-10 transition-all duration-300
          cursor-auto`}
        onMouseEnter={handleOverlayMouseEnter}
        onMouseLeave={handleOverlayMouseLeave}
      >
        <div className="relative mb-4 border-b border-opacity-50 pb-2 border-current">
          <div className="absolute -top-3 -left-3 w-4 h-4 border-t-2 border-l-2 border-current rounded-tl-md"></div>
          <div className="absolute -top-3 -right-3 w-4 h-4 border-t-2 border-r-2 border-current rounded-tr-md"></div>
          <div className="flex justify-between items-center">
            <code className="text-xs">
              {isPaused
                ? "[ PAUSED ]"
                : isHovered
                  ? "[ HOVER ]"
                  : "[ RUNNING ]"}
            </code>
            <div className="flex space-x-2">
              <button
                className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
                onClick={() => setIsPaused(!isPaused)}
                aria-label={isPaused ? "Play animation" : "Pause animation"}
              >
                {isPaused ? (
                  <Play size={14} className={`${textColor} hover:bg-current`} />
                ) : (
                  <Pause
                    size={14}
                    className={`${textColor} hover:bg-current`}
                  />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span>SPEED</span>
            <span>{getSpeedDisplayValue()}</span>
          </div>
          <Slider
            value={[speed]}
            min={30}
            max={60}
            step={1}
            onValueChange={(values) => setSpeed(values[0])}
            className={
              "[&_[role=slider]]:bg-palette-teal-DEFAULT [&_[role=slider]]:cursor-grab [&_[role=slider]:active]:cursor-grabbing"
            }
          />
        </div>

        <div className="mb-1">
          <div className="text-xs mb-1">FILTER</div>
          <div className="flex flex-wrap gap-1">
            <button
              className={`text-xs px-2 py-1 rounded-sm cursor-pointer ${getButtonStyle(selectedCategory || "null", "null")}`}
              onClick={() => handleCategoryChange(null)}
            >
              ALL
            </button>
            {categories.map((category) => (
              <button
                key={category}
                className={`text-xs px-2 py-1 rounded-sm cursor-pointer ${getButtonStyle(selectedCategory || "", category)}`}
                onClick={() => handleCategoryChange(category)}
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
