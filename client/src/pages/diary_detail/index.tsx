import { styled } from "styled-components";
import { SvgIcon } from "@mui/material";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";

const DiaryDetail = () => {
	return (
		<DetailContainer>
			<div className="go_back">
				<SvgIcon
					component={ChevronLeftOutlinedIcon}
					sx={{ stroke: "#ffffff", strokeWidth: 1 }}
				/>
				<p>일기 조회로 돌아가기</p>
			</div>
		</DetailContainer>
	);
};

const DetailContainer = styled.div`
	width: 20%;
	display: flex;
	justify-content: center;
	flex-direction: column;
	cursor: pointer;

	.go_back {
		display: flex;
		gap: 1rem;
		transition: all 2s;

		svg {
			font-size: 2.4rem;
		}

		p {
			font-size: 1.4rem;
			align-self: center;
		}

		&:hover {
			svg,
			p {
				transform: scale(1.05);
			}
		}
	}
`;

export default DiaryDetail;
