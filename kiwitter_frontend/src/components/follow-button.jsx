import React, { useState } from 'react';
import axios from 'axios';

const FollowButton = ({ userId }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const authToken = localStorage.getItem('token');

  const handleFollow = async () => {
    try {
      await axios.post(`http://127.0.0.1:8000/api/follow/${userId}/`, {}, {
        headers: { 'Authorization': `Token ${authToken}` }
      });
      setIsFollowing(true);
    } catch (error) {
      console.error("Follow error:", error);
    }
  };

  const handleUnfollow = async () => {
    try {
      await axios.post(`http://127.0.0.1:8000/api/unfollow/${userId}/`, {}, {
        headers: { 'Authorization': `Token ${authToken}` }
      });
      setIsFollowing(false);
    } catch (error) {
      console.error("Unfollow error:", error);
    }
  };

  return (
    <button onClick={isFollowing ? handleUnfollow : handleFollow}>
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
};

export default FollowButton;
