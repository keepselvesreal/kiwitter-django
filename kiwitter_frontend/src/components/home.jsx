import React from 'react';
import { useUserContext } from '../components/UserContext';
// import { useAuthServiceContext } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';

import TweetForm from './tweet-form';
import Timeline from './timeline';

export default function Home() {
    const { logoutUser } = useUserContext();
    const navigate = useNavigate();

    const handleLogout = () => {
        console.log('Logging out...');
        logoutUser();
        navigate("/login"); // 로그아웃 후 로그인 페이지로 리디렉션
    };

    return (
        <div>
            <div style={{ position: 'relative' }}>
                <TweetForm />
                <Timeline />
                {/* 로그아웃 버튼을 우측 상단에 배치 */}
                <button 
                    onClick={handleLogout} 
                    style={{ 
                        position: 'absolute', 
                        top: 0, 
                        right: 0, 
                        margin: '10px' 
                    }}>
                    Logout
                </button>
            </div>      
        </div>       
    );
}

