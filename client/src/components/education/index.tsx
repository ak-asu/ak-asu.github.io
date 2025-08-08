import React, { useState, useRef, useEffect } from 'react';
import eduData from '@/data/education.json';

const Education = () => {
  const [rotation, setRotation] = useState(0);
  const [animationType, setAnimationType] = useState<'flip' | 'spin' | 'tilt'>('flip');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [lastTap, setLastTap] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  // Generate content from education data
  const frontTitle = `${eduData[0].degree} in ${eduData[0].field}`;
  const frontContent = `${eduData[0].institution}\n${eduData[0].startDate} - ${eduData[0].endDate}\nGPA: ${eduData[0].gpa}\n\nSubjects:\n${eduData[0].subjects.map(subject => `• ${subject.name} (${subject.grade})`).join('\n')}`;
  const frontImage = eduData[0].image;
  const backTitle = `${eduData[1].degree} in ${eduData[1].field}`;
  const backContent = `${eduData[1].institution}\n${eduData[1].startDate} - ${eduData[1].endDate}\nGPA: ${eduData[1].gpa}\n\nSubjects:\n${eduData[1].subjects.map(subject => `• ${subject.name} (${subject.grade})`).join('\n')}`;
  const backImage = eduData[1].image;

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
  };

  // Handle drag move
  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - startX;
    const newRotation = rotation + deltaX * 0.5;
    setRotation(newRotation);
    setStartX(clientX);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Handle double click/tap
  const handleDoubleClick = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      // Double tap detected
      cycleAnimation();
    }
    setLastTap(now);
  };

  // Cycle through animations
  const cycleAnimation = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const animations: Array<'flip' | 'spin' | 'tilt'> = ['flip', 'spin', 'tilt'];
    const currentIndex = animations.indexOf(animationType);
    const nextIndex = (currentIndex + 1) % animations.length;
    const nextAnimation = animations[nextIndex];
    
    setAnimationType(nextAnimation);
    
    // Trigger the animation
    if (nextAnimation === 'flip') {
      animateFlip();
    } else if (nextAnimation === 'spin') {
      animateSpin();
    } else if (nextAnimation === 'tilt') {
      animateTilt();
    }
  };

  // Flip animation
  const animateFlip = () => {
    const targetRotation = rotation + 180;
    const duration = 600;
    const start = performance.now();
    const startRotation = rotation;

    const animate = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2;
      
      setRotation(startRotation + (targetRotation - startRotation) * easeProgress);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  // Spin animation
  const animateSpin = () => {
    const targetRotation = rotation + 360;
    const duration = 1000;
    const start = performance.now();
    const startRotation = rotation;

    const animate = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      setRotation(startRotation + (targetRotation - startRotation) * easeProgress);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  // Tilt animation
  const animateTilt = () => {
    const duration = 800;
    const start = performance.now();
    const startRotation = rotation;
    const wobbleAmount = 15;

    const animate = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      
      if (progress < 0.25) {
        setRotation(startRotation + wobbleAmount * (progress * 4));
      } else if (progress < 0.5) {
        setRotation(startRotation + wobbleAmount * (2 - progress * 4));
      } else if (progress < 0.75) {
        setRotation(startRotation - wobbleAmount * ((progress - 0.5) * 4));
      } else {
        setRotation(startRotation - wobbleAmount * (4 - progress * 4));
      }
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setRotation(startRotation + 180);
        setIsAnimating(false);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // const isFlipped = (rotation % 360) > 90 && (rotation % 360) < 270;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-8 transition-colors duration-300">      
      <div 
        ref={cardRef}
        className="relative w-96 h-[500px] cursor-grab active:cursor-grabbing"
        style={{ perspective: '1000px' }}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onClick={handleDoubleClick}
      >
        <div
          className="absolute inset-0 w-full h-full transition-none"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${rotation}deg)`,
          }}
        >
          {/* Front Face */}
          <div
            className="absolute inset-0 w-full h-full bg-card rounded-2xl shadow-2xl overflow-hidden border border-border transition-colors duration-300"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
            }}
          >
            <div className="h-1/2 relative overflow-hidden bg-gradient-to-br from-palette-teal-DEFAULT to-primary">
              <img 
                src={frontImage} 
                alt="Front" 
                className="w-full h-full object-cover mix-blend-overlay opacity-70"
              />
              <div className="absolute top-0 left-0 right-0 p-6">
                <h2 className="text-2xl font-bold text-primary-foreground text-left drop-shadow-lg leading-tight">
                  {frontTitle}
                </h2>
              </div>
            </div>
            <div className="h-1/2 p-6 overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                <pre className="text-card-foreground leading-relaxed whitespace-pre-wrap font-sans">{frontContent}</pre>
              </div>
            </div>
            <div className="absolute top-4 right-4 bg-background/20 backdrop-blur-sm rounded-full p-2">
              <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>

          {/* Back Face */}
          <div
            className="absolute inset-0 w-full h-full bg-card rounded-2xl shadow-2xl overflow-hidden border border-border transition-colors duration-300"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="h-1/2 relative overflow-hidden bg-gradient-to-br from-secondary to-palette-teal-dark">
              <img 
                src={backImage} 
                alt="Back" 
                className="w-full h-full object-cover mix-blend-overlay opacity-70"
              />
              <div className="absolute top-0 left-0 right-0 p-6">
                <h2 className="text-2xl font-bold text-primary-foreground text-left drop-shadow-lg leading-tight">
                  {backTitle}
                </h2>
              </div>
            </div>
            <div className="h-1/2 p-6 overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                <pre className="text-card-foreground leading-relaxed whitespace-pre-wrap font-sans">{backContent}</pre>
              </div>
            </div>
            <div className="absolute top-4 right-4 bg-background/20 backdrop-blur-sm rounded-full p-2">
              <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Education;