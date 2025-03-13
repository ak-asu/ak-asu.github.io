import React from 'react';
import { motion } from 'framer-motion';
import { Project } from '../../lib/types';

interface FloorProps {
  project: Project;
  floorIndex: number;
  position: { bottom: number; height: number };
  isActive: boolean;
  onSelect: () => void;
}

const Floor: React.FC<FloorProps> = ({
  project,
  floorIndex,
  position,
  isActive,
  onSelect,
}) => {
  return (
    <motion.div
      className={`absolute left-0 right-0 bg-amber-200 ${isActive ? 'z-20' : 'z-10'} border-b border-amber-300`}
      style={{
        bottom: position.bottom,
        height: position.height,
      }}
      whileHover={{
        backgroundColor: '#fcd34d',
      }}
      onClick={onSelect}
      aria-label={`${project.title}, floor ${floorIndex + 1}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect();
        }
      }}
    >
      {/* Window(s) */}
      <div className="absolute right-8 inset-y-2 flex flex-col gap-1">
        <div
          className={`flex-1 bg-blue-200 ${isActive ? 'animate-pulse' : ''} rounded-sm`}
          style={{
            boxShadow: isActive ? '0 0 10px #3b82f6' : 'none'
          }}
          aria-hidden="true"
        />
      </div>

      {/* Floor number badge */}
      <div
        className='absolute top-1 left-24 bg-blue-600 text-white text-xs px-1 rounded-sm'
        aria-hidden="true"
      >
        {floorIndex + 1}
      </div>

      {/* Project title (visible on hover) */}
      <motion.div
        className='absolute inset-0 flex items-center justify-center bg-white/70 text-blue-800 opacity-0 hover:opacity-100 transition-opacity'
        aria-hidden="true"
      >
        <p className="text-xs font-medium text-center px-2">{project.title}</p>
      </motion.div>
    </motion.div>
  );
};

export default Floor;