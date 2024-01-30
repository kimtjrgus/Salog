import { styled } from "styled-components";
import { SvgIcon } from "@mui/material";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import { useCallback, useEffect, useState } from "react";
import { api } from "src/utils/refreshToken";
import moment from "moment";
import { debounce } from "src/utils/timeFunc";
import { type budgetType } from ".";
import { useDispatch } from "react-redux";
import { showToast } from "src/store/slices/toastSlice";

interface propsType {
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	monthlyBudget: budgetType;
	setMonthlyBudget: React.Dispatch<React.SetStateAction<budgetType>>;
}

const Modal = ({ setIsOpen, monthlyBudget, setMonthlyBudget }: propsType) => {
	const [budget, setBudget] = useState<string>("");
	const [isDisabled, setIsDisabled] = useState<boolean>(true);

	const dispatch = useDispatch();

	const onChangeNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value;
		if (inputValue.startsWith("0")) {
			setBudget(inputValue.substring(1));
		} else if (inputValue === "") {
			setBudget("0");
		} else {
			setBudget(inputValue);
		}
	};

	const checkValues = useCallback(
		debounce((budget: string) => {
			let isBlank = false;
			let isNotValid = true;

			// 빈 값 체크
			if (budget === "" || budget === "0") isBlank = true;

			if (!isBlank) {
				isNotValid = false;
			}

			setIsDisabled(isNotValid);
		}, 700),
		[],
	);

	const onClickSubmitBtn = () => {
		monthlyBudget.budget === 0
			? api
					.post(`/monthlyBudget/post`, {
						date: moment().format("YYYY-MM-DD"),
						budget: Number(budget),
					})
					.then(() => {
						api
							.get(`/monthlyBudget?date=${moment().format("YYYY-MM")}`)
							.then((res) => {
								setMonthlyBudget(res.data);
							})
							.catch((error) => {
								console.error(error);
							});
						dispatch(
							showToast({
								message: "작성이 완료되었습니다",
								type: "success",
							}),
						);
						setIsOpen(false);
					})
					.catch((error) => {
						console.log(error);
					})
			: api
					.patch(`/monthlyBudget/update/1`, {
						date: moment().format("YYYY-MM-DD"),
						budget: Number(budget),
					})
					.then(() => {
						api
							.get(`/monthlyBudget?date=${moment().format("YYYY-MM")}`)
							.then((res) => {
								setMonthlyBudget(res.data);
							})
							.catch((error) => {
								console.error(error);
							});
						dispatch(
							showToast({
								message: "수정이 완료되었습니다",
								type: "success",
							}),
						);
						setIsOpen(false);
					})
					.catch((error) => {
						console.log(error);
					});
	};

	useEffect(() => {
		checkValues(budget);
	}, [budget]);

	return (
		<Container>
			<div className="msg-box">
				<div className="msg-header">
					<h5>1월 예산 설정</h5>
					<SvgIcon
						component={ClearOutlinedIcon}
						onClick={() => {
							setIsOpen(false);
						}}
						sx={{ stroke: "#ffffff", strokeWidth: 0.5 }}
					/>
				</div>
				<p className="box-p">
					예산을 설정하여 지출을 더욱 효울적으로 관리해보세요!
				</p>
				<p className="input-p">금액</p>
				<input
					className="input-number"
					type="number"
					value={budget}
					placeholder={
						monthlyBudget.budget !== 0 ? `${monthlyBudget.budget}` : "0"
					}
					onChange={(e) => {
						onChangeNumber(e);
					}}
				/>
				<button onClick={onClickSubmitBtn} disabled={isDisabled}>
					예산 등록하기
				</button>
			</div>
		</Container>
	);
};

export default Modal;

const Container = styled.div`
	display: flex;
	width: 100%;
	height: 100vh;
	background-color: rgba(0, 0, 0, 0.3);
	justify-content: center;
	align-items: center;
	position: fixed;
	top: 0;
	left: 0;
	z-index: 99;

	.msg-box {
		width: 43rem;
		height: 30rem;
		background-color: ${(props) => props.theme.COLORS.WHITE};
		border-radius: 1.5rem;
		display: flex;
		flex-direction: column;
		padding: 3rem;

		.msg-header {
			width: 100%;
			display: flex;
			justify-content: space-between;

			h5 {
				font-size: 2.2rem;
				font-weight: 700;
			}

			svg {
				cursor: pointer;
				font-size: 2.4rem;
				color: rgb(198, 198, 208);
			}
		}

		.box-p {
			font-size: 1.3rem;
			color: rgb(144, 144, 160);
			margin-top: 1.5rem;
		}

		.input-p {
			font-size: 1.3rem;
			color: rgb(98, 98, 115);
			margin-top: 1.5rem;
		}

		.input-number {
			margin-top: 1rem;
			height: 3.5rem;
			font-size: 1.2rem;
			color: rgb(98, 98, 115);
			padding-left: 0.5rem;
			border-radius: 4px;
			border: 1px solid ${(props) => props.theme.COLORS.GRAY_300};
		}

		input::-webkit-outer-spin-button,
		input::-webkit-inner-spin-button {
			-webkit-appearance: none;
			margin: 0;
		}

		input::placeholder {
			opacity: 0.6;
		}

		button {
			margin-top: 7.5rem;
			background: ${(props) => props.theme.COLORS.LIGHT_BLUE};
			width: 100%;
			padding: 1.2rem;
			border-radius: 4px;
			color: white;

			&:disabled {
				opacity: 0.4;
				pointer-events: none;
			}
		}

		.msg-title {
			font-size: 2rem;
			color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
			font-weight: 600;
			margin-bottom: 2rem;
			white-space: pre-line;
			text-align: center;
			line-height: 1.5em;
		}

		.msg-body {
			font-size: 1.6rem;
			color: ${(props) => props.theme.COLORS.GRAY_500};
			font-weight: 600;
			margin-bottom: 3rem;
			white-space: pre-line;
			text-align: center;
			line-height: 1.5em;
		}
	}
`;
