import React, { useState } from 'react';
import { useUserContext } from '../components/UserContext';
// import { useAuthServiceContext } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    // const { loginUser } = useUserContext(); // 컨텍스트에서 loginUser 함수 사용
    const { loginUser } =useUserContext();
    const navigate = useNavigate(); // 페이지 리다이렉션을 위한 히스토리 객체

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        try {
            // loginUser 함수를 호출하여 로그인
            // await loginUser(username, password);
            await loginUser(username, password);
            // 로그인 성공 후 리다이렉트, 예를 들어 홈 페이지로
            navigate('/'); // 성공적으로 로그인한 후의 리다이렉션 경로
        } catch (error) {
            // 로그인 실패 처리, 에러 메시지 표시 등
            console.error("Login error: ", error.response ? error.response.data : 'Error');
            // 여기서 사용자에게 에러 메시지를 보여주는 로직을 추가할 수 있습니다.
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            <button type="submit">Login</button>
        </form>
    );
};

export default Login;

