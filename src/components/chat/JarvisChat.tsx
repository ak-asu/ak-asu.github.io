import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Minimize2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useAudioSystem } from "@/hooks/useAudioSystem";
import { useSpeech } from "@/hooks/useSpeech";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// TODO: Replace with actual AI API call
// This is a placeholder that simulates JARVIS-style responses
const getJarvisResponse = async (
  userMessage: string,
  conversationHistory: Message[],
): Promise<string> => {
  // Simulate API delay
  await new Promise((resolve) =>
    setTimeout(resolve, 1000 + Math.random() * 1500),
  );

  const lowerMessage = userMessage.toLowerCase();

  // Context-aware responses based on portfolio content
  if (lowerMessage.includes("skill") || lowerMessage.includes("tech")) {
    return "Sir, I've analyzed the skill matrix. The primary proficiencies include React, TypeScript, and various modern web technologies. Shall I elaborate on any specific domain?";
  }
  if (lowerMessage.includes("project")) {
    return "I've catalogued several notable projects in the database, sir. Each demonstrates a unique application of technical expertise. Would you like me to highlight a particular initiative?";
  }
  if (lowerMessage.includes("experience") || lowerMessage.includes("work")) {
    return "The professional timeline indicates substantial experience across multiple organizations. I can provide detailed analysis of any specific role upon request, sir.";
  }
  if (
    lowerMessage.includes("contact") ||
    lowerMessage.includes("hire") ||
    lowerMessage.includes("reach")
  ) {
    return "Certainly, sir. The 'Let's Talk' interface is available in the navigation bar. Alternatively, I can facilitate a direct communication channel if you prefer.";
  }
  if (
    lowerMessage.includes("hello") ||
    lowerMessage.includes("hi") ||
    lowerMessage.includes("hey")
  ) {
    return "Good day, sir. I am JARVIS, your personal portfolio assistant. How may I assist you in exploring this digital domain?";
  }
  if (
    lowerMessage.includes("who are you") ||
    lowerMessage.includes("what are you")
  ) {
    return "I am JARVIS - Just A Rather Very Intelligent System. I serve as the AI interface for this portfolio, designed to assist visitors in navigating and understanding the professional capabilities on display.";
  }
  if (lowerMessage.includes("game")) {
    return "Ah, the recreational subroutines. We have Tic-Tac-Toe and Color Tap available for your entertainment, sir. Shall I navigate you to the Games section?";
  }
  if (
    lowerMessage.includes("education") ||
    lowerMessage.includes("study") ||
    lowerMessage.includes("degree")
  ) {
    return "The educational credentials are quite impressive, sir. I can provide a comprehensive overview of the academic achievements if you wish to proceed to that section.";
  }
  if (lowerMessage.includes("achievement")) {
    return "The achievement vault contains several notable accomplishments. Shall I unlock the display for your perusal, sir?";
  }

  // Default responses with some variety
  const defaultResponses = [
    "Acknowledged, sir. I'm processing your inquiry. Is there a specific aspect of the portfolio you'd like me to analyze?",
    "Interesting query, sir. While I compile the relevant data, perhaps you'd like to explore the Skills or Projects section?",
    "I'm at your service, sir. Feel free to ask about skills, projects, experience, or any other aspect of this portfolio.",
    "Processing, sir. My systems are fully operational and ready to assist with any portfolio-related inquiries.",
    "Indeed, sir. The portfolio contains extensive information. How may I direct your attention today?",
  ];

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

export const JarvisChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Good day, sir. I am JARVIS, at your service. How may I assist you in exploring this portfolio?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { playClick, playBeep, playSuccess, playHover, playPowerUp } =
    useAudioSystem();

  const handleVoiceResult = useCallback((transcript: string) => {
    setInput(transcript);
    // Auto-send after voice input
    setTimeout(() => {
      const sendButton = document.getElementById("jarvis-send-btn");
      if (sendButton) sendButton.click();
    }, 300);
  }, []);

  const {
    isListening,
    isSpeaking,
    isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  } = useSpeech({
    onResult: handleVoiceResult,
    onError: (error) => console.error("Speech error:", error),
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    playClick();
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      const response = await getJarvisResponse(userMessage.content, messages);

      playBeep();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      playSuccess();

      // Speak the response if voice is enabled
      if (voiceEnabled && isSupported) {
        speak(response);
      }
    } catch (error) {
      console.error("Error getting response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I apologize, sir. There seems to be a temporary disruption in my neural network. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleOpen = () => {
    playClick();
    if (!isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
    } else {
      setIsOpen(false);
      stopSpeaking();
    }
  };

  const toggleMinimize = () => {
    playClick();
    setIsMinimized(!isMinimized);
  };

  const toggleVoice = () => {
    playClick();
    if (isSpeaking) stopSpeaking();
    setVoiceEnabled(!voiceEnabled);
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      playPowerUp();
      startListening();
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleOpen}
            onMouseEnter={playHover}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-red-800 border-2 border-amber-400/50 shadow-lg shadow-red-500/30 flex items-center justify-center group"
          >
            {/* Arc Reactor Glow */}
            <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-500/30 animate-[spin_3s_linear_infinite]" />
            <MessageCircle className="w-6 h-6 text-cyan-400 relative z-10" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? "auto" : "500px",
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed bottom-6 right-6 z-50 w-[380px] rounded-xl overflow-hidden",
              "bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-xl",
              "border-2 border-red-600/50 shadow-2xl shadow-red-500/20",
              "flex flex-col",
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-900/50 via-red-800/30 to-amber-900/30 border-b border-amber-500/30">
              <div className="flex items-center gap-3">
                {/* Mini Arc Reactor */}
                <div className="relative w-8 h-8">
                  <div
                    className={cn(
                      "absolute inset-0 rounded-full",
                      isSpeaking
                        ? "bg-green-400/50 animate-pulse"
                        : "bg-cyan-400/30 animate-pulse",
                    )}
                  />
                  <div
                    className={cn(
                      "absolute inset-1 rounded-full opacity-60",
                      isSpeaking
                        ? "bg-gradient-to-br from-green-400 to-emerald-500"
                        : "bg-gradient-to-br from-cyan-400 to-blue-500",
                    )}
                  />
                  <div className="absolute inset-2 rounded-full bg-slate-900 flex items-center justify-center">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full animate-pulse",
                        isSpeaking ? "bg-green-400" : "bg-cyan-400",
                      )}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-amber-400 font-bold text-sm tracking-wider">
                    J.A.R.V.I.S
                  </h3>
                  <p className="text-cyan-400/70 text-xs">
                    {isSpeaking
                      ? "Speaking..."
                      : isListening
                        ? "Listening..."
                        : "Online • Ready to assist"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Voice Toggle */}
                {isSupported && (
                  <button
                    onClick={toggleVoice}
                    onMouseEnter={playHover}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      voiceEnabled
                        ? "text-cyan-400 hover:bg-cyan-400/10"
                        : "text-slate-500 hover:bg-white/5",
                    )}
                    title={voiceEnabled ? "Disable voice" : "Enable voice"}
                  >
                    {voiceEnabled ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                  </button>
                )}
                <button
                  onClick={toggleMinimize}
                  onMouseEnter={playHover}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-amber-400/70 hover:text-amber-400 transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleOpen}
                  onMouseEnter={playHover}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-red-400/70 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[350px] scrollbar-thin scrollbar-thumb-red-600/30 scrollbar-track-transparent"
                >
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "flex",
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] px-4 py-2.5 rounded-xl text-sm",
                          message.role === "user"
                            ? "bg-gradient-to-r from-red-600/80 to-red-700/80 text-white rounded-br-sm"
                            : "bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 text-cyan-100 rounded-bl-sm",
                        )}
                      >
                        {message.content}
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 px-4 py-3 rounded-xl rounded-bl-sm flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                        <span className="text-cyan-400 text-sm">
                          Processing...
                        </span>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-3 border-t border-amber-500/20 bg-slate-900/50"
                >
                  <div className="flex items-center gap-2">
                    {/* Mic Button */}
                    {isSupported && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleMicClick}
                        onMouseEnter={playHover}
                        disabled={isLoading}
                        className={cn(
                          "p-2.5 rounded-lg transition-all relative",
                          isListening
                            ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30"
                            : "bg-slate-700/50 text-cyan-400 hover:bg-slate-600/50",
                        )}
                      >
                        {isListening && (
                          <div className="absolute inset-0 rounded-lg bg-green-400/30 animate-ping" />
                        )}
                        {isListening ? (
                          <Mic className="w-4 h-4 relative z-10" />
                        ) : (
                          <MicOff className="w-4 h-4" />
                        )}
                      </motion.button>
                    )}
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder={
                        isListening ? "Listening..." : "Ask JARVIS anything..."
                      }
                      className="flex-1 bg-slate-800/50 border border-cyan-500/30 rounded-lg px-4 py-2.5 text-sm text-cyan-100 placeholder:text-cyan-500/50 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 transition-colors"
                    />
                    <motion.button
                      id="jarvis-send-btn"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSend}
                      onMouseEnter={playHover}
                      disabled={isLoading || !input.trim()}
                      className={cn(
                        "p-2.5 rounded-lg transition-all",
                        input.trim() && !isLoading
                          ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30"
                          : "bg-slate-700/50 text-slate-500 cursor-not-allowed",
                      )}
                    >
                      <Send className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
