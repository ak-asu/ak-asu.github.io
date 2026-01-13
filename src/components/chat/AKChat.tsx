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
  Download,
} from "lucide-react";
import { useAudioSystem } from "@/hooks/useAudioSystem";
import { useSpeech } from "@/hooks/useSpeech";
import { cn } from "@/lib/utils";
import { webLLMService } from "@/services/webLLMService";
import type { ChatMessage } from "@/services/webLLMService";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export const AKChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Good day, sir. I am AK, at your service. How may I assist you in exploring this portfolio?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelInitialized, setIsModelInitialized] = useState(false);
  const [modelLoadProgress, setModelLoadProgress] = useState(0);
  const [modelLoadText, setModelLoadText] = useState(
    "Initializing AI systems...",
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { playClick, playBeep, playSuccess, playHover, playPowerUp } =
    useAudioSystem();

  const handleVoiceResult = useCallback((transcript: string) => {
    setInput(transcript);
    // Auto-send after voice input
    setTimeout(() => {
      const sendButton = document.getElementById("ak-send-btn");
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

  // Function to initialize WebLLM when user clicks Enable AI button
  const initializeAI = async () => {
    if (isModelInitialized || isModelLoading) return;

    setIsModelLoading(true);
    playPowerUp();

    const result = await webLLMService.initialize((progress) => {
      setModelLoadProgress(Math.round(progress.progress * 100));
      setModelLoadText(progress.text);
    });

    if (result.success) {
      setIsModelLoading(false);
      setIsModelInitialized(true);
      playSuccess();
      console.log("AK AI systems online");
    } else {
      setIsModelLoading(false);
      setModelLoadText(`Initialization failed: ${result.error}`);
      console.error("Failed to initialize WebLLM:", result.error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !isModelInitialized) return;

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

    // Create a placeholder message for streaming
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    playBeep();

    try {
      // Convert message history to ChatMessage format
      const chatHistory: ChatMessage[] = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      let fullResponse = "";

      // Stream response from WebLLM
      await webLLMService.chat(
        userMessage.content,
        chatHistory,
        (delta, isDone) => {
          if (!isDone && delta) {
            fullResponse += delta;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: fullResponse }
                  : msg,
              ),
            );
          } else if (isDone) {
            // Mark as done streaming
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, isStreaming: false }
                  : msg,
              ),
            );
            playSuccess();

            // Speak the response if voice is enabled
            if (voiceEnabled && isSupported && fullResponse) {
              speak(fullResponse);
            }
          }
        },
      );
    } catch (error) {
      console.error("Error getting response:", error);
      const errorContent =
        error instanceof Error
          ? `I apologize, sir. ${error.message}`
          : "I apologize, sir. There seems to be a temporary disruption in my neural network. Please try again.";

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: errorContent, isStreaming: false }
            : msg,
        ),
      );
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
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-linear-to-br from-red-600 to-red-800 border-2 border-amber-400/50 shadow-lg shadow-red-500/30 flex items-center justify-center group"
          >
            {/* Arc Reactor Glow */}
            <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-linear-to-br from-cyan-400/30 to-blue-500/30 animate-[spin_3s_linear_infinite]" />
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
              "fixed bottom-6 right-6 z-50 w-95 rounded-xl overflow-hidden",
              "bg-linear-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-xl",
              "border-2 border-red-600/50 shadow-2xl shadow-red-500/20",
              "flex flex-col",
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-linear-to-r from-red-900/50 via-red-800/30 to-amber-900/30 border-b border-amber-500/30">
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
                        ? "bg-linear-to-br from-green-400 to-emerald-500"
                        : "bg-linear-to-br from-cyan-400 to-blue-500",
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
                    AK
                  </h3>
                  <p className="text-cyan-400/70 text-xs">
                    {isModelLoading
                      ? `Initializing... ${modelLoadProgress}%`
                      : !isModelInitialized
                        ? "AI Offline • Click Enable AI"
                        : isSpeaking
                          ? "Speaking..."
                          : isListening
                            ? "Listening..."
                            : "Online • Ready to assist"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Enable AI Button */}
                {!isModelInitialized && !isModelLoading && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={initializeAI}
                    onMouseEnter={playHover}
                    className="px-3 py-1.5 rounded-lg bg-linear-to-r from-cyan-600 to-blue-600 text-white text-xs font-medium shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all"
                  >
                    Enable AI
                  </motion.button>
                )}
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
                  className="flex-1 overflow-y-auto p-4 space-y-4 min-h-75 max-h-87.5 scrollbar-thin scrollbar-thumb-red-600/30 scrollbar-track-transparent"
                >
                  {isModelLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center justify-center gap-3 py-8"
                    >
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-pulse" />
                        <div className="absolute inset-2 rounded-full bg-linear-to-br from-cyan-400/40 to-blue-500/40 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Download className="w-8 h-8 text-cyan-400 animate-bounce" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-cyan-400 text-sm font-medium">
                          {modelLoadText}
                        </p>
                        <p className="text-cyan-400/60 text-xs mt-1">
                          {modelLoadProgress}% complete
                        </p>
                      </div>
                      <div className="w-full max-w-50 h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                          style={{ width: `${modelLoadProgress}%` }}
                        />
                      </div>
                    </motion.div>
                  )}
                  {!isModelLoading &&
                    messages.map((message, index) => (
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
                              ? "bg-linear-to-r from-red-600/80 to-red-700/80 text-white rounded-br-sm"
                              : "bg-linear-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 text-cyan-100 rounded-bl-sm",
                          )}
                        >
                          {message.content}
                          {message.isStreaming && (
                            <span className="inline-block w-1 h-4 bg-cyan-400 ml-1 animate-pulse" />
                          )}
                        </div>
                      </motion.div>
                    ))}
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
                        disabled={isLoading || !isModelInitialized}
                        className={cn(
                          "p-2.5 rounded-lg transition-all relative",
                          isListening
                            ? "bg-linear-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30"
                            : "bg-slate-700/50 text-cyan-400 hover:bg-slate-600/50",
                          (isLoading || !isModelInitialized) &&
                            "opacity-50 cursor-not-allowed",
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
                      disabled={!isModelInitialized || isModelLoading}
                      placeholder={
                        !isModelInitialized
                          ? "Enable AI to start chatting..."
                          : isModelLoading
                            ? "Initializing AI..."
                            : isListening
                              ? "Listening..."
                              : "Ask AK anything..."
                      }
                      className="flex-1 bg-slate-800/50 border border-cyan-500/30 rounded-lg px-4 py-2.5 text-sm text-cyan-100 placeholder:text-cyan-500/50 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {!isLoading ? (
                      <motion.button
                        id="ak-send-btn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSend}
                        onMouseEnter={playHover}
                        disabled={
                          isLoading || !input.trim() || !isModelInitialized
                        }
                        className={cn(
                          "p-2.5 rounded-lg transition-all",
                          input.trim() && !isLoading && isModelInitialized
                            ? "bg-linear-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30"
                            : "bg-slate-700/50 text-slate-500 cursor-not-allowed",
                        )}
                      >
                        <Send className="w-4 h-4" />
                      </motion.button>
                    ) : (
                      <div className="p-2.5">
                        <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                      </div>
                    )}
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

export default AKChat;
