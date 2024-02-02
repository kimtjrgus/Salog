import { SvgIcon } from "@mui/material";
import { styled } from "styled-components";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import NotData from "../../assets/NotData.png";
import { Input } from "../login";
import dateAsKor from "src/utils/dateAsKor";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CalendarComponent from "./Calendar";
import { api } from "src/utils/refreshToken";
import { v4 as uuidv4 } from "uuid";
import useDebounce from "src/hooks/useDebounce";
// import { useScroll } from "src/hooks/useScroll";

export interface diaryType {
	diaryId: number;
	date: string;
	title: string;
	body: string;
	img: string;
	tagList: TagList[];
}

export interface TagList {
	diaryTagId: number;
	tagName: string;
}

const Diary = () => {
	const [diaries, setDiaries] = useState<diaryType[]>([]);
	const [filterDiary, setFilterDiary] = useState<diaryType[]>([]);
	const [searchVal, setSearchVal] = useState<string>("");
	const debouncedSearchVal = useDebounce(searchVal, 300); // 300ms 딜레이로 디바운스 적용

	const mapArray = filterDiary.length > 0 ? filterDiary : diaries;

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

	const onChangeSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchVal(e.target.value);
	};

	const onClickSearchBtn = () => {
		navigate(`${path}?title=${searchVal}`);
	};

	const onKeyDownSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			onClickSearchBtn();
		}
	};

	const categoryOrganize = () => {
		const map = new Map();
		const arr = [];
		diaries.forEach((diary) => {
			const category = diary.tagList;
			category.forEach((tag) => {
				map.get(tag.tagName) !== undefined
					? map.set(tag.tagName, map.get(tag.tagName) + 1)
					: map.set(tag.tagName, 1);
			});
		});

		for (const [key, value] of map) {
			arr.push(
				<NavStyle
					to={`/diary?diaryTag=${key}`}
					key={uuidv4()}
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
		api
			.get(`${path}?page=1&size=20`)
			.then((res) => {
				setDiaries(res.data.data);
				setFilterDiary(res.data.data);
			})
			.catch((error) => {
				console.log(error);
			});
	}, []);

	useEffect(() => {
		if (search !== "" && search !== "?title=") {
			api
				.get(
					`${path}${
						search.includes("?title") ? "/search" : ""
					}?page=1&size=10${search.replace("?", "&")}`,
				)
				.then((res) => {
					setFilterDiary(res.data.data);
				})
				.catch((error) => {
					console.log(error);
				});
		} else {
			setFilterDiary(diaries); // search가 빈 문자열인 경우 filterDiary를 빈 배열로 초기화
		}
	}, [search]);

	useEffect(() => {
		if (debouncedSearchVal === "") {
			navigate(`${path}`);
		} else {
			navigate(`${path}?title=${debouncedSearchVal}`);
		}
	}, [debouncedSearchVal]);

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
				{filterDiary?.length !== 0 ? (
					<>
						{search === "" || search === "?title=" ? (
							<h3>분류 전체보기 ({diaries.length})</h3>
						) : (
							<h3>
								{decodeUrl} ({filterDiary.length})
							</h3>
						)}
						<ListContainer>
							{mapArray?.map((diary) => {
								return (
									<List
										key={diary.diaryId}
										onClick={() => {
											onClickList(diary.diaryId);
										}}
									>
										<ListMain>
											<h4>{diary.title}</h4>
											<p>{diary.body.replace(/(<([^>]+)>)/gi, "")}</p>
											<Tags>
												{diary.tagList.map((tag) => {
													return <Tag key={tag.diaryTagId}>{tag.tagName}</Tag>;
												})}
											</Tags>
											<Info>
												<p>{dateAsKor(diary.date)}</p>
												{/* 리팩토링으로 건의 예정 */}
												{/* <p>지출 내역: 4개 / 수입 내역: 0개</p> */}
											</Info>
										</ListMain>
										{diary.img !== "" && <img src={diary.img} alt="이미지" />}
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
			<div className="remain">
				<div className="blank"></div>
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
							<Input
								placeholder="게시글 검색"
								onChange={onChangeSearchInput}
								onKeyDown={onKeyDownSearch}
							/>
							<button onClick={onClickSearchBtn}>
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
							<h3>태그</h3>
						</div>
						<hr />
						<NavStyle to="/diary" className={search === "" ? "active" : ""}>
							<p>전체보기</p>&nbsp;<span>{`(${diaries.length})`}</span>
						</NavStyle>
						{categoryOrganize()}
					</CategoryContainer>
					<CalendarComponent diaries={diaries} />
				</RemainContainer>
			</div>
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

	.remain {
		width: 30%;
	}

	.blank {
		height: 12.8rem;
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
	overflow-y: auto;
	/* width: 30%; */
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

	img {
		width: 17rem;
	}
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
		min-height: 3rem;
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
	min-height: 3rem;
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
	margin-top: 15rem;

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
	/* margin-top: 12.8rem; */
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
