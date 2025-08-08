import { Howl } from "howler";

class AudioManager {
  private backgroundMusic: Howl | null = null;
  private soundEffects: Map<string, Howl> = new Map();
  private volume = 0.5;

  constructor() {
    this.initializeAudio();
  }

  private initializeAudio() {
    this.backgroundMusic = new Howl({
      src: ["/audio/background.mp3"],
      loop: true,
      volume: this.volume,
    });

    // Initialize common sound effects
    const effects = {
      hover: "/audio/hover.mp3",
      click: "/audio/click.mp3",
      success: "/audio/success.mp3",
      transition: "/audio/transition.mp3",
    };

    Object.entries(effects).forEach(([key, src]) => {
      this.soundEffects.set(
        key,
        new Howl({
          src: [src],
          volume: this.volume,
        }),
      );
    });
  }

  playBackgroundMusic() {
    this.backgroundMusic?.play();
  }

  stopBackgroundMusic() {
    this.backgroundMusic?.stop();
  }

  playSoundEffect(effect: string) {
    this.soundEffects.get(effect)?.play();
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.backgroundMusic?.volume(this.volume);
    this.soundEffects.forEach((effect) => effect.volume(this.volume));
  }
}

export const audioManager = new AudioManager();
