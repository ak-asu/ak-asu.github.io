import React from 'react';
import { motion, AnimationControls } from 'framer-motion';
import { Pencil } from 'lucide-react';

interface PageContentProps {
  pageIndex: number;
  totalPages: number;
  textWritten: boolean;
  pencilAnimation: AnimationControls;
  education: any[];
  isBackSide?: boolean;
}

const PageContent: React.FC<PageContentProps> = ({
  pageIndex,
  totalPages,
  textWritten,
  pencilAnimation,
  education,
  isBackSide = false
}) => {
  const getPageContent = () => {
    if (pageIndex < 0 || pageIndex >= totalPages) return null;
    // Front cover (only shows on the right side initially)
    if (pageIndex === 0 && !isBackSide) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-card dark:bg-card/90 p-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-6 text-palette-teal dark:text-palette-teal-light"
          >
            Education
          </motion.h1>
        </div>
      );
    }
    // Back cover (only shows on the left side at the end)
    else if (pageIndex === totalPages - 1) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-card dark:bg-card/90 p-8 text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-semibold mb-6 text-palette-teal dark:text-palette-teal-light"
          >
            To be continued...
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-foreground dark:text-muted-foreground italic"
          >
            (Learning never stops)
          </motion.p>
        </div>
      );
    }
    // Content pages
    else {
      const eduIndex = Math.floor((pageIndex - 1) / 2);
      if (eduIndex < 0 || eduIndex >= education.length) return null;
      const entry = education[eduIndex];
      if (!entry) return null;
      if (pageIndex % 2 === 0) {
        return (
          <div className="w-full bg-card/50 dark:bg-card/30 p-4 relative">
            {!textWritten && (
              <motion.div
                className="absolute z-10"
                animate={pencilAnimation}
              >
                <Pencil />
              </motion.div>
            )}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: textWritten ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-xl font-semibold text-palette-teal dark:text-palette-teal-light">{entry.degree} in {entry.field}</h3>
              <p className="text-foreground dark:text-foreground/90">{entry.institution}</p>
              <p className="text-muted-foreground">{entry.startDate} - {entry.endDate}</p>
              <p className="text-palette-teal dark:text-palette-teal-light">GPA: {entry.gpa}</p>
              <div className="mt-6">
                <h4 className="font-medium text-palette-teal dark:text-palette-teal-light mb-2">Key Subjects:</h4>
                <ul className="text-sm space-y-1">
                  {entry.subjects?.map((subject: any, idx: number) => (
                    <li key={idx} className="flex justify-between">
                      <span className="text-foreground dark:text-foreground/90">{subject.name}</span>
                      <span className="font-medium text-palette-teal dark:text-palette-teal-light">{subject.grade}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        );
      } else {
        return (
          <div className="w-full bg-card/50 dark:bg-card/30 p-4 flex items-center justify-center border-r border-palette-teal dark:border-palette-slate">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <img src={entry.image} alt={entry.institution} className="max-h-[80%] max-w-[80%] object-contain" />
            </motion.div>
          </div>
        );
      }
    }
  };

  return (
    <div
      className="absolute top-0 left-0 w-full h-full bg-card dark:bg-card/90 border border-palette-gray-light dark:border-palette-gray-dark p-4 rounded shadow-md"
      style={{
        backfaceVisibility: 'hidden',
        transform: isBackSide ? 'rotateY(180deg)' : 'none',
        zIndex: isBackSide ? 0 : 1
      }}
    >
      {getPageContent()}
    </div>
  );
};

export default PageContent;
