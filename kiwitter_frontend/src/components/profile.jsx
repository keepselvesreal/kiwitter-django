import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Box, Avatar, Typography } from '@mui/material';

const Profile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/users/${userId}/`, {
          headers: { 'Authorization': `Token ${localStorage.getItem('token')}` }
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
          'Authorization': `Token ${localStorage.getItem('token')}`,
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
          <Typography sx={{ mt: 1 }}>팔로우 중인 사용자 아이디: {user.following_ids.join(', ')}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Profile;



