import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, TextField, Box, Typography } from '@mui/material';

const API_BASE_URL = 'http://localhost:8000';

function Comment({ comment, tweetId, depth = 0, onCommentDeleted, onCommentUpdated, parentId  }) {
    const [editMode, setEditMode] = useState(false);
    const [content, setContent] = useState(comment.content);
    const [replyContent, setReplyContent] = useState('');
    const [replies, setReplies] = useState([]);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const currentUser = localStorage.getItem("username");
    const isAuthor = currentUser === comment.author.username;
    const accessToken = localStorage.getItem("access token");

    useEffect(() => {
        if (comment.id) {
            fetchReplies();
        }
    }, [comment.id, tweetId]);

    // 댓글이나 대댓글의 내용이 부모 컴포넌트로부터 변경될 때마다 업데이트됩니다.
    useEffect(() => {
        setContent(comment.content);
        fetchReplies(); // 댓글 내용이 변경될 때 대댓글도 다시 로드합니다.
    }, [comment]);


    const fetchReplies = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/tweets/${tweetId}/comments/${comment.id}/replies/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            setReplies(response.data);
        } catch (error) {
            console.error('Error fetching replies', error);
        }
    };

    const handleAction = async (action) => {
        let url;
        if (action === 'edit' || action === 'delete') {
            // depth를 기준으로 대댓글 처리를 분기합니다.
            if (depth === 0) {
                // 최상위 댓글의 경우
                url = `${API_BASE_URL}/tweets/${tweetId}/comments/${comment.id}/`;
            } else {
                // 대댓글의 경우 parentId를 사용합니다.
                url = `${API_BASE_URL}/tweets/${tweetId}/comments/${parentId}/replies/${comment.id}/`;
            }

            if (action === 'edit') {
                await axios.patch(url, { content }, { headers: { 'Authorization': `Bearer ${accessToken}` } });
                setEditMode(false);
                onCommentUpdated({ ...comment, content }); // 수정된 내용을 상위 컴포넌트로 전달
            } else {
                await axios.delete(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
                onCommentDeleted(comment.id);
            }
        } else if (action === 'reply') {
            // 댓글에 대한 답글 처리
            url = `${API_BASE_URL}/tweets/${tweetId}/comments/${comment.id}/replies/`;
            await axios.post(url, { content: replyContent }, { headers: { 'Authorization': `Bearer ${accessToken}` } });
            setReplyContent('');
            setShowReplyInput(false);
            fetchReplies();
        }
    };
    

    return (
        <Box sx={{ mt: 2, ml: depth * 2 }}>
            {editMode ? (
                <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    margin="dense"
                    sx={{ mb: 1 }}
                />
            ) : (
                <Typography variant="body1">{comment.content}</Typography>
            )}
            {isAuthor && (
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    {editMode ? (
                        <>
                            <Button size="small" onClick={() => setEditMode(false)}>취소</Button>
                            <Button size="small" onClick={() => handleAction('edit')}>저장</Button>
                        </>
                    ) : (
                        <>
                            <Button size="small" onClick={() => setEditMode(true)}>수정하기</Button>
                            <Button size="small" onClick={() => handleAction('delete')}>삭제하기</Button>
                        </>
                    )}
                </Box>
            )}
            <Button size="small" onClick={() => setShowReplyInput(!showReplyInput)}>댓글 달기</Button>
            {showReplyInput && (
                <Box sx={{ display: 'flex', mt: 1 }}>
                    <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="대댓글 작성..."
                        margin="dense"
                    />
                    <Button onClick={() => handleAction('reply')}>입력</Button>
                </Box>
            )}
            {replies.map(reply => (
                <Comment key={reply.id} comment={reply} tweetId={tweetId} depth={depth + 1} onCommentDeleted={onCommentDeleted} onCommentUpdated={onCommentUpdated} parentId={comment.id} />
            ))}
        </Box>
    );
}

export default Comment;








