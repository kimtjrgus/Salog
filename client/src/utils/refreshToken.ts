// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { getCookie, removeCookie, setCookie } from "./cookie";

// export const api = axios.create({
//   baseURL: process.env.REACT_APP_SERVER_URL,
//   headers: { "Content-Type": "application/json" },
// });

// const RefreshToken = () => {
//   const navigate = useNavigate();

//   // 요청 전에 헤더에 accessToken을 추가
//   api.interceptors.request.use((config) => {
//     const accessToken = getCookie("accessToken");
//     if (typeof accessToken === "undefined") {
//       config.headers.Authorization = null;
//       return config;
//     }
//     config.headers.Authorization = `${accessToken}`;
//     //   config.withCredentials = true;
//     return config;
//   });

//   // 에러 처리 및 accessToken 재발급
//   api.interceptors.response.use(
//     // 2xx 범위에 있는 응답 트리거
//     (response) => response,
//     async (error) => {
//       // 2xx 범위 밖에있는 응답 트리거
//       console.log(error);
//       if (error.response && error.response.status === 401) {
//         // 토큰 재발급 중인 경우 다른 요청은 중단

//         const refreshToken = getCookie("refreshToken");
//         const accessToken = localStorage.getItem("accessToken");
//         const current = new Date();
//         current.setMinutes(current.getMinutes() + 30);

//         try {
//           const response = await axios.post(
//             `${process.env.REACT_APP_SERVER_URL}/refresh`,
//             {
//               accessToken,
//               refreshToken,
//             }
//           );

//           const newAccessToken = response.data.accessToken;
//           const newRefreshToken = response.data.refreshToken;

//           setCookie("accessToken", newAccessToken, {
//             path: "/",
//             expires: current,
//           });
//           setCookie("refreshToken", newRefreshToken, {
//             path: "/",
//             expires: current,
//           });
//           localStorage.setItem("accessToken", newAccessToken);

//           // 이전 요청을 재시도
//           const originalRequest = error.config;
//           originalRequest.headers.accessToken = newAccessToken;
//           originalRequest.headers.refreshToken = newRefreshToken;

//           // originalRequest.headers.Authorization = newAccessToken;

//           await api.request(originalRequest);
//           //   .then(() => {
//           //     window.location.reload();
//           //   })
//           //   .catch((error) => {
//           //     console.log(error);
//           //   });
//           return;
//         } catch (error) {
//           // refreshToken 재발급에 실패한 경우 로그아웃 처리 등을 수행할 수 있습니다.
//           removeCookie("refreshToken", { path: "/" });
//           removeCookie("accessToken", { path: "/" });
//           localStorage.clear();
//           navigate("/login", { replace: true });
//         }
//       }

//       return await Promise.reject(error);
//     }
//   );

//   return <></>;
// };

// export default RefreshToken;
import axios from 'axios';
import { getCookie, removeCookie, setCookie } from './cookie';

export const api = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL,
  headers: { "Content-Type": "application/json" },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Do something before request is sent
    const accessToken = getCookie('accessToken'); // accessToken 토큰을 가져오는 함수
    if (accessToken) {
      config.headers.Authorization = `${accessToken}`;
    }
    return config;
  },
  async (error) => {
    // Do something with request error
    await Promise.reject(error);
  }
)

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
   // 2xx 응답코드에 대한 트리거
    return response;
  },
  async (error) => {
   // 2xx이 아닌 응답코드에 대한 트리거
    const { response: errorResponse } = error;
    
    // 인증 에러 발생시
    if (errorResponse.status === 401) {
      return await resetTokenAndReattemptRequest(error);
    }

    return await Promise.reject(error);
  }
);

let subscribers: any = [];
console.log(subscribers);


const resetTokenAndReattemptRequest = async (error: any) => {

  let isAlreadyFetchingAccessToken = false;

  try {
    const { response: errorResponse } = error;

    // subscribers에 access token을 받은 이후 재요청할 함수 추가 (401로 실패했던)
    // retryOriginalRequest는 pending 상태로 있다가
    // access token을 받은 이후 onAccessTokenFetched가 호출될 때
    // access token을 넘겨 다시 axios로 요청하고
    // 결과값을 처음 요청했던 promise의 resolve로 settle시킨다.
    const retryOriginalRequest = new Promise((resolve, reject) => {
      addSubscriber(async (accessToken:any) => {
        try {
          errorResponse.config.headers.Authorization = `${accessToken}`;
          resolve(api.request(errorResponse.config));
        } catch (err) {
          reject(err);
        }
      });
    });

    // refresh token을 이용해서 access token 요청
    if (!isAlreadyFetchingAccessToken) {
      isAlreadyFetchingAccessToken = true; // 문닫기 (한 번만 요청)
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = getCookie("refreshToken");

      const { data } = await axios.post(
            `${process.env.REACT_APP_SERVER_URL}/refresh`,
            {
              accessToken,
              refreshToken,
            }
      );
      const current = new Date();
      current.setMinutes(current.getMinutes() + 30); // 30분
      setCookie('accessToken', data.accessToken, {
            path: "/",
            expires: current,
          });
      localStorage.setItem("accessToken", data.accessToken);

      current.setMinutes(current.getMinutes() + 1440); // 1일
      setCookie('refreshToken', data.refreshToken, {
            path: "/",
            expires: current,
          });

      isAlreadyFetchingAccessToken = false; // 문열기 (초기화)

      onAccessTokenFetched(data.accessToken);
    }

    return await retryOriginalRequest; // pending 됐다가 onAccessTokenFetched가 호출될 때 resolve
  } catch (error) {
    signOut();
    return await Promise.reject(error);
  }
}

const addSubscriber = (callback : (accessToken:any) => void) => {
  subscribers.push(callback);
}

const onAccessTokenFetched = (accessToken:any) => {
  subscribers.forEach((callback: (accessToken: any) => void) => { callback(accessToken) });
  subscribers = [];
}

const signOut = () => {
  removeCookie('accessToken');
  localStorage.clear();
  removeCookie('refreshToken');
}
