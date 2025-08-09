import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
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

interface TimelineItemProps {
  work: WorkEntry;
  index: number;
  isActive: boolean;
  isSelected: boolean;
  onClick: () => void;
  animationLevel: AnimationLevel;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  work,
  index,
  isActive,
  isSelected,
  onClick,
  animationLevel,
}) => {
  const isMobile = useIsMobile();

  const formatDateRange = (startDate: string, endDate: string | null) => {
    try {
      const start = format(new Date(startDate), "MMM yyyy");
      const end = endDate ? format(new Date(endDate), "MMM yyyy") : "Present";
      return `${start} - ${end}`;
    } catch {
      return `${startDate} - ${endDate || "Present"}`;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "professional":
        return "bg-palette-teal";
      case "volunteer":
        return "bg-amber-500 dark:bg-amber-600";
      default:
        return "bg-muted";
    }
  };

  // Position calculations
  const itemSpacing = isMobile ? 172 : 128;
  const cardWidth = 140;
  const cardHeight = 54;
  const dotSize = 8;
  const connectorLength = 50;

  return (
    <div
      className={`absolute ${isMobile ? "flex flex-col items-center" : "flex items-center"}`}
      style={
        isMobile
          ? {
              left: `${index * itemSpacing + itemSpacing / 2}px`,
              top: "16%",
              transform: "translateX(-50%)",
            }
          : {
              top: `${index * itemSpacing + itemSpacing / 2}px`,
              right: "13px",
              transform: "translateY(-50%)",
            }
      }
    >
      {/* Card */}
      <motion.div
        className={`
          relative cursor-pointer rounded-lg border shadow-md p-2
          bg-card border-palette-teal/20 dark:border-palette-teal/10
          ${isSelected ? "ring-2 ring-palette-teal" : ""}
          ${isActive ? "ring-2 ring-palette-teal ring-offset-1" : ""}
        `}
        style={{
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
          [isMobile ? "marginBottom" : "marginRight"]:
            `${connectorLength - 56}px`,
          order: isMobile && index % 2 === 1 ? 2 : 0,
          ...(isMobile && {
            transform: `translateY(-30%)`,
          }),
        }}
        initial={{ scale: 1 }}
        animate={{
          scale: isActive ? 1.2 : 1,
        }}
        whileHover={{ scale: 1.2 }}
        transition={{
          type: animationLevel === AnimationLevel.High ? "spring" : "tween",
          stiffness: 300,
          damping: 20,
          duration: getAnimationLevel(animationLevel, { min: 0.2, max: 0.4 }),
        }}
        onClick={onClick}
      >
        {/* Role */}
        <div
          className={`font-semibold ${isMobile ? "text-xs" : "text-sm"} text-card-foreground leading-tight mb-1 truncate`}
        >
          {work.position}
        </div>

        {/* Date Range */}
        <div
          className={`${isMobile ? "text-[10px]" : "text-xs"} text-muted-foreground leading-tight truncate`}
        >
          {formatDateRange(work.startDate, work.endDate)}
        </div>
      </motion.div>

      {/* Connector Line */}
      {!isMobile && (
        <div
          className={`${getTypeColor(work.type)} h-0.5`}
          style={{
            width: `${connectorLength}px`,
          }}
        />
      )}

      {/* Dot */}
      {!isMobile && (
        <div
          className={`relative ${getTypeColor(work.type)} rounded-full`}
          style={{
            width: `${dotSize}px`,
            height: `${dotSize}px`,
          }}
        >
          {/* Pulse Animation for Active Dot */}
          {isActive && animationLevel !== AnimationLevel.Low && (
            <motion.div
              className="absolute inset-0 rounded-full bg-palette-teal opacity-60"
              animate={{
                scale: [1, 2, 1],
                opacity: [0.6, 0.2, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default TimelineItem;
