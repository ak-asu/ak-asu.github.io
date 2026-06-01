import { create } from "zustand";

type ViewMode = "visual" | "terminal";
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
  animationEnabled: boolean;
  soundEnabled: boolean;
  activeSection: Section;
  chatOpen: boolean;

  setViewMode: (mode: ViewMode) => void;
  setAnimationEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setActiveSection: (section: Section) => void;
  toggleViewMode: () => void;
  toggleSound: () => void;
  toggleAnimation: () => void;
  toggleChat: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  viewMode: "visual",
  animationEnabled: true,
  soundEnabled: false,
  activeSection: "home",
  chatOpen: false,

  setViewMode: (mode) => set({ viewMode: mode }),
  setAnimationEnabled: (enabled) => set({ animationEnabled: enabled }),
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  setActiveSection: (section) => {
    window.location.hash = section;
    set({ activeSection: section });
  },
  toggleViewMode: () =>
    set((state) => ({
      viewMode: state.viewMode === "visual" ? "terminal" : "visual",
    })),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  toggleAnimation: () =>
    set((state) => ({ animationEnabled: !state.animationEnabled })),
  toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),
}));
