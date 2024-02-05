import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Comment from './comment'; // 가정: Comment 컴포넌트가 별도 파일로 분리되어 있음
import { Card, CardContent, Box, Typography, TextField, Button } from '@mui/material';
import Avatar from '@mui/material/Avatar';


function Tweet({ author, content, id }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTweet, setEditedTweet] = useState(content);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState([]);
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false); // 팔로우 상태

    const authToken = localStorage.getItem('token'); // localStorage에서 토큰 가져오기
    
    const authorName = author ? author.username : 'Unknown';
    const profileImageUrl = author ? author.profileImageUrl : ''; // 유저 프로필 이미지 URL을 이 변수에 할당
    

    const onDelete = async () => {
        if (window.confirm("Are you sure you want to delete this tweet?")) {
            await axios.delete(`http://localhost:8000/tweets/${id}/`, {
                headers: { 'Authorization': `Token ${authToken}` }
            });
        }
    };

    const onEdit = () => {
        setIsEditing(true);
    };

    const saveEdit = async () => {
        await axios.patch(`http://localhost:8000/tweets/${id}/`, {
            content: editedTweet,
        }, {
            headers: { 'Authorization': `Token ${authToken}` }
        });
        setIsEditing(false);
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditedTweet(content);
    };

    const submitComment = async () => {
        if (!newComment.trim()) return;

        try {
            await axios.post(`http://localhost:8000/tweets/${id}/comments/`, {
                content: newComment,
            }, {
                headers: { 'Authorization': `Token ${authToken}` }
            });
            setNewComment('');
            // 댓글 목록 갱신 로직 추가
        } catch (error) {
            console.error('Error submitting comment', error);
        }
    };

    function linkifyHashtags(text) {
        return text.split(/(\s+)/).map(part => {
            if (part.startsWith('#')) {
                return <a href={`#hashtag/${part.substring(1)}`}>{part}</a>;
            }
            return part;
        });
    }

    // '댓글 달기' 버튼 클릭 핸들러
    const toggleCommentInput = () => {
        setShowCommentInput(!showCommentInput);
    };

    const handleCommentDeleted = (deletedCommentId) => {
        // 상태 업데이트 또는 다른 로직으로 삭제된 댓글 처리
        console.log(`Deleted comment ID: ${deletedCommentId}`);
      };

      const handleFollow = async () => {
        try {
            const response = await axios.post(`http://localhost:8000/api/follow/${author.id}/`, {}, {
                headers: { 'Authorization': `Token ${authToken}` }
            });
            if (response.status === 201) {
                setIsFollowing(true); // 팔로우 성공
            }
        } catch (error) {
            console.error('Follow action failed:', error);
        }
    };
    
    const handleUnfollow = async () => {
        try {
            const response = await axios.post(`http://localhost:8000/api/unfollow/${author.id}/`, {}, {
                headers: { 'Authorization': `Token ${authToken}` }
            });
            if (response.status === 204) {
                setIsFollowing(false); // 언팔로우 성공
            }
        } catch (error) {
            console.error('Unfollow action failed:', error);
        }
    };

    useEffect(() => {
        if (showComments) {
            axios.get(`http://localhost:8000/tweets/${id}/comments/`, {
                headers: { 'Authorization': `Token ${authToken}` }
            })
            .then(response => setComments(response.data))
            .catch(error => console.error('Error fetching comments', error));
        }
    }, [showComments, id, authToken]);

    const toggleComments = () => {
        setShowComments(!showComments);
    };

    return (
        <Card sx={{ marginBottom: 2 }}>
            <CardContent>
                {isEditing ? (
                    <Box>
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            value={editedTweet}
                            onChange={(e) => setEditedTweet(e.target.value)}
                        />
                        <Button onClick={saveEdit}>Save</Button>
                        <Button onClick={cancelEdit}>Cancel</Button>
                    </Box>
                ) : (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={isFollowing ? handleUnfollow : handleFollow}
                                sx={{ marginRight: 'auto' }}
                            >
                                {isFollowing ? '언팔로우' : '팔로우'}
                            </Button>
                        </Box>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                            <Avatar src={profileImageUrl} sx={{ width: 32, height: 32, marginRight: 1 }} />
                            {/* 유저 프로필 이미지 표시 */}
                            <Typography variant="h6">{authorName}</Typography>
                            </Box>
                            {/* 나머지 컴포넌트 로직은 변경 없음 */}
                        </CardContent>
                        <Typography variant="body1">{linkifyHashtags(content)}</Typography>
                        <Button onClick={onDelete}>Delete</Button>
                        <Button onClick={onEdit}>Edit</Button>
                        <Button onClick={toggleComments}>{showComments ? '댓글 숨기기' : '댓글 보기'}</Button>
                        <Button onClick={toggleCommentInput}>{showCommentInput ? '취소' : '댓글 달기'}</Button>
                        {showCommentInput && (
                            <Box>
                                <TextField
                                    fullWidth
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="댓글 작성..."
                                />
                                <Button onClick={submitComment}>입력</Button>
                            </Box>
                        )}
                        {showComments && (
                            <Box>
                                {comments.map(comment => (
                                    <Comment 
                                        key={comment.id} 
                                        comment={comment} 
                                        authToken={authToken} 
                                        tweetId={id} 
                                        currentUser={author} 
                                        onCommentDeleted={handleCommentDeleted} 
                                    />
                                ))}
                            </Box>
                        )}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}

export default Tweet;


