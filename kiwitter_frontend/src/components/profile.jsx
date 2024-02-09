import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Box, Avatar, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useUserContext } from './UserContext';

import Tweet from './tweet';

const Profile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [comments, setComments] = useState([]);
  const [likedTweets, setLikedTweets] = useState([]);
  const authToken = localStorage.getItem('token'); // user 변수명이 위에서 사용 중이라 일단 브라우저 저장소에서 직접 토큰을 가져옴
  const accessToken = localStorage.getItem("access token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/users/${userId}/`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        setUser(response.data);
        setUsername(response.data.username);
        setShortDescription(response.data.short_description);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUser();
  }, [userId, editMode]);

  useEffect(() => {
      const fetchTweets = async () => {
          const response = await axios.get(`http://localhost:8000/api/user-tweets/`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
          setTweets(response.data);
      };
      const fetchComments = async () => {
          const response = await axios.get(`http://localhost:8000/api/user-comments/`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
          setComments(response.data);
      };
      const fetchLikedTweets = async () => {
          const response = await axios.get(`http://localhost:8000/api/user-liked-tweets/`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
          setLikedTweets(response.data);
      };

      fetchTweets();
      fetchComments();
      fetchLikedTweets();
  }, [userId]);

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('short_description', shortDescription);
    if (profileImage) {
      formData.append('profile_image', profileImage);
    }

    try {
      await axios.patch(`http://localhost:8000/api/users/${userId}/`, formData, {
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setEditMode(false);
      // Optionally re-fetch user data here or use response data to update UI
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  if (!user) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, marginTop: 10}}>
      {editMode ? (
        <Box>
          <TextField variant="outlined" label="Username" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth />
          <TextField variant="outlined" label="Short Description" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} fullWidth multiline rows={4} sx={{ mt: 2 }} />
          <input type="file" onChange={(e) => setProfileImage(e.target.files[0])} style={{ marginTop: '20px' }} />
          <Button variant="contained" onClick={handleSave} sx={{ mt: 2 }}>
            Save
          </Button>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', width: '100%' }}>
          <Avatar src={`http://localhost:8000${user.profile_image}`} alt={user.username} sx={{ width: 70, height: 70, margin: 'auto' }} />
          <Typography variant="h5">{user.username}</Typography>
          <Typography>{user.short_description}</Typography>
          <Button variant="outlined" onClick={() => setEditMode(true)} sx={{ mt: 1 }}>
            Edit Profile
          </Button>
          <Typography sx={{ mt: 1 }}>팔로우 중인 사용자</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
            {user.following_ids.map((followingId, index) => (
              <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar src={`http://localhost:8000/profile_images/${followingId}.jpg`} alt={`User ${followingId}`} sx={{ width: 50, height: 50 }} />
                <Typography sx={{ mt: 0.5 }}>{followingId}</Typography>
              </Box>
            ))}
          </Box>
          <Typography variant="h6">작성 트윗</Typography>
          {tweets.map(tweet => (
              <Tweet key={tweet.id} tweet={tweet} />
          ))}

            <Typography variant="h6">작성 댓글</Typography>
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <React.Fragment key={comment.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={`댓글: ${comment.content}`}
                        secondary={
                          <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            날짜: {new Date(comment.created_at).toLocaleDateString("ko-KR")}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < comments.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="댓글이 없습니다." />
                </ListItem>
              )}
            </List>

            <Typography variant="h6">좋아요 누른 트윗</Typography>
            {likedTweets.map(tweet => (
              <Tweet key={tweet.id} tweet={tweet} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Profile;



