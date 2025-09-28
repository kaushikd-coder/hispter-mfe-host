import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import {
  persistReducer,
  persistStore,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER
} from "redux-persist";

import authReducer from "./authSlice";
import { bookingsReducer } from "./bookingsSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  bookings: bookingsReducer, // 👈 static, always present
});

const persisted = persistReducer({ key: "root", storage }, rootReducer);

export const store = configureStore({
  reducer: persisted,
  middleware: (gdm) => gdm({
    serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] }
  }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
