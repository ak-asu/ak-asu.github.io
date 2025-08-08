import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AnimationLevel, ThemeMode } from "@/lib/types";

interface ModeState {
  isTechnicalMode: boolean;
  animationLevel: AnimationLevel;
  themeMode: ThemeMode;
  soundEnabled: boolean;
}

const initialState: ModeState = {
  isTechnicalMode: false,
  animationLevel: AnimationLevel.Medium,
  themeMode: ThemeMode.System,
  soundEnabled: false,
};

const modeSlice = createSlice({
  name: "mode",
  initialState,
  reducers: {
    toggleMode: (state) => {
      state.isTechnicalMode = !state.isTechnicalMode;
    },
    setAnimationLevel: (state, action: PayloadAction<AnimationLevel>) => {
      state.animationLevel = action.payload;
    },
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload;
    },
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled;
    },
  },
});

export const { toggleMode, setAnimationLevel, setThemeMode, toggleSound } =
  modeSlice.actions;

export default modeSlice.reducer;
