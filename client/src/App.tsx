import { Route, Routes } from "react-router";
import { ToastContainer } from "react-toastify";
import "./App.css";
import MainLayout from "./components/Layout/MainLayout";
import Dashboard from "./pages/dashboard";
import Diary from "./pages/diary";
import DiaryDetail from "./pages/diary_detail";
import DiaryWrite from "./pages/diary_write";
import History from "./pages/imcome_outgo";
import Login from "./pages/login";
import PasswordFind from "./pages/password";
import SignUp from "./pages/sign_up";

function App() {
	return (
		<>
			<Routes>
				<Route element={<MainLayout />}>
					<Route path={"/"} element={<Dashboard />} />
					<Route path={"/history"} element={<History />} />
					<Route path={"/diary"} element={<Diary />} />
					<Route path={"/diary/:id"} element={<DiaryDetail />} />
					<Route path={"/diary/post"} element={<DiaryWrite />} />
				</Route>
				<Route path={"/login"} element={<Login />} />
				<Route path={"/signup"} element={<SignUp />} />
				<Route path={"/findPassword"} element={<PasswordFind />} />
			</Routes>
			<ToastContainer />
		</>
	);
}

export default App;
