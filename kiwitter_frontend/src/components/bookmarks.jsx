import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box } from '@mui/material';

import Tweet from './tweet';
import { useAxiosWithJwtInterceptor } from './jwtinterceptor';


export default function Bookmarks() {
    const [bookmarkedTweets, setBookmarkedTweets] = useState([]);
    const accessToken = localStorage.getItem("access token");
    const axiosInstance = useAxiosWithJwtInterceptor();

    const fetchBookmarkedTweets = async () => {
        try {
            const response = await axiosInstance.get('http://localhost:8000/api/bookmarks/', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const tweetsWithAbsoluteUrls = response.data.map(tweet => ({
                ...tweet,
                images: tweet.images.map(image => ({
                    ...image,
                    image: `http://localhost:8000${image.image}`
                }))
            }));
            setBookmarkedTweets(tweetsWithAbsoluteUrls);
        } catch (error) {
            console.error('Error fetching bookmarked tweets', error);
        }
    };

    useEffect(() => {
        fetchBookmarkedTweets();
    }, []);

    const handleBookmarkToggle = (tweetId) => {
        setBookmarkedTweets(prevTweets => prevTweets.filter(tweet => tweet.id !== tweetId));
    };

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2>북마크한 트윗</h2>
            {bookmarkedTweets.length > 0 ? (
                bookmarkedTweets.map(tweet => (
                    <Tweet 
                        key={tweet.id} 
                        tweet={tweet} 
                        refreshTweets={fetchBookmarkedTweets}
                        onBookmarkToggle={() => handleBookmarkToggle(tweet.id)}
                    />
                ))
            ) : (
                <p>북마크한 트윗이 없습니다.</p>
            )}
        </Box>
    );
}
