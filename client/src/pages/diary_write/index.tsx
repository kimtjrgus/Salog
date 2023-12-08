import React, { useState } from "react";
import { SvgIcon } from "@mui/material";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import dateAsKor from "src/utils/dateAsKor";
import { styled } from "styled-components";
import { Input } from "../login";
import Reactquill from "./textEditor";

export interface valuesType {
	title: string;
	body: string;
}

const DiaryWrite = () => {
	const [values, setValues] = useState<valuesType>({ title: "", body: "" });
	const [categories, setCategories] = useState<string[]>([]);
	const [category, setCategory] = useState<string>("");

	const onChangeValues = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setValues({ ...values, [name]: value });
	};

	const onChangeBody = (value: string) => {
		setValues({ ...values, body: value });
	};

	const onChangeCategory = (e: React.ChangeEvent<HTMLInputElement>) => {
		setCategory(e.target.value);
	};

	const onKeyUpEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const inputElement = e.target as HTMLInputElement;
		if (inputElement.value.trim() !== "" && inputElement.value !== ",") {
			if (e.key === ",") {
				setCategories([
					...categories,
					inputElement.value.slice(0, inputElement.value.length - 1).trim(),
				]);
				setCategory("");
			}
			if (e.key === "Enter") {
				setCategories([...categories, inputElement.value.trim()]);
				setCategory("");
			}
		}
	};

	const onKeyDownEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const inputElement = e.target as HTMLInputElement;
		if (e.key === "Backspace" && inputElement.value === "") {
			setCategories([...categories.slice(0, categories.length - 1)]);
		}
	};

	const onClickTagBtn = (idx: number) => {
		setCategories([...categories.slice(0, idx), ...categories.slice(idx + 1)]);
	};

	const nowDate = dateAsKor(new Date().toDateString());
	return (
		<Container>
			<WriteContainer>
				<div className="header">
					<h3>{nowDate}</h3>
					<div className="header_btn">
						<button>작성 취소</button>
						<button>작성 완료</button>
					</div>
				</div>
				<h4>제목</h4>
				<Input
					placeholder="제목을 입력하세요."
					type="text"
					name="title"
					onChange={onChangeValues}
				/>
				<h4>카테고리</h4>
				<CategoryList>
					{categories.map((category: string, idx: number) => {
						return (
							// key는 서버 연동 후 id가 생기면 변경 예정
							<div key={Math.floor(Math.random() * 1000000000000000)}>
								<p>{category}</p>
								<button
									onClick={() => {
										onClickTagBtn(idx);
									}}
								>
									<SvgIcon
										component={ClearOutlinedIcon}
										sx={{ stroke: "#ffffff", strokeWidth: 0.7 }}
									/>
								</button>
							</div>
						);
					})}
					<Input
						placeholder={"카테고리를 입력하세요."}
						onChange={onChangeCategory}
						onKeyUp={onKeyUpEvent}
						onKeyDown={onKeyDownEvent}
						value={category}
					/>
				</CategoryList>
				<h4>내용</h4>
				<Reactquill body={values.body} onChangeBody={onChangeBody} />
			</WriteContainer>
		</Container>
	);
};

const Container = styled.div`
	display: flex;
	height: 90vh;
`;

const WriteContainer = styled.div`
	width: 65%;
	min-width: 70rem;
	margin-top: 3rem;
	overflow: scroll;

	&::-webkit-scrollbar {
		display: none;
	}

	.header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 3rem;

		h3 {
			font-size: 2rem;
			color: ${(props) => props.theme.COLORS.GRAY_600};
		}

		.header_btn > button {
			font-size: 1.2rem;
			background-color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
			color: ${(props) => props.theme.COLORS.WHITE};
			border-radius: 0.4rem;
			padding: 0.8rem 3.5rem;
			&:first-child {
				background-color: ${(props) => props.theme.COLORS.GRAY_300};
				color: ${(props) => props.theme.COLORS.GRAY_600};
				margin-right: 1.5rem;
			}
		}
	}

	h4 {
		font-size: 1.6rem;
		color: ${(props) => props.theme.COLORS.GRAY_600};
		margin-bottom: 1.5rem;
		margin-top: 1.5rem;
	}

	input {
		border-radius: 0.2rem;
		height: 3.6rem;
	}
`;

const CategoryList = styled.div`
	display: flex;
	flex-wrap: wrap;
	margin-bottom: 1.5rem;
	padding: 0.4rem 0.7rem;
	border: 1px solid ${(props) => props.theme.COLORS.GRAY_400};

	div {
		display: inline-flex;
		align-items: center;
		border-radius: 1.5rem;
		white-space: nowrap;
		border: none;
		height: 2.5rem;
		margin-right: 0.4rem;
		padding: 0 0.8rem;
		background-color: ${(props) => props.theme.COLORS.GRAY_200};
		/* transition: all 0.125s ease-in 0s;
		@keyframes mount {
			0% {
				opacity: 0.7;
				transform: scale3d(0.8, 0.8, 1);
			}

			100% {
				opacity: 1;
				transform: scale3d(1, 1, 1);
			}
		}
		animation: 0.125s ease-in-out 0s 1 normal forwards running mount; */

		p {
			color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
			font-size: 1.2rem;
			font-weight: 500;
		}

		button {
			margin-left: 0.3rem;

			svg {
				position: relative;
				font-size: 1.2rem;
				top: 0.15rem;
			}
		}
	}

	input {
		padding: 0.3rem;
		border-radius: 0.2rem;
		max-width: 14rem;
		height: 2.6rem;
		border: none;
	}
`;

export default DiaryWrite;
