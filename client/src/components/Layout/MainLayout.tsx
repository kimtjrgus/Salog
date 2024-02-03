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
	height: 100vh;
`;

const Container = styled.div`
	width: 92%;
	height: 100%;
	max-width: 130.5rem;
	margin: 0 auto;
	padding-top: 7.5rem;
	padding-left: 20rem;
	/* position: relative; */
	/* left: 20rem; */
`;

export default MainLayout;
