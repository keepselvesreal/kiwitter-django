import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const getAuthHeaders = (accessToken) => ({
  headers: { 'Authorization': `Bearer ${accessToken}` },
});

export const updateTweet = async (tweetId, content, accessToken) => {
  return await axios.patch(`${API_URL}/tweets/${tweetId}/`, { content }, getAuthHeaders(accessToken));
};

export const deleteTweet = async (tweetId, accessToken) => {
  return await axios.delete(`${API_URL}/tweets/${tweetId}/`, getAuthHeaders(accessToken));
};

export const addComment = async (tweetId, content, accessToken) => {
  return await axios.post(`${API_URL}/tweets/${tweetId}/comments/`, { content }, getAuthHeaders(accessToken));
};

export const fetchLikesCount = async (tweetId, accessToken) => {
  const response = await axios.get(`${API_URL}/tweets/${tweetId}/likes/count/`, getAuthHeaders(accessToken));
  return response.data.likes_count;
};

export const toggleLikeStatus = async (tweetId, accessToken) => {
  return await axios.post(`${API_URL}/tweets/${tweetId}/toggle_like/`, {}, getAuthHeaders(accessToken));
};

export const toggleBookmarkStatus = async (tweetId, accessToken) => {
  return await axios.post(`${API_URL}/tweets/${tweetId}/toggle_bookmark/`, {}, getAuthHeaders(accessToken));
};

export const toggleFollowStatus = async (userId, isFollowing, accessToken) => {
  const url = isFollowing ? `${API_URL}/unfollow/${userId}/` : `${API_URL}/follow/${userId}/`;
  return await axios.post(url, {}, getAuthHeaders(accessToken));
};

export const fetchCommentsCount = async (tweetId, accessToken) => {
  const response = await axios.get(`${API_URL}/tweets/${tweetId}/comments-count/`, getAuthHeaders(accessToken));
  return response.data.comments_count;
};
