import { Navigate, Outlet } from "react-router-dom";
import { getCookie } from "src/utils/cookie";

const PublicRoute = () => {
	// eslint-disable-next-line react/react-in-jsx-scope
	return !getCookie("access") ? <Outlet /> : <Navigate to="/" />;
};

export default PublicRoute;
