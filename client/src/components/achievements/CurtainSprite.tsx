import React from 'react';

interface CurtainSpriteProps {
  side: 'left' | 'right';
}

const CurtainSprite: React.FC<CurtainSpriteProps> = ({ side }) => {
    const spriteCount = 8; // Number of sprite elements
    
    return (
        <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: spriteCount }).map((_, index) => (
                <div 
                    key={index}
                    className={`
                        absolute top-0 h-full w-1
                        ${side === 'left' ? 'left-0' : 'right-0'}
                        bg-white/20
                    `}
                    style={{
                        left: side === 'left' ? `${(index + 1) * (100 / (spriteCount + 2))}%` : undefined,
                        right: side === 'right' ? `${(index + 1) * (100 / (spriteCount + 2))}%` : undefined,
                        height: '100%',
                        boxShadow: '0 0 15px rgba(255, 255, 255, 0.4)'
                    }}
                />
            ))}
        </div>
    );
};

export default CurtainSprite;
