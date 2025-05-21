import React from 'react';

const BookBinding: React.FC = () => {
  return (
    <div className="w-8 h-full bg-palette-teal dark:bg-palette-slate rounded-sm shadow-inner">
      <div className="absolute inset-0 bg-gradient-to-r from-palette-teal-light via-palette-teal to-palette-teal-light dark:from-palette-slate dark:via-primary dark:to-palette-slate opacity-70"></div>
    </div>
  );
};

export default BookBinding;
