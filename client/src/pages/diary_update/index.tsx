import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "src/components/Layout/Modal";
import Toast, { ToastType } from "src/components/Layout/Toast";
import dateAsKor from "src/utils/dateAsKor";
import { styled } from "styled-components";
import { Input } from "../login";
import ReactQuillComponent from "../diary_write/TextEditor";
import { api } from "src/utils/refreshToken";
import useTokenCheck from "src/hooks/useTokenCheck";
import { type TagList } from "../diary";
export interface valuesType {
	title: string;
	body: string;
}

const DiaryWrite = () => {
	const [values, setValues] = useState<valuesType>({ title: "", body: "" });
	console.log(values);

	const [categories, setCategories] = useState<string[]>([]);

	const [category, setCategory] = useState<string>("");
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [tagModal, setTagModal] = useState<boolean>(false);
	useTokenCheck();

	const id = useParams().id;

	const navigate = useNavigate();

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

	const onFocusInput = () => {
		setTagModal(true);
	};

	const onBlurInput = () => {
		setTagModal(false);
	};

	const onKeyUpEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const inputElement = e.target as HTMLInputElement;

		if (inputElement.value.trim() !== "" && inputElement.value !== ",") {
			if (e.key === ",") {
				if (
					!categories.includes(
						inputElement.value.slice(0, inputElement.value.length - 1),
					)
				) {
					setCategories([
						...categories,
						inputElement.value.slice(0, inputElement.value.length - 1).trim(),
					]);
					setCategory("");
				} else {
					setCategory("");
				}
			}
			if (e.key === "Enter") {
				if (!categories.includes(inputElement.value)) {
					setCategories([...categories, inputElement.value.trim()]);
					setCategory("");
				} else {
					setCategory("");
				}
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

	const onClickCancelBtn = () => {
		setIsOpen((prev) => !prev);
	};

	const onClickCloseBtn = () => {
		navigate(`/diary/${id}`);
	};

	const onClickWriteBtn = () => {
		// 모달창을 띄운 뒤 확인을 누르면
		if (
			values.title.length === 0 &&
			values.body.replace(/(<([^>]+)>)/gi, "").length < 10
		) {
			Toast(ToastType.error, "제목과 내용을 입력해주세요");
		} else if (values.title.length === 0) {
			Toast(ToastType.error, "제목을 입력해주세요");
		} else if (values.body.replace(/(<([^>]+)>)/gi, "").length < 10) {
			Toast(ToastType.error, "내용을 10자 이상 입력해주세요");
		} else {
			api
				.patch(`/diary/update/${id}`, {
					title: values.title,
					body: values.body,
					tagList: categories,
				})
				.then(() => {
					navigate(`/diary/${id}`);
				})
				.catch((error) => {
					console.log(error);
				});
		}
	};

	useEffect(() => {
		api
			.get(`/diary/${id}`)
			.then((res) => {
				setValues({ title: res.data.data.title, body: res.data.data.body });
				const tags: string[] = [];
				res.data.data.tagList.forEach((tagObj: TagList) => {
					tags.push(tagObj.tagName);
				});
				setCategories([...categories, ...tags]);
			})
			.catch((error) => {
				console.log(error);
			});
	}, []);

	const nowDate = dateAsKor(new Date().toDateString());
	return (
		<>
			<Container>
				<WriteContainer>
					<div className="header">
						<h3>{nowDate}</h3>
						<div className="header_btn">
							<button onClick={onClickCancelBtn}>수정 취소</button>
							<button onClick={onClickWriteBtn}>수정 완료</button>
						</div>
					</div>
					<WriteInput
						className="title_input"
						placeholder="제목을 입력하세요."
						type="text"
						name="title"
						value={values.title}
						onChange={onChangeValues}
					/>
					<div className="contour"></div>
					<CategoryList>
						{categories.map((category: string, idx: number) => {
							return (
								// key는 서버 연동 후 id가 생기면 변경 예정
								<div
									key={Math.floor(Math.random() * 1000000000000000)}
									onClick={() => {
										onClickTagBtn(idx);
									}}
								>
									<p>{category}</p>
								</div>
							);
						})}
						<WriteInput
							placeholder={"태그를 입력하세요."}
							onChange={onChangeCategory}
							onFocus={onFocusInput}
							onBlur={onBlurInput}
							onKeyUp={onKeyUpEvent}
							onKeyDown={onKeyDownEvent}
							value={category}
						/>
						<TagModal open={Boolean(tagModal)}>
							{`엔터 혹은 쉼표를 입력하여 태그를 등록할 수 있습니다.\n 등록된
							요소를 클릭하면 삭제됩니다.`}
						</TagModal>
					</CategoryList>
					<ReactQuillComponent body={values.body} onChangeBody={onChangeBody} />
				</WriteContainer>
				<Calculate></Calculate>
			</Container>
			<Modal
				state={isOpen}
				setState={setIsOpen}
				msgTitle="내용 수정을 취소하시겠습니까?"
			>
				<button
					onClick={() => {
						setIsOpen((prev) => !prev);
					}}
				>
					취소
				</button>
				<button onClick={onClickCloseBtn}>확인</button>
			</Modal>
		</>
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
			font-weight: 600;
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

	.title_input {
		font-weight: 600;
		font-size: 2.4rem;
	}

	.contour {
		background: rgb(73, 80, 87);
		height: 4px;
		width: 6rem;
		margin-top: 1.5rem;
		margin-bottom: 1rem;
		border-radius: 1px;
	}

	input {
		border-radius: 0.2rem;
		padding-left: 0;
		height: 3.6rem;
		border: none;
		font-size: 2.2rem;
	}
`;

const WriteInput = styled(Input)`
	border: none !important;
`;

const CategoryList = styled.div`
	position: relative;
	display: flex;
	flex-wrap: wrap;
	margin: 1.5rem 0;
	padding: 0.4rem 0.7rem 0.4rem 0;

	div {
		display: inline-flex;
		align-items: center;
		border-radius: 1.5rem;
		white-space: nowrap;
		border: none;
		height: 2.5rem;
		margin-right: 0.5rem;
		padding: 0.5rem 1rem;
		cursor: pointer;
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
			font-size: 1.4rem;
			font-weight: 500;
		}

		button {
			margin-left: 0.3rem;
		}
	}

	input {
		padding: 0.3rem;
		border-radius: 0.2rem;
		max-width: 17rem;
		height: 2.6rem;
		padding-left: 0;
		font-size: 1.6rem;
	}
`;

const TagModal = styled.span<{ open: boolean }>`
	z-index: 40;
	position: absolute;
	bottom: -5rem;
	width: 31rem;
	padding: 1.3rem;
	font-size: 1.2rem;
	background: #484848;
	color: white;
	font-weight: 400;
	display: ${(props) => (!props.open ? "none" : "block")};
	transition: all 0.125s ease-in 0s;
`;

const Calculate = styled.div`
	width: 35%;
	padding: 2rem;
`;

export default DiaryWrite;
