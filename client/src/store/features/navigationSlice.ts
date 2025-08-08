import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface NavigationState {
  scrollSection: string;
}

const initialState: NavigationState = {
  scrollSection: "intro",
};

export const navigationSlice = createSlice({
  name: "navigation",
  initialState,
  reducers: {
    setScrollSection: (state, action: PayloadAction<string>) => {
      state.scrollSection = action.payload;
    },
  },
});

export const { setScrollSection } = navigationSlice.actions;

export default navigationSlice.reducer;
