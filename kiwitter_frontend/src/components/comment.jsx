import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, TextField, Box, Typography } from '@mui/material';

function Comment({ comment, authToken, tweetId, depth = 0, currentUser, onCommentDeleted }) {
    const [editMode, setEditMode] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [replyContent, setReplyContent] = useState('');
    const [replies, setReplies] = useState([]);
    const [showReplyInput, setShowReplyInput] = useState(false);

    const isAuthor = currentUser && currentUser.username === comment.author.username;

    useEffect(() => {
        axios.get(`http://localhost:8000/tweets/${tweetId}/comments/${comment.id}/replies/`, {
            headers: { 'Authorization': `Token ${authToken}` },
        }).then(response => {
            setReplies(response.data);
        }).catch(error => {
            console.error('Error fetching replies', error);
        });
    }, [tweetId, comment.id, authToken]);

    const handleEdit = () => {
        console.log("currentUser: ", currentUser)
        setEditMode(true);
    };

    const handleDelete = async () => {
        console.log("comment: ", comment)
        const endpoint = depth === 0 
            ? `/tweets/${tweetId}/comments/${comment.id}/` 
            : `/tweets/${tweetId}/comments/${comment.parent}/replies/${comment.id}/`;
        try {
            await axios.delete(`http://localhost:8000${endpoint}`, {
                headers: { 'Authorization': `Token ${authToken}` },
            });
            onCommentDeleted(comment.id);
        } catch (error) {
            console.error('Error deleting comment', error);
        }
    };
    
    const handleSaveEdit = async () => {
        const endpoint = depth === 0 
            ? `/tweets/${tweetId}/comments/${comment.id}/` 
            : `/tweets/${tweetId}/comments/${comment.parent}/replies/${comment.id}/`;
        try {
            await axios.patch(`http://localhost:8000${endpoint}`, {
                content: editContent,
            }, {
                headers: { 'Authorization': `Token ${authToken}` },
            });
            setEditMode(false);
            comment.content = editContent;
        } catch (error) {
            console.error('Error updating comment', error);
        }
    };

    const submitReply = async (parent = null) => {
        try {
            await axios.post(`http://localhost:8000/tweets/${tweetId}/comments/${comment.id}/replies/`, {
                content: replyContent,
                parent: parent,
            }, {
                headers: { 'Authorization': `Token ${authToken}` },
            });
            setReplyContent('');
            setShowReplyInput(false);
            // Optionally refresh replies here...
        } catch (error) {
            console.error('Error submitting reply', error);
        }
    };

    return (
        <Box sx={{ mt: 2, ml: depth * 2 }}>
            {editMode ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        margin="dense"
                        sx={{ mr: 1 }}
                    />
                    <Button variant="contained" color="primary" size="small" onClick={handleSaveEdit}>
                        저장
                    </Button>
                </Box>
            ) : (
                <>
                    <Typography variant="body1">{comment.content}</Typography>
                    {isAuthor && (
                        <>
                            <Button size="small" onClick={handleEdit}>수정하기</Button>
                            <Button size="small" onClick={handleDelete} sx={{ ml: 1 }}>삭제하기</Button>
                        </>
                    )}
                </>
            )}
            <Typography variant="body2" sx={{ cursor: 'pointer', color: 'blue', display: 'inline', ml: 1 }} onClick={() => setShowReplyInput(!showReplyInput)}>
                댓글 달기
            </Typography>
            {showReplyInput && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="대댓글 작성..."
                        margin="dense"
                        sx={{ mr: 1 }}
                    />
                    <Button variant="contained" color="primary" size="small" onClick={() => submitReply()}>
                        입력
                    </Button>
                </Box>
            )}
            {replies.map(reply => (
                <Comment key={reply.id} comment={reply} authToken={authToken} tweetId={tweetId} depth={depth + 1} currentUser={currentUser} onCommentDeleted={onCommentDeleted} />
            ))}
        </Box>
    );
}

export default Comment;




