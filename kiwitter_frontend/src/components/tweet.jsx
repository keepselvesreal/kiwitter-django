import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Avatar, Box, TextField } from '@mui/material';
import TweetActions from './tweetActions';
import CommentsSection from './commentSection';
import axios from 'axios';

function Tweet({ tweet, onTweetUpdate, refreshTweets, onTweetDelete, onLike, onBookmark, onFollow, onUnfollow }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(tweet.content);
    const [tweetData, setTweetData] = useState(tweet);
    const [showComments, setShowComments] = useState(false);
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [comments, setComments] = useState([]); // 댓글 목록 상태 추가
    const [newComment, setNewComment] = useState("");
    const handleNewCommentChange = (e) => setNewComment(e.target.value);
    const [likesCount, setLikesCount] = useState(tweet.likesCount || 0); // 좋아요 수 상태 추가
    const [isLiked, setIsLiked] = useState(tweet.isLiked);
    const [isBookmarked, setIsBookmarked] = useState(tweet.isBookmarked);
    const [isFollowing, setIsFollowing] = useState(tweet.isFollowing);
    const accessToken = localStorage.getItem("access token");
    const authorUsername = tweet.author.username;

    // 편집 모드 진입 처리
    const handleEditClick = () => {
        setIsEditing(true);
    };

    // 편집 취소 처리
    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditContent(tweet.content); // 편집 내용을 원래대로 리셋
    };

    // 편집 저장 처리
    const handleSaveEdit = async () => {
        try {
            const response = await axios.patch(`http://localhost:8000/tweets/${tweetData.id}/`, { content: editContent }, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            setTweetData({...tweetData, content: editContent}); // 수정된 내용으로 tweetData 상태 업데이트
            setIsEditing(false); // 편집 모드 종료
            onTweetUpdate(tweetData.id, editContent); // 상위 컴포넌트의 업데이트 함수 호출 (필요한 경우)
        } catch (error) {
            console.error('트윗 수정 중 오류 발생:', error);
        }
    };

    // TextField 내용 업데이트 처리
    const handleContentChange = (e) => {
        setEditContent(e.target.value);
    };

    // 트윗 수정 로직
    const handleTweetEdit = async (newContent) => {
        try {
            const response = await axios.patch(`http://localhost:8000/tweets/${tweetData.id}/`, { content: newContent }, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            setTweetData({...tweetData, content: response.data.content});
            setIsEditing(false); // 편집 모드 종료
        } catch (error) {
            console.error('트윗 수정 중 오류 발생:', error);
        }
    };

    // 트윗 삭제 로직
    const handleTweetDelete = async () => {
        try {
            await axios.delete(`http://localhost:8000/tweets/${tweetData.id}/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            // refreshTweets 함수를 호출하여 트윗 목록을 갱신
            refreshTweets(); // 이렇게 하면 트윗 목록이 새로고침됩니다.
        } catch (error) {
            console.error('트윗 삭제 중 오류 발생:', error);
        }
    };



    // 좋아요 토글
    const handleLike = async () => {
        try {
            await axios.post(`http://localhost:8000/api/tweets/${tweet.id}/toggle_like/`, {}, { headers: { 'Authorization': `Bearer ${accessToken}` }});
            setIsLiked(!isLiked);
            // 좋아요 수 업데이트 등 추가 작업 필요
        } catch (error) {
            console.error('좋아요 처리 중 오류:', error);
        }
    };

    // 북마크 토글
    const handleBookmark = async () => {
        try {
            await axios.post(`http://localhost:8000/api/tweets/${tweet.id}/toggle_bookmark/`, {}, { headers: { 'Authorization': `Bearer ${accessToken}` }});
            setIsBookmarked(!isBookmarked);
        } catch (error) {
            console.error('북마크 처리 중 오류:', error);
        }
    };

    // 팔로우/언팔로우 토글
    const handleFollowToggle = async () => {
        const url = isFollowing ? `http://localhost:8000/api/unfollow/${tweet.authorId}/` : `http://localhost:8000/api/follow/${tweet.authorId}/`;
        try {
            await axios.post(url, {}, { headers: { 'Authorization': `Bearer ${accessToken}` }});
            setIsFollowing(!isFollowing);
        } catch (error) {
            console.error(isFollowing ? '언팔로우 처리 중 오류:' : '팔로우 처리 중 오류:', error);
        }
    };   

    // 댓글 달기 기능 구현
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await axios.post(`http://localhost:8000/tweets/${tweet.id}/comments/`, { content: newComment }, { headers: { 'Authorization': `Bearer ${accessToken}` }});
            setNewComment("");
            setShowCommentInput(false); // 댓글 달기 후 입력 필드 숨김
            // TODO: 댓글 목록 갱신 로직 필요
        } catch (error) {
            console.error('댓글 달기 중 오류:', error);
        }
    };

    useEffect(() => {
        // 댓글 목록 초기 로딩
        const fetchComments = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/tweets/${tweet.id}/comments/`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                });
                setComments(response.data);
            } catch (error) {
                console.error('댓글 로딩 중 오류:', error);
            }
        };
        if(showComments) fetchComments();
    }, [showComments, tweet.id]); // 댓글 보기 상태 변경 시 댓글 목록 갱신

    return (
        <Card sx={{ marginBottom: 2 }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Avatar src={tweet.authorProfileImageUrl} alt="Author" />
                    <Typography variant="body1">{authorUsername}</Typography>
                </Box>
                {isEditing ? (
                    <TextField
                        fullWidth
                        multiline
                        value={editContent} // 수정 필요: value={editContent}로 변경
                        onChange={handleContentChange} // 수정 필요: 이벤트 핸들러 수정
                        margin="dense"
                    />
                ) : (
                    <Typography>{tweetData.content}</Typography>
                )}
                <TweetActions
                    isLiked={isLiked}
                    isBookmarked={isBookmarked}
                    isFollowing={isFollowing}
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                    onFollowToggle={handleFollowToggle}
                    onEdit={handleEditClick}
                    onCancelEdit={handleCancelEdit}
                    onSaveEdit={handleSaveEdit} // 수정 필요: onSaveEdit에 handleSaveEdit 연결
                    isEditing={isEditing}
                    onDelete={() => handleTweetDelete(tweet.id)}
                />
                <Box>
                    <Button onClick={() => setShowCommentInput(!showCommentInput)}>{showCommentInput ? "취소" : "댓글 달기"}</Button>
                    {showCommentInput && (
                        <Box>
                            <TextField fullWidth value={newComment} onChange={handleNewCommentChange} placeholder="댓글을 입력하세요" />
                            <Button onClick={handleCommentSubmit}>입력</Button>
                        </Box>
                    )}
                    <Button onClick={() => setShowComments(!showComments)}>{showComments ? "댓글 숨기기" : "댓글 보기"}</Button>
                    {showComments && <CommentsSection tweetId={tweet.id} />}
                </Box>
            </CardContent>
        </Card>
    );
}

export default Tweet;

