import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Minus, Maximize2, Briefcase } from 'lucide-react';
import { AnimationLevel, getAnimationLevel } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface WorkDetailsProps {
  company: string;
  project: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    type: string;
  };
  onMinimize: () => void;
  animationLevel: AnimationLevel;
}

const WorkDetails: React.FC<WorkDetailsProps> = ({
  company,
  project,
  onMinimize,
  animationLevel
}) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'description' | 'details'>('description');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const formatDate = (dateString: string) => {
    if (dateString === 'Present') return 'Present';
    try {
      return format(new Date(dateString), 'MMM yyyy');
    } catch {
      return dateString;
    }
  };

  const handleTabSwitch = (tab: 'description' | 'details') => {
    if (tab === activeTab) return;
    setIsLoading(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsLoading(false);
    }, getAnimationLevel(animationLevel, { min: 400, max: 800 }));
  };

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
    onMinimize();
    // Only call the parent's onMinimize when we're completely hiding the card
    // (which we're no longer doing with this implementation)
  }; return (
    <motion.div
      className={`absolute left-1/2 top-1/2 w-full ${isMobile ? 'max-w-sm mx-2' : 'max-w-md'} z-50`}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{
        type: animationLevel === AnimationLevel.High ? 'spring' : 'tween',
        stiffness: 300,
        damping: 20
      }}
    >
      <div className='transform -translate-x-1/2 -translate-y-1/2'>
        <div className='px-3 py-1 flex justify-between items-center bg-palette-teal text-white'>
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold truncate flex items-center gap-2`}>
            <Briefcase size={isMobile ? 16 : 18} />
            {project.title}
          </h3>
          <button
            onClick={handleToggleMinimize}
            className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} rounded-full flex items-center justify-center hover:bg-white/20`}
            aria-label={isMinimized ? "Maximize details" : "Minimize details"}
          >
            {isMinimized ? <Maximize2 size={isMobile ? 14 : 16} /> : <Minus size={isMobile ? 14 : 16} />}
          </button>
        </div>
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className={`mx-3 px-2 py-1 ${isMobile ? 'text-xs' : 'text-xs'} inline-block rounded bg-palette-teal-light dark:bg-palette-teal/70 text-white`}>
                {company}
              </div>
              <div className="flex border-b border-slate-200 dark:border-slate-700 px-2 pt-1">
                <button
                  className={`px-3 py-1 ${isMobile ? 'text-xs' : 'text-sm'} font-medium rounded-t-md ${activeTab === 'description'
                    ? 'bg-palette-teal/10 text-palette-teal dark:text-palette-teal-light border-b-2 border-palette-teal'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                    }`}
                  onClick={() => handleTabSwitch('description')}
                >
                  Description
                </button>
                <button
                  className={`px-3 py-1 ${isMobile ? 'text-xs' : 'text-sm'} font-medium rounded-t-md ${activeTab === 'details'
                    ? 'bg-palette-teal/10 text-palette-teal dark:text-palette-teal-light border-b-2 border-palette-teal'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                    }`}
                  onClick={() => handleTabSwitch('details')}
                >
                  Details
                </button>
              </div>
              <div className={`p-2 ${isMobile ? 'max-h-[100px]' : 'max-h-[128px]'} overflow-auto`}>
                {isLoading && (
                  <div className={`flex justify-center items-center ${isMobile ? 'h-[100px]' : 'h-[128px]'}`}>
                    <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full border-t-2 border-b-2 animate-spin border-palette-teal`} />
                  </div>
                )}
                {!isLoading && (
                  <AnimatePresence mode="wait">
                    {activeTab === 'description' ? (
                      <motion.div
                        key="description"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`${isMobile ? 'text-xs' : 'text-sm'} text-slate-700 dark:text-slate-200`}
                      >
                        <p>{project.description}</p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="details"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`${isMobile ? 'space-y-2' : 'space-y-3'}`}
                      >                      <div>
                          <div className={`${isMobile ? 'text-xs' : 'text-xs'} font-medium text-slate-500 dark:text-slate-400`}>
                            Position
                          </div>
                          <div className={`${isMobile ? 'text-xs' : 'text-slate-700'} text-slate-700 dark:text-slate-200`}>
                            {project.title}
                          </div>
                        </div>
                        <div>
                          <div className={`${isMobile ? 'text-xs' : 'text-xs'} font-medium text-slate-500 dark:text-slate-400`}>
                            Duration
                          </div>
                          <div className={`${isMobile ? 'text-xs' : 'text-slate-700'} text-slate-700 dark:text-slate-200`}>
                            {formatDate(project.startDate)} - {formatDate(project.endDate)}
                          </div>
                        </div>
                        <div>
                          <div className={`${isMobile ? 'text-xs' : 'text-xs'} font-medium text-slate-500 dark:text-slate-400`}>
                            Type
                          </div>
                          <div
                            className={`inline-block px-2 py-1 ${isMobile ? 'text-xs' : 'text-xs'} rounded-full
                            ${project.type === 'professional'
                                ? 'bg-palette-teal-light/20 text-palette-teal dark:bg-palette-teal/30 dark:text-palette-teal-light'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
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
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default WorkDetails;