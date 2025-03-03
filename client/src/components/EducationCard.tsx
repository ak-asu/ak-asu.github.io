import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveEducation } from '@/store/features/educationSlice';
import education from '@/data/education.json';

const EducationCard: React.FC = () => {
    const dispatch = useDispatch();
    const activeEducation = useSelector((state: any) => state.education.activeEducation);
    const animationLevel = useSelector((state: any) => state.mode.animationLevel);
    const [currentPage, setCurrentPage] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState(0);
    const [textWritten, setTextWritten] = useState(false);
    const bookRef = useRef<HTMLDivElement>(null);
    const pencilAnimation = useAnimation();
    const textAnimation = useAnimation();
    
    const totalPages = education.length + 2; // Education entries + cover & back

    // Write animation function
    const animateWriting = async () => {
        if (currentPage === 0 || currentPage === totalPages - 1) {
            setTextWritten(true);
            return;
        }

        setTextWritten(false);
        
        // Animate pencil to write the content
        const contentHeight = 300; // Estimated content height
        
        await pencilAnimation.start({
            x: [0, 300, 0, 300, 0],
            y: [0, 50, 100, 150, 200],
            transition: { duration: animationLevel === 'expert' ? 2 : (animationLevel === 'medium' ? 1 : 0.5) }
        });
        
        setTextWritten(true);
    };

    useEffect(() => {
        if (activeEducation !== currentPage - 1 && currentPage > 0 && currentPage < totalPages - 1) {
            dispatch(setActiveEducation(currentPage - 1));
        }
        
        animateWriting();
    }, [currentPage]);

    const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        setIsDragging(true);
        if ('touches' in e) {
            setDragStartX(e.touches[0].clientX);
        } else {
            setDragStartX(e.clientX);
        }
    };

    const handleDragMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const diff = clientX - dragStartX;
        
        if (Math.abs(diff) > 100) {
            if (diff > 0 && currentPage > 0) {
                setCurrentPage(currentPage - 1);
            } else if (diff < 0 && currentPage < totalPages - 1) {
                setCurrentPage(currentPage + 1);
            }
            setIsDragging(false);
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const getPageContent = (page: number) => {
        if (page === 0) {
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
                        {/* {<Image 
                            src="/images/book-cover.svg" 
                            alt="Education Book" 
                            width={200} 
                            height={200} 
                            className="mt-4"
                        />} */}
                    </motion.div>
                </div>
            );
        } else if (page === totalPages - 1) {
            // Back cover
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
            // Education pages
            const eduIndex = page - 1;
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
                            {/* {<Image 
                                src={entry.image || `/images/school-${eduIndex}.jpg`}
                                alt={entry.school}
                                width={200}
                                height={150}
                                className="rounded shadow-md"
                            />} */}
                        </motion.div>
                    </div>
                    
                    {/* Right page - Education details */}
                    <div className="w-1/2 bg-amber-50 p-4 relative">
                        {!textWritten && (
                            <motion.div
                                className="absolute z-10"
                                animate={pencilAnimation}
                            >
                                {/* {<Image 
                                    src="/images/pencil.svg" 
                                    alt="Writing pencil" 
                                    width={30} 
                                    height={30} 
                                />} */}
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
                                    {education[eduIndex].subjects?.map((subject, idx) => (
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

    const pageVariants = {
        initial: (custom: { direction: number }) => ({
            rotateY: custom.direction > 0 ? 0 : -180,
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
        }),
        animate: (custom: { direction: number }) => ({
            rotateY: custom.direction > 0 ? -180 : 0,
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 20
            }
        })
    };

    return (
        <div className="flex items-center justify-center w-full py-12">
            <div 
                ref={bookRef}
                className="relative w-[700px] h-[500px] perspective-1000"
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
            >
                <div className="relative w-full h-full">
                    {/* Book binding */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-full bg-amber-800 rounded-sm z-0"></div>
                    
                    {/* Pages */}
                    {Array.from({ length: totalPages }).map((_, i) => {
                        // Calculate whether this page should be flipped
                        const isFlipped = i < currentPage;
                        // Direction is for the animation
                        const direction = isFlipped ? 1 : -1;
                        
                        // Calculate z-index to stack pages correctly
                        const zIndex = i === currentPage - 1 || i === currentPage ? 10 : totalPages - Math.abs(currentPage - i);
                        
                        return (
                            <motion.div
                                key={i}
                                className="absolute top-0 left-0 w-full h-full origin-left"
                                style={{ 
                                    zIndex,
                                    transformStyle: 'preserve-3d',
                                    backfaceVisibility: 'hidden'
                                }}
                                custom={{ direction }}
                                initial="initial"
                                animate={isFlipped ? "animate" : "initial"}
                                variants={pageVariants}
                            >
                                {/* Front of page */}
                                <div 
                                    className="absolute top-0 left-0 w-full h-full bg-amber-50 border border-amber-200 rounded shadow-md"
                                    style={{ 
                                        backfaceVisibility: 'hidden',
                                    }}
                                >
                                    {getPageContent(i)}
                                </div>
                                
                                {/* Back of page */}
                                <div 
                                    className="absolute top-0 left-0 w-full h-full bg-amber-50 border border-amber-200 rounded shadow-md"
                                    style={{ 
                                        transform: 'rotateY(180deg)',
                                        backfaceVisibility: 'hidden',
                                    }}
                                >
                                    {getPageContent(i + 1)}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
                
                {/* Navigation hints */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-12 text-amber-700 text-sm">
                    <span>Drag left/right to turn pages</span>
                </div>
            </div>
        </div>
    );
};

export default EducationCard;