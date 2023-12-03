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
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
`;

const Inner = styled.div`
	display: flex;
	height: 92.5vh;
`;

const Container = styled.div`
	width: 92%;
	max-width: 120.5rem;
	position: relative;
	padding: 8rem;
	padding-top: 7.5rem;
	height: 100vh;
	left: 20rem;
`;

export default MainLayout;
