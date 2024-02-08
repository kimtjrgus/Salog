import { Outlet } from "react-router";
import { styled } from "styled-components";
import { Header } from "./Header";
import { SideBar } from "./SideBar";

const MainLayout = () => {
  return (
    <Full>
      <Header />
      <Inner>
        <SideBar />
        <Container>
          <Outlet />
        </Container>
      </Inner>
    </Full>
  );
};

const Full = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Inner = styled.div`
  width: 92%;
  height: 100vh;
  max-width: 135.8rem;
  background-color: white;
  padding-top: 6rem;
  display: flex;

  ::-webkit-scrollbar {
    width: 3px;
    height: 8px;
  }

  ::-webkit-scrollbar-thumb {
    height: 30%;
    background: ${(props) => props.theme.COLORS.LIGHT_BLUE};
    border-radius: 2px;
  }
`;

const Container = styled.div`
  width: 123.5rem;
  display: flex;
  justify-content: center;
  position: absolute;
  flex-wrap: nowrap;
  left: 20rem;
  right: 0;
  margin: 0 auto;
`;

export default MainLayout;
