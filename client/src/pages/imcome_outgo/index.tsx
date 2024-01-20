import { css, styled } from "styled-components";
import moment from "moment";
import { useEffect, useState } from "react";
import { SvgIcon } from "@mui/material";
import ArrowBackIosOutlinedIcon from "@mui/icons-material/ArrowBackIosOutlined";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import axios from "axios";
import { NavLink, useLocation } from "react-router-dom";
import HistoryList from "./History";
import IncomeList from "./IncomeList";
import WasteList from "./WasteList";
import OutgoList from "./OutgoList";
import LedgerWrite from "./LedgerWrite";

export interface outgoType {
	id: number;
	date: string;
	outgoName: string;
	money: number;
	memo: string;
	outgoTag: string;
	wasteList: boolean;
	payment: string;
	reciptImg: string;
}

export interface incomeType {
	id: number;
	incomeTag: string;
	date: string;
	money: number;
	income_name: string;
	memo: string;
}

export interface wasteType {
	id: number;
	date: string;
	money: number;
	outgoName: string;
	memo: string;
	outgoTag: string;
	wasteList: boolean;
	reciptImg: string;
}

interface sumOutgoType {
	month: number;
	monthlyOutgo: number;
	tags: tagType[];
}

interface sumIncomeType {
	month: number;
	monthlyIncome: number;
	tags: tagType[];
}

interface sumWasteType {
	month: number;
	monthlyWaste: number;
	tags: tagType[];
}

interface tagType {
	tagName: string;
	tagSum: number;
}

export interface checkedType {
	income: number[];
	outgo: number[];
	waste: number[];
}

const History = () => {
	const [getMoment, setMoment] = useState(moment());
	const [outgo, setOutgo] = useState<outgoType[]>([]);
	const [income, setIncome] = useState<incomeType[]>([]);
	const [waste, setWaste] = useState<wasteType[]>([]);
	const [sumOutgo, setSumOutgo] = useState<sumOutgoType>({
		month: 0,
		monthlyOutgo: 0,
		tags: [],
	});
	const [sumIncome, setSumIncome] = useState<sumIncomeType>({
		month: 0,
		monthlyIncome: 0,
		tags: [],
	});
	const [sumWasteList, setSumWasteList] = useState<sumWasteType>({
		month: 0,
		monthlyWaste: 0,
		tags: [],
	});

	const [isOpen, setIsOpen] = useState<boolean>(false);

	// 체크박스 상태
	const [isAllChecked, setIsAllChecked] = useState(false);

	const [checkedList, setCheckedList] = useState<checkedType>({
		income: [],
		outgo: [],
		waste: [],
	});
	const [isChecked, setIsChecked] = useState(false);

	const location = useLocation();

	console.log(checkedList, isAllChecked);

	const checkedItemHandler = (
		id: number,
		isChecked: boolean,
		division: keyof checkedType,
	) => {
		setCheckedList((prev) => {
			const updatedList = { ...prev };
			if (isChecked) {
				updatedList[division] = [...updatedList[division], id];
			} else {
				updatedList[division] = updatedList[division].filter(
					(item) => item !== id,
				);
			}

			// 전체 체크 여부 판단
			const isAllIncomeChecked =
				location.pathname === "/outgo" || location.pathname === "/history"
					? updatedList.outgo.length === outgo.length &&
					  updatedList.outgo.length > 0
					: true;
			const isAllOutgoChecked =
				location.pathname === "/income" || location.pathname === "/history"
					? updatedList.income.length === income.length &&
					  updatedList.income.length > 0
					: true;
			const isAllWasteChecked =
				location.pathname === "/waste"
					? updatedList.waste.length === waste.length &&
					  updatedList.waste.length > 0
					: true;

			setIsAllChecked(
				isAllIncomeChecked && isAllOutgoChecked && isAllWasteChecked,
			);

			return updatedList;
		});
	};

	const checkHandler = (
		e: React.ChangeEvent<HTMLInputElement>,
		id: number,
		division: keyof checkedType,
	) => {
		setIsChecked(!isChecked);
		checkedItemHandler(id, e.target.checked, division);
	};

	const handleAllChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { checked } = e.target;

		setIsAllChecked(checked); // isAllChecked 값을 true로 설정

		if (checked) {
			// setIsAllChecked(true); // isAllChecked 값을 true로 설정
			if (location.pathname === "/history") {
				outgo.forEach((el) => {
					setCheckedList((prev) => {
						const updatedList = { ...prev };
						updatedList.outgo = [...updatedList.outgo, el.id];
						return updatedList; // 업데이트된 상태 반환
					});
				});
				income.forEach((el) => {
					setCheckedList((prev) => {
						const updatedList = { ...prev };
						updatedList.income = [...updatedList.income, el.id];
						return updatedList; // 업데이트된 상태 반환
					});
				});
			} else if (location.pathname === "/outgo") {
				outgo.forEach((el) => {
					setCheckedList((prev) => {
						const updatedList = { ...prev };
						updatedList.outgo = [...updatedList.outgo, el.id];
						return updatedList; // 업데이트된 상태 반환
					});
				});
			} else if (location.pathname === "/waste") {
				outgo.forEach((el) => {
					setCheckedList((prev) => {
						const updatedList = { ...prev };
						updatedList.waste = [...updatedList.waste, el.id];
						return updatedList; // 업데이트된 상태 반환
					});
				});
			} else {
				income.forEach((el) => {
					setCheckedList((prev) => {
						const updatedList = { ...prev };
						updatedList.income = [...updatedList.income, el.id];
						return updatedList; // 업데이트된 상태 반환
					});
				});
			}
		} else {
			// setIsAllChecked(false); // isAllChecked 값을 false로 설정
			setCheckedList({
				income: [],
				outgo: [],
				waste: [],
			});
		}
	};

	useEffect(() => {
		axios
			.get("http://localhost:8000/outgo")
			.then((res) => {
				setOutgo(res.data);
			})
			.catch((error) => {
				console.log(error);
			});
		axios
			.get("http://localhost:8000/income")
			.then((res) => {
				setIncome(res.data);
			})
			.catch((error) => {
				console.log(error);
			});
		axios
			.get("http://localhost:8000/wasteList")
			.then((res) => {
				setWaste(res.data);
			})
			.catch((error) => {
				console.log(error);
			});
		axios
			.get("http://localhost:8000/monthlyOutgo")
			.then((res) => {
				setSumOutgo(res.data[0]);
			})
			.catch((error) => {
				console.log(error);
			});
		axios
			.get("http://localhost:8000/monthlyIncome")
			.then((res) => {
				setSumIncome(res.data[0]);
			})
			.catch((error) => {
				console.log(error);
			});
		axios
			.get("http://localhost:8000/monthlyWasteList")
			.then((res) => {
				setSumWasteList(res.data[0]);
			})
			.catch((error) => {
				console.log(error);
			});
	}, [getMoment]);

	useEffect(() => {
		setCheckedList({
			income: [],
			outgo: [],
			waste: [],
		});
		setIsAllChecked(false);
	}, [location.pathname]);

	return (
		<>
			<Container>
				<h3>가계부 내역</h3>
				<SubHeader>
					<div className="sub__left">
						<div className="date__div">
							<button
								onClick={() => {
									setMoment(getMoment.clone().subtract(1, "month"));
								}}
							>
								<SvgIcon
									component={ArrowBackIosOutlinedIcon}
									sx={{ stroke: "#ffffff", strokeWidth: 0.3 }}
								/>
							</button>
							<div>{getMoment.format("YYYY-MM")}</div>
							<button
								onClick={() => {
									setMoment(getMoment.clone().add(1, "month"));
								}}
							>
								<SvgIcon
									component={ArrowForwardIosOutlinedIcon}
									sx={{ stroke: "#ffffff", strokeWidth: 0.3 }}
								/>
							</button>
						</div>
						<button
							className="nowMonth__btn"
							onClick={() => {
								setMoment(moment());
							}}
						>
							이번 달
						</button>
					</div>
					<div className="sub__right">
						<button
							className="write__btn"
							onClick={() => {
								setIsOpen(true);
							}}
						>
							<SvgIcon
								component={CreateOutlinedIcon}
								sx={{ stroke: "#ffffff", strokeWidth: 0.3 }}
							/>
							<p>가계부 작성하기</p>
						</button>
					</div>
				</SubHeader>
				<MainLists>
					<div className="lists__header">
						<NavStyle to="/history" $isActive={"/history"}>
							<p>{`전체 (${income.length + outgo.length})`}</p>
							<p className="sum__red">
								{(
									sumIncome.monthlyIncome - sumOutgo.monthlyOutgo
								).toLocaleString()}{" "}
								원
							</p>
						</NavStyle>
						<NavStyle to="/income" $isActive={"/income"}>
							<p>{`수입 (${income.length})`}</p>
							<p className="sum__blue">
								{sumIncome.monthlyIncome.toLocaleString()} 원
							</p>
						</NavStyle>
						<NavStyle to="/outgo" $isActive={"/outgo"}>
							<p>{`지출 (${outgo.length})`}</p>
							<p className="sum__red">
								{sumOutgo.monthlyOutgo.toLocaleString()} 원
							</p>
						</NavStyle>
						<NavStyle to="/waste" $isActive={"/waste"}>
							<p>{`낭비 리스트 (${waste.length})`}</p>
							<p className="sum__green">
								{sumWasteList.monthlyWaste.toLocaleString()} 원
							</p>
						</NavStyle>
					</div>
					<div className="category__header">
						<input
							type="checkbox"
							checked={isAllChecked}
							onChange={handleAllChecked}
						/>
						<p>분류</p>
						<p>날짜</p>
						<p>카테고리</p>
						<p>거래처</p>
						<p>결제수단</p>
						<p>금액</p>
						<p>메모</p>
						<p>영수증</p>
					</div>
					{/* 경로에 따라 다른 컴포넌트를 보여줘야함  */}
					{location.pathname === "/history" && (
						<HistoryList
							outgo={outgo}
							income={income}
							checkedList={checkedList}
							checkHandler={checkHandler}
						/>
					)}
					{location.pathname === "/income" && (
						<IncomeList
							income={income}
							checkedList={checkedList}
							checkHandler={checkHandler}
						/>
					)}
					{location.pathname === "/outgo" && (
						<OutgoList
							outgo={outgo}
							checkedList={checkedList}
							checkHandler={checkHandler}
						/>
					)}
					{location.pathname === "/waste" && (
						<WasteList
							waste={waste}
							checkedList={checkedList}
							checkHandler={checkHandler}
						/>
					)}
				</MainLists>
			</Container>
			{isOpen && <LedgerWrite setIsOpen={setIsOpen} />}
		</>
	);
};

export default History;

const Container = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;
	padding: 3rem 4rem;

	h3 {
		font-size: 2.2rem;
	}
`;

const SubHeader = styled.div`
	margin-top: 3rem;
	display: flex;
	justify-content: space-between;

	.sub__left {
		display: flex;
		gap: 2rem;
	}

	.date__div {
		display: flex;

		button {
			border: 1px solid #bebebe;
			padding: 0.6rem;
			color: #464656;

			&:first-child {
				border-radius: 8px 0px 0px 8px;
			}
			&:last-child {
				border-radius: 0px 8px 8px 0px;
			}
		}

		div {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 10rem;
			border-top: 1px solid #bebebe;
			border-bottom: 1px solid #bebebe;
			padding: 0.6rem;
			font-size: 1.6rem;
			font-weight: 600;
			color: #464656;
		}
	}

	.nowMonth__btn {
		border: 1px solid #bebebe;
		padding: 0.6rem 1.1rem;
		border-radius: 8px;
		font-weight: 500;
	}

	.write__btn {
		display: flex;
		gap: 5px;
		padding: 0.8rem 1rem;
		border-radius: 4px;
		color: white;
		background: ${(props) => props.theme.COLORS.LIGHT_BLUE};
	}
`;

const MainLists = styled.div`
	width: 100%;
	margin-top: 2.5rem;

	.category__header {
		width: 100%;
		border: 1px solid #c7c7c7;
		border-top: none;
		padding: 0.8rem;
		display: flex;
		align-items: center;
		gap: 4rem;

		input {
			cursor: pointer;
			width: 1.6rem;
			height: 1.6rem;
			margin-left: 1.5rem;
			margin-right: -0.5rem;
		}

		p {
			font-size: 1.2rem;
			white-space: nowrap;

			&:nth-child(2) {
				width: 4rem;
			}

			&:nth-child(3) {
				width: 8.2rem;
			}

			&:nth-child(5) {
				width: 10rem;
			}

			&:nth-child(7) {
				width: 6rem;
			}

			&:nth-child(8) {
				width: 15rem;
			}
		}
	}

	.lists__header {
		border-radius: 12px 12px 0px 0px;
		display: flex;
		border: 1px solid #c7c7c7;
	}

	.sum__red {
		color: ${(props) => props.theme.COLORS.LIGHT_RED};
	}

	.sum__blue {
		color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
	}

	.sum__green {
		color: ${(props) => props.theme.COLORS.LIGHT_GREEN};
	}
`;

const NavStyle = styled(NavLink)<{ $isActive: string }>`
	text-align: center;
	flex-grow: 1;
	padding: 1rem;

	p:first-child {
		font-size: 1.2rem;
		color: #9d9d9d;
		margin-bottom: 0.5rem;
	}

	p:last-child {
		font-weight: 600;
	}

	${(props) =>
		props.$isActive === "/history" || props.$isActive === "/outgo"
			? css`
					&.active {
						border-bottom: 2px solid ${(props) => props.theme.COLORS.LIGHT_RED};
					}
			  `
			: props.$isActive === "/income"
			  ? css`
						&.active {
							border-bottom: 2px solid
								${(props) => props.theme.COLORS.LIGHT_BLUE};
						}
			    `
			  : css`
						&.active {
							border-bottom: 2px solid
								${(props) => props.theme.COLORS.LIGHT_GREEN};
						}
			    `}
`;
