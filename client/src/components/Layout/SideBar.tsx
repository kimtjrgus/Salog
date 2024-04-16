import styled, { css } from "styled-components";
import { SvgIcon } from "@mui/material";
import GridViewIcon from "@mui/icons-material/GridView";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import PriceChangeOutlinedIcon from "@mui/icons-material/PriceChangeOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import ContactSupportOutlinedIcon from "@mui/icons-material/ContactSupportOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Modal from "./Modal";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "src/store/slices/userSlice";
import { userLogout } from "src/utils/validCheck";

export const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onclickLogout = () => {
    setIsOpen(true);
  };

  const onClickCloseBtn = () => {
    userLogout();
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const isActive = (paths: string[]) => {
    const location = useLocation();
    return paths.some((path) => location.pathname === path);
  };

  return (
    <>
      <Container>
        <NavTitle>ACCOUNT BOOK</NavTitle>
        <Lists>
          <NavStyle to="/dashboard">
            <SvgIcon
              component={GridViewIcon}
              sx={{ stroke: "#ffffff", strokeWidth: 0.5 }}
            />
            <ListTitle>대시보드</ListTitle>
          </NavStyle>
          <NavStyle
            to="/history"
            $isActive={isActive(["/history", "/income", "/outgo", "/waste"])}
          >
            <SvgIcon
              component={MenuBookIcon}
              sx={{ stroke: "#ffffff", strokeWidth: 0.5 }}
            />
            <ListTitle>지출 · 수입</ListTitle>
          </NavStyle>
          <NavStyle to="/monthRadio">
            <SvgIcon
              component={SignalCellularAltIcon}
              sx={{ stroke: "#ffffff", strokeWidth: 0.5 }}
            />
            <ListTitle>분석</ListTitle>
          </NavStyle>
          <NavStyle to="/budget">
            <SvgIcon
              component={PriceChangeOutlinedIcon}
              sx={{ stroke: "#ffffff", strokeWidth: 0.5 }}
            />
            <ListTitle>예산</ListTitle>
          </NavStyle>
          <NavStyle to="/fixed__account">
            <SvgIcon
              component={AttachMoneyOutlinedIcon}
              sx={{ stroke: "#ffffff", strokeWidth: 0.5 }}
            />
            <ListTitle>고정 지출 · 수입</ListTitle>
          </NavStyle>
        </Lists>
        <NavTitle>DIARY</NavTitle>
        <Lists>
          <NavStyle to="/diary">
            <SvgIcon
              component={StickyNote2OutlinedIcon}
              sx={{ stroke: "#ffffff", strokeWidth: 0.5 }}
            />
            <ListTitle>일기</ListTitle>
          </NavStyle>
        </Lists>
        <NavTitle>ACCOUNT</NavTitle>
        <Lists>
          <NavStyle to="/inquiry">
            <SvgIcon
              component={ContactSupportOutlinedIcon}
              sx={{ stroke: "#ffffff", strokeWidth: 0.5 }}
            />
            <ListTitle>문의</ListTitle>
          </NavStyle>
          <NavStyle to="/setting">
            <SvgIcon
              component={SettingsOutlinedIcon}
              sx={{ stroke: "#ffffff", strokeWidth: 0.5 }}
            />
            <ListTitle>설정</ListTitle>
          </NavStyle>
          <LogoutDiv onClick={onclickLogout}>
            <SvgIcon
              component={ExitToAppRoundedIcon}
              sx={{ stroke: "#ffffff", strokeWidth: 0.5 }}
            />
            <ListTitle>로그아웃</ListTitle>
          </LogoutDiv>
        </Lists>
      </Container>
      <Modal
        state={isOpen}
        setState={setIsOpen}
        msgTitle={"로그아웃 하시겠습니까?"}
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
  /* background-color: #e9eeff; */
  border-right: 1px solid #e2e2e2;
  position: fixed;
  width: 20rem;
  height: 100%;
  background-color: white;
  z-index: 80;
`;

const NavTitle = styled.p`
  font-size: 1rem;
  padding: 1.5rem;
  color: ${(props) => props.theme.COLORS.GRAY_500};
`;

const ListTitle = styled.p`
  font-size: 1.5rem;
  padding: 1rem 1.5rem;
  color: ${(props) => props.theme.COLORS.GRAY_700};
  font-weight: 600;
`;

const Lists = styled.div`
  border-bottom: 1px solid #e2e2e2;
`;

const NavStyle = styled(NavLink)<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.5rem 1.3rem;
  cursor: pointer;

  > svg {
    font-size: 2.1rem;
    color: ${(props) => props.theme.COLORS.GRAY_600};
    border: 1px;
  }

  &:hover {
    background-color: #f0f3fd;
  }

  ${(props) =>
    props.$isActive &&
    css`
      background-color: #e2e8ff;
      > svg,
      p {
        color: ${props.theme.COLORS.LIGHT_BLUE};
      }
    `}

  &.active {
    background-color: #e2e8ff;
    > svg,
    p {
      color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
    }
  }
`;

const LogoutDiv = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem 1.3rem;
  cursor: pointer;

  > svg {
    font-size: 2.1rem;
    color: ${(props) => props.theme.COLORS.GRAY_600};
    border: 1px;
  }

  &:hover {
    background-color: #f0f3fd;
  }

  &.active {
    background-color: #e2e8ff;
    > svg,
    p {
      color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
    }
  }
`;
