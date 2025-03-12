import React from 'react';

interface DebugInfoProps {
    currentPage: number;
    totalPages: number;
    isDragging: boolean;
    dragProgress: number;
}

const DebugInfo: React.FC<DebugInfoProps> = ({
    currentPage,
    totalPages,
    isDragging,
    dragProgress
}) => {
    return (
        <div className="absolute top-2 left-2 z-50 bg-white bg-opacity-80 p-2 rounded text-sm">
            Page: {currentPage + 1}/{totalPages}, 
            Drag: {isDragging ? 'yes' : 'no'}, 
            Progress: {Math.round(dragProgress * 100)}%
        </div>
    );
};

export default DebugInfo;
