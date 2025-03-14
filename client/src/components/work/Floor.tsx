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
      className={`absolute left-0 right-0 ${isActive ? 'z-20' : 'z-10'}`}
      style={{
        bottom: position.bottom,
        height: position.height,
      }}
      whileHover={{
        backgroundColor: 'rgba(115, 211, 231, 0.2)', // palette-teal-light with opacity
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
      <motion.div
        className='absolute inset-0 flex items-center justify-center text-palette-teal dark:text-palette-teal-light opacity-0 hover:opacity-100 transition-opacity'
        aria-hidden="true"
      >
        <p className="text-xs font-medium text-center px-2">{project.title}</p>
      </motion.div>
    </motion.div>
  );
};

export default Floor;