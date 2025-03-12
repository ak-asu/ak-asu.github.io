import React from 'react';

interface DragIndicatorsProps {
    isDragging: boolean;
    dragProgress: number;
    currentPage: number;
    totalPages: number;
}

const DragIndicators: React.FC<DragIndicatorsProps> = ({
    isDragging,
    dragProgress,
    currentPage,
    totalPages
}) => {
    if (!isDragging) return null;
    
    return (
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
    );
};

export default DragIndicators;
