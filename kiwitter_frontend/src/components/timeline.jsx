import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Tweet from './tweet'; // 수정된 Tweet 컴포넌트 임포트
import { Box } from '@mui/material'; // MUI의 Box 컴포넌트 임포트

function TimeLine({ tweets, refreshTweets, onTweetStateChange }) {
    const accessToken = localStorage.getItem("access token"); // 사용자 인증을 위한 토큰

    return (
        // 여기서 Box 컴포넌트를 사용하여 스타일을 적용합니다.
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {tweets.map(tweet => (
                <Tweet
                    key={tweet.id}
                    tweet={tweet}
                    refreshTweets={refreshTweets}
                    onTweetStateChange={onTweetStateChange}
                />
            ))}
        </Box>
    );
}

export default TimeLine;



