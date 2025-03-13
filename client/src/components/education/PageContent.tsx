import React from 'react';
import { motion, AnimationControls } from 'framer-motion';

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
        if (pageIndex === 0) {
            // Cover page
            return (
                <div className="flex flex-col items-center justify-center h-full bg-amber-100 p-8 text-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold mb-6 text-amber-800"
                    >
                        Education
                    </motion.h1>
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        {/* Book cover image placeholder */}
                    </motion.div>
                </div>
            );
        } else if (pageIndex === totalPages - 1) {
            return (
                <div className="flex flex-col items-center justify-center h-full bg-amber-100 p-8 text-center">
                    <motion.h2 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-3xl font-semibold mb-6 text-amber-800"
                    >
                        To be continued...
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg text-amber-700 italic"
                    >
                        (Learning never stops)
                    </motion.p>
                </div>
            );
        } else {
            const eduIndex = pageIndex - 1;
            if (eduIndex < 0 || eduIndex >= education.length) return null;
            const entry = education[eduIndex];
            if (!entry) return null;
            return (
                <div className="flex h-full">
                    {/* Left page - Image */}
                    <div className="w-1/2 bg-amber-50 p-4 flex items-center justify-center border-r border-amber-800">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            {/* School image placeholder */}
                        </motion.div>
                    </div>
                    {/* Right page - Education details */}
                    <div className="w-1/2 bg-amber-50 p-4 relative">
                        {!textWritten && (
                            <motion.div
                                className="absolute z-10"
                                animate={pencilAnimation}
                            >
                                {/* Pencil image placeholder */}
                            </motion.div>
                        )}
                        <motion.div
                            className="space-y-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: textWritten ? 1 : 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h3 className="text-xl font-semibold text-amber-900">{entry.degree} in {entry.field}</h3>
                            <p className="text-amber-800">{entry.institution}</p>
                            <p className="text-amber-700">{entry.startDate} - {entry.endDate}</p>
                            <p className="text-amber-900">GPA: {entry.gpa}</p>
                            <div className="mt-6">
                                <h4 className="font-medium text-amber-900 mb-2">Key Subjects:</h4>
                                <ul className="text-sm space-y-1">
                                    {education[eduIndex].subjects?.map((subject: any, idx: number) => (
                                        <li key={idx} className="flex justify-between">
                                            <span>{subject.name}</span>
                                            <span className="font-medium">{subject.grade}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    </div>
                </div>
            );
        }
    };

    return (
        <div 
            className="absolute top-0 left-0 w-full h-full bg-amber-50 border border-amber-200 p-4 rounded shadow-md"
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
