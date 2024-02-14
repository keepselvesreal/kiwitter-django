import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider } from '@mui/material';
import axios from 'axios';

// 사용자 추천 목록 컴포넌트
const WhoToFollow = () => {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const accessToken = localStorage.getItem('access token');

  // 팔로우/언팔로우 상태 토글 함수
  const toggleFollow = async (userId, isCurrentlyFollowing) => {
    // 팔로우 또는 언팔로우 요청 URL 설정
    const url = isCurrentlyFollowing
      ? `http://localhost:8000/api/unfollow/${userId}/`
      : `http://localhost:8000/api/follow/${userId}/`;
    
    try {
      await axios.post(url, {}, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      // 상태를 업데이트하여 UI에 반영
      setSuggestedUsers(suggestedUsers.map(user => {
        if (user.id === userId) {
          return { ...user, isFollowing: !isCurrentlyFollowing };
        }
        return user;
      }));
    } catch (error) {
      console.error('팔로우/언팔로우 처리 중 오류 발생:', error);
    }
  };

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/recommend-users/', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        // 서버에서 isFollowing 정보를 받아온다고 가정하고 설정합니다.
        setSuggestedUsers(response.data.map(user => ({
          ...user,
          isFollowing: user.isFollowing
        })));
      } catch (error) {
        console.error('추천 사용자 목록을 가져오는데 실패했습니다:', error);
      }
    };

    fetchSuggestedUsers();
  }, []);

  return (
    <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
      <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
        Who to follow
      </Typography>
      <List dense={true}>
        {suggestedUsers.map((user) => (
          <React.Fragment key={user.id}>
            <ListItem
              secondaryAction={
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => toggleFollow(user.id, user.isFollowing)}
                >
                  {user.isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
              }
            >
              <ListItemAvatar>
                <Avatar
                  alt={`Avatar n°${user.id}`}
                  src={user.profileImageUrl}
                />
              </ListItemAvatar>
              <ListItemText primary={user.username} />
            </ListItem>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default WhoToFollow;

