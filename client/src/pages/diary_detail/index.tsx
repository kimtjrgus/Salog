import { styled } from "styled-components";
import { SvgIcon } from "@mui/material";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import dateAsKor from "src/utils/dateAsKor";
import ReactQuill from "react-quill";
import { QuillContainer } from "../diary_write/textEditor";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

interface detailType {
	id: number;
	date: string;
	title: string;
	body: string;
	img: string;
	diaryTag: string[];
	// 가계부 관련 타입도 추가 예정
}

const DiaryDetail = () => {
	const [diary, setDiary] = useState<detailType | null>(null);

	const id = useParams().id;
	const navigate = useNavigate();

	const onClickBackBtn = () => {
		navigate("/diary");
	};

	useEffect(() => {
		axios
			.get(`http://localhost:8000/diary/${id}`)
			.then((res) => {
				setDiary(res.data);
			})
			.catch((error) => {
				console.log(error);
			});
	}, []);

	return (
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
						{diary?.diaryTag.map((tag, idx) => (
							<span key={idx}>
								{diary?.diaryTag.length - 1 !== idx ? `${tag}, ` : `${tag}`}
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
				</div>
				<hr />
				<Quill>
					<ReactQuill theme="snow" value={diary?.body} readOnly={true} />
				</Quill>
			</DetailContainer>
			<BookContainer>안녕</BookContainer>
		</Container>
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
		gap: 5rem;
		justify-content: center;
		margin-top: 2.3rem;
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
