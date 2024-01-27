interface WeeklyStatistics {
	week: number;
	totalOutgo: number;
	totalIncome: number;
}

const weeklyCalculateRadio = (
	statistics: WeeklyStatistics[],
): Array<{ week: number; outgoRadio: number; incomeRadio: number }> => {
	const totalOutgo = statistics.reduce((sum, stat) => sum + stat.totalOutgo, 0);
	const totalIncome = statistics.reduce(
		(sum, stat) => sum + stat.totalIncome,
		0,
	);

	const radios = statistics.map((stat) => ({
		week: stat.week,
		outgoRadio: (stat.totalOutgo / totalOutgo) * 100,
		incomeRadio: (stat.totalIncome / totalIncome) * 100,
	}));

	return radios;
};

export default weeklyCalculateRadio;
