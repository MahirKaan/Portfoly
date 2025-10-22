import { configureStore } from '@reduxjs/toolkit';
import marketSlice from './marketSlice';

export const store = configureStore({
  reducer: {
    market: marketSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;