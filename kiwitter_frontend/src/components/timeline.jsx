import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Tweet from './tweet'; // 수정된 Tweet 컴포넌트 임포트

function TimeLine() {
    const [tweets, setTweets] = useState([]);
    const accessToken = localStorage.getItem("access token"); // 사용자 인증을 위한 토큰

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

    // refreshTweets 함수는 이제 fetchTweets 함수와 동일하므로 중복을 제거합니다.
    const refreshTweets = () => fetchTweets();

    return (
        <div>
            {tweets.map(tweet => (
                <Tweet
                    key={tweet.id}
                    tweet={tweet}
                    refreshTweets={refreshTweets}
                />
            ))}
        </div>
    );
}

export default TimeLine;


