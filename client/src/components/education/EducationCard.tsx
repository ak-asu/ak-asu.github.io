import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveEducation } from '@/store/features/educationSlice';
import education from '@/data/education.json';
import BookPage from './BookPage';
import NavigationButtons from './NavigationButtons';
import BookBinding from './BookBinding';
import DragIndicators from './DragIndicators';
import DebugInfo from './DebugInfo';
import PageContent from './PageContent';

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
    const [dragProgress, setDragProgress] = useState(0);
    
    const totalPages = education.length + 2;

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
            
            setTimeout(() => {
                setIsFlipping(false);
            }, 600);
        }
    };

    // Get drag style for page animation
    const getDragStyle = (index: number) => {
        if (!isDragging) return {};
        
        if ((index === currentPage && dragProgress < 0) || (index === currentPage - 1 && dragProgress > 0)) {
            const rotationAmount = dragProgress * 180;
            return {
                transform: `rotateY(${rotationAmount}deg)`,
                transition: { duration: 0 }
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
                <DebugInfo 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    isDragging={isDragging}
                    dragProgress={dragProgress}
                />

                <div className="relative w-full h-full" style={{ perspective: '1500px' }}>
                    <BookBinding />
                    
                    {/* Pages */}
                    {Array.from({ length: totalPages }).map((_, i) => {
                        const isFlipped = i < currentPage;
                        const zIndex = totalPages - i;
                        const isCurrentlyFlipping = (i === currentPage - 1 || i === currentPage) && isFlipping;
                        
                        return (
                            <BookPage
                                key={i}
                                index={i}
                                isFlipped={isFlipped}
                                zIndex={zIndex}
                                dragStyle={getDragStyle(i)}
                                isDragging={isDragging}
                            >
                                <PageContent 
                                    pageIndex={i}
                                    totalPages={totalPages}
                                    textWritten={textWritten}
                                    pencilAnimation={pencilAnimation}
                                    education={education}
                                />
                                <PageContent 
                                    pageIndex={i + 1}
                                    totalPages={totalPages}
                                    textWritten={textWritten}
                                    pencilAnimation={pencilAnimation}
                                    education={education}
                                    isBackSide
                                />
                            </BookPage>
                        );
                    })}

                    {/* Click areas for page turning */}
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
                
                <DragIndicators 
                    isDragging={isDragging}
                    dragProgress={dragProgress}
                    currentPage={currentPage}
                    totalPages={totalPages}
                />
                
                <NavigationButtons 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    handlePageClick={handlePageClick}
                />
            </div>
        </div>
    );
};

export default EducationCard;