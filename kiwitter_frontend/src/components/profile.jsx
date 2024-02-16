import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Avatar, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Paper,
  Stack
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

import Tweet from './tweet';
import { useAxiosWithJwtInterceptor } from './jwtinterceptor';


// 스크롤바를 숨기는 스타일
const hiddenScrollbarStyle = {
  '&::-webkit-scrollbar': { display: 'none' },
  scrollbarWidth: 'none', // Firefox용
};

const sectionBoxStyle = {
  p: 2,
  mt: 2,
  width: '80%', // 섹션의 너비를 넉넉하게 설정
  height: '300px', // 섹션의 높이를 고정
  overflowY: 'scroll', // 섹션 내용이 넘칠 경우 스크롤 가능
  // ...hiddenScrollbarStyle,
};


const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  // 프로필 이미지 미리보기 URL 상태
  const [preview, setPreview] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [comments, setComments] = useState([]);
  const [likedTweets, setLikedTweets] = useState([]);
  const [currentPage, setCurrentPage] = useState({ tweets: 1, comments: 1, likedTweets: 1 });
  const accessToken = localStorage.getItem("access token");
  const userId = localStorage.getItem("user_id");
  const axiosInstance = useAxiosWithJwtInterceptor();

  const itemsPerPage = 3; // 한 페이지에 표시할 항목 수
  const commentsPerPage = 5; // 한 페이지에 표시할 댓글의 수

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axiosInstance.get(`http://localhost:8000/api/users/${userId}/`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        setUser(userResponse.data);
        setUsername(userResponse.data.username);
        setShortDescription(userResponse.data.short_description);

        const tweetsResponse = await axiosInstance.get(`http://localhost:8000/api/user-tweets/`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
        setTweets(tweetsResponse.data);

        const commentsResponse = await axiosInstance.get(`http://localhost:8000/api/user-comments/`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
        setComments(commentsResponse.data);

        const likedTweetsResponse = await axiosInstance.get(`http://localhost:8000/api/user-liked-tweets/`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
        setLikedTweets(likedTweetsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [userId, editMode]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.substr(0, 5) === "image") {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('short_description', shortDescription);
    if (profileImage) {
      formData.append('profile_image', profileImage, profileImage.name);
    }

    try {
      await axiosInstance.patch(`http://localhost:8000/api/users/${userId}/`, formData, {
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setEditMode(false);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  useEffect(() => {
    if (profileImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(profileImage);
    } else {
      setPreview(null);
    }
  }, [profileImage]);

  const changePage = (section, pageNumber) => {
    setCurrentPage({ ...currentPage, [section]: pageNumber });
  };

  if (!user) {
    return <Typography>Loading...</Typography>;
  }

  // 페이지 별로 항목을 계산하는 함수
  const getPageItems = (items, page) => items.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // 댓글 페이지 별로 항목을 계산하는 함수입니다.
  const getCommentsPageItems = (items, page) => items.slice((page - 1) * commentsPerPage, page * commentsPerPage);

  // 페이지 번호를 생성하는 함수
  const renderPageNumbers = (items, section, perPage) => {
    if (items.length === 0) return null; // 아이템이 없는 경우 페이지 번호를 렌더링하지 않음
    const pageCount = Math.ceil(items.length / perPage); // 페이지 수 계산
    if (pageCount === 1) return null; // 페이지가 한 개뿐이라면 페이지 번호를 렌더링하지 않음
  
    // 페이지 번호 버튼 생성
    return Array.from({ length: pageCount }, (_, i) => (
      <Button key={i} onClick={() => changePage(section, i + 1)} 
        variant={currentPage[section] === i + 1 ? "contained" : "text"}>
        {i + 1}
      </Button>
    ));
  };  
  

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, marginTop: 5 }}>
      {editMode ? (
        <Stack direction="column" alignItems="center" spacing={2}>
          <Avatar src={preview || user?.profile_image || '기본 이미지 경로'} sx={{ width: 64, height: 64 }} />
          <input accept="image/*" id="icon-button-file" type="file" style={{ display: 'none' }} onChange={handleImageChange} />
          <label htmlFor="icon-button-file">
            <Button variant="outlined" component="span">
              프로필 이미지 변경
            </Button>
          </label>
          <TextField variant="outlined" label="Username" value={username} onChange={(e) => setUsername(e.target.value)} sx={{ width: '75%' }} />
          <TextField variant="outlined" label="Short Description" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} multiline rows={4} sx={{ width: '75%' }} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <LoadingButton variant="contained" onClick={handleSave} sx={{ flexGrow: 1 }}>
              저장
            </LoadingButton>
            <Button variant="contained" onClick={() => setEditMode(false)} sx={{ flexGrow: 1 }}>
              취소
            </Button>
          </Box>
        </Stack>
      ) : (
        <Box sx={{ textAlign: 'center', width: '100%' }}>
          <Avatar src={`http://localhost:8000${user.profile_image}`} alt={user.username} sx={{ width: 70, height: 70, margin: 'auto' }} />
          <Typography variant="h5">{user.username}</Typography>
          <Typography>{user.short_description}</Typography>
          <Button variant="outlined" onClick={() => setEditMode(true)} sx={{ mt: 1 }}>
            프로필 수정
          </Button>
        </Box>
      )}
      {/* Following Users Section */}
      <Typography variant="h5" gutterBottom sx={{ mt: 3, mb: 0, textAlign: 'center', fontWeight: 'bold' }}>팔로우 중인 사용자</Typography>
      <Box component={Paper} elevation={4} sx={{ p: 2, mt: 2, width: '80%', overflowX: 'auto', ...hiddenScrollbarStyle }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {user.following_ids?.map((followingId, index) => (
            <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100 }}>
              <Avatar src={`http://localhost:8000/profile_images/${followingId}.jpg`} alt={`User ${followingId}`} sx={{ width: 50, height: 50 }} />
              <Typography sx={{ mt: 0.5 }}>{followingId}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Tweets, Comments, and Liked Tweets Sections */}
      {['tweets', 'comments', 'likedTweets'].map((section) => (
        <React.Fragment key={section}>
          <Typography variant="h5" gutterBottom sx={{ mt: 5, mb: 0, textAlign: 'center', fontWeight: 'bold' }}>
              {section === 'tweets' ? '작성 트윗' : section === 'comments' ? '작성 댓글' : '좋아요 누른 트윗'}
          </Typography>
          <Box component={Paper} elevation={4} sx={sectionBoxStyle}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}> {/* 트윗 가운데 정렬을 위한 수정 */}
              {section === 'tweets' && getPageItems(tweets, currentPage.tweets).map(tweet => (
                <Box key={tweet.id} sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <Tweet tweet={tweet} />
                </Box>
              ))}
              {section === 'comments' && (
                <List sx={{ width: '100%' }}>
                  {getCommentsPageItems(comments, currentPage.comments).map(comment => (
                    <ListItem key={comment.id} alignItems="flex-start">
                      <ListItemText primary={`댓글: ${comment.content}`} />
                    </ListItem>
                  ))}
                </List>
              )}
              {section === 'likedTweets' && getPageItems(likedTweets, currentPage.likedTweets).map(likedTweet => (
                <Box key={likedTweet.id} sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <Tweet tweet={likedTweet} />
                </Box>
              ))}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
            {section === 'comments'
              ? renderPageNumbers(comments, 'comments', commentsPerPage)
              : section === 'tweets'
                  ? renderPageNumbers(tweets, 'tweets', itemsPerPage)
                  : renderPageNumbers(likedTweets, 'likedTweets', itemsPerPage)}
          </Box>
      </React.Fragment>
      ))}
    </Box>
  );
};

export default Profile;




