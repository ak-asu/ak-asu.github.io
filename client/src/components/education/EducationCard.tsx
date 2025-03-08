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
    const [isFlipping, setIsFlipping] = useState(false);
    const [dragProgress, setDragProgress] = useState(0); // Track drag progress for visual feedback
    
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
        const threshold = 100;
        
        // Calculate drag progress percentage for visual feedback
        const progressPercentage = Math.min(Math.abs(diff) / threshold, 1);
        setDragProgress(diff > 0 ? progressPercentage : -progressPercentage);
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0 && currentPage > 0) {
                handlePageFlip(currentPage - 1);
            } else if (diff < 0 && currentPage < totalPages - 1) {
                handlePageFlip(currentPage + 1);
            }
            setIsDragging(false);
            setDragProgress(0);
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        setDragProgress(0);
    };

    // Separate click handler for button navigation
    const handlePageClick = (direction: 'prev' | 'next') => {
        let newPage = currentPage;
        if (direction === 'prev' && currentPage > 0) {
            newPage = currentPage - 1;
        } else if (direction === 'next' && currentPage < totalPages - 1) {
            newPage = currentPage + 1;
        }
        
        if (newPage !== currentPage) {
            handlePageFlip(newPage);
        }
    };

    const handlePageFlip = (newPage: number) => {
        if (newPage !== currentPage) {
            setIsFlipping(true);
            setCurrentPage(newPage);
            
            // Reset flipping state after animation completes
            setTimeout(() => {
                setIsFlipping(false);
            }, 600);
        }
    };

    // Improved error handling for content pages
    const getPageContent = (page: number) => {
        if (page < 0 || page >= totalPages) return null;
        
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
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            filter: "brightness(1)"
        }),
        animate: (custom: { direction: number }) => ({
            rotateY: custom.direction > 0 ? -180 : 0,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
            filter: "brightness(0.95)",
            transition: {
                type: "spring",
                stiffness: 70,
                damping: 15,
                mass: 1.2
            }
        })
    };

    // Create visual feedback during dragging with proper transition format
    const getDragStyle = (index: number) => {
        if (!isDragging) return {};
        
        if ((index === currentPage && dragProgress < 0) || (index === currentPage - 1 && dragProgress > 0)) {
            // Apply rotation based on drag progress
            const rotationAmount = dragProgress * 180;
            return {
                transform: `rotateY(${rotationAmount}deg)`,
                transition: { duration: 0 } // Using object format for Framer Motion
            };
        }
        return {};
    };

    return (
        <div className="flex items-center justify-center w-full py-12">
            <div 
                ref={bookRef}
                className="relative w-[800px] h-[500px] mx-auto"
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
            >
                {/* Debug element - can be removed after testing */}
                <div className="absolute top-2 left-2 z-50 bg-white bg-opacity-80 p-2 rounded text-sm">
                    Page: {currentPage + 1}/{totalPages}, 
                    Drag: {isDragging ? 'yes' : 'no'}, 
                    Progress: {Math.round(dragProgress * 100)}%
                </div>

                <div className="relative w-full h-full" style={{ perspective: '1500px' }}>
                    {/* Book binding */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-full bg-amber-800 rounded-sm z-10 shadow-inner">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 opacity-70"></div>
                    </div>
                    
                    {/* Pages */}
                    {Array.from({ length: totalPages }).map((_, i) => {
                        // Calculate whether this page should be flipped
                        const isFlipped = i < currentPage;
                        
                        // Calculate z-index to stack pages correctly
                        const zIndex = totalPages - i;
                        
                        // Determine if this is the page currently flipping
                        const isCurrentlyFlipping = (i === currentPage - 1 || i === currentPage) && isFlipping;
                        
                        return (
                            <div
                                key={i}
                                className="absolute top-0 w-[345px] h-full"
                                style={{ 
                                    left: i % 2 === 0 ? 'calc(50% - 345px)' : '50%',
                                    zIndex: zIndex,
                                    perspective: '1000px'
                                }}
                            >
                                <motion.div 
                                    className="absolute top-0 left-0 w-full h-full origin-right"
                                    style={{ 
                                        transformStyle: 'preserve-3d',
                                        ...((i % 2 === 0) ? { transformOrigin: 'right center' } : { transformOrigin: 'left center' })
                                    }}
                                    initial={false}
                                    animate={isFlipped ? { rotateY: -180 } : { rotateY: 0 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 70,
                                        damping: 15,
                                        mass: 1.2
                                    }}
                                    {...(isDragging ? getDragStyle(i) : {})}
                                >
                                    {/* Front of page */}
                                    <div 
                                        className="absolute top-0 left-0 w-full h-full bg-amber-50 border border-amber-200 p-4 rounded shadow-md"
                                        style={{ 
                                            backfaceVisibility: 'hidden',
                                            zIndex: isFlipped ? 0 : 1
                                        }}
                                    >
                                        {getPageContent(i)}
                                    </div>
                                    
                                    {/* Back of page */}
                                    <div 
                                        className="absolute top-0 left-0 w-full h-full bg-amber-50 border border-amber-200 p-4 rounded shadow-md"
                                        style={{ 
                                            backfaceVisibility: 'hidden',
                                            transform: 'rotateY(180deg)',
                                            zIndex: isFlipped ? 1 : 0
                                        }}
                                    >
                                        {getPageContent(i + 1)}
                                    </div>
                                </motion.div>
                            </div>
                        );
                    })}

                    {/* Click areas for page turning - made visible for debugging */}
                    <div 
                        className="absolute top-0 left-0 w-1/4 h-full cursor-pointer z-20"
                        onClick={() => handlePageClick('prev')}
                        aria-label="Previous page"
                    />
                    <div 
                        className="absolute top-0 right-0 w-1/4 h-full cursor-pointer z-20"
                        onClick={() => handlePageClick('next')}
                        aria-label="Next page"
                    />
                </div>
                
                {/* Visual drag indicators */}
                {isDragging && (
                    <>
                        {dragProgress < 0 && currentPage < totalPages - 1 && (
                            <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-2xl text-amber-800 font-bold animate-pulse">
                                &raquo;
                            </div>
                        )}
                        {dragProgress > 0 && currentPage > 0 && (
                            <div className="absolute top-1/2 left-4 transform -translate-y-1/2 text-2xl text-amber-800 font-bold animate-pulse">
                                &laquo;
                            </div>
                        )}
                    </>
                )}
                
                {/* Navigation buttons */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center space-x-8 text-amber-700">
                    <button 
                        className={`px-3 py-1 rounded bg-amber-100 hover:bg-amber-200 transition ${currentPage <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => handlePageClick('prev')}
                        disabled={currentPage <= 0}
                    >
                        Previous
                    </button>
                    
                    <span className="text-sm">Page {currentPage + 1} of {totalPages}</span>
                    
                    <button 
                        className={`px-3 py-1 rounded bg-amber-100 hover:bg-amber-200 transition ${currentPage >= totalPages - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => handlePageClick('next')}
                        disabled={currentPage >= totalPages - 1}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EducationCard;