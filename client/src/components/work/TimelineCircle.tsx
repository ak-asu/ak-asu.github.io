import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Building2, Calendar, MapPin } from "lucide-react";
import { AnimationLevel, getAnimationLevel } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";

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
  animationLevel,
}) => {
  const isMobile = useIsMobile();

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM yyyy");
    } catch {
      return dateString;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "professional":
        return "bg-palette-teal text-white";
      case "volunteer":
        return "bg-amber-500 dark:bg-amber-600 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
  return (
    <motion.div
      className={isMobile ? "relative flex-shrink-0" : "absolute left-3/4"}
      style={
        isMobile
          ? { left: `${index * 120 + 60}px` }
          : { top: `${index * 140 + 50}px` }
      }
      initial={{ scale: 0.8 }}
      animate={{
        scale: isActive ? 1.2 : 1,
      }}
      transition={{
        type: animationLevel === AnimationLevel.High ? "spring" : "tween",
        stiffness: 300,
        damping: 20,
        duration: getAnimationLevel(animationLevel, { min: 0.2, max: 0.5 }),
      }}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Main Circle */}
      <div
        className={`
        relative ${isMobile ? "w-16 h-16" : "w-20 h-20"} rounded-full shadow-lg transition-all duration-300 ${isMobile ? "" : "transform -translate-x-1/2"}
        ${
          isActive
            ? `${getTypeColor(work.type)} ring-4 ring-palette-teal ring-offset-2`
            : isSelected
              ? `${getTypeColor(work.type)} ring-2 ring-palette-teal`
              : `${getTypeColor(work.type)}`
        }
      `}
      >
        {/* Icon */}
        <div
          className={`
          absolute inset-0 flex items-center justify-center
          ${isActive || isSelected ? "text-white" : "text-foreground"}
        `}
        >
          {/* Date Range */}
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar size={12} className="mr-1 text-palette-teal" />
            <span>
              {formatDate(work.startDate)} -{" "}
              {work.endDate ? formatDate(work.endDate) : "Present"}
            </span>
          </div>
        </div>
        {/* Pulse Animation for Active */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-full bg-palette-teal opacity-60"
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.6, 0.2, 0.6],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </div>
      {/* Info Card */}
      <motion.div
        className={`
          relative ${isMobile ? "h-20 w-32 left-1/2 top-20 -translate-x-1/2" : "h-24 w-40 right-56 -top-20"} bg-card rounded-lg shadow-lg p-3
          border border-palette-teal/20 dark:border-palette-teal/10
          ${isActive ? "opacity-100 translate-x-0" : "opacity-70 translate-x-2"}
        `}
        initial={{ opacity: 0, x: isMobile ? 0 : 10 }}
        animate={{
          opacity: isActive ? 100 : 70,
          x: isActive ? 0 : isMobile ? 0 : 8,
          y: isActive && isMobile ? -5 : 0,
          scale: isActive ? 1.05 : 1,
        }}
        transition={{ delay: 0.1 }}
      >
        {/* Position */}
        <h3
          className={`font-bold ${isMobile ? "text-xs" : "text-sm"} text-card-foreground mb-1`}
        >
          {work.position}
        </h3>
        {/* Company */}
        <div
          className={`flex items-center ${isMobile ? "text-[10px]" : "text-xs"} text-muted-foreground mb-1`}
        >
          <Building2
            size={isMobile ? 10 : 12}
            className="mr-1 text-palette-teal"
          />
          <span className="truncate">{work.company}</span>
        </div>
        {/* Location */}
        <div
          className={`flex items-center ${isMobile ? "text-[10px]" : "text-xs"} text-muted-foreground mb-1`}
        >
          <MapPin
            size={isMobile ? 10 : 12}
            className="mr-1 text-palette-teal"
          />
          <span className="truncate">{work.location}</span>
        </div>
        {/* Arrow pointing to circle */}
        <div
          className={`absolute ${isMobile ? "top-[-6px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-transparent border-b-card" : "right-[-6px] top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-l-[6px] border-transparent border-l-card"}`}
        />
      </motion.div>
    </motion.div>
  );
};

export default TimelineCircle;
