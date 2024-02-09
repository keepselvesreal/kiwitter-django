import React, { useState, useEffect } from 'react';
import { useUserContext } from '../components/UserContext';
// import { useAuthServiceContext } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import TweetForm from './tweetForm';
import Timeline from './timeline';

export default function Home() {
    const { logoutUser } = useUserContext();
    const navigate = useNavigate();
    const [tweets, setTweets] = useState([]);
    const accessToken = localStorage.getItem("access token");

    useEffect(() => {
        fetchTweets();
    }, []);

    const fetchTweets = async () => {
        try {
            const response = await axios.get('http://localhost:8000/tweets/', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            setTweets(response.data); // 트윗 목록 상태 업데이트
        } catch (error) {
            console.error('트윗 로딩 중 오류 발생:', error);
        }
    };
    console.log("home tweets: ", tweets)

    const handleLogout = () => {
        console.log('Logging out...');
        logoutUser();
        navigate("/login"); // 로그아웃 후 로그인 페이지로 리디렉션
    };

    const addTweet = (newTweet) => {
        console.log("newTweet", newTweet)
        setTweets(prevTweets => [newTweet, ...prevTweets]); // 새 트윗을 목록의 맨 앞에 추가
    };

    const refreshTweets = () => fetchTweets();

    return (
        <div>
            <div style={{ position: 'relative' }}>
                <TweetForm addTweet={addTweet} />
                <Timeline tweets={tweets} refreshTweets={refreshTweets}/>
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

