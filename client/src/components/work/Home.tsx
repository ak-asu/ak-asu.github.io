import React from 'react';
import { motion } from 'framer-motion';

interface HomeProps {
  position: number;
}

const Home: React.FC<HomeProps> = ({ position }) => {
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
          className='w-0 h-0 border-l-[80px] border-r-[80px] border-b-[40px] border-l-transparent border-r-transparent border-b-palette-teal-light dark:border-b-palette-teal'
          aria-hidden="true"
        />
        {/* Home body */}
        <div
          className='w-[160px] h-[80px] relative bg-palette-teal-light/80 dark:bg-palette-teal/80 border-palette-teal border-2 overflow-hidden'
          aria-hidden="true"
        >
          {/* Windows */}
          <div className="absolute top-4 left-4 w-6 h-6 flex flex-col gap-1">
            <div
              className='flex-1 bg-yellow-200 dark:bg-yellow-300/80 rounded-sm'
            />
          </div>
          <div className="absolute top-4 right-4 w-6 h-6 flex flex-col gap-1">
            <div
              className='flex-1 bg-yellow-200 dark:bg-yellow-300/80 rounded-sm'
            />
          </div>
          {/* Door */}
          <div
            className='absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-16 bg-palette-slate dark:bg-palette-gray-dark rounded-t-lg'
          >
            <div
              className='absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-yellow-600'
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Home;