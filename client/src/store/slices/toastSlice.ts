// toastSlice.js
import { createSlice } from "@reduxjs/toolkit";

const toastSlice = createSlice({
	name: "toast",
	initialState: {
		message: "",
		type: "",
		visible: false,
	},
	reducers: {
		showToast: (state, action) => {
			state.message = action.payload.message;
			state.type = action.payload.type;
			state.visible = true;
		},
		hideToast: (state) => {
			state.visible = false;
		},
	},
});

export const { showToast, hideToast } = toastSlice.actions;

export default toastSlice.reducer;
