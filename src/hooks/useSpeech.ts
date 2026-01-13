import { useState, useCallback, useRef, useEffect } from "react";

interface UseSpeechOptions {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

export const useSpeech = (options: UseSpeechOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Check browser support at initialization
  const SpeechRecognitionAPI =
    (
      window as typeof window & {
        SpeechRecognition?: typeof SpeechRecognition;
        webkitSpeechRecognition?: typeof SpeechRecognition;
      }
    ).SpeechRecognition ||
    (
      window as typeof window & {
        SpeechRecognition?: typeof SpeechRecognition;
        webkitSpeechRecognition?: typeof SpeechRecognition;
      }
    ).webkitSpeechRecognition;
  const [isSupported] = useState(
    () => !!(SpeechRecognitionAPI && window.speechSynthesis),
  );

  useEffect(() => {
    if (!SpeechRecognitionAPI || !window.speechSynthesis) {
      return;
    }

    synthRef.current = window.speechSynthesis;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      options.onResult?.(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      options.onError?.(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      synthRef.current?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error("Error starting speech recognition:", error);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 0.9;
    utterance.volume = 1.0;

    // Try to find a British English voice for AK feel
    const voices = synthRef.current.getVoices();
    const britishVoice = voices.find(
      (v) =>
        v.lang.includes("en-GB") ||
        v.name.toLowerCase().includes("british") ||
        v.name.toLowerCase().includes("daniel"),
    );
    const englishVoice = voices.find((v) => v.lang.startsWith("en"));

    utterance.voice = britishVoice || englishVoice || voices[0];

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    isSpeaking,
    isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
};
