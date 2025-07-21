import { configureStore } from '@reduxjs/toolkit';
import chatSlice from './slices/chatSlice';
import uiSlice from './slices/uiSlice';
import tasksSlice from './slices/tasksSlice';

export const store = configureStore({
  reducer: {
    tasks: tasksSlice,
    chat: chatSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['chat/setWebSocket'],
        ignoredPaths: ['chat.webSocket'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 