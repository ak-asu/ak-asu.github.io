import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setActiveProject } from '../store/features/workSlice';
import Building from './work/Building';
import Character from './work/Character';
import Home from './work/Home';
import ProjectDetails from './work/ProjectDetails';
import workData from '@/data/work.json';
import { WorkData, Company, Project } from '../types/work';

// Prepare data structure for the scene
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
  const isTechnicalMode = useSelector((state: RootState) => state.mode.isTechnicalMode);
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
  
  const sceneRef = useRef<HTMLDivElement>(null);
  const buildingRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Calculate positions based on scene dimensions
  const calculateBuildingPositions = () => {
    if (!sceneRef.current) return [];
    
    const sceneWidth = sceneRef.current.clientWidth;
    const buildingWidth = 200; // Base width for buildings
    const gapWidth = 100; // Gap between buildings
    const totalBuildings = workData.companies.length;
    const startX = 50; // Initial offset
    
    return workData.companies.map((_, index) => {
      return startX + index * (buildingWidth + gapWidth);
    });
  };
  
  const buildingPositions = calculateBuildingPositions();

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

  // Character movement logic
  useEffect(() => {
    if (!targetPosition || !isMoving) return;
    
    // Logic for character movement
    const moveCharacter = async () => {
      // If character is in a different building or outside
      if (currentBuilding !== targetPosition.buildingIndex) {
        // If inside a building, exit first
        if (isInBuilding) {
          // Exit animation
          setIsWorking(false);
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait for work animation to complete
          
          // Move to building exit
          setCharacterPosition(prev => ({ ...prev, x: buildingPositions[currentBuilding] + 150 }));
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for horizontal movement
          
          setIsInBuilding(false);
        }
        
        // Move horizontally to the target building
        setCharacterPosition(prev => ({ ...prev, x: buildingPositions[targetPosition.buildingIndex] }));
        await new Promise(resolve => setTimeout(resolve, 1500)); // Wait for horizontal movement
        
        // Enter the building
        setIsInBuilding(true);
        setCurrentBuilding(targetPosition.buildingIndex);
        
        // If target is not ground floor, use the lift
        if (targetPosition.floorIndex > 0) {
          setIsInLift(true);
          // Move to the lift position
          setCharacterPosition(prev => ({ ...prev, x: buildingPositions[targetPosition.buildingIndex] + 30 }));
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait for horizontal movement
          
          // Go up in the lift
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
          
          // Use the lift
          setIsInLift(true);
          // Move to the lift position
          setCharacterPosition(prev => ({ ...prev, x: buildingPositions[targetPosition.buildingIndex] + 30 }));
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait for horizontal movement
          
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
      
      // Show project details
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

  // Auto cycle through buildings and floors
  useEffect(() => {
    // Only start the cycle if not already in progress and not manually interacting
    if (!isCycleComplete && !isMoving && !isWorking && currentBuilding === -1) {
      // Start with the first building, first floor
      handleFloorSelect(0, 0);
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
            handleFloorSelect(currentBuilding, currentFloor + 1);
          } else if (currentBuilding < workData.companies.length - 1) {
            // Move to the next building, first floor
            handleFloorSelect(currentBuilding + 1, 0);
          } else {
            // Cycle complete, go home
            const homePosition = buildingPositions[buildingPositions.length - 1] + 300;
            setTargetPosition({
              x: homePosition,
              y: 300, // Ground level
              buildingIndex: -1,
              floorIndex: -1
            });
            setIsMoving(true);
            setIsInBuilding(false);
            setCurrentBuilding(-1);
            setCurrentFloor(-1);
            setIsResting(true);
          }
        }
      }, 5000); // Work for 5 seconds on each floor
      
      return () => clearTimeout(workingTimer);
    }
  }, [isWorking, currentBuilding, currentFloor, workData.companies, buildingPositions]);

  // Rest at home and then restart the cycle
  useEffect(() => {
    if (isResting) {
      const restTimer = setTimeout(() => {
        setIsResting(false);
        setIsCycleComplete(true);
        
        // After resting, go back to the first building
        setTimeout(() => {
          setCharacterPosition({ x: 0, y: 300 }); // Move back to start position
          setIsCycleComplete(false); // Reset cycle flag to start a new cycle
        }, 3000);
      }, 5000); // Rest for 5 seconds
      
      return () => clearTimeout(restTimer);
    }
  }, [isResting]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      buildingRefs.current = buildingRefs.current.slice(0, workData.companies.length);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [workData.companies.length]);

  return (
    <div 
      ref={sceneRef}
      className={`relative w-full min-h-[600px] overflow-hidden ${
        isTechnicalMode ? 'bg-gray-900' : 'bg-blue-50'
      }`}
      aria-label="Interactive work experience timeline"
    >
      {/* Sky/Background */}
      <div 
        className={`absolute inset-0 h-[300px] ${
          isTechnicalMode ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'bg-gradient-to-b from-sky-300 to-blue-50'
        }`}
        aria-hidden="true"
      />
      
      {/* Ground */}
      <div 
        className={`absolute bottom-0 w-full h-[300px] ${
          isTechnicalMode ? 'bg-gray-800' : 'bg-amber-100'
        }`}
        aria-hidden="true"
      >
        {/* Road */}
        <div 
          className={`absolute bottom-20 left-0 right-0 h-20 ${
            isTechnicalMode ? 'bg-gray-700' : 'bg-gray-400'
          }`}
          aria-hidden="true"
        >
          {/* Road markings */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-yellow-400 dashed-line" aria-hidden="true" />
        </div>
      </div>
      
      {/* Buildings */}
      {workData.companies.map((company, buildingIndex) => (
        <Building
          key={`building-${buildingIndex}`}
          ref={(el) => { buildingRefs.current[buildingIndex] = el; }}
          company={company}
          position={buildingPositions[buildingIndex] || 0}
          isCurrent={currentBuilding === buildingIndex}
          currentFloor={currentFloor}
          isTechnicalMode={isTechnicalMode}
          onFloorSelect={(floorIndex) => handleFloorSelect(buildingIndex, floorIndex)}
          animationLevel={animationLevel}
        />
      ))}
      
      {/* Home building at the end */}
      <Home 
        position={(buildingPositions[buildingPositions.length - 1] || 0) + 300}
        isTechnicalMode={isTechnicalMode}
        isResting={isResting}
      />
      
      {/* Character */}
      <Character
        position={characterPosition}
        isMoving={isMoving}
        isInBuilding={isInBuilding}
        isInLift={isInLift}
        isWorking={isWorking}
        isResting={isResting}
        isTechnicalMode={isTechnicalMode}
        physicsEnabled={physicsEnabled}
      />
      
      {/* Project Details Panel */}
      <AnimatePresence>
        {showProjectDetails && activeProject && (
          <ProjectDetails
            company={activeProject.company}
            project={activeProject.project}
            onClose={() => setShowProjectDetails(false)}
            isTechnicalMode={isTechnicalMode}
            animationLevel={animationLevel}
          />
        )}
      </AnimatePresence>
      
      {/* Scene Controls - Optional */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            isTechnicalMode ? 'bg-green-700 hover:bg-green-600 text-green-100' : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
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
      
      {/* Technical mode debug overlay */}
      {isTechnicalMode && (
        <div className="absolute top-2 left-2 bg-black/70 text-green-400 text-xs font-mono p-2 rounded pointer-events-none">
          <p>Building: {currentBuilding >= 0 ? workData.companies[currentBuilding]?.name : 'None'}</p>
          <p>Floor: {currentFloor >= 0 ? currentFloor : 'None'}</p>
          <p>Status: {isMoving ? 'Moving' : isWorking ? 'Working' : isResting ? 'Resting' : 'Idle'}</p>
          <p>Position: x:{Math.round(characterPosition.x)}, y:{Math.round(characterPosition.y)}</p>
        </div>
      )}
    </div>
  );
};

export default WorkScene;