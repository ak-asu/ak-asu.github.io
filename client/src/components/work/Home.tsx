import React from 'react';
import { motion } from 'framer-motion';

interface HomeProps {
  position: number;
  isTechnicalMode: boolean;
  isResting: boolean;
}

const Home: React.FC<HomeProps> = ({ position, isTechnicalMode, isResting }) => {
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
          className={`w-0 h-0 border-l-[100px] border-r-[100px] border-b-[80px] 
            ${isTechnicalMode 
              ? 'border-l-transparent border-r-transparent border-b-gray-700' 
              : 'border-l-transparent border-r-transparent border-b-red-700'}`}
          aria-hidden="true"
        />
        
        {/* Home body */}
        <div 
          className={`w-[200px] h-[160px] relative ${
            isTechnicalMode 
              ? 'bg-gray-700 border-gray-600' 
              : 'bg-red-500 border-red-600'
          } border-2 rounded-b-lg overflow-hidden`}
          aria-hidden="true"
        >
          {/* Windows */}
          <div className="absolute top-4 left-4 w-12 h-12 flex flex-col gap-1">
            <div 
              className={`flex-1 ${
                isTechnicalMode ? 'bg-gray-900' : 'bg-yellow-200'
              } ${isResting ? 'animate-pulse' : ''} rounded-sm`}
              style={{ 
                boxShadow: isResting ? `0 0 10px ${isTechnicalMode ? '#22c55e' : '#f59e0b'}` : 'none' 
              }}
            />
          </div>
          
          <div className="absolute top-4 right-4 w-12 h-12 flex flex-col gap-1">
            <div 
              className={`flex-1 ${
                isTechnicalMode ? 'bg-gray-900' : 'bg-yellow-200'
              } rounded-sm`}
            />
          </div>
          
          {/* Door */}
          <div 
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-28 ${
              isTechnicalMode ? 'bg-gray-800' : 'bg-brown-600'
            } rounded-t-lg`}
          >
            <div 
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
                isTechnicalMode ? 'bg-gray-500' : 'bg-yellow-600'
              }`}
            />
          </div>
          
          {/* Home label */}
          <div 
            className={`absolute top-2 left-1/2 -translate-x-1/2 py-1 px-3 rounded-md text-center font-bold text-sm
              ${isTechnicalMode 
                ? 'bg-gray-900 text-green-400' 
                : 'bg-red-700 text-white'}`}
          >
            Home
          </div>
        </div>
      </div>
      
      {/* Glow effect when resting */}
      {isResting && (
        <div 
          className={`absolute -inset-4 rounded-2xl opacity-20 animate-pulse ${
            isTechnicalMode ? 'bg-green-500' : 'bg-yellow-500'
          }`}
          style={{
            filter: 'blur(8px)'
          }}
        />
      )}
    </motion.div>
  );
};

export default Home;