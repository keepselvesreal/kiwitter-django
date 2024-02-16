import React, { useState, useRef } from 'react';
import { Box, TextField, Button, Select, MenuItem, FormControl, InputLabel, Paper } from '@mui/material';
import { generatePrompt, generateImage } from "./ImageGeneration";


function TweetForm({ addTweet }) {
  const [message, setMessage] = useState('');
  const [images, setImages] = useState([]); // 사용자가 선택한 이미지 파일들
  const [imagePreviews, setImagePreviews] = useState([]); // 선택한 이미지의 미리보기 URL들
  const fileInputRef = useRef();
  const [genre, setGenre] = useState('animation');
  const genres = ['animation', 'Pop Art', 'Minimal Line Art', 'Street Art', 'Splatter Paint', 'cartoon', 'Blog Illustration'];
  const accessToken = localStorage.getItem("access token");

  // 폼 제출 처리: 새 트윗 게시
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('content', message);
    images.forEach(file => formData.append('images', file));

    try {
      const response = await fetch('http://localhost:8000/tweets/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` },
        body: formData,
      });

      if (response.ok) {
        const newTweet = await response.json();
        addTweet(newTweet);
        resetForm(); // 폼 초기화
      } else {
        console.error('트윗 추가 실패');
      }
    } catch (error) {
      console.error('트윗 제출 중 오류:', error);
    }
  };

  // 폼 상태 초기화
  const resetForm = () => {
    setMessage('');
    setImages([]);
    setImagePreviews([]);
  };

  // 이미지 파일 선택 처리 및 미리보기 생성
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const newImagePreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...selectedFiles]);
    setImagePreviews(prev => [...prev, ...newImagePreviews]);
  };

  // 선택한 이미지 제거
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  // 입력 메시지 또는 AI 생성 프롬프트를 기반으로 이미지 생성 및 추가
  const generateAndAddImage = async (useAI = false) => {
    const prompt = useAI ? await generatePrompt(message, genre) : message;
    const imageUrl = await generateImage(prompt);
    if (imageUrl) {
      setImagePreviews(prev => [...prev, imageUrl]);
    }
  };

  return (
    <Paper elevation={3} 
    sx={{ 
      width: '100%', 
      maxWidth: 500, 
      p: 3, 
      flexGrow: 0,
      borderRadius: '16px',
      }}
    >
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="메시지를 입력하세요..."
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { // shift + enter는 줄바꿈을 위해 예외 처리
                e.preventDefault(); // 폼 제출 방지
                handleSubmit(e);
              }
            }}
            variant="outlined"
            margin="normal"
          />
          {imagePreviews.map((preview, index) => (
            <Box key={index} sx={{ textAlign: 'center', mt: 2 }}>
              <img src={preview} alt="미리보기" style={{ maxWidth: '100%', height: 'auto' }} />
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => removeImage(index)}
                sx={{ display: 'block', margin: 'auto', mt: 1 }} // 이미지 바로 아래에 위치하도록 스타일 수정
              >
                제거
              </Button>
            </Box>
          ))}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button variant="outlined" size="small" component="label">
              이미지 선택
              <input type="file" hidden multiple ref={fileInputRef} onChange={handleImageChange} />
            </Button>
            <Button variant="outlined" size="small" onClick={() => generateAndAddImage(false)}>이미지 생성</Button>
            <Button variant="outlined" size="small" onClick={() => generateAndAddImage(true)}>이미지 생성 with AI</Button>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>장르 선택</InputLabel>
              <Select
                value={genre}
                label="장르 선택"
                onChange={(e) => setGenre(e.target.value)}
              >
                {genres.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <Button type="submit" variant="contained" sx={{ mt: 2, color: "black", fontWeight: 'bold', backgroundColor: "lightgreen" }}>
            작성
          </Button>
        </Box>
      </form>
    </Paper>
  );
}

export default TweetForm;

