import { styled } from "styled-components";
import { SvgIcon } from "@mui/material";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import dateAsKor from "src/utils/dateAsKor";
import ReactQuill from "react-quill";
import { QuillContainer } from "../diary_write/TextEditor";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "src/utils/refreshToken";
import Modal from "src/components/Layout/Modal";

interface detailType {
	diaryId: number;
	date: string;
	title: string;
	body: string;
	img: string;
	tagList: TagList[];
	// 가계부 관련 타입도 추가 예정
}

interface TagList {
	diaryTagId: number;
	tagName: string;
}

const DiaryDetail = () => {
	const [diary, setDiary] = useState<detailType | null>(null);
	const [isOpen, setIsOpen] = useState<boolean>(false);

	const id = useParams().id;
	const navigate = useNavigate();

	const onClickBackBtn = () => {
		navigate("/diary");
	};

	const onClickUpdateBtn = () => {
		navigate(`/diary/${id}/update`);
	};

	const onClickDeleteBtn = () => {
		setIsOpen(true);
	};

	const onClickCloseBtn = () => {
		api
			.delete(`/diary/${id}/delete`)
			.then(() => {
				navigate("/diary");
			})
			.catch((error) => {
				console.log(error);
			});
	};

	useEffect(() => {
		api
			.get(`/diary/${id}`)
			.then((res) => {
				setDiary(res.data.data);
			})
			.catch((error) => {
				console.log(error);
			});
	}, []);

	return (
		<>
			<Container>
				<DetailContainer>
					<div className="go_back" onClick={onClickBackBtn}>
						<SvgIcon
							component={ChevronLeftOutlinedIcon}
							sx={{ stroke: "#ffffff", strokeWidth: 1 }}
						/>
						<p>일기 조회로 돌아가기</p>
					</div>
					<h2>{diary?.title}</h2>
					<div className="diary_header">
						<div className="diary_subtitle">
							<SvgIcon
								component={CategoryOutlinedIcon}
								sx={{ stroke: "#ffffff", strokeWidth: 1 }}
							/>
							{diary?.tagList.map((tag, idx) => (
								<span key={tag.diaryTagId}>
									{diary?.tagList.length - 1 !== idx
										? `${tag.tagName},`
										: `${tag.tagName} `}
								</span>
							))}
						</div>
						<div className="diary_subtitle">
							<SvgIcon
								component={ScheduleOutlinedIcon}
								sx={{ stroke: "#ffffff", strokeWidth: 0.5 }}
							/>
							<span>
								{diary?.date !== undefined ? dateAsKor(diary?.date) : null}
							</span>
						</div>
						<div className="update_delete">
							<span onClick={onClickUpdateBtn}>수정</span>
							<span onClick={onClickDeleteBtn}>삭제</span>
						</div>
					</div>
					<hr />
					<Quill>
						<ReactQuill theme="snow" value={diary?.body} readOnly={true} />
					</Quill>
				</DetailContainer>
				<BookContainer>1</BookContainer>
			</Container>
			<Modal
				state={isOpen}
				setState={setIsOpen}
				msgTitle="작성한 글을 삭제하시겠습니까?"
				msgBody="삭제한 글은 복구할 수 없습니다."
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
	overflow: scroll;

	&::-webkit-scrollbar {
		width: 8px;
	}

	&::-webkit-scrollbar-thumb {
		height: 50%; /* 스크롤바의 길이 */
	}
`;

const DetailContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 70%;

	.go_back {
		width: 20%;
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
		cursor: pointer;

		svg {
			font-size: 2.4rem;
			transition: all 0.5s;
		}

		p {
			font-size: 1.4rem;
			align-self: center;
			transition: all 0.5s;
			white-space: nowrap;
		}

		&:hover {
			svg,
			p {
				transform: scale(1.03);
			}
		}
	}

	h2 {
		text-align: center;
		margin-top: 2.5rem;
		font-size: 2rem;
	}

	.diary_header {
		display: flex;
		position: relative;
		gap: 5rem;
		justify-content: center;
		margin-top: 3rem;
	}

	.diary_subtitle {
		display: flex;

		svg {
			font-size: 1.8rem;
			margin-right: 0.5rem;
		}

		span {
			align-self: center;
			font-size: 1.4rem;
			margin-right: 0.3rem;
		}
	}

	.update_delete {
		position: absolute;
		right: 0;
		span {
			margin-right: 1rem;
			color: ${(props) => props.theme.COLORS.GRAY_500};
			font-size: 1.4rem;
			cursor: pointer;

			&:hover {
				text-decoration: underline;
			}
		}
	}

	hr {
		margin-top: 3rem;
		margin-bottom: 3rem;
		border: none;
		width: 100%;
		height: 1px;
		background-color: ${(props) => props.theme.COLORS.GRAY_300};
	}
`;

const Quill = styled(QuillContainer)`
	.ql-toolbar {
		display: none;
	}
`;

const BookContainer = styled.div`
	width: 30%;
	height: 50vh;
	margin-top: 5rem;
`;

export default DiaryDetail;
