import React from 'react';
import { MessageSquare, X, Minimize2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  isTyping: boolean;
  isMinimized: boolean;
  isTechnicalMode: boolean;
  minimizeChat: (e: React.MouseEvent) => void;
  closeChat: (e: React.MouseEvent) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  isTyping,
  isMinimized,
  isTechnicalMode,
  minimizeChat,
  closeChat,
}) => {
  return (
    <div
      className={cn(
        "p-3 flex items-center justify-between cursor-pointer",
        isTechnicalMode
          ? "bg-gray-800 text-green-400 border-b border-green-900"
          : "bg-primary text-primary-foreground"
      )}
      onClick={minimizeChat}
    >
      <div className="flex items-center gap-2">
        <MessageSquare
          className={cn(
            "h-5 w-5",
            isTyping && "animate-pulse"
          )}
        />
        <h3 className="font-medium text-sm">
          {isTyping ? "Bot is typing..." : "Portfolio Assistant"}
        </h3>
      </div>
      <div className="flex items-center gap-1">
        {!isMinimized && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full hover:bg-background/20"
            onClick={(e) => {
              e.stopPropagation();
              minimizeChat(e);
            }}
            aria-label="Minimize chat"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        )}
        {isMinimized && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full hover:bg-background/20"
            aria-label="Expand chat"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full hover:bg-background/20"
          onClick={(e) => {
            e.stopPropagation();
            closeChat(e);
          }}
          aria-label="Close chat"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
