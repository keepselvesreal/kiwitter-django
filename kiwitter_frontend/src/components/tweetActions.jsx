import React from 'react';
import { Button, Box, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
function TweetActions({ 
    isLiked, 
    isBookmarked, 
    isFollowing, 
    onLike, 
    likeCounts,
    onBookmark, 
    onFollowToggle, 
    onEdit, 
    onCancelEdit, 
    onSaveEdit, 
    onDelete, 
    isEditing,
    tweetAuthor
}) {
    const currentUser = localStorage.getItem("username");
    const showEditDeleteButtons = currentUser === tweetAuthor;
    const showFollowButton = currentUser !== tweetAuthor;

    return (
        <Box display="flex" justifyContent="space-around" marginY={2}>
            <Box>
                <IconButton color="secondary">
                    <FavoriteIcon color="error" />
                </IconButton>
                <span>{likeCounts}</span>
            </Box>
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


