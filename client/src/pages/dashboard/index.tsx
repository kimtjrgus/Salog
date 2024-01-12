import { styled } from "styled-components";
import "chart.js/auto";
import PieChart from "./PieChart";
import { useEffect, useState } from "react";
import DashboardCalendar from "./Calendar";
import axios from "axios";
import Schedule from "./Schedule";
import WriteModal from "./WriteModal";
import { useSelector } from "react-redux";
import { type RootState } from "src/store";

export interface outgoType {
	month: number;
	monthlyOutgo: number;
	tags: tagType[];
}

export interface incomeType {
	month: number;
	monthlyIncome: number;
	tags: tagType[];
}

export interface wasteType {
	month: number;
	monthlyWaste: number;
	tags: tagType[];
}

export interface budgetType {
	budget: number;
	totalOutgo: number;
	dayRemain: number;
}

export interface tagType {
	tagName: string;
	tagSum: number;
}

export interface modalType {
	dayTile: boolean;
	writeIcon: boolean;
	day: string;
}

const Dashboard = () => {
	const member = useSelector((state: RootState) => state.persistedReducer.user);
	console.log(member);

	// member에 태그가 추가되면 화면 제작
	const [monthlyOutgo, setMonthlyOutgo] = useState<outgoType>({
		month: 0,
		monthlyOutgo: 0,
		tags: [],
	});
	const [monthlyIncome, setMonthlyIncome] = useState<incomeType>({
		month: 0,
		monthlyIncome: 0,
		tags: [],
	});
	const [monthlyWasteList, setMonthlyWasteList] = useState<wasteType>({
		month: 0,
		monthlyWaste: 0,
		tags: [],
	});
	const [monthlyBudget, setMonthlyBudget] = useState<budgetType>({
		budget: 0,
		totalOutgo: 0,
		dayRemain: 0,
	});

	const [isOpen, setIsOpen] = useState<modalType>({
		dayTile: false,
		writeIcon: false,
		day: "",
	});

	const statLists = [
		{
			title: "이번 달 지출",
			data: monthlyOutgo,
			sum: monthlyOutgo.monthlyOutgo,
		},
		{
			title: "이번 달 수입",
			data: monthlyIncome,
			sum: monthlyIncome.monthlyIncome,
		},
		{
			title: "낭비 리스트",
			data: monthlyWasteList,
			sum: monthlyWasteList.monthlyWaste,
		},
	];
	useEffect(() => {
		axios
			.get("http://localhost:8000/monthlyOutgo")
			.then((res) => {
				setMonthlyOutgo(res.data[0]);
			})
			.catch((error) => {
				console.log(error);
			});
		axios
			.get("http://localhost:8000/monthlyIncome")
			.then((res) => {
				setMonthlyIncome(res.data[0]);
			})
			.catch((error) => {
				console.log(error);
			});
		axios
			.get("http://localhost:8000/monthlyWasteList")
			.then((res) => {
				setMonthlyWasteList(res.data[0]);
			})
			.catch((error) => {
				console.log(error);
			});
		axios
			.get("http://localhost:8000/monthlyBudget")
			.then((res) => {
				setMonthlyBudget(res.data[0]);
			})
			.catch((error) => {
				console.log(error);
			});
		// const fetchData = async () => {
		// 	try {
		// 		const [outgoResponse, incomeResponse] = await Promise.all([
		// 			api.get("/monthlyOutgo"),
		// 			api.get("/monthlyIncome"),
		// 		]);

		// 		setMonthlyOutgo(outgoResponse.data[0]);
		// 		setMonthlyIncome(incomeResponse.data[0]);
		// 	} catch (error) {
		// 		console.log(error);
		// 	}
		// };
		// fetchData();
	}, []);

	return (
		<>
			<Container>
				<StatContainer>
					{statLists.map((stat, index) => (
						<StatList key={index}>
							<h3>{stat.title}</h3>
							<h4>{stat.sum.toLocaleString()}원</h4>
							<hr />
							<div className="PieChartContainer">
								<PieChart stat={stat} />
							</div>
						</StatList>
					))}
					<StatList>
						<h3>예산</h3>
						<h4>{monthlyBudget.budget.toLocaleString()}원</h4>
						<hr />
						<BarChartContainer
							width={`${Math.floor(
								(monthlyBudget.totalOutgo / monthlyBudget.budget) * 100,
							)}`}
						>
							<div className="legends">
								<div className="legend__square"></div>
								<p>예산</p>
								<div className="legend__square"></div>
								<p>지출</p>
							</div>
							<div className="bar">
								<div className="bar__item"></div>
								<span>{monthlyBudget.totalOutgo.toLocaleString()}원</span>
							</div>
						</BarChartContainer>
					</StatList>
				</StatContainer>
				<MainContainer>
					<DashboardCalendar isOpen={isOpen} setIsOpen={setIsOpen} />
					<Schedule />
					<WriteModal isOpen={isOpen} setIsOpen={setIsOpen} />
				</MainContainer>
			</Container>
		</>
	);
};

const Container = styled.div`
	display: flex;
	flex-direction: column;
`;

const StatContainer = styled.ul`
	padding: 1.5rem;
	display: flex;
	height: 22rem;
`;

const MainContainer = styled.div`
	display: flex;
`;

const StatList = styled.li`
	border: 1px solid ${(props) => props.theme.COLORS.GRAY_300};
	box-shadow: 0px 2px 10px rgb(0, 0, 0, 10%);
	border-radius: 6px;
	margin: 0 0.5rem;
	width: 25rem;

	h3 {
		font-size: 1.2rem;
		margin-left: 1.8rem;
		margin-top: 1.3rem;
		color: ${(props) => props.theme.COLORS.GRAY_600};
	}

	h4 {
		font-size: 1.8rem;
		margin-left: 1.8rem;
		margin-top: 0.6rem;
	}

	hr {
		border: 1px solid #f2f2f2;
	}

	.PieChartContainer {
		width: 250px;
		height: 100px; /* 파이차트 컨테이너의 높이 설정 */
	}
`;

const BarChartContainer = styled.div<{ width: string }>`
	display: flex;
	flex-direction: column;
	padding: 0.3rem 2rem;

	.legends {
		display: flex;
		align-items: center;
	}

	.legend__square {
		width: 20px;
		height: 5px;
		margin-right: 0.5rem;

		&:first-child {
			background: #d9d9d9;
		}

		&:nth-child(3) {
			background: #1bbf83;
		}
	}

	p {
		font-size: 1.2rem;
		margin-right: 1rem;
	}

	.bar {
		margin-top: 1.5rem;
		border-radius: 4px;
		width: 100%;
		height: 22px;
		background: #d9d9d9;

		.bar__item {
			background: #1bbf83;
			border-radius: ${(props) =>
				Number(props.width) < 100 ? "4px 0 0 4px" : "4px"};
			width: ${(props) => (Number(props.width) > 100 ? 100 : props.width)}%;
			height: 22px;
		}

		span {
			color: #7c7878;
			white-space: nowrap;
			font-size: 1rem;
			margin-left: ${(props) =>
				Number(props.width) < 8
					? 0
					: Number(props.width) > 85
					  ? 0
					  : Number(props.width) - 8}%;

			float: ${(props) =>
				Number(props.width) < 8
					? "left"
					: Number(props.width) > 85
					  ? "right"
					  : "none"};

			margin-top: ${(props) =>
				Number(props.width) < 8
					? "0.5rem"
					: Number(props.width) > 85
					  ? "0.5rem"
					  : "0"};
		}
	}
`;

export default Dashboard;
