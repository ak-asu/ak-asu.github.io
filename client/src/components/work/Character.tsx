import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { User, UserCog, Home, UserCheck } from 'lucide-react';
import { characterSize, CharacterState } from './utils';

interface CharacterProps {
  position: { x: number; y: number };
  isInBuilding: boolean;
  characterState: CharacterState
}

const Character: React.FC<CharacterProps> = ({
  position,
  isInBuilding,
  characterState
}) => {
  const controls = useAnimation();
  const prevPositionRef = useRef(position);
  const facingLeft = useRef(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const getTransitionProps = () => {
    return {
      type: "spring",
      stiffness: 100,
      damping: 20,
      mass: 1
    };
  };

  const getOpacity = () => {
    return isInBuilding || characterState===CharacterState.Resting ? 0.8 : 1;
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
  }, [position, controls]);

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
        className={`relative flex items-center justify-center ${characterState===CharacterState.Moving ? 'animate-bounce-subtle' : ''}`}
        style={{
          transform: facingLeft.current ? 'scaleX(-1)' : 'scaleX(1)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="w-12 h-12 flex items-center justify-center bg-palette-teal rounded-full shadow-lg">
          {characterState===CharacterState.Working ? (
            <UserCog className="text-white" size={characterSize} />
          ) : characterState===CharacterState.Resting ? (
            <Home className="text-white" size={characterSize} />
          ) : characterState===CharacterState.Moving ? (
            <User className="text-white animate-pulse" size={characterSize} />
          ) : (
            <UserCheck className="text-white" size={characterSize} />
          )}
        </div>
      </div>
      {isHovered && (characterState===CharacterState.Working || characterState===CharacterState.Resting) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -10 }}
          className='absolute -top-16 left-1/2 -translate-x-1/2 p-2 rounded-lg min-w-[120px] text-center text-sm bg-white dark:bg-palette-gray-dark text-palette-teal border border-palette-teal/30'
        >
          {characterState===CharacterState.Working ? (
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