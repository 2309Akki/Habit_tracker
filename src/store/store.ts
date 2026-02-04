import { configureStore } from "@reduxjs/toolkit";
import habitsReducer from "./slices/habitsSlice";
import uiReducer from "./slices/uiSlice";
import { syncListenerMiddleware } from "./syncListener";

export const store = configureStore({
  reducer: {
    habits: habitsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).prepend(syncListenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
