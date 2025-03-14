import React from 'react';
import { motion } from 'framer-motion';

interface BookPageProps {
  isFlipped: boolean;
  zIndex: number;
  dragStyle: any;
  children: React.ReactNode;
}

const BookPage: React.FC<BookPageProps> = ({
  isFlipped,
  zIndex,
  dragStyle,
  children
}) => {
  return (
    <div
      className="absolute top-0 w-[345px] h-full"
      style={{
        left: isFlipped ? 'calc(50% - 345px)' : '50%',
        zIndex: zIndex,
        perspective: '1000px'
      }}
    >
      <motion.div
        className="absolute top-0 left-0 w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          transformOrigin: isFlipped ? 'right center' : 'left center',
        }}
        initial={false}
        // transition={{
        //   type: 'spring',
        //   stiffness: 70,
        //   damping: 15,
        //   mass: 1.2
        // }}
        {...dragStyle}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default BookPage;
