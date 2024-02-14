import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Divider, Box } from '@mui/material';
import Tweet from './tweet'; // Tweet 컴포넌트를 임포트하세요.

function MyVibe() {
    const [tweets, setTweets] = useState([]);
    const accessToken = localStorage.getItem("access token");

    const fetchMyVibeTweets = async () => {
        try {
            const response = await axios.get('http://localhost:8000/tweets/my-vibe/', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            // 날짜 기준으로 내림차순 정렬
            const sortedTweets = response.data.sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
            );
            setTweets(sortedTweets);
        } catch (error) {
            console.error('트윗 로딩 중 오류 발생:', error);
        }
    };

    // 트윗 컴포넌트에 전달할 새로고침 함수
    const refreshMyVibeTweets = () => {
        fetchMyVibeTweets();
    };

    useEffect(() => {
        fetchMyVibeTweets();
    }, []);

    return (
        <div>
            {tweets.map((tweet, index, array) => (
                <React.Fragment key={tweet.id}>
                    {/* 날짜 헤더를 표시합니다 */}
                    {index === 0 || new Date(tweet.created_at).toDateString() !== new Date(array[index - 1].created_at).toDateString() ? (
                        <>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                {new Date(tweet.created_at).toDateString()}
                            </Typography>
                        </>
                    ) : null}
                    {/* Tweet 컴포넌트를 사용해 트윗을 렌더링합니다. */}
                    <Box key={tweet.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Tweet 
                            key={tweet.id}
                            tweet={tweet}
                            refreshTweets={refreshMyVibeTweets}  
                        />
                    </Box>
                </React.Fragment>
            ))}
        </div>
    );
}

export default MyVibe;


