import React, { useState, useRef, useEffect } from 'react';
import { useAnimation } from 'framer-motion';
import './referenceS.css';
import BookBinding from './BookBinding';
import NavigationButtons from './NavigationButtons';
import PageContent from './PageContent';

const Education2: React.FC = () => {
  // State to track current page location
  const [currentLocation, setCurrentLocation] = useState(1);
  const numOfPapers = 3;
  const maxLocation = numOfPapers + 1;
  
  // Add a state to control BookBinding visibility (temporarily disabled)
  const [showBinding, setShowBinding] = useState(false);
  
  // Add state for animation and content
  const [textWritten, setTextWritten] = useState(false);
  const pencilAnimation = useAnimation();
  
  // Sample education data
  const [education] = useState([
    {
      degree: "Bachelor's",
      field: "Computer Science",
      institution: "Arizona State University",
      startDate: "2018",
      endDate: "2022",
      gpa: "3.8",
      image: "/images/asu-logo.png",
      subjects: [
        { name: "Data Structures", grade: "A" },
        { name: "Algorithms", grade: "A-" },
        { name: "Computer Networks", grade: "B+" },
      ]
    },
    {
      degree: "Master's",
      field: "Artificial Intelligence",
      institution: "Stanford University",
      startDate: "2022",
      endDate: "2024",
      gpa: "3.9",
      image: "/images/stanford-logo.png",
      subjects: [
        { name: "Machine Learning", grade: "A" },
        { name: "Neural Networks", grade: "A" },
        { name: "Computer Vision", grade: "A-" },
      ]
    },
  ]);
  
  // Refs for DOM elements
  const bookRef = useRef<HTMLDivElement>(null);
  const prevBtnRef = useRef<HTMLButtonElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);
  const paper1Ref = useRef<HTMLDivElement>(null);
  const paper2Ref = useRef<HTMLDivElement>(null);
  const paper3Ref = useRef<HTMLDivElement>(null);

  // Load Font Awesome
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://kit.fontawesome.com/b0f29e9bfe.css';
    document.head.appendChild(link);
    
    const script = document.createElement('script');
    script.src = 'https://kit.fontawesome.com/b0f29e9bfe.js';
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
      if (link.parentNode) {
        document.head.removeChild(link);
      }
    };
  }, []);

  // Start the writing animation when page is flipped
  useEffect(() => {
    if (currentLocation > 1) {
      setTextWritten(false);
      const animateWriting = async () => {
        await pencilAnimation.start({
          x: [0, 150, 0, 150, 0],
          y: [0, 20, 40, 60, 80],
          transition: { duration: 2 }
        });
        setTextWritten(true);
      };
      animateWriting();
    }
  }, [currentLocation, pencilAnimation]);

  // Book functions
  const openBook = () => {
    if (bookRef.current && prevBtnRef.current && nextBtnRef.current) {
      bookRef.current.style.transform = "translateX(50%)";
      prevBtnRef.current.style.transform = "translateX(-180px)";
      nextBtnRef.current.style.transform = "translateX(180px)";
    }
  };

  const closeBook = (isAtBeginning: boolean) => {
    if (bookRef.current && prevBtnRef.current && nextBtnRef.current) {
      if(isAtBeginning) {
        bookRef.current.style.transform = "translateX(0%)";
      } else {
        bookRef.current.style.transform = "translateX(100%)";
      }
      
      prevBtnRef.current.style.transform = "translateX(0px)";
      nextBtnRef.current.style.transform = "translateX(0px)";
    }
  };

  // Page turning functions
  const goNextPage = () => {
    if(currentLocation < maxLocation) {
      switch(currentLocation) {
        case 1:
          openBook();
          paper1Ref.current?.classList.add("flipped");
          if (paper1Ref.current) paper1Ref.current.style.zIndex = "1";
          break;
        case 2:
          paper2Ref.current?.classList.add("flipped");
          if (paper2Ref.current) paper2Ref.current.style.zIndex = "2";
          break;
        case 3:
          paper3Ref.current?.classList.add("flipped");
          if (paper3Ref.current) paper3Ref.current.style.zIndex = "3";
          closeBook(false);
          break;
        default:
          throw new Error("unknown state");
      }
      setCurrentLocation(currentLocation + 1);
    }
  };

  const goPrevPage = () => {
    if(currentLocation > 1) {
      switch(currentLocation) {
        case 2:
          closeBook(true);
          paper1Ref.current?.classList.remove("flipped");
          if (paper1Ref.current) paper1Ref.current.style.zIndex = "3";
          break;
        case 3:
          paper2Ref.current?.classList.remove("flipped");
          if (paper2Ref.current) paper2Ref.current.style.zIndex = "2";
          break;
        case 4:
          openBook();
          paper3Ref.current?.classList.remove("flipped");
          if (paper3Ref.current) paper3Ref.current.style.zIndex = "1";
          break;
        default:
          throw new Error("unknown state");
      }

      setCurrentLocation(currentLocation - 1);
    }
  };

  // Handle page navigation for the NavigationButtons component
  const handlePageClick = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      goNextPage();
    } else {
      goPrevPage();
    }
  };

  // Convert currentLocation to zero-based page index for NavigationButtons
  const currentPage = currentLocation - 1;
  const totalPages = numOfPapers + 1;

  // Determine binding position based on current state
  const getBindingPosition = () => {
    if (currentLocation === 1) {
      return "binding-left"; // Front cover visible
    } else if (currentLocation === maxLocation) {
      return "binding-right"; // Back cover visible
    } else {
      return "binding-middle"; // Book is open, binding in middle
    }
  };

  return (
    <div className="book-container">
      {/* Book */}
      <div id="book" className="book" ref={bookRef}>
        {/* Book Binding - temporarily disabled */}
        {showBinding && (
          <div className={`binding-container ${getBindingPosition()}`}>
            <BookBinding />
          </div>
        )}
        
        {/* Paper 1 */}
        <div id="p1" className="paper" ref={paper1Ref}>
          <div className="front">
            <div id="f1" className="front-content">
              <PageContent 
                pageIndex={0}
                totalPages={totalPages}
                textWritten={textWritten}
                pencilAnimation={pencilAnimation}
                education={education}
              />
            </div>
          </div>
          <div className="back">
            <div id="b1" className="back-content">
              <PageContent 
                pageIndex={1}
                totalPages={totalPages}
                textWritten={textWritten}
                pencilAnimation={pencilAnimation}
                education={education}
                isBackSide={true}
              />
            </div>
          </div>
        </div>
        
        {/* Paper 2 */}
        <div id="p2" className="paper" ref={paper2Ref}>
          <div className="front">
            <div id="f2" className="front-content">
              <PageContent 
                pageIndex={2}
                totalPages={totalPages}
                textWritten={textWritten}
                pencilAnimation={pencilAnimation}
                education={education}
              />
            </div>
          </div>
          <div className="back">
            <div id="b2" className="back-content">
              <PageContent 
                pageIndex={3}
                totalPages={totalPages}
                textWritten={textWritten}
                pencilAnimation={pencilAnimation}
                education={education}
                isBackSide={true}
              />
            </div>
          </div>
        </div>
        
        {/* Paper 3 */}
        <div id="p3" className="paper" ref={paper3Ref}>
          <div className="front">
            <div id="f3" className="front-content">
              <PageContent 
                pageIndex={4}
                totalPages={totalPages}
                textWritten={textWritten}
                pencilAnimation={pencilAnimation}
                education={education}
              />
            </div>
          </div>
          <div className="back">
            <div id="b3" className="back-content">
              <PageContent 
                pageIndex={5}
                totalPages={totalPages}
                textWritten={textWritten}
                pencilAnimation={pencilAnimation}
                education={education}
                isBackSide={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <NavigationButtons 
        currentPage={currentPage}
        totalPages={totalPages}
        handlePageClick={handlePageClick}
      />

      {/* Hidden buttons for keyboard accessibility */}
      <button 
        id="prev-btn" 
        ref={prevBtnRef} 
        onClick={goPrevPage}
        className="sr-only"
        aria-label="Previous page"
      >
        Previous
      </button>
      <button 
        id="next-btn" 
        ref={nextBtnRef} 
        onClick={goNextPage}
        className="sr-only"
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  );
};

export default Education2;
