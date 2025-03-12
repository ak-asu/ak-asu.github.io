import React from 'react';
import { motion } from 'framer-motion';

interface BookPageProps {
    index: number;
    isFlipped: boolean;
    zIndex: number;
    dragStyle: any;
    isDragging: boolean;
    children: React.ReactNode;
}

const BookPage: React.FC<BookPageProps> = ({ 
    index, 
    isFlipped, 
    zIndex, 
    dragStyle, 
    isDragging,
    children 
}) => {
    return (
        <div
            className="absolute top-0 w-[345px] h-full"
            style={{ 
                left: index % 2 === 0 ? 'calc(50% - 345px)' : '50%',
                zIndex: zIndex,
                perspective: '1000px'
            }}
        >
            <motion.div 
                className="absolute top-0 left-0 w-full h-full origin-right"
                style={{ 
                    transformStyle: 'preserve-3d',
                    ...((index % 2 === 0) ? { transformOrigin: 'right center' } : { transformOrigin: 'left center' })
                }}
                initial={false}
                animate={isFlipped ? { rotateY: -180 } : { rotateY: 0 }}
                transition={{
                    type: 'spring',
                    stiffness: 70,
                    damping: 15,
                    mass: 1.2
                }}
                {...(isDragging ? dragStyle : {})}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default BookPage;
