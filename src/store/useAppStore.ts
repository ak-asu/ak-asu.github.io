import { create } from "zustand";

type ViewMode = "visual" | "terminal";
type AnimationLevel = "low" | "medium" | "high";
type Section =
  | "home"
  | "skills"
  | "projects"
  | "work"
  | "education"
  | "achievements"
  | "games";

interface AppState {
  viewMode: ViewMode;
  animationLevel: AnimationLevel;
  soundEnabled: boolean;
  activeSection: Section;

  setViewMode: (mode: ViewMode) => void;
  setAnimationLevel: (level: AnimationLevel) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setActiveSection: (section: Section) => void;
  toggleViewMode: () => void;
  toggleSound: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  viewMode: "visual",
  animationLevel: "high",
  soundEnabled: false,
  activeSection: "home",

  setViewMode: (mode) => set({ viewMode: mode }),
  setAnimationLevel: (level) => set({ animationLevel: level }),
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  setActiveSection: (section) => {
    // Update URL hash when section changes
    window.location.hash = section;
    set({ activeSection: section });
  },
  toggleViewMode: () =>
    set((state) => ({
      viewMode: state.viewMode === "visual" ? "terminal" : "visual",
    })),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
}));
