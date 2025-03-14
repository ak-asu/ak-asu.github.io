import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import workData from '@/data/work.json';
import { WorkData, Company } from '@/lib/types';
import { RootState } from '@/store/store';
import { setActiveProject } from '@/store/features/workSlice';
import Building from './Building';
import Character from './Character';
import Home from './Home';
import ProjectDetails from './WorkCard';


const prepareWorkData = (): WorkData => {
  const companies: Company[] = [];
  workData.forEach((job) => {
    const company: Company = {
      name: job.company,
      location: job.location,
      projects: [{
        title: job.company,
        description: job.description.join(' '),
        startDate: job.startDate,
        endDate: job.endDate || 'Present',
        type: 'professional'
      }]
    };
    const existingCompany = companies.find(c => c.name === job.company);
    if (existingCompany) {
      existingCompany.projects.push(...company.projects);
    } else {
      companies.push(company);
    }
  });
  return { companies };
};

const WorkScene: React.FC = () => {
  const dispatch = useDispatch();
  const { animationLevel, physicsEnabled } = useSelector((state: RootState) => state.mode);
  const activeProject = useSelector((state: RootState) => state.work.activeProject);
  const [workData, setWorkData] = useState<WorkData>(prepareWorkData());
  const [characterPosition, setCharacterPosition] = useState({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState<{ x: number, y: number, buildingIndex: number, floorIndex: number } | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [isInBuilding, setIsInBuilding] = useState(false);
  const [isInLift, setIsInLift] = useState(false);
  const [currentBuilding, setCurrentBuilding] = useState(-1);
  const [currentFloor, setCurrentFloor] = useState(-1);
  const [isWorking, setIsWorking] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [isCycleComplete, setIsCycleComplete] = useState(false);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [isOnRoad, setIsOnRoad] = useState(false);

  const sceneRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const buildingRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Calculate positions based on scene dimensions
  const calculateBuildingPositions = () => {
    const homeWidth = 200;
    const buildingWidth = 200; // Base width for buildings
    const gapWidth = 100; // Gap between buildings
    const totalBuildings = workData.companies.length;
    const startX = homeWidth + 100; // Initial offset after home
    return workData.companies.map((_, index) => {
      return startX + index * (buildingWidth + gapWidth);
    });
  };

  const buildingPositions = calculateBuildingPositions();

  useEffect(() => {
    // Initially character is at home door
    setCharacterPosition({ x: 80, y: 400 });
  }, []);

  // Handle floor selection
  const handleFloorSelect = (buildingIndex: number, floorIndex: number) => {
    if (isMoving) return; // Prevent multiple movements at once
    // Calculate target position
    const buildingX = buildingPositions[buildingIndex] || 0;
    const floorY = 300 - (floorIndex * 80); // Base floor height is 80px, 300px is ground level
    setTargetPosition({
      x: buildingX + 50, // Center of the floor
      y: floorY,
      buildingIndex,
      floorIndex
    });
    setIsMoving(true);
  };

  const scrollToPosition = (x: number) => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTo({
      left: Math.max(0, x - 200),
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    if (!targetPosition || !isMoving) return;
    const moveCharacter = async () => {
      // If character is in a different building or outside
      if (currentBuilding !== targetPosition.buildingIndex) {
        // If inside a building, exit first
        if (isInBuilding) {
          // Exit animation
          setIsWorking(false);
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait for work animation to complete
          
          // Move to the lift first if not on ground floor
          if (currentFloor > 0) {
            setCharacterPosition(prev => ({ ...prev, x: buildingPositions[currentBuilding] + 30 }));
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Use lift to go down
            setIsInLift(true);
            setCharacterPosition(prev => ({ ...prev, y: 300 })); // Ground level
            await new Promise(resolve => setTimeout(resolve, 1000));
            setIsInLift(false);
          }
          
          // Move to building door
          setCharacterPosition(prev => ({ ...prev, x: buildingPositions[currentBuilding] + 50 }));
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Exit to the road
          setCharacterPosition(prev => ({ ...prev, y: 480 })); // Road level
          await new Promise(resolve => setTimeout(resolve, 500));
          setIsInBuilding(false);
          setIsOnRoad(true);
          setCurrentFloor(-1);
        }
        
        // Scroll to target building
        scrollToPosition(buildingPositions[targetPosition.buildingIndex]);
        
        // Move horizontally on the road to the target building
        setCharacterPosition(prev => ({ 
          ...prev, 
          x: buildingPositions[targetPosition.buildingIndex] + 50,
          y: 480 // Road level
        }));
        await new Promise(resolve => setTimeout(resolve, 1500)); // Wait for horizontal movement
        
        // Move up to the building door
        setCharacterPosition(prev => ({ ...prev, y: 300 })); // Building entrance level
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Enter the building
        setIsInBuilding(true);
        setIsOnRoad(false);
        setCurrentBuilding(targetPosition.buildingIndex);
        
        // If target is not ground floor, use the lift
        if (targetPosition.floorIndex > 0) {
          // Move to the lift position
          setCharacterPosition(prev => ({ ...prev, x: buildingPositions[targetPosition.buildingIndex] + 30 }));
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait for horizontal movement
          
          // Go up in the lift
          setIsInLift(true);
          setCharacterPosition(prev => ({ ...prev, y: targetPosition.y }));
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for vertical movement
          
          // Exit the lift
          setIsInLift(false);
          setCharacterPosition({ x: targetPosition.x, y: targetPosition.y });
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait for horizontal movement
        }
      } else {
        // If in the same building but different floor
        if (currentFloor !== targetPosition.floorIndex) {
          setIsWorking(false);
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait for work animation to complete
          
          // Move to lift
          setCharacterPosition(prev => ({ ...prev, x: buildingPositions[targetPosition.buildingIndex] + 30 }));
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait for horizontal movement
          
          // Use the lift
          setIsInLift(true);
          
          // Go to the target floor
          setCharacterPosition(prev => ({ ...prev, y: targetPosition.y }));
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for vertical movement
          
          // Exit the lift
          setIsInLift(false);
          setCharacterPosition({ x: targetPosition.x, y: targetPosition.y });
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait for horizontal movement
        }
      }
      
      // Set current floor and start working
      setCurrentFloor(targetPosition.floorIndex);
      setIsMoving(false);
      setIsWorking(true);
      const company = workData.companies[targetPosition.buildingIndex];
      const project = company?.projects[targetPosition.floorIndex];
      if (project) {
        dispatch(setActiveProject({
          company: company.name,
          project: {
            title: project.title,
            description: project.description,
            startDate: project.startDate,
            endDate: project.endDate,
            type: project.type
          }
        }));
        setShowProjectDetails(true);
      }
    };
    moveCharacter();
  }, [targetPosition, isMoving, currentBuilding, currentFloor, buildingPositions, dispatch]);

  useEffect(() => {
    // Only start the cycle if not already in progress and not manually interacting
    if (!isCycleComplete && !isMoving && !isWorking && currentBuilding === -1) {
      // Start with the home
      setIsResting(true);
      
      const restingTimeout = setTimeout(() => {
        setIsResting(false);
        
        const moveDownTimeout = setTimeout(() => {
          // Move down from home door to road
          setCharacterPosition({ x: 80, y: 480 });
          setIsOnRoad(true);
          
          const startTourTimeout = setTimeout(() => {
            handleFloorSelect(0, 0);
          }, 1000);
          
          return () => clearTimeout(startTourTimeout);
        }, 1000);
        
        return () => clearTimeout(moveDownTimeout);
      }, 2000);
      
      return () => clearTimeout(restingTimeout);
    }
  }, [isCycleComplete, isMoving, isWorking, currentBuilding]);

  // When finished working on a floor, move to next floor or building
  useEffect(() => {
    if (isWorking) {
      // Simulate working time
      const workingTimer = setTimeout(() => {
        setIsWorking(false);
        // Find next floor or building
        const currentBuildingData = workData.companies[currentBuilding];
        if (currentBuildingData) {
          if (currentFloor < currentBuildingData.projects.length - 1) {
            // Move to next floor in the same building
            setTimeout(() => {
              if (!isMoving) handleFloorSelect(currentBuilding, currentFloor + 1);
            }, 500);
          } else if (currentBuilding < workData.companies.length - 1) {
            // Move to the next building, first floor
            setTimeout(() => {
              if (!isMoving) handleFloorSelect(currentBuilding + 1, 0);
            }, 500);
          } else {
            // Cycle complete, go home
            setTimeout(() => {
              setTargetPosition({
                x: 100, // Home position
                y: 300, // Ground level
                buildingIndex: -1,
                floorIndex: -1
              });
              scrollToPosition(0);
              setIsMoving(true);
              setIsInBuilding(false);
              setCurrentBuilding(-1);
              setCurrentFloor(-1);
              setIsResting(true);
            }, 500);
          }
        }
      }, 4000); // Work for 4 seconds on each floor
      
      return () => clearTimeout(workingTimer);
    }
  }, [isWorking, currentBuilding, currentFloor, workData.companies.length]);

  // Rest at home and then restart the cycle
  useEffect(() => {
    if (isResting && !isMoving) {
      const restTimer = setTimeout(() => {
        setIsResting(false);
        setIsCycleComplete(true);
        // Clear active project when at home
        dispatch(setActiveProject(null));
        setShowProjectDetails(false);
        
        const resetTimer = setTimeout(() => {
          setCharacterPosition({ x: 80, y: 380 }); // Reset to home door
          setIsOnRoad(false);
          
          // Add delay before resetting cycle flag
          const cycleTimer = setTimeout(() => {
            setIsCycleComplete(false); // Reset cycle flag to start a new cycle
          }, 500);
          
          return () => clearTimeout(cycleTimer);
        }, 3000);
        
        return () => clearTimeout(resetTimer);
      }, 4000);

      return () => clearTimeout(restTimer);
    }
  }, [isResting, isMoving, dispatch]);

  // Also clear the active project when we're going home
  useEffect(() => {
    if (targetPosition && targetPosition.buildingIndex === -1 && targetPosition.floorIndex === -1) {
      // We're heading home, clear the active project after a small delay
      const clearTimeoutFunc = setTimeout(() => {
        dispatch(setActiveProject(null));
        setShowProjectDetails(false);
      }, 1000);
      
      return () => clearTimeout(clearTimeoutFunc);
    }
  }, [targetPosition, dispatch]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      buildingRefs.current = buildingRefs.current.slice(0, workData.companies.length);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [workData.companies.length]);

  // Calculate the total content width
  const totalWidth = buildingPositions[buildingPositions.length - 1] + 300;

  return (
    <div
      ref={sceneRef}
      className='relative w-full min-h-[540px] bg-background'
      aria-label="Interactive work experience timeline"
    >
      {/* Sky/Background */}
      <div
        className='absolute inset-0 h-[300px] bg-gradient-to-b from-palette-teal-light/20 to-background dark:from-palette-teal-DEFAULT/10'
        aria-hidden="true"
      />
      {/* Road */}
      <div
        className='absolute bottom-0 left-0 right-0 h-[90px] bg-palette-slate/30 dark:bg-palette-slate/50'
        aria-hidden="true"
      >
        {/* Road markings */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-yellow-400 dashed-road-line" aria-hidden="true" />
      </div>
      {/* Scroll container */}
      <div
        ref={scrollContainerRef}
        className="absolute inset-0 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-palette-teal scrollbar-track-transparent"
        style={{ width: '100%' }}
      >
        <div style={{ minWidth: `${totalWidth}px`, height: '100%', position: 'relative' }}>
          <Home position={20} />
          {workData.companies.map((company, buildingIndex) => (
            <Building
              key={`building-${buildingIndex}`}
              ref={(el) => { buildingRefs.current[buildingIndex] = el; }}
              company={company}
              position={buildingPositions[buildingIndex] || 0}
              isCurrent={currentBuilding === buildingIndex}
              currentFloor={currentFloor}
              onFloorSelect={(floorIndex) => handleFloorSelect(buildingIndex, floorIndex)}
              animationLevel={animationLevel}
            />
          ))}
          <Character
            position={characterPosition}
            isMoving={isMoving}
            isInBuilding={isInBuilding}
            isInLift={isInLift}
            isWorking={isWorking}
            isResting={isResting}
            physicsEnabled={physicsEnabled}
          />
        </div>
      </div>
      {/* Project Details Panel - Only show when there's an active project AND we're not at home */}
      <AnimatePresence>
        {activeProject && currentBuilding !== -1 && (
          <ProjectDetails
            company={activeProject.company}
            project={activeProject.project}
            onMinimize={() => {
              // When the card is minimized, we just let the WorkCard component handle it
              // Only hide the card completely when there's no active project
              if (!activeProject) {
                setShowProjectDetails(false);
              }
            }}
            animationLevel={animationLevel}
          />
        )}
      </AnimatePresence>
      {/* Scene Controls - Optional */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          className='px-4 py-2 rounded-md text-sm font-medium bg-palette-teal hover:bg-palette-teal-light text-white'
          onClick={() => handleFloorSelect(0, 0)}
          aria-label="Restart work experience animation"
        >
          Restart Tour
        </button>
      </div>
      {/* Accessibility announcements */}
      <div className="sr-only" aria-live="polite">
        {isWorking && activeProject && (
          <div>
            Now working at {activeProject.company} as {activeProject.project.title}
            from {activeProject.project.startDate} to {activeProject.project.endDate}.
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkScene;