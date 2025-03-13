import React from 'react';
import { cn } from '@/lib/utils';
import { Message } from './types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div
      className={cn(
        "flex flex-col max-w-[80%] mb-2",
        isUser ? "ml-auto items-end" : "mr-auto items-start"
      )}
    >
      <div
        className={cn(
          "rounded-lg px-3 py-2",
          isUser
            ? "bg-palette-teal text-white"
            : "bg-palette-gray-light/20 text-foreground border border-palette-gray-light/30"
        )}
      >
        {message.content}
      </div>
      <span className="text-xs mt-1 opacity-50">
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
};

export default ChatMessage;
