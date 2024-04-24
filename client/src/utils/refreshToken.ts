import axios from 'axios';
import { getCookie, setCookie } from './cookie';

export const api = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL,
  headers: { "Content-Type": "application/json" },
});

// 요청이 전송되기 전 실행할 로직
api.interceptors.request.use(
  (config) => {
    // accessToken 토큰을 가져오는 함수
    const accessToken = getCookie('accessToken'); 
    if (accessToken) {
      config.headers.Authorization = `${accessToken}`;
    }
    return config;
  },
  // Promise를 반환하는 문에서는 async 사용을 권장함
  async (error) => {
    await Promise.reject(error);
  }
)

// 서버로부터 응답 받은 뒤 실행할 로직
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
// 새로운 액세스 토큰을 요청 중임을 나타내는 변수
let isAlreadyFetchingAccessToken = false;

// 토큰 재발급이 되는 경우와 반대의 경우가 랜덤으로 발생함.
const resetTokenAndReattemptRequest = async (error: any) => {

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
      
      RefreshToken().catch(() => {
        // 재발급에 실패하면 로그아웃 처리 (refreshToken이 없다고 판단)
            // signOut();
      });
      isAlreadyFetchingAccessToken = false; // 문열기 (초기화)
    }
    

    return await retryOriginalRequest; // pending 됐다가 onAccessTokenFetched가 호출될 때 resolve
  } catch (error) {
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

// 토큰 재발급 후 pending된 요청들에 대하여 재요청을 보냄
const RefreshToken = async() => {
   const accessToken = localStorage.getItem("accessToken");
      const refreshToken = getCookie("refreshToken");
      console.log(accessToken, refreshToken);
      
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
  
  onAccessTokenFetched(data.accessToken);
}
 
// const signOut = () => {
//   removeCookie('accessToken');
//   localStorage.clear();
//   removeCookie('refreshToken');
//   window.location.href = ("/login");
// }
