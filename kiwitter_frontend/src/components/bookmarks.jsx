import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUserContext } from './UserContext';
import Tweet from './tweet';

export default function Bookmarks() {
    const [bookmarkedTweets, setBookmarkedTweets] = useState([]);
    const { user } = useUserContext();
    const authToken = user?.token;

    useEffect(() => {
        const fetchBookmarkedTweets = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/bookmarks/', {
                    headers: { 'Authorization': `Token ${authToken}` }
                });
                setBookmarkedTweets(response.data);
            } catch (error) {
                console.error('Error fetching bookmarked tweets', error);
            }
        };

        fetchBookmarkedTweets();
    }, [authToken]); // authToken을 의존성 배열에 추가하여 토큰 변경 시 새로운 북마크 불러오기

    return (
        <div>
            <h2>북마크한 트윗</h2>
            {bookmarkedTweets.length > 0 ? (
                bookmarkedTweets.map(tweet => (
                    <Tweet key={tweet.id} {...tweet} />
                ))
            ) : (
                <p>북마크한 트윗이 없습니다.</p>
            )}
        </div>
    );
}
