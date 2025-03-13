import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

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

  // Update animation when position changes
  useEffect(() => {
    // Determine if character is moving left or right
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

  const getCharacterSprite = () => {
    if (isInLift) {
      return "/assets/character/lift.png";
    } else if (isWorking) {
      return "/assets/character/working.png";
    } else if (isResting) {
      return "/assets/character/resting.png";
    } else if (isMoving) {
      return "/assets/character/walking.png";
    } else {
      return "/assets/character/standing.png";
    }
  };

  return (
    <motion.div
      className="absolute z-40"
      style={{ originX: 0.5, originY: 1 }}
      animate={controls}
      initial={{ x: position.x, y: position.y }}
    >
      <div
        className={`relative w-16 h-32 ${isMoving ? 'animate-bounce-subtle' : ''}`}
        style={{
          transform: facingLeft.current ? 'scaleX(-1)' : 'scaleX(1)',
          filter: 'hue-rotate(120deg) brightness(1.2)'
        }}
      >
        {/* {<Image
          src={getCharacterSprite()}
          alt="Character"
          layout="fill"
          objectFit="contain"
          priority
        />} */}
      </div>
      {/* Speech bubble for working or resting states */}
      {(isWorking || isResting) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -10 }}
          className='absolute -top-16 left-1/2 -translate-x-1/2 p-2 rounded-lg min-w-[120px] text-center text-sm bg-white text-blue-700 border border-blue-300'
        >
          {isWorking ? (
            <span>Working...</span>
          ) : (
            <span>Resting at home</span>
          )}
          <div
            className='absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rotate-45 bg-white border-r border-b border-blue-300'
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default Character;