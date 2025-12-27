import { useCallback, useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";

// Audio URLs - using royalty-free sci-fi sounds
const SOUNDS = {
  // UI Sounds
  click: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
  hover: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
  toggle: "https://assets.mixkit.co/active_storage/sfx/2205/2205-preview.mp3",
  powerUp: "https://assets.mixkit.co/active_storage/sfx/2600/2600-preview.mp3",
  whoosh: "https://assets.mixkit.co/active_storage/sfx/2617/2617-preview.mp3",
  beep: "https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3",
  success: "https://assets.mixkit.co/active_storage/sfx/2190/2190-preview.mp3",

  // Ambient/Background
  ambient: "https://assets.mixkit.co/active_storage/sfx/2831/2831-preview.mp3",
};

type SoundType = keyof typeof SOUNDS;

export const useAudioSystem = () => {
  const { soundEnabled } = useAppStore();
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());
  const ambientRef = useRef<HTMLAudioElement | null>(null);

  // Preload sounds
  useEffect(() => {
    Object.entries(SOUNDS).forEach(([key, url]) => {
      if (!audioCache.current.has(key)) {
        const audio = new Audio(url);
        audio.preload = "auto";
        audio.volume = key === "ambient" ? 0.15 : 0.3;
        audioCache.current.set(key, audio);

        if (key === "ambient") {
          audio.loop = true;
          ambientRef.current = audio;
        }
      }
    });
  }, []);

  // Handle ambient music based on sound toggle
  useEffect(() => {
    if (ambientRef.current) {
      if (soundEnabled) {
        ambientRef.current.play().catch(() => {});
      } else {
        ambientRef.current.pause();
      }
    }
  }, [soundEnabled]);

  const playSound = useCallback(
    (type: SoundType) => {
      if (!soundEnabled) return;

      const audio = audioCache.current.get(type);
      if (audio && type !== "ambient") {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    },
    [soundEnabled],
  );

  const playClick = useCallback(() => playSound("click"), [playSound]);
  const playHover = useCallback(() => playSound("hover"), [playSound]);
  const playToggle = useCallback(() => playSound("toggle"), [playSound]);
  const playPowerUp = useCallback(() => playSound("powerUp"), [playSound]);
  const playWhoosh = useCallback(() => playSound("whoosh"), [playSound]);
  const playBeep = useCallback(() => playSound("beep"), [playSound]);
  const playSuccess = useCallback(() => playSound("success"), [playSound]);

  return {
    playSound,
    playClick,
    playHover,
    playToggle,
    playPowerUp,
    playWhoosh,
    playBeep,
    playSuccess,
  };
};
