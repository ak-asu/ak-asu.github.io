import React from 'react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  isTechnicalMode: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isTechnicalMode }) => {
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
            ? isTechnicalMode
              ? "bg-green-800 text-green-100"
              : "bg-primary text-primary-foreground"
            : isTechnicalMode
              ? "bg-gray-800 text-gray-100 border border-green-900/50"
              : "bg-muted text-muted-foreground"
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
