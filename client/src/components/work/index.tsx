import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { getAnimationLevel } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';
import workData from '@/data/work.json';
import TimelineCircle from './TimelineCircle';
import WorkDetails from './WorkDetails';

interface WorkEntry {
  position: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | null;
  description: string[];
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
  const scrollAnimationRef = useRef<number | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sort work entries by date (most recent first)
  const sortedWorkData = [...workData].sort((a, b) => {
    const dateA = new Date(a.startDate).getTime();
    const dateB = new Date(b.startDate).getTime();
    return dateB - dateA;
  });  // Auto-scroll timeline
  useEffect(() => {
    if (isPaused || userInteracting) return;

    const scrollTimeline = () => {
      if (!timelineRef.current) return;

      const container = timelineRef.current;
      const itemSize = isMobile ? 120 : 140; // Width for mobile, height for desktop
      const containerSize = isMobile ? container.clientWidth : container.clientHeight;

      let animationId: number;
      let startTime: number;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;

        const elapsed = timestamp - startTime;
        const duration = getAnimationLevel(animationLevel, { min: 3000, max: 8000 }); // 3-8 seconds per item

        if (elapsed < duration) {
          const progress = elapsed / duration;
          const easeInOut = 0.5 - 0.5 * Math.cos(progress * Math.PI);

          // Calculate target scroll position to center the current item
          const targetScrollPosition = Math.max(0, currentWorkIndex * itemSize - containerSize / 2 + itemSize / 2);
          const currentScrollPosition = isMobile ? container.scrollLeft : container.scrollTop;
          const scrollDiff = targetScrollPosition - currentScrollPosition;

          if (isMobile) {
            container.scrollLeft = currentScrollPosition + scrollDiff * easeInOut;
          } else {
            container.scrollTop = currentScrollPosition + scrollDiff * easeInOut;
          }

          animationId = requestAnimationFrame(animate);
        } else {
          // Scroll complete, ensure item is centered and pause for 5 seconds
          const targetScrollPosition = Math.max(0, currentWorkIndex * itemSize - containerSize / 2 + itemSize / 2);
          if (isMobile) {
            container.scrollLeft = targetScrollPosition;
          } else {
            container.scrollTop = targetScrollPosition;
          }
          setIsPaused(true);

          pauseTimeoutRef.current = setTimeout(() => {
            setIsPaused(false);
            setCurrentWorkIndex((prev) => (prev + 1) % sortedWorkData.length);
          }, 5000);
        }
      };

      animationId = requestAnimationFrame(animate);
      scrollAnimationRef.current = animationId;
    };

    const timeoutId = setTimeout(scrollTimeline, 500);

    return () => {
      clearTimeout(timeoutId);
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current);
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, [currentWorkIndex, isPaused, userInteracting, animationLevel, sortedWorkData.length, isMobile]);  const handleCircleClick = useCallback((index: number, work: WorkEntry) => {
    setUserInteracting(true);
    setCurrentWorkIndex(index);
    setSelectedWork(work);
    setIsPaused(true);

    // Cancel any ongoing scroll animation
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }

    // Manually scroll to the selected item to center it
    if (timelineRef.current) {
      const container = timelineRef.current;
      const itemSize = isMobile ? 120 : 140;
      const containerSize = isMobile ? container.clientWidth : container.clientHeight;
      const targetScrollPosition = Math.max(0, index * itemSize - containerSize / 2 + itemSize / 2);
      
      if (isMobile) {
        container.scrollTo({
          left: targetScrollPosition,
          behavior: 'smooth'
        });
      } else {
        container.scrollTo({
          top: targetScrollPosition,
          behavior: 'smooth'
        });
      }
    }

    // Resume auto-scrolling after 10 seconds of user interaction
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }

    pauseTimeoutRef.current = setTimeout(() => {
      setUserInteracting(false);
      setIsPaused(false);
    }, 10000);
  }, [isMobile]);
  const handleMinimizeDetails = useCallback(() => {
    setSelectedWork(null);
  }, []);

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
      }, 5000);
    }
  }, [userInteracting]);
  useEffect(() => {
    // Set initial selected work when component mounts or current index changes
    if (!selectedWork && sortedWorkData[currentWorkIndex]) {
      setSelectedWork(sortedWorkData[currentWorkIndex]);
    }
  }, [currentWorkIndex, sortedWorkData, selectedWork]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current);
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, []);
  return (
    <div className={`relative w-full ${isMobile ? 'h-[90vh] flex-col' : 'h-[72vh] flex'} bg-card rounded-2xl shadow-xl border border-palette-teal/20 dark:border-palette-teal/10 overflow-hidden`}>
      {/* Timeline Section - Top/Left Side */}
      <div className={`${isMobile ? 'w-full h-1/3' : 'w-1/2'} relative bg-gradient-to-b from-palette-teal/10 to-palette-teal/5 ${isMobile ? 'border-b' : 'border-r'} border-palette-teal/20`}>
        <div className="absolute inset-0 p-4">
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-palette-teal mb-4 text-center`}>Work Timeline</h2>

          {/* Timeline Container */}
          <div
            ref={timelineRef}
            className={`relative h-full ${isMobile ? 'overflow-x-auto overflow-y-hidden' : 'overflow-y-auto'} scrollbar-thin scrollbar-thumb-palette-teal/30 scrollbar-track-transparent`}
            style={{ scrollBehavior: 'smooth' }}
            onWheel={handleTimelineScroll}
            onTouchMove={handleTimelineScroll}
          >
            {/* Timeline Line */}
            <div className={`absolute ${isMobile ? 'top-1/2 left-0 right-0 h-0.5 -translate-y-1/2' : 'left-3/4 top-0 bottom-0 w-0.5'} bg-palette-teal/30 z-0`} />

            {/* Timeline Items */}
            <div className={`z-10 ${isMobile ? 'flex items-center h-full py-4' : 'pt-8 pb-8'}`} style={isMobile ? { width: `${sortedWorkData.length * 120}px` } : { height: `${sortedWorkData.length * 140}px` }}>
              {sortedWorkData.map((work, index) => (
                <TimelineCircle
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
      <div className={`${isMobile ? 'w-full h-2/3' : 'w-1/2'} relative`}>
        <AnimatePresence mode="wait">
          {selectedWork ? (
            <WorkDetails
              key={`${selectedWork.company}-${selectedWork.position}`}
              company={selectedWork.company}
              project={{
                title: selectedWork.position,
                description: selectedWork.description.join(' • '),
                startDate: selectedWork.startDate,
                endDate: selectedWork.endDate || 'Present',
                type: selectedWork.type
              }}
              onMinimize={handleMinimizeDetails}
              animationLevel={animationLevel}
            />
          ) : (            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`flex items-center justify-center h-full text-center ${isMobile ? 'p-4' : 'p-8'}`}
            >
              <div className="text-slate-500 dark:text-slate-400">
                <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} mx-auto mb-4 rounded-full bg-palette-teal/10 flex items-center justify-center`}>
                  <svg className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-palette-teal`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 8v6a2 2 0 002 2h4a2 2 0 002-2V8M8 8V6a2 2 0 012-2h4a2 2 0 002-2V8" />
                  </svg>
                </div>
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold mb-2`}>Select a Position</h3>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'}`}>Click on any circle in the timeline to view work details</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WorkScene;