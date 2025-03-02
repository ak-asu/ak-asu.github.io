import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface ProjectDetailsProps {
  company: string;
  project: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    type: string;
  };
  onClose: () => void;
  isTechnicalMode: boolean;
  animationLevel: string;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  company,
  project,
  onClose,
  isTechnicalMode,
  animationLevel
}) => {
  const [activeTab, setActiveTab] = useState<'description' | 'details'>('description');
  const [isLoading, setIsLoading] = useState(false);

  // Format dates for display
  const formatDate = (dateString: string) => {
    if (dateString === 'Present') return 'Present';
    try {
      return format(new Date(dateString), 'MMM yyyy');
    } catch {
      return dateString;
    }
  };
  
  // Handle tab switching with loading animation
  const handleTabSwitch = (tab: 'description' | 'details') => {
    if (tab === activeTab) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsLoading(false);
    }, animationLevel === 'expert' ? 800 : 400);
  };

  return (
    <motion.div 
      className={`absolute left-1/2 top-4 -translate-x-1/2 w-[90%] max-w-md rounded-lg shadow-lg z-50 overflow-hidden
        ${isTechnicalMode 
          ? 'bg-gray-800 border border-green-500' 
          : 'bg-white border border-blue-300'}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        type: animationLevel === 'expert' ? 'spring' : 'tween',
        stiffness: 300,
        damping: 20
      }}
    >
      {/* Header */}
      <div 
        className={`p-3 flex justify-between items-center
          ${isTechnicalMode 
            ? 'bg-gray-900 text-green-400' 
            : 'bg-blue-600 text-white'}`}
      >
        <h3 className="text-lg font-bold truncate">{project.title}</h3>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-black/20"
          aria-label="Close details"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Company name badge */}
      <div 
        className={`mx-3 -mt-2 px-2 py-1 text-xs inline-block rounded
          ${isTechnicalMode 
            ? 'bg-green-900 text-green-300' 
            : 'bg-blue-700 text-white'}`}
      >
        {company}
      </div>
      
      {/* Tab navigation */}
      <div className="flex border-b px-2 pt-2">
        <button
          className={`px-3 py-1 text-sm font-medium rounded-t-md ${
            activeTab === 'description'
              ? isTechnicalMode 
                ? 'bg-gray-700 text-green-400 border-b-2 border-green-500' 
                : 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
              : isTechnicalMode
                ? 'text-gray-400 hover:text-gray-300' 
                : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => handleTabSwitch('description')}
        >
          Description
        </button>
        <button
          className={`px-3 py-1 text-sm font-medium rounded-t-md ${
            activeTab === 'details'
              ? isTechnicalMode 
                ? 'bg-gray-700 text-green-400 border-b-2 border-green-500' 
                : 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
              : isTechnicalMode
                ? 'text-gray-400 hover:text-gray-300' 
                : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => handleTabSwitch('details')}
        >
          Details
        </button>
      </div>
      
      {/* Content area */}
      <div className="p-4 min-h-[200px]">
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center items-center h-[200px]">
            <div 
              className={`w-8 h-8 rounded-full border-t-2 border-b-2 animate-spin
                ${isTechnicalMode 
                  ? 'border-green-500' 
                  : 'border-blue-500'}`}
            />
          </div>
        )}
        
        {/* Tab content */}
        {!isLoading && (
          <AnimatePresence mode="wait">
            {activeTab === 'description' ? (
              <motion.div
                key="description"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`text-sm ${isTechnicalMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                <p>{project.description}</p>
              </motion.div>
            ) : (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <div>
                  <div className={`text-xs font-medium ${isTechnicalMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Position
                  </div>
                  <div className={`${isTechnicalMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {project.title}
                  </div>
                </div>
                
                <div>
                  <div className={`text-xs font-medium ${isTechnicalMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Duration
                  </div>
                  <div className={`${isTechnicalMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {formatDate(project.startDate)} - {formatDate(project.endDate)}
                  </div>
                </div>
                
                <div>
                  <div className={`text-xs font-medium ${isTechnicalMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Type
                  </div>
                  <div 
                    className={`inline-block px-2 py-1 text-xs rounded-full
                      ${project.type === 'professional'
                        ? isTechnicalMode
                          ? 'bg-green-900 text-green-300'
                          : 'bg-blue-100 text-blue-800'
                        : isTechnicalMode
                          ? 'bg-yellow-900 text-yellow-300'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                  >
                    {project.type.charAt(0).toUpperCase() + project.type.slice(1)}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};

export default ProjectDetails;