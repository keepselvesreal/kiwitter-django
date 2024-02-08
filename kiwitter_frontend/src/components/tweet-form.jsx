import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Button } from '@mui/material';
import { useUserContext } from './UserContext';

import { generatePrompt, generateImage } from "./ImageGeneration";

function TweetForm() {
  const [message, setMessage] = useState('');
  const [selectedImages, setSelectedImages] = useState([]); // 사용자가 선택한 이미지 파일들
  const [selectedImagePreviews, setSelectedImagePreviews] = useState([]); // 선택한 이미지의 미리보기 URL들
  const [generatedImagePreviews, setGeneratedImagePreviews] = useState([]); // 생성된 이미지의 미리보기 URL들
  const { user } = useUserContext();
  const authToken = user?.token;
  const fileInputRef = useRef(); // 파일 입력을 위한 ref
  const [genre, setGenre] = useState('');
  const genres = ['animation', 'Pop Art', 'Minimal Line Art', 'Street Art', 'Splatter Paint', 'cartoon', 'Blog Illustration'];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImagePreviews = files.map(file => URL.createObjectURL(file));
    setSelectedImages(prev => [...prev, ...files]);
    setSelectedImagePreviews(prev => [...prev, ...newImagePreviews]);
  };

  const handleSelectImage = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('content', message);
    selectedImages.forEach((file, index) => {
      formData.append('images', file);
    });

    // 생성된 이미지 URL을 formData에 추가
    generatedImagePreviews.forEach((imageUrl, index) => {
        formData.append('generatedImageUrls', imageUrl);
    });

    console.log("submitted formData: ", formData)
    
    try {
        const response = await fetch('http://localhost:8000/tweets/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${authToken}`  // 토큰 사용 예시
            },
            body: formData, // JSON.stringify를 사용하지 않고 formData 직접 전송
        });
      if (response.status === 201) {
        // 성공적으로 메시지가 추가됨
        setMessage('');
        setSelectedImages([]);
        setSelectedImagePreviews([]);
        setGeneratedImagePreviews([]);
        console.log('메시지가 성공적으로 추가되었습니다.');
      } else {
        console.error('메시지 추가 실패');
      }
    } catch (error) {
      console.error('오류 발생:', error);
    }
  };

  const handleGenreChange = (event) => {
    setGenre(event.target.value);
  };

  const handleRemoveSelectedImage = index => {
    const newSelectedImages = selectedImages.filter((_, i) => i !== index);
    const newImagePreviews = selectedImagePreviews.filter((_, i) => i !== index);
    setSelectedImages(newSelectedImages);
    setSelectedImagePreviews(newImagePreviews);
  };

  const handleGenerateImageWithInput = async () => {
    const generatedImageUrl = await generateImage(message);
    if (generatedImageUrl) { // 유효한 URL만 상태에 추가
        setGeneratedImagePreviews(prev => [...prev, generatedImageUrl]);
      }
    // console.log("generatedImageUrl: ", generatedImageUrl)
  };

  // generatedImagePreviews 상태가 업데이트될 때마다 실행
  useEffect(() => {
    console.log("generatedImagePreviews updated: ", generatedImagePreviews);
  }, [generatedImagePreviews]);

  const handleGenerateImageWithAI = async () => {
    const generatedPrompt = await generatePrompt(message, genre);
    const generatedImageUrl = await generateImage(generatedPrompt);
    setGeneratedImagePreviews(prev => [...prev, generatedImageUrl]);
  };

  const handleRemoveGeneratedImage = index => {
    const newGeneratedImagePreviews = generatedImagePreviews.filter((_, i) => i !== index);
    setGeneratedImagePreviews(newGeneratedImagePreviews);
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
        {selectedImagePreviews.map((preview, index) => (
          <Box key={index} sx={{ textAlign: 'center' }}>
            <img src={preview} alt="Preview" style={{ maxWidth: '100%', height: 'auto' }} />
            <Button variant="contained" onClick={() => handleRemoveSelectedImage(index)}>취소</Button>
          </Box>
        ))}
        {generatedImagePreviews.map((preview, index) => (
          <Box key={index} sx={{ textAlign: 'center' }}>
            <img src={preview} alt="Generated" style={{ maxWidth: '100%', height: 'auto' }} />
            <Button variant="contained" onClick={() => handleRemoveGeneratedImage(index)}>취소</Button>
          </Box>
        ))}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginTop: 1 }}>
          <Button variant="contained" component="label" sx={{ height: 'fit-content' }}>
            이미지 선택
            <input
              type="file"
              hidden
              multiple
              ref={fileInputRef}
              onChange={handleImageChange}
            />
          </Button>
          <select value={genre} onChange={handleGenreChange}>
                <option value="">장르 선택...</option>
                {genres.map(g => (
                    <option key={g} value={g}>{g}</option>
                ))}
          </select>
          <Button onClick={handleGenerateImageWithInput}>
            이미지 생성 with 내 입력 메시지
          </Button>
          <Button onClick={handleGenerateImageWithAI}>
            이미지 생성 with 내 입력 메시지 + AI
          </Button>
        </Box>
        <Button type="submit" variant="contained" color="primary">
          입력
        </Button>
      </form>
    </Box>
  );
}

export default TweetForm;
