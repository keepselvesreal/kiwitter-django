import React from 'react';
import { useUserContext } from '../components/UserContext'; // 올바른 경로로 수정
import { useNavigate } from 'react-router-dom';

import TweetForm from '../components/tweet-form';
import Timeline from '../components/timeline';

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

