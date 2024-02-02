import { useState } from "react";
import axios from "axios";

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
    });

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        console.log("formData ->", formData);
        e.preventDefault();
        try {
        const response = await axios.post('http://localhost:8000/users/register/', formData);
        console.log("response data -> ", response.data);
        setFormData({ username: '', password: '', email: '' });
        } catch (error) {
        console.error("error response -> ", error.response.data);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    name="username" 
                    placeholder="Username" 
                    onChange={handleChange} 
                    value={formData.username}
                />
                <input 
                    type="password" 
                    name="password" 
                    placeholder="Password" 
                    onChange={handleChange}
                    value={formData.password}
                />
                <input 
                    type="email" 
                    name="email" 
                    placeholder="Email" 
                    onChange={handleChange}
                    value={formData.email}
                />
                <button type="submit">Register</button>
            </form>
        </div>
    );
}