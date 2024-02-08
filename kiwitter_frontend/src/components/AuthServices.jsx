import axios from "axios";
import { useState } from "react";
// import { useNavigate } from "react-router-dom";


export function useAuthService() {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
      });

    // const navigate = useNavigate()

    const login = async (username, password) =>{
        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/token/", {
                    username,
                    password,
            }
            );

            console.log("response.data", response.data)

            const userData = {
                username: response.data.username,
                id: response.data.id, 
                token: response.data.token,
              };
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            localStorage.setItem("isLoggedIn", "true")

            const {access, refresh} = response.data;
            localStorage.setItem("access token", access)
            localStorage.setItem("refresh token", refresh)
        } catch (err) {
            return err.response.status;
        }
    }

    const refreshAccessToken = async () => {
        try {
            await axios.post(
                'http://127.0.0.1:8000/api/token/refresh/', {}
            )
        } catch (refreshError) {
            return Promise.reject(refreshError)
        }
    }

    const register = async (username, password) => {
        try {
            const response = await axios.post(
                "http://localhost:8000/users/register/", {
                    username,
                    password,
            }
            );
            return response.status
        } catch (err) {
            return err.response.status;
        }
    }


    const logout = async () => {
        // navigate("/login")

        try {
            await axios.post(
                `http://localhost:8000/users/logout/`, {}
            )
        } catch (refreshError) {
            return Promise.reject(refreshError)
        }

    }

    return {user, login, logout, refreshAccessToken, register}
   
}