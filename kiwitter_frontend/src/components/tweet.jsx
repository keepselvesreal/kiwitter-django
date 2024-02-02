import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Comment from './comment'; // 가정: Comment 컴포넌트가 별도 파일로 분리되어 있음

function Tweet({ author, content, id }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTweet, setEditedTweet] = useState(content);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState([]);
    const authToken = localStorage.getItem('token'); // localStorage에서 토큰 가져오기
    
    const authorName = author ? author.username : 'Unknown';

    const onDelete = async () => {
        if (window.confirm("Are you sure you want to delete this tweet?")) {
            await axios.delete(`http://localhost:8000/tweets/${id}/comments/`, {
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
        <div>
            {isEditing ? (
                <div>
                    <textarea value={editedTweet} onChange={(e) => setEditedTweet(e.target.value)} />
                    <button onClick={saveEdit}>Save</button>
                    <button onClick={cancelEdit}>Cancel</button>
                </div>
            ) : (
                <div>
                    <p>{authorName}</p>
                    <p>{linkifyHashtags(content)}</p>
                    <button onClick={onDelete}>Delete</button>
                    <button onClick={onEdit}>Edit</button>
                    <button onClick={toggleComments}>{showComments ? '댓글 숨기기' : '댓글'}</button>
                    {showComments && (
                        <div>
                            <input 
                                type="text" 
                                value={newComment} 
                                onChange={(e) => setNewComment(e.target.value)} 
                                placeholder="댓글 작성..."
                            />
                            <button onClick={submitComment}>댓글 달기</button>
                            {comments.map(comment => (
                                <Comment 
                                    key={comment.id} 
                                    comment={comment}
                                    authToken={authToken}
                                    tweetId={id}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Tweet;


