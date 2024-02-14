import React from 'react';
import { Button, Box } from '@mui/material';

function TweetActions({ 
    isLiked, 
    isBookmarked, 
    isFollowing, 
    onLike, 
    onBookmark, 
    onFollowToggle, 
    onEdit, 
    onCancelEdit, 
    onSaveEdit, 
    onDelete, 
    isEditing,
    currentUser,
    tweetAuthor
}) {
    const showEditDeleteButtons = currentUser === tweetAuthor;
    const showFollowButton = currentUser !== tweetAuthor;

    return (
        <Box display="flex" justifyContent="space-around" marginY={2}>
            <Button onClick={onLike}>{isLiked ? "좋아요 취소" : "좋아요"}</Button>
            <Button onClick={onBookmark}>{isBookmarked ? "북마크 취소" : "북마크"}</Button>
            {showFollowButton && <Button onClick={onFollowToggle}>{isFollowing ? "언팔로우" : "팔로우"}</Button>}
            {showEditDeleteButtons && !isEditing && <Button onClick={onEdit} color="error">편집</Button>}
            {showEditDeleteButtons && isEditing && <Button onClick={onCancelEdit}>취소</Button>}
            {showEditDeleteButtons && isEditing && <Button onClick={onSaveEdit}>저장</Button>}
            {showEditDeleteButtons && <Button onClick={onDelete} color="error">삭제</Button>}
        </Box>
    );
}

export default TweetActions;


