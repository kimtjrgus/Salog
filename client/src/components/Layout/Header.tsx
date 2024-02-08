import styled from "styled-components";
import SvgIcon from "@mui/material/SvgIcon";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import logo from "../../assets/Slogo.png";
import { getCookie } from "src/utils/cookie";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();

  const onClickLogo = () => {
    const cookie = getCookie("accessToken");
    typeof cookie === "undefined" ? navigate("/") : navigate("/dashboard");
  };

  return (
    <Container>
      <Logo onClick={onClickLogo}>
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
  height: 6rem;
  border-bottom: 0.1rem solid #e2e2e2;
  position: fixed;
  top: 0;
  z-index: 10;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Logo = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-left: 60px;
  > img {
    width: 50px;
  }
`;

export const LogoTitle = styled.p`
  color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
  font-size: 2rem;
  font-weight: 600;
`;

export const Alarm = styled.div`
  margin-right: 60px;
  color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
  cursor: pointer;

  > svg {
    font-size: 3rem;
  }
`;
