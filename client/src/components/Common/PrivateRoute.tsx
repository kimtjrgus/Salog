import { Navigate, Outlet } from "react-router-dom";
import { getCookie } from "src/utils/cookie";

const PrivateRoute = () => {
  // eslint-disable-next-line react/react-in-jsx-scope
  return getCookie("accessToken") ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default PrivateRoute;
