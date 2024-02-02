import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        try {
            const response = await axios.post('http://localhost:8000/users/login/', { username, password });
            console.log("response data -> ", response.data);
            
            localStorage.setItem('username', response.data.username);
            localStorage.setItem('userId', response.data.userId);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('isLoggedIn', true);
    
        } catch (error) {
            console.error("error resonse -> ", error.response ? error.response.data : 'Error');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <button type="submit">Login</button>
        </form>
    );
};

export default Login;
