import React from 'react';

interface NavigationButtonsProps {
    currentPage: number;
    totalPages: number;
    handlePageClick: (direction: 'prev' | 'next') => void;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({ 
    currentPage, 
    totalPages, 
    handlePageClick 
}) => {
    return (
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
    );
};

export default NavigationButtons;
