interface calendarType {
	date: string;
	totalOutgo: number;
	totalIncome: number;
}

const generateWeeklyData = (data: calendarType[]): calendarType[][] => {
	const weeks: calendarType[][] = [[]];

	// 데이터를 주차별로 분류
	for (const item of data) {
		const date = new Date(item.date);
		const weekIndex = Math.floor((date.getDate() - 1) / 7); // 주차 인덱스 계산

		if (!weeks[weekIndex]) {
			weeks[weekIndex] = [];
		}

		weeks[weekIndex].push(item);
	}
	return weeks;
};

export default generateWeeklyData;
