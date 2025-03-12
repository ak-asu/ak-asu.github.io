import React from 'react';

const BookBinding: React.FC = () => {
    return (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-full bg-amber-800 rounded-sm z-10 shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 opacity-70"></div>
        </div>
    );
};

export default BookBinding;
