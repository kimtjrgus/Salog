import { createSlice } from "@reduxjs/toolkit";

const ledgerSlice = createSlice({
	name: "monthlyOutgo",
	initialState: {
		value: {
			month: 0,
			monthlyOutgo: 0,
			tags: {
				tagName: "",
				tagSum: "",
			},
		},
	},
	reducers: {
		monthly: (state, action) => {
			state.value = action.payload;
		},
	},
});
export const { monthly } = ledgerSlice.actions;
export default ledgerSlice.reducer;
