import {
	combineReducers,
	configureStore,
	getDefaultMiddleware,
} from "@reduxjs/toolkit";
import ledgerSlice from "./slices/pieChartSlice";
import userSlice from "./slices/userSlice";
import ToastSlice from "./slices/toastSlice";
import scheduleSlice from './slices/scheduleSlice';
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// import type { RootState, AppDispatch } from './store'

const reducers = combineReducers({
	user: userSlice,
	ledger: ledgerSlice,
	toast: ToastSlice,
	schedule: scheduleSlice,
});

const persistConfig = {
	key: "root",
	storage,
	whiteList: ["schedule"],
};

const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
	reducer: {
		persistedReducer,
	},
	middleware: getDefaultMiddleware({
		serializableCheck: false,
	}),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export default store;
