import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Building2, Calendar, MapPin } from 'lucide-react';
import { AnimationLevel, getAnimationLevel } from '@/lib/types';

interface WorkEntry {
  position: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | null;
  description: string[];
  type: string;
}

interface TimelineCircleProps {
  work: WorkEntry;
  index: number;
  isActive: boolean;
  isSelected: boolean;
  onClick: () => void;
  animationLevel: AnimationLevel;
}

const TimelineCircle: React.FC<TimelineCircleProps> = ({
  work,
  index,
  isActive,
  isSelected,
  onClick,
  animationLevel
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM yyyy');
    } catch {
      return dateString;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'professional':
        return 'bg-palette-teal text-white';
      case 'volunteer':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };
  return (
    <motion.div
      className="absolute left-3/4"
      style={{ top: `${index * 140 + 50}px` }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: isActive ? 1.2 : 1,
        x: isActive ? '10%' : '0%'
      }}
      transition={{
        type: animationLevel === AnimationLevel.High ? 'spring' : 'tween',
        stiffness: 300,
        damping: 20,
        duration: getAnimationLevel(animationLevel, { min: 0.2, max: 0.5 })
      }}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >{/* Main Circle */}
      <div className={`
        relative w-20 h-20 rounded-full shadow-lg transition-all duration-300 transform -translate-x-1/2
        ${isActive
          ? `${getTypeColor(work.type)} ring-4 ring-palette-teal/30 ring-offset-2`
          : isSelected
            ? `${getTypeColor(work.type)} ring-2 ring-palette-teal/50`
            : `${getTypeColor(work.type)} opacity-80 hover:opacity-100`
        }
      `}>
        {/* Icon */}
        <div className={`
          absolute inset-0 flex items-center justify-center
          ${isActive || isSelected ? 'text-white' : 'text-palette-teal'}
        `}>
          {/* Date Range */}
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Calendar size={12} className="mr-1 text-palette-teal" />
            <span>
              {formatDate(work.startDate)} - {work.endDate ? formatDate(work.endDate) : 'Present'}
            </span>
          </div>
        </div>
        {/* Pulse Animation for Active */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-full bg-palette-teal opacity-60"
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.6, 0.2, 0.6]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </div>
      {/* Info Card */}
      <motion.div
        className={`
          relative h-24 w-40 right-56 -top-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3
          border border-palette-teal/20 dark:border-palette-teal/10
          ${isActive ? 'opacity-100 translate-x-0' : 'opacity-70 translate-x-2'}
        `}
        initial={{ opacity: 0, x: 10 }}
        animate={{
          opacity: isActive ? 100 : 70,
          x: isActive ? 0 : 8,
          scale: isActive ? 1.05 : 1
        }}
        transition={{ delay: 0.1 }}
      >
        {/* Position */}
        <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-1">
          {work.position}
        </h3>
        {/* Company */}
        <div className="flex items-center text-xs text-gray-600 dark:text-gray-300 mb-1">
          <Building2 size={12} className="mr-1 text-palette-teal" />
          <span className="truncate">{work.company}</span>
        </div>
        {/* Location */}
        <div className="flex items-center text-xs text-gray-600 dark:text-gray-300 mb-1">
          <MapPin size={12} className="mr-1 text-palette-teal" />
          <span className="truncate">{work.location}</span>
        </div>
        {/* Arrow pointing to circle */}
        <div className="absolute right-[-6px] top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-l-[6px] border-transparent border-l-white dark:border-l-gray-800" />
      </motion.div>
    </motion.div>
  );
};

export default TimelineCircle;