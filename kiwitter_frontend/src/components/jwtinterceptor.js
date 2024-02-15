import React, { useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';

export const useAxiosWithJwtInterceptor = () => {
  const { logoutUser, refreshAccessToken } = useContext(UserContext);
  const navigate = useNavigate();
  const axiosInstance = axios.create({
    baseURL: "http://127.0.0.1:8000/api/",
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  });

  axiosInstance.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem("access token");
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  axiosInstance.interceptors.response.use((response) => {
    return response;
  }, async (error) => {
    const originalRequest = error.config;
    // 401 Unauthorized or 403 Forbidden
    if ((error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await refreshAccessToken();
        console.log("newAccessToken in interceptor: ", newAccessToken)
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        logoutUser();
        navigate("/login");
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  });

  return axiosInstance;
};
