import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// 비동기 액션 생성자인 createAsyncThunk를 사용하여 데이터를 가져오는 비동기 작업을 처리합니다.
export const fetchMonthlyOutgo = createAsyncThunk(
	"user/fetchMonthlyOutgo",
	async () => {
		const response = await axios.get("http://localhost:8000/monthlyOutgo");
		return response.data;
	},
);

const pieChartSlice = createSlice({
	name: "pieChart",
	initialState: {
		monthlyOutgo: [],
		monthlyIncome: [],
		wasteList: [],
	},
	reducers: {
		setMonthlyOutgo: (state, action) => {
			state.monthlyOutgo = action.payload;
		},
		setIncome: (state, action) => {
			state.monthlyIncome = action.payload;
		},
		setWasteList: (state, action) => {
			state.wasteList = action.payload;
		},
	},

	extraReducers(builder) {
		builder.addCase(fetchMonthlyOutgo.fulfilled, (state, action) => {
			state.monthlyOutgo = action.payload;
		});
	},
});
export const { setMonthlyOutgo, setIncome, setWasteList } =
	pieChartSlice.actions;
export default pieChartSlice.reducer;
