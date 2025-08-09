import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Key, AlertTriangle } from "lucide-react";

interface ApiKeyDialogProps {
  isOpen: boolean;
  onSubmit: (apiKey: string) => void;
  onClose: () => void;
}

export const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({
  isOpen,
  onSubmit,
  onClose,
}) => {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError("Please enter a valid API key");
      return;
    }
    if (!apiKey.startsWith("AIza")) {
      setError("Gemini API keys typically start with 'AIza'");
      return;
    }
    onSubmit(apiKey.trim());
    setApiKey("");
    setError("");
  };

  const handleClose = () => {
    setApiKey("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background border rounded-lg shadow-xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Gemini API Key Required</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-accent/20 border border-border rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-palette-teal-DEFAULT dark:text-palette-teal-dark mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1 text-foreground">
                Privacy Notice:
              </p>
              <p>
                Your API key is stored only in memory and will be lost when you
                refresh the page. All AI processing happens in your browser -
                your data stays with you.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
              Enter your Gemini API Key:
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIza..."
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                {error}
              </p>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            <p>
              Get your free API key from{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-palette-teal-DEFAULT dark:text-palette-teal-dark hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Continue
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ApiKeyDialog;
