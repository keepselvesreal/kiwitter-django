import React, { useState, useRef } from 'react';
import { Box, TextField, Button } from '@mui/material';
import { generatePrompt, generateImage } from "./ImageGeneration";

function TweetForm({ addTweet }) {
  const [message, setMessage] = useState('');
  const [images, setImages] = useState([]); // 사용자가 선택한 이미지 파일들
  const [imagePreviews, setImagePreviews] = useState([]); // 선택한 이미지의 미리보기 URL들
  const fileInputRef = useRef();
  const [genre, setGenre] = useState('');
  const genres = ['animation', 'Pop Art', 'Minimal Line Art', 'Street Art', 'Splatter Paint', 'cartoon', 'Blog Illustration'];
  const accessToken = localStorage.getItem("access token");

  // 이미지 파일 선택 처리 및 미리보기 생성
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const newImagePreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...selectedFiles]);
    setImagePreviews(prev => [...prev, ...newImagePreviews]);
  };

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
    <Box sx={{ margin: 2 }}>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="메시지를 입력하세요..."
          multiline
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          variant="outlined"
          margin="normal"
        />
        {imagePreviews.map((preview, index) => (
          <Box key={index} sx={{ textAlign: 'center', mt: 2 }}>
            <img src={preview} alt="미리보기" style={{ maxWidth: '100%', height: 'auto' }} />
            <Button variant="contained" onClick={() => removeImage(index)}>제거</Button>
          </Box>
        ))}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
          <Button variant="contained" component="label">
            이미지 선택
            <input type="file" hidden multiple ref={fileInputRef} onChange={handleImageChange} />
          </Button>
          <TextField select value={genre} onChange={(e) => setGenre(e.target.value)} sx={{ minWidth: 120 }}>
            {genres.map(g => <option key={g} value={g}>{g}</option>)}
          </TextField>
          <Button onClick={() => generateAndAddImage(false)}>이미지 생성</Button>
          <Button onClick={() => generateAndAddImage(true)}>이미지 생성 with AI</Button>
        </Box>
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          제출
        </Button>
      </form>
    </Box>
  );
}

export default TweetForm;

