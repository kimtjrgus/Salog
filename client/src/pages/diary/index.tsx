import { SvgIcon } from "@mui/material";
import { styled } from "styled-components";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import axios from "axios";
import NotData from "../../assets/NotData.png";
import { Input } from "../login";
import Test from "../../assets/Test.jpeg";
import dateAsKor from "src/utils/dateAsKor";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// import { useScroll } from "src/hooks/useScroll";

interface diaryType {
	id: number;
	date: string;
	title: string;
	body: string;
	img: string;
	diaryTag: string[];
}

const Diary = () => {
	const [diaries, setDiaries] = useState<diaryType[]>([]);
	// const { scrollY, containerRef } = useScroll();

	const path = useLocation().pathname;
	const search = useLocation().search;
	const decodeUrl = decodeURI(search).split("=")[1];
	const navigate = useNavigate();

	const onClickWriteBtn = () => {
		navigate("/diary/post");
	};

	const onClickList = (id: number) => {
		navigate(`/diary/${id}`);
	};

	const categoryOrganize = () => {
		const map = new Map();
		const arr = [];
		diaries.forEach((diary) => {
			const category = diary.diaryTag;
			category.forEach((tag) => {
				map.get(tag) !== undefined
					? map.set(tag, map.get(tag) + 1)
					: map.set(tag, 1);
			});
		});

		for (const [key, value] of map) {
			arr.push(
				<NavStyle
					to={`/diary?category=${key}`}
					// key는 서버 연동 후 id가 생기면 변경 예정
					key={Math.floor(Math.random() * 1000000000000000)}
					className={decodeUrl === key ? "active" : ""}
				>
					<p>{key}</p>
					&nbsp;
					<span>{`(${value})`}</span>
				</NavStyle>,
			);
		}
		return arr;
	};

	useEffect(() => {
		axios
			.get(`http://localhost:8000${path}${search}`)
			.then((res) => {
				setDiaries(res.data);
			})
			.catch((error) => {
				console.log(error);
			});
	}, []);

	return (
		<Container>
			<DiaryContainer>
				<DiaryTitle>
					<h2>일기</h2>
					<WriteBtn onClick={onClickWriteBtn}>
						<SvgIcon
							component={CreateOutlinedIcon}
							sx={{ stroke: "#ffffff", strokeWidth: 1 }}
						/>
						<p>일기 작성하기</p>
					</WriteBtn>
				</DiaryTitle>
				<SubTitle>일기를 기록하여 하루를 정리해보세요!</SubTitle>
				<hr />
				{diaries?.length !== 0 ? (
					<>
						{search === "" ? (
							<h3>분류 전체보기 ({diaries.length})</h3>
						) : (
							<h3>{decodeUrl}</h3>
						)}
						<ListContainer>
							{diaries.map((diary) => {
								return (
									<List
										key={diary.id}
										onClick={() => {
											onClickList(diary.id);
										}}
									>
										<ListMain>
											<h4>{diary.title}</h4>
											<p>{diary.body.replace(/(<([^>]+)>)/gi, "")}</p>
											<Tags>
												{diary.diaryTag.map((tag, idx) => {
													return <Tag key={idx}>{tag}</Tag>;
												})}
											</Tags>
											<Info>
												<p>{dateAsKor(diary.date)}</p>
												<p>지출 내역: 4개 / 수입 내역: 0개</p>
											</Info>
										</ListMain>
										<img src={Test} alt="이미지" />
									</List>
								);
							})}
						</ListContainer>
					</>
				) : (
					<NotDataContainer>
						<div className="img_background">
							<img src={NotData} alt="데이터 없음" />
						</div>
						<p>작성된 일기가 없습니다.</p>
					</NotDataContainer>
				)}
			</DiaryContainer>
			<RemainContainer>
				<SearchContainer>
					<div className="header">
						<SvgIcon
							component={SearchOutlinedIcon}
							sx={{ stroke: "#ffffff", strokeWidth: 1 }}
						/>
						<h3>검색</h3>
					</div>
					<hr />
					<div className="search_input">
						<Input placeholder="게시글 검색" />
						<button>
							<SvgIcon
								component={SearchOutlinedIcon}
								sx={{ stroke: "#ffffff", strokeWidth: 1 }}
							/>
						</button>
					</div>
				</SearchContainer>
				<CategoryContainer>
					<div className="header">
						<SvgIcon
							component={CategoryOutlinedIcon}
							sx={{ stroke: "#ffffff", strokeWidth: 1 }}
						/>
						<h3>카테고리</h3>
					</div>
					<hr />
					<NavStyle to="/diary" className={search === "" ? "active" : ""}>
						<p>전체보기</p>&nbsp;<span>{`(${diaries.length})`}</span>
					</NavStyle>
					{categoryOrganize()}
				</CategoryContainer>
			</RemainContainer>
		</Container>
	);
};

const Container = styled.div`
	display: flex;
	height: 100%;
	overflow-y: scroll;

	&::-webkit-scrollbar {
		display: none;
	}
`;

const DiaryContainer = styled.div`
	margin-top: 3rem;
	width: 70%;

	hr {
		width: 100%;
		border: none;
		height: 1px;
		margin-top: 1.5rem;
		margin-bottom: 1.5rem;
		background-color: ${(props) => props.theme.COLORS.GRAY_300};
	}

	h3 {
		margin: 2rem 0;
		font-size: 1.8rem;
		color: ${(props) => props.theme.COLORS.GRAY_600};
		text-align: center;
	}
`;

const RemainContainer = styled.div`
	margin-top: 3rem;
	margin-left: 3rem;
	width: 30%;
`;

const ListContainer = styled.ul`
	margin-top: 2rem;
`;

const DiaryTitle = styled.div`
	display: flex;
	justify-content: space-between;
	height: 3rem;

	h2 {
		font-size: 2rem;
		color: ${(props) => props.theme.COLORS.GRAY_600};
	}
`;

const SubTitle = styled.p`
	font-size: 1.4rem;
	margin-top: 1rem;
	font-weight: 500;
	color: ${(props) => props.theme.COLORS.GRAY_500};
`;

const WriteBtn = styled.button`
	background-color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
	border-radius: 4px;
	padding: 1.3rem;
	display: flex;
	align-items: center;

	svg {
		color: white;
	}

	p {
		margin-left: 0.5rem;
		font-size: 1.2rem;
		color: ${(props) => props.theme.COLORS.WHITE};
	}
`;

const List = styled.li`
	display: flex;
	height: 15rem;
	justify-content: space-between;
	border: 1px solid ${(props) => props.theme.COLORS.GRAY_200};
	padding: 0 2rem;
	padding-top: 1.5rem;
	padding-bottom: 1rem;
	margin-bottom: 1rem;
	border-radius: 4px;
	box-shadow: 1px 1px 1px rgb(0, 0, 0, 25%);
	cursor: pointer;
`;

const ListMain = styled.div`
	width: 65%;
	display: flex;
	flex-direction: column;

	h4 {
		font-size: 1.8rem;
		color: ${(props) => props.theme.COLORS.GRAY_600};
	}

	p {
		font-size: 1.2rem;
		margin-top: 1.2rem;
		line-height: 1.2;
		overflow: hidden;
		text-overflow: ellipsis;
		color: ${(props) => props.theme.COLORS.GRAY_500};
	}
`;

const Tags = styled.ul`
	display: flex;
	margin-top: 0.5rem;
`;

const Tag = styled.li`
	padding: 0.5rem 1rem;
	margin-top: 1rem;
	margin-right: 0.5rem;
	background-color: ${(props) => props.theme.COLORS.GRAY_200};
	border-radius: 15px;
	font-size: 1.2rem;
	font-weight: 500;
	color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
`;

const Info = styled.div`
	display: flex;
	justify-content: space-between;
	flex: 1;
	align-items: flex-end;
`;

const NotDataContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;

	.img_background {
		width: 100px;
		border-radius: 50px;
		padding: 2.5rem;
		margin-bottom: 2.5rem;
		background-color: ${(props) => props.theme.COLORS.GRAY_200};
	}

	img {
		width: 100%;
	}

	p {
		padding-left: 1rem;
		color: ${(props) => props.theme.COLORS.GRAY_600};
		font-size: 2rem;
		font-weight: 600;
	}
`;

const SearchContainer = styled.div`
	border: 1px solid ${(props) => props.theme.COLORS.GRAY_400};
	border-radius: 4px;
	margin-top: 12.8rem;
	padding: 2rem;
	display: flex;
	flex-direction: column;
	width: 100%;

	.header {
		display: flex;
		align-items: center;
		svg {
			font-size: 2rem;
			margin-right: 0.5rem;
		}

		h3 {
			font-size: 1.6rem;
			color: ${(props) => props.theme.COLORS.GRAY_600};
		}
	}

	.search_input {
		display: flex;
		position: relative;

		input {
			height: 4rem;
		}

		button {
			position: absolute;
			right: 1rem;
			top: 30%;

			svg {
				font-size: 2rem;
				&:hover {
					transition: 0.5s all;
					transform: scale(1.1);
				}
			}
		}
	}

	hr {
		width: 100%;
		border: none;
		height: 1px;
		margin-bottom: 1.8rem;
		background-color: ${(props) => props.theme.COLORS.GRAY_300};
	}
`;

const CategoryContainer = styled(SearchContainer)`
	margin-top: 3rem;
	min-height: 8rem;
`;

const NavStyle = styled(Link)`
	display: flex;
	font-size: 1.4rem;
	color: ${(props) => props.theme.COLORS.GRAY_600};
	font-weight: 500;
	margin-bottom: 1.5rem;

	p {
		&:hover {
			text-decoration: underline;
		}
	}

	&.active {
		p {
			color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
			font-size: 1.5rem;
			font-weight: 600;
		}
	}
`;

export default Diary;
