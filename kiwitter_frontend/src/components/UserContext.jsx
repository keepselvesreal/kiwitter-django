import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

// 사용자 정보를 위한 컨텍스트 생성
const UserContext = createContext();

// 컨텍스트를 사용하기 쉽게 하는 커스텀 훅
export function useUserContext() {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error("Error - You have to use the AuthServiceProvider");
  }
  return context;
}

// UserContextProvider 컴포넌트
export const UserContextProvider = ({ children }) => {
    const getInitialLoggedInValue = () => {
          const loggedIn = localStorage.getItem("isLoggedIn");
          return loggedIn !== null && loggedIn === "true";
        };

    const [isLoggedIn, setIsLoggedIn] = useState((getInitialLoggedInValue))
    
    const getUserDetails = async () =>{
        try {
            const userId = localStorage.getItem("user_id")
            const accessToken = localStorage.getItem("access token")
            const response = await axios.get(
                `http://127.0.0.1:8000/api/users/${userId}/`, {
                  headers: { 'Authorization': `JWT ${accessToken}` }
                }
            );
            const userDetails = response.data
            localStorage.setItem("username", userDetails.username);
            setIsLoggedIn(true);
            localStorage.setItem("isLoggedIn", "true")
        } catch (err) {
            setIsLoggedIn(false)
            localStorage.setItem("isLoggedIn", "false")
            return err;
        }
    }


  // 로그인 함수
  const loginUser = async (username, password) => {
      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/api/token/", {
              username,
              password,
      }
      );
      console.log("response: ", response)
      // const userData = {
      //   username: response.data.username,
      //   id: response.data.id, 
      //   token: response.data.token,
      // };
      // localStorage.setItem('user', JSON.stringify(userData));
      // setUser(userData);
      
      const user_id = response.data.user_id
      localStorage.setItem("user_id", user_id)
      localStorage.setItem("isLoggedIn", "true")
      console.log("user_id: ", user_id)

      const {access, refresh} = response.data;
      localStorage.setItem("access token", access)
      localStorage.setItem("refresh token", refresh)

      setIsLoggedIn(true)
      getUserDetails()
      
    } catch (error) {
      console.error("Login error: ", error.response ? error.response.status : 'Error');
      throw error; // 오류를 다시 던져서 호출 측에서 처리할 수 있도록 함
    }
  };

  // 로그아웃 함수
  const logoutUser = async() => {
    localStorage.setItem("isLoggedIn", "false")
    localStorage.removeItem("user_id")
    localStorage.removeItem("username");
    setIsLoggedIn(false);

    try {
        const accessToken = localStorage.getItem("access token")
        await axios.post(
          'http://127.0.0.1:8000/users/logout/', {} , {
            headers: { 'Authorization': `JWT ${accessToken}` }
          }
          )
        } catch (refreshError) {
            return Promise.reject(refreshError)
        }
      }

  const refreshAccessToken = async () => {
    try {
        const refreshToken = localStorage.getItem("refresh token")
        await axios.post(
            'http://127.0.0.1:8000/token/refresh/', 
            {},
            {
              headers: { 'Authorization': `JWT ${refreshToken}` }
            } 
        )
    } catch (refreshError) {
        return Promise.reject(refreshError)
    }
  }

  // register 함수

  // 컨텍스트 프로바이더 값 제공
  return (
    <UserContext.Provider value={{ isLoggedIn, loginUser, logoutUser, refreshAccessToken }}>
      {children}
    </UserContext.Provider>
  );
};