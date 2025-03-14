import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimationLevel, Company, getAnimationLevel } from '@/lib/types';
import { Building as BuildingIcon } from 'lucide-react';
import Floor from './Floor';

interface BuildingProps {
  company: Company;
  position: number;
  isCurrent: boolean;
  currentFloor: number;
  onFloorSelect: (floorIndex: number) => void;
  animationLevel: AnimationLevel;
}

const Building = forwardRef<HTMLDivElement, BuildingProps>(
  ({ company, position, isCurrent, currentFloor, onFloorSelect, animationLevel }, ref) => {
    const floorHeight = 48; // h-12 equivalent in pixels
    // Add an extra floor for the ground floor
    const buildingHeight = (company.projects.length + 1) * floorHeight;
    const buildingWidth = 180;
    const buildingVariants = {
      initial: {
        opacity: 0,
        y: 50,
      },
      animate: {
        opacity: 1,
        y: 0,
        transition: {
          duration: getAnimationLevel(animationLevel, { min: 0.5, max: 0.8 }),
          type: animationLevel === AnimationLevel.High ? 'spring' : 'tween',
          stiffness: 100,
          damping: 15,
        }
      },
      hover: animationLevel === AnimationLevel.Low ? {} : {
        scale: 1.02,
        transition: {
          duration: 0.3,
          type: 'spring',
          stiffness: 300,
          damping: 15,
        }
      }
    };

    return (
      <motion.div
        ref={ref}
        className={`absolute bottom-20 ${isCurrent ? 'z-20' : 'z-10'}`}
        style={{ left: position, width: buildingWidth }}
        variants={buildingVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        aria-label={`${company.name} building with ${company.projects.length} ${company.projects.length === 1 ? 'project' : 'projects'}`}
      >
        {/* Building roof with company name */}
        <div className='absolute -top-9 left-4 right-4 bg-slate-200 dark:bg-slate-700 py-1 text-center font-medium text-slate-800 dark:text-slate-200 border-2 border-slate-500 border-b-2 rounded-t-sm'>
          <span>{company.name}</span>
        </div>
        <div
          className={`relative w-full bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 border-1 overflow-hidden`}
          style={{ height: buildingHeight }}
        >
          {/* Floor divider lines - start from 1 to create ground floor */}
          {Array.from({ length: company.projects.length + 1 }).map((_, index) => (
            index > 0 && (
              <div 
                key={`divider-${index}`} 
                className="absolute left-12 right-0 border-t border-slate-300 dark:border-slate-600"
                style={{ bottom: index * floorHeight }}
                aria-hidden="true"
              />
            )
          ))}          
          {/* Ground floor - empty */}
          <div className="absolute bottom-0 left-0 right-0" style={{ height: floorHeight }} aria-label="Ground floor" />
          {company.projects.map((project, index) => (
            <React.Fragment key={`floor-${index}`}>
              <Floor
                project={project}
                floorIndex={index}
                position={{
                  bottom: (index + 1) * floorHeight, // +1 to start from first floor
                  height: floorHeight
                }}
                isActive={isCurrent && currentFloor === index}
                onSelect={() => onFloorSelect(index)}
              />
              <div 
                className="absolute right-4 flex items-center justify-center text-sm font-medium"
                style={{ 
                  bottom: (index + 1) * floorHeight + floorHeight/2 - 10,
                  height: 20 
                }}
                aria-hidden="true"
              >
                <div className="group relative">
                  <span>{index + 1}</span>
                  <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block px-2 py-1 rounded shadow-md text-xs whitespace-nowrap">
                    {project.title}
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
          {/* Building lift */}
          <div className='absolute left-0 bottom-0 w-12 h-full bg-slate-200 dark:bg-slate-700 border-r border-slate-300 dark:border-slate-600' aria-hidden="true" />
          {/* Building door */}
          <div className='absolute bottom-0 left-14 right-14 h-10 bg-palette-slate dark:bg-palette-slate/70 rounded-t-lg border-t border-l border-r border-palette-slate/30' aria-hidden="true" />
        </div>        
        {/* Building highlight when current */}
        <AnimatePresence>
          {isCurrent && (
            <motion.div
              className="absolute -inset-2 rounded-lg opacity-20 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              exit={{ opacity: 0 }}
              style={{
                backgroundColor: 'var(--palette-teal)'
              }}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

Building.displayName = 'Building';

export default Building;