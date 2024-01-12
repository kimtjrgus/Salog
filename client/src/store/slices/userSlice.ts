import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
	name: "user",
	initialState: {
		isLoggedIn: false,
		emailAlarm: false,
		homeAlarm: false,
		createdAt: "",
	},
	reducers: {
		login: (state, action) => {
			state.isLoggedIn = true;
			state.emailAlarm = action.payload.emailAlarm;
			state.homeAlarm = action.payload.homeAlarm;
			state.createdAt = action.payload.createdAt;
		},
		logout: (state) => {
			state.isLoggedIn = false;
		},
	},
});

export const { login, logout } = userSlice.actions;

export default userSlice.reducer;
