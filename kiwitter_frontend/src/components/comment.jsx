import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, TextField, Box, Typography } from '@mui/material';

const API_BASE_URL = 'http://localhost:8000';

function Comment({
    comment,
    tweetId,
    depth = 0,
    onCommentDeleted,
    onCommentUpdated,
    onReplyUpdated,
    onReplyDeleted,
    parentId = null
}) {
    const [editMode, setEditMode] = useState(false);
    const [content, setContent] = useState(comment.content);
    const [replyContent, setReplyContent] = useState('');
    const [replies, setReplies] = useState([]);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const currentUser = localStorage.getItem("username");
    const isAuthor = currentUser === comment.author.username;
    const accessToken = localStorage.getItem("access token");

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
    useEffect(() => {
        if (comment.id) {
            fetchReplies();
        }
    }, [comment.id, tweetId]);

    useEffect(() => {
        setContent(comment.content);
        fetchReplies();
    }, [comment]);

    
    const handleAction = async (action) => {
        let url;
        if (action === 'edit' || action === 'delete') {
            if (depth === 0) {
                url = `${API_BASE_URL}/tweets/${tweetId}/comments/${comment.id}/`;
            } else {
                url = `${API_BASE_URL}/tweets/${tweetId}/comments/${parentId}/replies/${comment.id}/`;
            }

            if (action === 'edit') {
                await axios.patch(url, { content }, { headers: { 'Authorization': `Bearer ${accessToken}` } });
                setEditMode(false);
                if (depth === 0) {
                    onCommentUpdated({ ...comment, content });
                } else {
                    // 대댓글 수정을 처리합니다.
                    onReplyUpdated(parentId, { ...comment, id: comment.id, content });
                }
            } else if (action === 'delete') {
                await axios.delete(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
                if (depth === 0) {
                    onCommentDeleted(comment.id);
                } else {
                    // 대댓글 삭제를 처리합니다.
                    onReplyDeleted(parentId, comment.id);
                }
            }
        } else if (action === 'reply') {
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
                <>
                    <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault(); // 폼 제출 방지
                                handleAction('edit');
                            }
                        }}
                        margin="dense"
                    />
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Button size="small" onClick={() => setEditMode(false)}>취소</Button>
                        <Button size="small" onClick={() => handleAction('edit')}>저장</Button>
                    </Box>
                </>
            ) : (
                <>
                    <Typography variant="body1">{comment.content}</Typography>
                    {isAuthor && (
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Button size="small" onClick={() => setEditMode(true)} color="error">수정하기</Button>
                            <Button size="small" onClick={() => handleAction('delete')} color="error">삭제하기</Button>
                        </Box>
                    )}
                </>
            )}
            {showReplyInput && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault(); // 폼 제출 방지
                                handleAction('reply');
                            }
                        }}
                        placeholder="대댓글 작성..."
                        margin="dense"
                        sx={{ mr: 1 }}
                    />
                    <Button onClick={() => handleAction('reply')}>입력</Button>
                    <Button size="small" onClick={() => setShowReplyInput(false)}>취소</Button>
                </Box>
            )}
            {!editMode && !showReplyInput && (
                <Button size="small" onClick={() => setShowReplyInput(true)}>댓글 달기</Button>
            )}
            {replies.map(reply => (
                <Comment
                    key={reply.id}
                    comment={reply}
                    tweetId={tweetId}
                    depth={depth + 1}
                    onCommentDeleted={onCommentDeleted}
                    onCommentUpdated={onCommentUpdated}
                    onReplyUpdated={onReplyUpdated}
                    onReplyDeleted={onReplyDeleted}
                    parentId={comment.id}
                />
            ))}
        </Box>
    );
}

export default Comment;