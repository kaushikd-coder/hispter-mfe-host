import { configureStore, combineReducers, ReducersMapObject, AnyAction } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistStore, persistReducer } from "redux-persist";

const staticReducers: ReducersMapObject = {};
let asyncReducers: ReducersMapObject = {};

function createRootReducer() {
    return combineReducers({ ...staticReducers, ...asyncReducers });
}

const persistConfig = {
    key: "root",
    storage,
    whitelist: ["bookings"], // persist bookings so refresh doesn’t lose data
};

const persistedReducer = persistReducer(persistConfig, createRootReducer());

export const store = configureStore({ reducer: persistedReducer });
export const persistor = persistStore(store);

/** Inject a remote reducer at runtime */
export function injectReducer(key: string, reducer: (state: any, action: AnyAction) => any) {
    if (asyncReducers[key]) return;
    asyncReducers[key] = reducer;

    const nextRootReducer = persistReducer(persistConfig, createRootReducer());
    // @ts-ignore
    store.replaceReducer(nextRootReducer);
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
