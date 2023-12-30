import { configureStore } from "@reduxjs/toolkit";
import ledgerSlice from "./slices/ledger";
// import type { RootState, AppDispatch } from './store'

// 리듀서들을 바인딩하는 저장소
export const store = configureStore({
	reducer: {
		monthlyOutgo: ledgerSlice,
	},
});
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
