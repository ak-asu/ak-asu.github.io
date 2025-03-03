import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AnimationLevel = 'basic' | 'medium' | 'expert';
export type ThemeMode = 'light' | 'dark' | 'system';

interface ModeState {
  isTechnicalMode: boolean;
  animationLevel: AnimationLevel;
  themeMode: ThemeMode;
  soundEnabled: boolean;
  physicsEnabled: boolean;
}

const initialState: ModeState = {
  isTechnicalMode: false,
  animationLevel: 'medium',
  themeMode: 'system',
  soundEnabled: true,
  physicsEnabled: true,
};

const modeSlice = createSlice({
  name: 'mode',
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
    togglePhysics: (state) => {
      state.physicsEnabled = !state.physicsEnabled;
    },
  },
});

export const { 
  toggleMode, 
  setAnimationLevel, 
  setThemeMode,
  toggleSound,
  togglePhysics 
} = modeSlice.actions;

export default modeSlice.reducer;