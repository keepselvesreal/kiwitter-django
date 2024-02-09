import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Tweet from './tweet'; // 수정된 Tweet 컴포넌트 임포트

function TimeLine({ tweets, refreshTweets }) {
    // const [tweets, setTweets] = useState([]);
    const accessToken = localStorage.getItem("access token"); // 사용자 인증을 위한 토큰

    



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


