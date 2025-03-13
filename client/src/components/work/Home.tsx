import React from 'react';
import { motion } from 'framer-motion';

interface HomeProps {
  position: number;
  isResting: boolean;
}

const Home: React.FC<HomeProps> = ({ position, isResting }) => {
  // Home building is simpler than work buildings
  return (
    <motion.div
      className="absolute bottom-20"
      style={{ left: position }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Home structure */}
      <div className="relative">
        {/* Home roof */}
        <div
          className='w-0 h-0 border-l-[100px] border-r-[100px] border-b-[80px] border-l-transparent border-r-transparent border-b-red-700'
          aria-hidden="true"
        />

        {/* Home body */}
        <div
          className='w-[200px] h-[160px] relative bg-red-500 border-red-600 border-2 rounded-b-lg overflow-hidden'
          aria-hidden="true"
        >
          {/* Windows */}
          <div className="absolute top-4 left-4 w-12 h-12 flex flex-col gap-1">
            <div
              className={`flex-1 bg-yellow-200 ${isResting ? 'animate-pulse' : ''} rounded-sm`}
              style={{
                boxShadow: isResting ? '0 0 10px #f59e0b' : 'none'
              }}
            />
          </div>
          <div className="absolute top-4 right-4 w-12 h-12 flex flex-col gap-1">
            <div
              className='flex-1 bg-yellow-200 rounded-sm'
            />
          </div>
          {/* Door */}
          <div
            className='absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-28 bg-brown-600 rounded-t-lg'
          >
            <div
              className='absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-yellow-600'
            />
          </div>

          {/* Home label */}
          <div
            className='absolute top-2 left-1/2 -translate-x-1/2 py-1 px-3 rounded-md text-center font-bold text-sm bg-red-700 text-white'
          >
            Home
          </div>
        </div>
      </div>

      {/* Glow effect when resting */}
      {isResting && (
        <div
          className='absolute -inset-4 rounded-2xl opacity-20 animate-pulse bg-yellow-500'
          style={{
            filter: 'blur(8px)'
          }}
        />
      )}
    </motion.div>
  );
};

export default Home;