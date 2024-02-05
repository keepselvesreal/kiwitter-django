import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

// 사용자 정보를 위한 컨텍스트 생성
const UserContext = createContext();

// 컨텍스트를 사용하기 쉽게 하는 커스텀 훅
export function useUserContext() {
  return useContext(UserContext);
}

// UserContextProvider 컴포넌트
export const UserContextProvider = ({ children }) => {
  // 로컬 스토리지에서 사용자 정보 가져오기
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 로그인 함수
  const loginUser = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:8000/users/login/', { username, password }, {
        headers: { 'Content-Type': 'application/json' },
      });
      const userData = {
        username: response.data.username,
        id: response.data.id, 
        token: response.data.token,
      };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return response.data; // 로그인 성공 데이터 반환
    } catch (error) {
      console.error("Login error: ", error.response ? error.response.data : 'Error');
      throw error; // 오류를 다시 던져서 호출 측에서 처리할 수 있도록 함
    }
  };

  // 로그아웃 함수
  const logoutUser = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // 컨텍스트 프로바이더 값 제공
  return (
    <UserContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};

