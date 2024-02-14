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
  window.location.href = ("/login");
}
