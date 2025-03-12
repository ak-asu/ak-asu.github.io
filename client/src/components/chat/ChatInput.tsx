import React, { useRef, RefObject } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSendMessage: () => void;
  isTechnicalMode: boolean;
  inputRef: RefObject<HTMLTextAreaElement>;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  setInputValue,
  handleSendMessage,
  isTechnicalMode,
  inputRef,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div 
      className={cn(
        "p-3 border-t",
        isTechnicalMode ? "bg-gray-800 border-green-900" : "bg-card border-border"
      )}
    >
      <div className="flex gap-2">
        <Textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className={cn(
            "text-sm resize-none min-h-[40px] max-h-[120px]",
            isTechnicalMode 
              ? "bg-gray-900 border-green-900 focus-visible:ring-green-500/20 text-green-100"
              : ""
          )}
          rows={1}
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className={cn(
                  "h-10 w-10 rounded-full shrink-0",
                  isTechnicalMode
                    ? "bg-green-800 text-green-100 hover:bg-green-700"
                    : ""
                )}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Send message</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ChatInput;
