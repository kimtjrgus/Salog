import styled from "styled-components";
import SvgIcon from "@mui/material/SvgIcon";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";

export const Header = () => {
	return (
		<Container>
			<Logo>샐로그</Logo>
			<Alarm>
				<SvgIcon component={NotificationsNoneIcon} />
			</Alarm>
		</Container>
	);
};

export const Container = styled.div`
	width: 100%;
	height: 5.5rem;
	border-bottom: 0.1rem solid #b4b4b4;
	position: fixed;
	top: 0;
	z-index: 10;
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

export const Logo = styled.p`
	color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
	font-size: 2rem;
	font-weight: 600;
	margin-left: 60px;
`;

export const Alarm = styled.div`
	margin-right: 60px;
	color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
	cursor: pointer;

	> svg {
		font-size: 3rem;
	}
`;
