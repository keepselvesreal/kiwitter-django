import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Comment from './comment'; // 컴포넌트 이름 확인 필요

function CommentsSection({ tweetId }) {
    const [comments, setComments] = useState([]);
    const accessToken = localStorage.getItem("access token");

    useEffect(() => {
        fetchComments();
    }, [tweetId]);

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

    // 대댓글 수정 처리 함수
const handleReplyUpdated = (commentId, replyId, updatedContent) => {
    const updatedComments = comments.map(comment => {
        // 해당 댓글을 찾아 대댓글 목록을 업데이트
        if (comment.id === commentId) {
            return {
                ...comment,
                replies: comment.replies.map(reply => {
                    if (reply.id === replyId) {
                        return { ...reply, content: updatedContent };
                    }
                    return reply;
                }),
            };
        }
        return comment;
    });
    setComments(updatedComments);
};

// 대댓글 삭제 처리 함수
const handleReplyDeleted = (commentId, replyId) => {
    const updatedComments = comments.map(comment => {
        // 해당 댓글을 찾아 대댓글 목록에서 삭제
        if (comment.id === commentId) {
            return {
                ...comment,
                replies: comment.replies.filter(reply => reply.id !== replyId),
            };
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



