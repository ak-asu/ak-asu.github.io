import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface EducationState {
  activeEducation: number;
}

const initialState: EducationState = {
  activeEducation: 0,
};

export const educationSlice = createSlice({
  name: "education",
  initialState,
  reducers: {
    setActiveEducation: (state, action: PayloadAction<number>) => {
      state.activeEducation = action.payload;
    },
  },
});

export const { setActiveEducation } = educationSlice.actions;
export default educationSlice.reducer;
