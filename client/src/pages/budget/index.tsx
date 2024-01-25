import { styled } from "styled-components";
import { SvgIcon } from "@mui/material";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import { useEffect, useState } from "react";
import axios from "axios";

export interface budgetType {
	budget: number;
	totalOutgo: number;
	dayRemain: number;
}

interface tagType {
	tagName: string;
	tagSum: number;
}

interface monthlyOutgoType {
	month: number;
	monthlyIncome: number;
	tags: tagType[];
}

const Budget = () => {
	const [monthlyBudget, setMonthlyBudget] = useState<budgetType>({
		budget: 0,
		totalOutgo: 0,
		dayRemain: 0,
	});

	const [monthlyIncome, setMonthlyIncome] = useState<monthlyOutgoType>({
		month: 0,
		monthlyIncome: 0,
		tags: [],
	});

	console.log(monthlyBudget);

	useEffect(() => {
		axios
			.get("http://localhost:8000/monthlyBudget")
			.then((res) => {
				setMonthlyBudget(res.data[0]);
			})
			.catch((error) => {
				console.error(error);
			});
		axios
			.get("http://localhost:8000/monthlyIncome")
			.then((res) => {
				setMonthlyIncome(res.data[0]);
			})
			.catch((error) => {
				console.error(error);
			});
	}, []);

	return (
		<Container>
			<div className="header">
				<h3>예산</h3>
				<button>
					<SvgIcon
						component={CreateOutlinedIcon}
						sx={{ stroke: "#ffffff", strokeWidth: 1 }}
					/>
					<p>예산 작성하기</p>
				</button>
			</div>
			<p className="subtitle">
				예산을 설정하여 지출을 효과적으로 관리해보세요!
			</p>
			<ul className="money__info">
				<li className="info__list">
					<h6>이번 달 지출</h6>
					<p>{monthlyBudget.totalOutgo.toLocaleString()}원</p>
				</li>
				<li className="info__list">
					<h6>이번 달 수입</h6>
					<p>{monthlyIncome.monthlyIncome.toLocaleString()}원</p>
				</li>
				<li className="info__list">
					<h6>예산</h6>
					<p>{monthlyBudget.budget.toLocaleString()}원</p>
				</li>
			</ul>
			<GraphContainer>
				<StatList>
					<h3>{`${monthlyBudget.dayRemain}월 예산`}</h3>
					<h4>{monthlyBudget.budget.toLocaleString()}원</h4>
					<hr />
					<BarChartContainer
						width={`${Math.floor(
							(monthlyBudget?.totalOutgo / monthlyBudget?.budget) * 100,
						)}`}
					>
						<div className="legends">
							<div className="legend__square"></div>
							<p>예산</p>
							<div className="legend__square"></div>
							<p>지출</p>
						</div>
						<div className="bar">
							<div className="bar__item">
								{Math.floor(
									(monthlyBudget?.totalOutgo / monthlyBudget?.budget) * 100,
								) > 10 ? (
									<span className="bar__percent">
										{`${Math.floor(
											(monthlyBudget?.totalOutgo / monthlyBudget?.budget) * 100,
										)}`}
										%
									</span>
								) : null}
							</div>
							<span className="bar__outgo">
								{monthlyBudget?.totalOutgo.toLocaleString()}원
							</span>
						</div>
					</BarChartContainer>
					<hr className="bottom__hr" />
					<div className="list__bottom">
						<div className="color__info">
							<div className="circle"></div>
							<p>남은 예산</p>
							<p>
								{(
									monthlyBudget.budget - monthlyBudget.totalOutgo
								).toLocaleString()}
								원
							</p>
						</div>
						<div className="color__info">
							<div className="circle"></div>
							<p>하루 예산</p>
							<p>{Math.floor(monthlyBudget.budget / 30).toLocaleString()}원</p>
						</div>
					</div>
				</StatList>
				<BarContainer>
					<h4>지난달 예산 및 결과</h4>
					<ul className="bar">
						<li className="bar__li">
							<div></div>
							<p>500,000원</p>
							<p>12월 예산</p>
						</li>
						<li className="bar__li__outgo">
							<div></div>
							<p>350,000원</p>
							<p>1월 지출</p>
						</li>
					</ul>
				</BarContainer>
			</GraphContainer>
		</Container>
	);
};

export default Budget;

const Container = styled.div`
	padding: 4rem 6rem;

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;

		h3 {
			font-size: 2rem;
		}

		button {
			display: flex;
			gap: 0.5rem;
			padding: 0.8rem 1.2rem;
			border-radius: 4px;
			background: ${(props) => props.theme.COLORS.LIGHT_BLUE};
			color: white;
		}
	}

	.subtitle {
		color: #7c7c7c;
		font-size: 1.4rem;
	}

	.money__info {
		width: 78.5rem;
		display: flex;
		margin-top: 4rem;
		border: 1px solid #e4e4e4;
		border-right: none;
		border-radius: 4px;

		.info__list {
			white-space: nowrap;
			padding: 2.5rem;
			padding-right: 15rem;
			border-right: 1px solid #e4e4e4;

			h6 {
				font-size: 1.2rem;
				font-weight: 400;
				color: #1e1e1e;
				margin-bottom: 1.5rem;
			}

			p {
				font-size: 1.8rem;
				font-weight: 600;
				color: #464656;
			}
		}
	}
`;

const GraphContainer = styled.div`
	width: 100%;
	display: flex;
	gap: 2rem;
	margin-top: 3.5rem;

	.budget {
		border: 1px solid #e4e4e4;
		border-radius: 4px;
		padding: 1.5rem;

		h5 {
			font-size: 1.4rem;
			font-weight: 300;
			color: #1e1e1e;
			margin-bottom: 1.5rem;
		}

		.budget__money {
			font-size: 2rem;
			font-weight: 600;
			color: #464656;
		}
	}
`;

const StatList = styled.li`
	border: 1px solid #e4e4e4;
	box-shadow: 0px 2px 10px rgb(0, 0, 0, 10%);
	border-radius: 6px;
	width: 45rem;
	height: 22.5rem;

	h3 {
		font-size: 1.3rem;
		margin-left: 1.8rem;
		margin-top: 1.3rem;
		color: ${(props) => props.theme.COLORS.GRAY_600};
	}

	h4 {
		font-size: 1.8rem;
		margin-left: 1.8rem;
		margin-top: 1rem;
	}

	hr {
		border: 1px solid #f2f2f2;
	}

	.bottom__hr {
		margin: 1rem 2rem;
		margin-top: 4rem;
	}

	.PieChartContainer {
		width: 250px;
		height: 100px; /* 파이차트 컨테이너의 높이 설정 */
	}

	.list__bottom {
		margin-top: 1.5rem;
		display: flex;
		align-items: center;
		padding: 0 2rem;
		white-space: nowrap;

		.color__info {
			display: flex;
			align-items: center;

			p {
				font-size: 1.1rem;
				margin-right: 4rem;
				color: #444444;

				&:nth-child(3) {
					font-size: 1.2rem;
					font-weight: 600;
					margin-right: 5.5rem;
				}
			}
		}

		.circle {
			margin-right: 0.8rem;
			width: 9px;
			height: 9px;
			background: #c1c1c1;
			border-radius: 50%;
		}
	}
`;

const BarChartContainer = styled.div<{ width: string }>`
	display: flex;
	flex-direction: column;
	padding: 0.3rem 2rem;

	.legends {
		display: flex;
		margin-top: 0.5rem;
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
		height: 26px;
		background: #d9d9d9;

		.bar__item {
			display: flex;
			align-items: center;
			justify-content: center; /* 수정된 부분 */

			background: #1bbf83;
			border-radius: ${(props) =>
				Number(props.width) < 100 ? "4px 0 0 4px" : "4px"};
			width: ${(props) => (Number(props.width) > 100 ? 100 : props.width)}%;
			height: 26px;
		}

		.bar__percent {
			color: white;
			font-size: 1.2rem;
			font-weight: 500;
		}

		.bar__outgo {
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

const BarContainer = styled.div`
	width: 34rem;
	box-shadow: 0px 2px 10px rgb(0, 0, 0, 10%);
	border: 1px solid #e4e4e4;
	padding: 2rem;
	border-radius: 4px;

	h4 {
		color: #69696a;
		font-size: 1.4rem;
	}

	.bar {
		/* 기타 스타일 속성들 */
		display: flex;
		justify-content: center;
		gap: 7rem;
		height: 14rem;
		margin-top: 2rem;
		padding: 0 2rem;
	}

	@keyframes fade-in {
		0% {
			opacity: 0;
			transform: translateY(20px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.bar__li {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;

		div {
			opacity: 0;
			animation: fade-in 0.5s ease-in-out forwards;
			border-radius: 4px;
			width: 25px;
			height: 100%;
			background: #bfbbbb;
			margin-bottom: 1rem;
		}

		p {
			font-size: 1.4rem;
			font-weight: 600;

			color: #444444;

			&:nth-child(3) {
				font-size: 1.2rem;
				font-weight: 400;
				margin-top: 0.7rem;
			}
		}
	}

	.bar__li__outgo {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		justify-content: end;
		align-items: center;

		div {
			border-radius: 4px;
			width: 25px;
			height: 70px;

			background: ${(props) => props.theme.COLORS.LIGHT_GREEN};
			margin-bottom: 1rem;
		}

		p {
			font-size: 1.4rem;
			font-weight: 600;

			color: #444444;

			&:nth-child(3) {
				font-size: 1.2rem;
				font-weight: 400;
				margin-top: 0.7rem;
			}
		}
	}
`;
