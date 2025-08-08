import React from "react";

interface NavigationButtonsProps {
  currentPage: number;
  totalPages: number;
  handlePageClick: (direction: "prev" | "next") => void;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentPage,
  totalPages,
  handlePageClick,
}) => {
  return (
    <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center space-x-8 text-primary">
      <button
        className={`px-3 py-1 rounded bg-secondary/80 hover:bg-secondary transition dark:bg-secondary/20 dark:hover:bg-secondary/30 ${currentPage <= 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onClick={() => handlePageClick("prev")}
        disabled={currentPage <= 0}
      >
        Previous
      </button>
      <span className="text-sm text-foreground dark:text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>
      <button
        className={`px-3 py-1 rounded bg-secondary/80 hover:bg-secondary transition dark:bg-secondary/20 dark:hover:bg-secondary/30 ${currentPage >= totalPages ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onClick={() => handlePageClick("next")}
        disabled={currentPage >= totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default NavigationButtons;
