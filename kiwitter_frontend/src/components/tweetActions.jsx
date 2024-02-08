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
    isEditing 
}) {
    return (
        <Box display="flex" justifyContent="space-around" marginY={2}>
            <Button onClick={onLike}>{isLiked ? "좋아요 취소" : "좋아요"}</Button>
            <Button onClick={onBookmark}>{isBookmarked ? "북마크 취소" : "북마크"}</Button>
            <Button onClick={onFollowToggle}>{isFollowing ? "언팔로우" : "팔로우"}</Button>
            {!isEditing && <Button onClick={onEdit}>편집</Button>}
            {isEditing && <Button onClick={onCancelEdit}>취소</Button>}
            {isEditing && <Button onClick={onSaveEdit}>저장</Button>}
            <Button onClick={onDelete} color="error">삭제</Button>
        </Box>
    );
}

export default TweetActions;


