import React, { useState, useEffect } from 'react';
import { useUserContext } from '../components/UserContext';
// import { useAuthServiceContext } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box } from '@mui/system';

import TweetForm from './tweetForm';
import Timeline from './timeline';
import { useAxiosWithJwtInterceptor } from './jwtinterceptor';

export default function Home() {
    const [tweets, setTweets] = useState([]);
    const axiosInstance = useAxiosWithJwtInterceptor();
    const accessToken = localStorage.getItem("access token");

    const fetchTweets = async () => {
        try {
            const response = await axiosInstance.get('http://localhost:8000/tweets/', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            setTweets(response.data); // 트윗 목록 상태 업데이트
        } catch (error) {
            console.error('트윗 로딩 중 오류 발생:', error);
        }
    };
    
    useEffect(() => {
        fetchTweets();
    }, []);

    const addTweet = (newTweet) => {
        console.log("newTweet", newTweet)
        setTweets(prevTweets => [newTweet, ...prevTweets]); // 새 트윗을 목록의 맨 앞에 추가
    };

    const refreshTweets = () => fetchTweets();

    return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <TweetForm addTweet={addTweet} />
                <Box sx={{ mt: 7 }}>
                    <Timeline tweets={tweets} refreshTweets={refreshTweets}/>
                </Box>
            </Box> 
    );
}

