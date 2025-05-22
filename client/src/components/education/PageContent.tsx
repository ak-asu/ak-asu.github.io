import React from 'react';
import { motion, AnimationControls } from 'framer-motion';
import { Pencil, GraduationCap, BookOpen, Award } from 'lucide-react';

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
    if (pageIndex < 0 || pageIndex >= 2*totalPages) return null;
    // Front cover
    if (pageIndex === 0 && !isBackSide) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-card dark:bg-card/90 p-8 text-center border-2 border-palette-teal/30 dark:border-palette-teal-light/20 rounded-lg">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-6 text-palette-teal dark:text-palette-teal-light"
          >
            Education
          </motion.h1>
        </div>
      );
    // Back cover
    } else if (pageIndex === 2*totalPages - 1 && isBackSide) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-card dark:bg-card/90 p-8 text-center border-2 border-palette-teal/30 dark:border-palette-teal-light/20 rounded-lg">
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
    // Image of School
    else if (isBackSide) {
      const entry = education[Math.floor((pageIndex - 1) / 2)];
      if (!entry) return null;
      return (
        <div className="w-full h-full bg-card/50 dark:bg-card/30 p-6 flex items-center justify-center border border-palette-teal/20 dark:border-palette-teal-light/15 rounded-lg">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center"
          >
            {entry.image ? (
              <img
                src={entry.image}
                alt={entry.institution}
                className="max-h-[80%] max-w-[80%] object-contain mb-4 border border-palette-teal/30 dark:border-palette-teal-light/20 rounded-md shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 bg-palette-teal-light/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-palette-teal">{entry.institution.charAt(0)}</span>
              </div>
            )}
            <h3 className="text-xl font-semibold text-center text-palette-teal dark:text-palette-teal-light">{entry.institution}</h3>
          </motion.div>
        </div>
      );
    }
    // Details of School
    else if (!isBackSide) {
      const entry = education[Math.floor((pageIndex - 1) / 2)];
      if (!entry) return null;
      return (
        <div className="w-full h-full bg-card/50 dark:bg-card/30 p-6 relative border border-palette-teal/20 dark:border-palette-teal-light/15 rounded-lg">
          {!textWritten && (
            <motion.div
              className="absolute"
              animate={pencilAnimation}
            >
              <Pencil className="text-palette-teal dark:text-palette-teal-light" />
            </motion.div>
          )}
          <motion.div
            className="space-y-4 h-full overflow-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: textWritten ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-xl font-semibold text-palette-teal dark:text-palette-teal-light border-b border-palette-teal/20 dark:border-palette-teal-light/15 pb-2">{entry.degree} in {entry.field}</h3>
            <p className="text-foreground dark:text-foreground/90">{entry.institution}</p>
            <p className="text-muted-foreground">{entry.startDate} - {entry.endDate}</p>
            <p className="text-palette-teal dark:text-palette-teal-light border border-palette-teal/20 dark:border-palette-teal-light/15 rounded py-1 px-2 inline-block text-sm">GPA: {entry.gpa}</p>
            <div className="mt-6 border border-palette-teal/15 dark:border-palette-teal-light/10 rounded-md p-3">
              <h4 className="font-medium text-palette-teal dark:text-palette-teal-light mb-2 border-b border-palette-teal/15 dark:border-palette-teal-light/10 pb-1">Key Subjects:</h4>
              <ul className="text-sm space-y-1">
                {entry.subjects?.map((subject: any, idx: number) => (
                  <li key={idx} className="flex justify-between border-b border-palette-teal/10 dark:border-palette-teal-light/5 last:border-0 py-1">
                    <span className="text-foreground dark:text-foreground/90">{subject.name}</span>
                    <span className="font-medium text-palette-teal dark:text-palette-teal-light px-1">{subject.grade}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      );
    }
    // Fallback for any other cases
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-palette-teal dark:text-palette-teal-light">Page {pageIndex + 1}</p>
      </div>
    );
  };

  return (
    <div
      className="w-full h-full bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow-md border border-palette-teal/10 dark:border-palette-teal-light/5"
      style={{
        transform: isBackSide ? 'none' : 'none',
      }}
    >
      {getPageContent()}
    </div>
  );
};

export default PageContent;
