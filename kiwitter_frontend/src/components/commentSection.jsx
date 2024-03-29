import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Comment from './comment'; // 컴포넌트 이름 확인 필요

function CommentsSection({ tweetId, commentsUpdated }) {
    const [comments, setComments] = useState([]);
    const accessToken = localStorage.getItem("access token");

    const fetchComments = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/tweets/${tweetId}/comments/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            setComments(response.data);
        } catch (error) {
            console.error('댓글 로딩 중 오류:', error);
        }
    };
    useEffect(() => {
        fetchComments();
    }, [tweetId, commentsUpdated]);

    const handleCommentUpdated = (updatedComment) => {
        const updatedComments = comments.map(comment => {
            if (comment.id === updatedComment.id) {
                return updatedComment;
            }
            return comment;
        });
        setComments(updatedComments);
    };

    const handleCommentDeleted = (deletedCommentId) => {
        // 삭제된 댓글의 ID를 사용하여 comments 상태를 업데이트합니다.
        const updatedComments = comments.filter(comment => comment.id !== deletedCommentId);
        setComments(updatedComments);
    };

    const handleReplyUpdated = (commentId, updatedReply) => {
        const updatedComments = comments.map(comment => {
            if (comment.id === commentId) {
                // replies 배열이 존재하는지 확인하고, 업데이트합니다.
                const updatedReplies = comment.replies ? comment.replies.map(reply => {
                    if (reply.id === updatedReply.id) {
                        return updatedReply;
                    }
                    return reply;
                }) : [];
                return { ...comment, replies: updatedReplies };
            }
            return comment;
        });
        setComments(updatedComments);
    };

    const handleReplyDeleted = (commentId, replyId) => {
        const updatedComments = comments.map(comment => {
            // 대댓글이 포함된 댓글을 찾음
            if (comment.id === commentId) {
                // replies 배열이 존재하는지 확인하고, 없으면 빈 배열로 초기화
                const updatedReplies = comment.replies ? comment.replies.filter(reply => reply.id !== replyId) : [];
                return { ...comment, replies: updatedReplies };
            }
            return comment;
        });
        setComments(updatedComments);
    };

    
    return (
        <div>
            {comments.map(comment => (
                <Comment
                    key={comment.id}
                    comment={comment}
                    tweetId={tweetId}
                    onCommentDeleted={handleCommentDeleted}
                    onCommentUpdated={handleCommentUpdated}
                    onReplyUpdated={handleReplyUpdated}
                    onReplyDeleted={handleReplyDeleted}
                />
            ))}
        </div>
    );
}

export default CommentsSection;



