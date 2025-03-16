import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { audioManager } from '@/lib/audio';
import { getSimulatedResponse, Message } from './utils';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ChatToggleButton from './ChatToggleButton';
import TypingIndicator from './TypingIndicator';

const initialMessages: Message[] = [
  {
    id: '1',
    content: "Hello! I'm Aakash's portfolio assistant. Ask me about his skills, projects, or experience! Currently I am in experimental mode with no AI integration.",
    sender: 'bot',
    timestamp: new Date(),
  },
];

export const ChatWindow: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { soundEnabled } = useSelector((state: RootState) => state.mode);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opening chat
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen, isMinimized]);

  const toggleChat = () => {
    if (soundEnabled) {
      audioManager.playSoundEffect('click');
    }
    if (!isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
    } else {
      setIsOpen(false);
    }
  };

  const minimizeChat = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (soundEnabled) {
      audioManager.playSoundEffect('click');
    }
    setIsMinimized(!isMinimized);
  };

  const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const handleSendMessageViaAPI = async () => {
    if (!inputValue.trim()) return;
    if (soundEnabled) {
      audioManager.playSoundEffect('message');
    }
    const newUserMessage: Message = {
      id: generateUniqueId(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsTyping(true);
    try {
      const response = await fetch('your-api-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputValue.trim() })
      });
      const data = await response.json();
      const botResponse: Message = {
        id: generateUniqueId(),
        content: data.response,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      const errorMessage: Message = {
        id: generateUniqueId(),
        content: "Sorry, I couldn't process your request right now.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    if (soundEnabled) {
      audioManager.playSoundEffect('message');
    }
    const newUserMessage: Message = {
      id: generateUniqueId(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsTyping(true);
    // Simulate bot typing
    setTimeout(() => {
      const botResponse: Message = {
        id: generateUniqueId(),
        content: getSimulatedResponse(inputValue),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "bg-background border rounded-lg shadow-lg overflow-hidden flex flex-col",
              isMinimized ? "w-72 h-12" : "w-80 sm:w-96 h-96"
            )}
            style={{
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15), 0 0 15px rgba(115, 211, 231, 0.15)'
            }}
          >
            <ChatHeader
              isTyping={isTyping}
              isMinimized={isMinimized}
              minimizeChat={minimizeChat}
              closeChat={toggleChat}
            />
            {!isMinimized && (
              <>
                <div
                  ref={chatContainerRef}
                  className={cn(
                    "flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin",
                    "bg-card scrollbar-thumb-palette-gray-light/40 scrollbar-track-transparent"
                  )}
                >
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                    />
                  ))}
                  {isTyping && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>
                <ChatInput
                  inputValue={inputValue}
                  setInputValue={setInputValue}
                  handleSendMessage={handleSendMessage}
                  inputRef={inputRef}
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {!isOpen && (
        <ChatToggleButton
          toggleChat={toggleChat}
        />
      )}
    </div>
  );
};

export default ChatWindow;
