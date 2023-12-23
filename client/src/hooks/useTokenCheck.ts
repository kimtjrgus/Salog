import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCookie } from "src/utils/cookie";

const useTokenCheck = () => {
	const navigate = useNavigate();

	useEffect(() => {
		const checkToken = () => {
			if (!getCookie("accessToken")) {
				navigate("/login", { replace: true });
			}
		};

		checkToken();
	}, []);
};

export default useTokenCheck;
