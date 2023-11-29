import { Route, Routes } from "react-router";
import "./App.css";
import MainLayout from "./components/Layout/MainLayout";
import Dashboard from "./pages/dashboard";
import Diary from "./pages/diary";
import History from "./pages/imcome_outgo";
import Login from "./pages/login";
import SignUp from "./pages/sign_up";

function App() {
	return (
		<>
			<Routes>
				<Route element={<MainLayout />}>
					<Route path={"/"} element={<Dashboard />} />
					<Route path={"/history"} element={<History />} />
					<Route path={"/diary"} element={<Diary />} />
				</Route>
				<Route path={"/login"} element={<Login />} />
				<Route path={"/signup"} element={<SignUp />} />
			</Routes>
		</>
	);
}

export default App;
