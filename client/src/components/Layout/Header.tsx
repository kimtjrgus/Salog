import styled from "styled-components";
import SvgIcon from "@mui/material/SvgIcon";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import logo from "../../assets/Slogo.png";

export const Header = () => {
	return (
		<Container>
			<Logo>
				<img src={logo} alt="로고" />
				<LogoTitle>샐로그</LogoTitle>
			</Logo>
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

export const Logo = styled.div`
	display: flex;
	border: 1px solid black;
`;

export const LogoTitle = styled.p`
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
