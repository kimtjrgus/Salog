import { Route, Routes } from "react-router";
import "./App.css";
import MainLayout from "./components/Layout/MainLayout";
import Dashboard from "./pages/dashboard";
import Diary from "./pages/diary";
import History from "./pages/imcome_outgo";

function App() {
	return (
		<>
			<Routes>
				<Route element={<MainLayout />}>
					<Route path={"/"} element={<Dashboard />} />
					<Route path={"/history"} element={<History />} />
					<Route path={"/diary"} element={<Diary />} />
				</Route>
			</Routes>
		</>
	);
}

export default App;
