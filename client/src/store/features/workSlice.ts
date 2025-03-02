import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ActiveProject {
  company: string;
  project: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    type: string;
  };
}

interface WorkState {
  activeProject: ActiveProject | null;
}

const initialState: WorkState = {
  activeProject: null
};

export const workSlice = createSlice({
  name: 'work',
  initialState,
  reducers: {
    setActiveProject: (state, action: PayloadAction<ActiveProject>) => {
      state.activeProject = action.payload;
    },
    clearActiveProject: (state) => {
      state.activeProject = null;
    }
  }
});

export const { setActiveProject, clearActiveProject } = workSlice.actions;

export default workSlice.reducer;