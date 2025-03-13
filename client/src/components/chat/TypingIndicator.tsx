import React from 'react';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  isTechnicalMode: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isTechnicalMode }) => {
  return (
    <div className="flex max-w-[80%]">
      <div
        className={cn(
          "rounded-lg px-4 py-2",
          isTechnicalMode
            ? "bg-gray-800 border border-green-900/50"
            : "bg-muted"
        )}
      >
        <span className="flex gap-1">
          <span className="animate-bounce">•</span>
          <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>•</span>
          <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>•</span>
        </span>
      </div>
    </div>
  );
};

export default TypingIndicator;
