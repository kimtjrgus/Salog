interface calendarType {
	date: string;
	totalOutgo: number;
	totalIncome: number;
}

const calculateWeeklyStatistics = (
	weeks: calendarType[][],
): Array<{ week: number; totalOutgo: number; totalIncome: number }> => {
	// 주간 별 통계를 저장할 배열
	const weeklyStatistics: Array<{
		week: number;
		totalOutgo: number;
		totalIncome: number;
	}> = [];

	// 주간 별 통계 계산
	for (let i = 0; i < weeks.length; i++) {
		const weekData = weeks[i];

		// 주간 지출과 수입의 합을 초기화
		let totalOutgo = 0;
		let totalIncome = 0;

		// 해당 주의 데이터를 순회하며 지출과 수입을 더함
		for (const data of weekData) {
			totalOutgo += data.totalOutgo;
			totalIncome += data.totalIncome;
		}

		// 주간 별 통계를 weeklyStatistics 배열에 추가
		weeklyStatistics.push({
			week: i + 1, // 주차 번호
			totalOutgo,
			totalIncome,
		});
	}

	return weeklyStatistics;
};

export default calculateWeeklyStatistics;
