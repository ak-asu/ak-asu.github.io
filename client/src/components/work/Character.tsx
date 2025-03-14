import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { User, UserCog, Loader, Home, UserCheck } from 'lucide-react';

interface CharacterProps {
  position: { x: number; y: number };
  isMoving: boolean;
  isInBuilding: boolean;
  isInLift: boolean;
  isWorking: boolean;
  isResting: boolean;
  physicsEnabled: boolean;
}

const Character: React.FC<CharacterProps> = ({
  position,
  isMoving,
  isInBuilding,
  isInLift,
  isWorking,
  isResting,
  physicsEnabled
}) => {
  const controls = useAnimation();
  const prevPositionRef = useRef(position);
  const facingLeft = useRef(false);

  const getTransitionProps = () => {
    if (!physicsEnabled) {
      return { duration: 0.5 };
    }
    return {
      type: "spring",
      stiffness: 100,
      damping: 20,
      mass: 1
    };
  };

  const getOpacity = () => {
    return isInBuilding || isResting ? 0.8 : 1;
  };

  useEffect(() => {
    if (position.x < prevPositionRef.current.x) {
      facingLeft.current = true;
    } else if (position.x > prevPositionRef.current.x) {
      facingLeft.current = false;
    }
    controls.start({
      x: position.x,
      y: position.y,
      transition: getTransitionProps()
    });
    prevPositionRef.current = position;
  }, [position, controls, physicsEnabled]);

  useEffect(() => {
    controls.set({ x: position.x, y: position.y });
  }, []);

  return (
    <motion.div
      className="absolute z-40"
      style={{ 
        originX: 0.5, 
        originY: 1,
        opacity: getOpacity(),
        transition: "opacity 0.3s ease-in-out"
      }}
      animate={controls}
      initial={{ x: position.x, y: position.y }}
    >
      <div
        className={`relative flex items-center justify-center ${isMoving ? 'animate-bounce-subtle' : ''}`}
        style={{
          transform: facingLeft.current ? 'scaleX(-1)' : 'scaleX(1)',
        }}
      >
        <div className="w-12 h-12 flex items-center justify-center bg-palette-teal rounded-full shadow-lg">
          {isInLift ? (
            <Loader className="text-white animate-spin" size={24} />
          ) : isWorking ? (
            <UserCog className="text-white" size={24} />
          ) : isResting ? (
            <Home className="text-white" size={24} />
          ) : isMoving ? (
            <User className="text-white animate-pulse" size={24} />
          ) : (
            <UserCheck className="text-white" size={24} />
          )}
        </div>
      </div>
      {(isWorking || isResting) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -10 }}
          className='absolute -top-16 left-1/2 -translate-x-1/2 p-2 rounded-lg min-w-[120px] text-center text-sm bg-white dark:bg-palette-gray-dark text-palette-teal border border-palette-teal/30'
        >
          {isWorking ? (
            <span>Working...</span>
          ) : (
            <span>At home</span>
          )}
          <div
            className='absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rotate-45 bg-white dark:bg-palette-gray-dark border-r border-b border-palette-teal/30'
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default Character;