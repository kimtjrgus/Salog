import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loading from "src/components/Layout/Loading";
import { login } from "src/store/slices/userSlice";
import { setCookie } from "src/utils/cookie";
import { api } from "src/utils/refreshToken";

function GoogleOAuth2RedirectPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const accessToken = new URL(window.location.href).searchParams.get(
    "accessToken"
  );
  const refreshToken = new URL(window.location.href).searchParams.get(
    "refreshToken"
  );

  const current = new Date();
  current.setMinutes(current.getMinutes() + 30);

  setCookie("accessToken", accessToken ?? "", {
    path: "/",
    expires: current,
  });
  localStorage.setItem("accessToken", accessToken ?? "");

  current.setMinutes(current.getMinutes() + 1440);
  setCookie("refreshToken", refreshToken ?? "", {
    path: "/",
    expires: current,
  });
  // 전역 상태로 회원 정보를 저장
  api
    .get("/members/get")
    .then((res) => {
      dispatch(login(res.data.data));
      navigate("/dashboard");
    })
    .catch((error) => {
      console.log(error);
    });

  return <Loading />;
}

export default GoogleOAuth2RedirectPage;
