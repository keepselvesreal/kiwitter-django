import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Comment({ comment, authToken, tweetId }) {
    const [replyContent, setReplyContent] = useState('');
    const [replies, setReplies] = useState([]);
    const [nestedReplyContent, setNestedReplyContent] = useState({});

    // 대댓글 목록 불러오기
    useEffect(() => {
        axios.get(`http://localhost:8000/tweets/${tweetId}/comments/${comment.id}/replies/`, {
            headers: { 'Authorization': `Token ${authToken}` }
        })
        .then(response => setReplies(response.data))
        .catch(error => console.error('Error fetching replies', error));
    }, [tweetId, comment.id, authToken]);

    const submitReply = async (parentId) => {
        const content = parentId ? nestedReplyContent[parentId] : replyContent;
        if (!content || content.trim() === '') return;

        try {
            await axios.post(`http://localhost:8000/tweets/${tweetId}/comments/${comment.id}/replies/`, {
                content,
                parent: parentId || null
            }, {
                headers: { 'Authorization': `Token ${authToken}` }
            });
            if (parentId) {
                setNestedReplyContent(prev => ({ ...prev, [parentId]: '' }));
            } else {
                setReplyContent('');
            }
            // 대댓글 목록 갱신 로직 필요
        } catch (error) {
            console.error('Error submitting reply', error);
        }
    };

    return (
        <div>
            <p>{comment.content}</p>
            <input 
                type="text" 
                value={replyContent} 
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="대댓글 작성..."
            />
            <button onClick={() => submitReply(null)}>대댓글 달기</button>
            {/* 대댓글 목록 표시 및 대댓글에 댓글 달기 기능 */}
            {replies.map(reply => (
                <div key={reply.id}>
                    <p>{reply.content}</p>
                    <input 
                        type="text" 
                        value={nestedReplyContent[reply.id] || ''} 
                        onChange={(e) => setNestedReplyContent({...nestedReplyContent, [reply.id]: e.target.value})}
                        placeholder="댓글 작성..."
                    />
                    <button onClick={() => submitReply(reply.id)}>대대댓글 달기</button>
                </div>
            ))}
        </div>
    );
}

export default Comment;

