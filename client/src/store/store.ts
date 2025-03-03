import { configureStore } from '@reduxjs/toolkit';
import modeReducer from './features/modeSlice';
import navigationReducer from './features/navigationSlice';
import workReducer from './features/workSlice';
import educationReducer from './features/educationSlice';

export const store = configureStore({
  reducer: {
    mode: modeReducer,
    education: educationReducer,
    navigation: navigationReducer,
    work: workReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
