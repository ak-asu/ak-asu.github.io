import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { getAnimationLevel, AnimationLevel } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";
import workData from "@/data/work.json";
import TimelineItem from "./TimelineCircle";
import WorkDetails from "./WorkDetails";

interface WorkEntry {
  position: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | null;
  description: string[];
  technologies: string[];
  links: Array<{
    title: string;
    url: string;
    type: string;
  }>;
  type: string;
}

const WorkScene: React.FC = () => {
  const { animationLevel } = useSelector((state: RootState) => state.mode);
  const isMobile = useIsMobile();
  const [currentWorkIndex, setCurrentWorkIndex] = useState(0);
  const [selectedWork, setSelectedWork] = useState<WorkEntry | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [userInteracting, setUserInteracting] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sort work entries by date (most recent first)
  const sortedWorkData: WorkEntry[] = [...workData].sort((a, b) => {
    const dateA = new Date(a.startDate).getTime();
    const dateB = new Date(b.startDate).getTime();
    return dateB - dateA;
  });

  // Function to scroll to a specific work item
  const scrollToIndex = useCallback(
    (index: number) => {
      if (!timelineRef.current) return;

      const container = timelineRef.current;
      const itemSize = isMobile ? 172 : 140; // Width for mobile, height for desktop
      const containerSize = isMobile
        ? container.clientWidth
        : container.clientHeight;
      const targetScrollPosition = Math.max(
        0,
        index * itemSize -
          containerSize / 2 +
          itemSize / 2 +
          (isMobile ? 20 : 0),
      );

      if (isMobile) {
        container.scrollTo({
          left: targetScrollPosition,
          behavior: "smooth",
        });
      } else {
        container.scrollTo({
          top: targetScrollPosition,
          behavior: "smooth",
        });
      }
    },
    [isMobile],
  );

  // Setup auto-scrolling
  useEffect(() => {
    // Don't auto-scroll if animation level is Low, user is interacting or it's paused
    if (animationLevel === AnimationLevel.Low || isPaused || userInteracting) {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
      return;
    }

    // Start auto-scrolling
    const scrollInterval = getAnimationLevel(animationLevel, {
      min: 5000,
      max: 7000,
    });

    // Clear any existing interval
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
    }

    // Set up new interval for auto-scrolling
    autoScrollIntervalRef.current = setInterval(() => {
      // Move to the next work item
      const nextIndex = (currentWorkIndex + 1) % sortedWorkData.length;
      setCurrentWorkIndex(nextIndex);
      scrollToIndex(nextIndex);
      setSelectedWork(sortedWorkData[nextIndex]);
    }, scrollInterval);

    // Scroll to the current index initially
    scrollToIndex(currentWorkIndex);

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
    };
  }, [
    currentWorkIndex,
    isPaused,
    userInteracting,
    animationLevel,
    sortedWorkData.length,
    scrollToIndex,
  ]);

  const handleCircleClick = useCallback(
    (index: number, work: WorkEntry) => {
      // Stop auto-scrolling when user interacts
      setUserInteracting(true);
      setCurrentWorkIndex(index);
      setSelectedWork(work);
      setIsPaused(true);
      scrollToIndex(index);

      // Clear existing timeout
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }

      // Resume auto-scrolling after 10 seconds of user interaction
      pauseTimeoutRef.current = setTimeout(() => {
        setUserInteracting(false);
        setIsPaused(false);
      }, 10000);
    },
    [scrollToIndex],
  );

  const handleTimelineScroll = useCallback(() => {
    if (!userInteracting) {
      setUserInteracting(true);
      setIsPaused(true);

      // Resume auto-scrolling after 5 seconds of no interaction
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }

      pauseTimeoutRef.current = setTimeout(() => {
        setUserInteracting(false);
        setIsPaused(false);
      }, 3000);
    }
  }, []);

  // Set initial selected work when component mounts or current index changes
  useEffect(() => {
    if (
      sortedWorkData.length > 0 &&
      (!selectedWork ||
        currentWorkIndex !== sortedWorkData.indexOf(selectedWork))
    ) {
      setSelectedWork(sortedWorkData[currentWorkIndex]);
    }
  }, [currentWorkIndex, sortedWorkData, selectedWork]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, []);

  // Handle mouse enter/leave for the entire work section
  const handleWorkSectionMouseEnter = useCallback(() => {
    setUserInteracting(true);
    setIsPaused(true);
  }, []);

  const handleWorkSectionMouseLeave = useCallback(() => {
    setUserInteracting(false);
    setIsPaused(false);
  }, []);

  return (
    <div
      className={`relative w-full ${isMobile ? "h-[90vh] flex-col" : "h-[72vh] flex min-w-[820px]"} bg-card rounded-2xl shadow-xl border border-palette-teal/20 dark:border-palette-teal/10 overflow-hidden`}
      onMouseEnter={handleWorkSectionMouseEnter}
      onMouseLeave={handleWorkSectionMouseLeave}
    >
      {/* Timeline Section - Top/Left Side */}
      <div
        className={`${isMobile ? "w-full h-1/3" : "w-1/3"} relative bg-gradient-to-b from-palette-teal/10 to-palette-teal/5 ${isMobile ? "border-b" : "border-r"} border-palette-teal/20`}
      >
        <div className="absolute inset-0 p-4">
          <h2
            className={`${isMobile ? "text-lg" : "text-xl"} font-bold text-palette-teal mb-4 text-center`}
          >
            Work Timeline
          </h2>

          {/* Timeline Container */}
          <div
            ref={timelineRef}
            className={`relative h-full ${isMobile ? "overflow-x-auto overflow-y-hidden" : "overflow-y-auto"} scrollbar-thin scrollbar-thumb-palette-teal/30 scrollbar-track-transparent`}
            style={{ scrollBehavior: "smooth" }}
            onWheel={handleTimelineScroll}
            onTouchMove={handleTimelineScroll}
          >
            {" "}
            {/* Timeline Line */}
            <div
              className={`absolute ${isMobile ? "top-1/3 h-0.5" : "right-4 w-0.5"} bg-palette-teal/30 z-0`}
              style={
                isMobile
                  ? {
                      left: "60px",
                      width: `${sortedWorkData.length * 120}px`,
                    }
                  : {
                      top: "68px",
                      height: `${sortedWorkData.length * 140}px`,
                    }
              }
            />
            {/* Timeline Items */}
            <div
              className={`relative z-10 ${isMobile ? "h-full" : "h-full"}`}
              // style={
              //   isMobile
              //     ? { width: `${sortedWorkData.length * 120 + 120}px` }
              //     : { height: `${sortedWorkData.length * 140 + 140}px` }
              // }
            >
              {sortedWorkData.map((work, index) => (
                <TimelineItem
                  key={`${work.company}-${work.position}-${index}`}
                  work={work}
                  index={index}
                  isActive={index === currentWorkIndex}
                  isSelected={selectedWork === work}
                  onClick={() => handleCircleClick(index, work)}
                  animationLevel={animationLevel}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Work Details Section - Bottom/Right Side */}
      <div
        className={`${isMobile ? "w-full h-2/3" : "w-2/3"} relative bg-gradient-to-b from-background to-card/50`}
      >
        <AnimatePresence mode="wait">
          {selectedWork ? (
            <WorkDetails selectedWork={selectedWork} isMobile={isMobile} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`flex items-center justify-center h-full text-center ${isMobile ? "p-4" : "p-8"}`}
            >
              <div className="text-muted-foreground">
                <div
                  className={`${isMobile ? "w-12 h-12" : "w-16 h-16"} mx-auto mb-4 rounded-full bg-palette-teal/10 flex items-center justify-center`}
                >
                  <svg
                    className={`${isMobile ? "w-6 h-6" : "w-8 h-8"} text-palette-teal`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 8v6a2 2 0 002 2h4a2 2 0 002-2V8M8 8V6a2 2 0 012-2h4a2 2 0 002-2V8"
                    />
                  </svg>
                </div>
                <h3
                  className={`${isMobile ? "text-base" : "text-lg"} font-semibold mb-2`}
                >
                  Select a Position
                </h3>
                <p className={`${isMobile ? "text-xs" : "text-sm"}`}>
                  Click on any circle in the timeline to view work details
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WorkScene;
