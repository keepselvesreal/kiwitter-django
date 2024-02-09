import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Tweet from './tweet';

export default function Bookmarks() {
    const [bookmarkedTweets, setBookmarkedTweets] = useState([]);
    const userId = localStorage.getItem("user_id");
    const accessToken = localStorage.getItem("access token");

    useEffect(() => {
        const fetchBookmarkedTweets = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/bookmarks/', {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                // 이미지 URL을 절대 경로로 변환하는 로직을 추가합니다.
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

        fetchBookmarkedTweets();
    }, [userId]);

    return (
        <div>
            <h2>북마크한 트윗</h2>
            {bookmarkedTweets.length > 0 ? (
                bookmarkedTweets.map(tweet => (
                    <Tweet key={tweet.id} tweet={tweet} />
                ))
            ) : (
                <p>북마크한 트윗이 없습니다.</p>
            )}
        </div>
    );
}
