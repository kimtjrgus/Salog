import { createSlice } from "@reduxjs/toolkit";

const scheduleSlice = createSlice({
	name: "schedule",
	  initialState: {
		  incomeSchedule : [],
		  outgoSchedule : [],
	   },
	reducers: {
		setIncomeSchedule: (state, action) => {
			state.incomeSchedule = action.payload;
		},
		setOutgoSchedule: (state, action) => {
			state.outgoSchedule = action.payload;
		},
	},
});
 
export const { setIncomeSchedule, setOutgoSchedule } = scheduleSlice.actions;

export default scheduleSlice.reducer;
