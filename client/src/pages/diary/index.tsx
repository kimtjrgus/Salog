import { SvgIcon } from "@mui/material";
import { styled } from "styled-components";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import Test from "../../assets/Test.jpeg";

const Diary = () => {
	return (
		<Container>
			<DiaryContainer>
				<DiaryTitle>
					<h2>일기</h2>
					<WriteBtn>
						<SvgIcon
							component={CreateOutlinedIcon}
							sx={{ stroke: "#ffffff", strokeWidth: 1 }}
						/>
						<p>일기 작성하기</p>
					</WriteBtn>
				</DiaryTitle>
				<SubTitle>일기를 기록하여 하루를 정리해보세요!</SubTitle>
				<hr />
				<h3>분류 전체보기 (0)</h3>
				<ListContainer>
					<List>
						<ListMain>
							<h4>일기 제목입니다</h4>
							<p>
								오늘은 텐진역 근처에 있는 이치란 라멘을 들렀다. 대기하는
								사람들도 많았지만 기다리고 기다려서 이치란 본점에 입장하였어요.
							</p>
							<Tags>
								<Tag>일본</Tag>
								<Tag>혼술</Tag>
							</Tags>
							<Info>
								<p>2023년 11월 18일 (토)</p>
								<p>지출 내역: 4개 / 수입 내역: 0개</p>
							</Info>
						</ListMain>
						<img src={Test} alt="이미지" />
					</List>
				</ListContainer>
			</DiaryContainer>
			<RemainContainer></RemainContainer>
		</Container>
	);
};

const Container = styled.div`
	display: flex;
	height: 90vh;
`;

const DiaryContainer = styled.div`
	display: flex;
	margin-top: 3rem;
	flex-direction: column;
	width: 65rem;

	hr {
		width: 100%;
		border: none;
		height: 1px;
		margin-top: 1.5rem;
		background-color: ${(props) => props.theme.COLORS.GRAY_200};
	}

	h3 {
		margin-top: 1.5rem;
		font-size: 1.8rem;
		color: ${(props) => props.theme.COLORS.GRAY_600};
		text-align: center;
	}
`;

const RemainContainer = styled.div`
	display: flex;
	margin-top: 3rem;
	margin-left: 3rem;
	flex-direction: column;
	width: 35rem;
	border: 1px solid black;
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
	height: 16rem;
	justify-content: space-between;
	border: 1px solid ${(props) => props.theme.COLORS.GRAY_200};
	padding: 0 2rem;
	padding-top: 1.5rem;
	padding-bottom: 1rem;
	border-radius: 4px;
	box-shadow: 1px 1px 1px rgb(0, 0, 0, 25%);

	img {
		width: 15rem;
	}
`;

const ListMain = styled.div`
	width: 65%;
	display: flex;
	flex-direction: column;

	h4 {
		font-size: 1.6rem;
		color: ${(props) => props.theme.COLORS.GRAY_600};
	}

	p {
		font-size: 1.2rem;
		margin-top: 1rem;
		line-height: 1.2;
		color: ${(props) => props.theme.COLORS.GRAY_500};
	}
`;

const Tags = styled.ul`
	display: flex;
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
`;

export default Diary;
