import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimationLevel, Company, getAnimationLevel } from '@/lib/types';
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
    const floorHeight = 80;
    const buildingHeight = Math.max(2, company.projects.length) * floorHeight;
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
        className={`absolute bottom-[320px] ${isCurrent ? 'z-20' : 'z-10'}`}
        style={{ left: position, width: buildingWidth }}
        variants={buildingVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        aria-label={`${company.name} building with ${company.projects.length} ${company.projects.length === 1 ? 'project' : 'projects'}`}
      >
        <div
          className='absolute -top-8 left-0 right-0 text-center font-bold text-blue-800'
          aria-hidden="true"
        >
          {company.name}
        </div>
        <div
          className={`relative w-full h-[${buildingHeight}px] bg-amber-200 border-amber-300 border-2 rounded-t-lg overflow-hidden`}
          style={{ height: buildingHeight }}
        >
          {company.projects.map((project, index) => (
            <Floor
              key={`floor-${index}`}
              project={project}
              floorIndex={index}
              position={{
                bottom: index * floorHeight,
                height: floorHeight
              }}
              isActive={isCurrent && currentFloor === index}
              onSelect={() => onFloorSelect(index)}
            />
          ))}
          {/* Building lift shaft */}
          <div
            className='absolute left-6 bottom-0 w-12 h-full bg-amber-300 border-r border-amber-400'
            aria-hidden="true"
          />
          {/* Building entrance */}
          <div
            className='absolute bottom-0 left-1/4 right-1/4 h-12 bg-amber-800 rounded-t-lg border-t border-l border-r border-amber-900'
            aria-hidden="true"
          />
          {/* Company badge */}
          <div className="absolute top-2 right-2 bg-gray-900 text-green-400 text-xs font-mono p-1 rounded">
            {company.name.split(' ')[0]}
          </div>
        </div>
        {/* Building foundation */}
        <div
          className='w-full h-6 bg-amber-800 rounded-b-sm'
          aria-hidden="true"
        />
        {/* Building highlight when current */}
        <AnimatePresence>
          {isCurrent && (
            <motion.div
              className="absolute -inset-2 rounded-lg opacity-20 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              exit={{ opacity: 0 }}
              style={{
                backgroundColor: '#3b82f6'
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