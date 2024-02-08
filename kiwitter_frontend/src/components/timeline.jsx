import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Tweet from './tweet'; // 수정된 Tweet 컴포넌트 임포트

function TimeLine() {
    const [tweets, setTweets] = useState([]);
    const accessToken = localStorage.getItem("access token"); // 사용자 인증을 위한 토큰

    // TODO: 핸들러 모듈화?

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

    const refreshTweets = () => fetchTweets();

    // 트윗 수정 핸들러
    const handleTweetUpdate = async (tweetId, updatedContent) => {
        try {
            await axios.patch(`http://localhost:8000/tweets/${tweetId}/`, { content: updatedContent }, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            refreshTweets(); // 변경사항 반영을 위해 트윗 목록 다시 불러오기
        } catch (error) {
            console.error('트윗 수정 중 오류 발생:', error);
        }
    };

    // 트윗 삭제 핸들러
    const handleTweetDelete = async (tweetId) => {
        try {
            await axios.delete(`http://localhost:8000/tweets/${tweetId}/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            refreshTweets(); // 변경사항 반영을 위해 트윗 목록 다시 불러오기
        } catch (error) {
            console.error('트윗 삭제 중 오류 발생:', error);
        }
    };

    const handleLike = async (tweetId) => {
        try {
            await axios.post(`http://localhost:8000/api/tweets/${tweetId}/toggle_like/`, {}, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            fetchTweets(); // 좋아요 상태 변경 후 트윗 목록 다시 불러오기
        } catch (error) {
            console.error('좋아요 처리 중 오류 발생:', error);
        }
    };

    const handleBookmark = async (tweetId) => {
        try {
            await axios.post(`http://localhost:8000/api/tweets/${tweetId}/toggle_bookmark/`, {}, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            fetchTweets(); // 북마크 상태 변경 후 트윗 목록 다시 불러오기
        } catch (error) {
            console.error('북마크 처리 중 오류 발생:', error);
        }
    };

    const handleFollow = async (authorId) => {
        try {
            await axios.post(`http://localhost:8000/api/follow/${authorId}/`, {}, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            fetchTweets(); // 팔로우 상태 변경 후 트윗 목록(또는 필요한 데이터) 다시 불러오기
        } catch (error) {
            console.error('팔로우 처리 중 오류 발생:', error);
        }
    };

    const handleUnfollow = async (authorId) => {
        try {
            await axios.post(`http://localhost:8000/api/unfollow/${authorId}/`, {}, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            fetchTweets(); // 언팔로우 상태 변경 후 트윗 목록(또는 필요한 데이터) 다시 불러오기
        } catch (error) {
            console.error('언팔로우 처리 중 오류 발생:', error);
        }
    };

    return (
        <div>
            {tweets.map(tweet => (
                <Tweet
                    key={tweet.id}
                    tweet={tweet}
                    refreshTweets={refreshTweets}
                    onTweetUpdate={handleTweetUpdate}
                    // onTweetDelete={handleTweetDelete}
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                    onFollow={handleFollow}
                    onUnfollow={handleUnfollow}
                />
            ))}
        </div>
    );
}

export default TimeLine;

