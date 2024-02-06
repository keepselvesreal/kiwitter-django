import React, { useState,  useRef } from 'react';
import { Box, TextField, Button } from '@mui/material';
import { useUserContext } from './UserContext';

import { generatePrompt, generateImage } from "./ImageGeneration"
import CustomInputComponent from './CustomInputComponent';

function TweetForm() {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // 이미지 미리보기 URL
  const { user } = useUserContext();
  const authToken = user?.token;
  const fileInputRef = useRef(); // 파일 입력을 위한 ref
  const [genre, setGenre] = useState('');
  const genres = ['animation', 'Pop Art', 'Minimal Line Art', 'Street Art', 'Splatter Paint', 'cartoon', 'Blog Illustration'];
  const [selectedImage, setSelectedImage] = useState(null);


  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagePreview(URL.createObjectURL(file)); // 파일로부터 URL 생성하여 미리보기 설정
    }
  };

  const handleSelectImage = () => {
    fileInputRef.current.click(); // 숨겨진 파일 입력을 열기
  };

  // TODO: axios 사용으로 변경
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('content', message);
    if (fileInputRef.current.files[0]) {
      formData.append('image', fileInputRef.current.files[0]);
    }
    console.log('formData:', formData.get('content'), formData.get('image'));

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
        setImagePreview(null);
        if (setSelectedImage) setSelectedImage(null);
        console.log('메시지가 성공적으로 추가되었습니다.');
      } else {
        console.error('메시지 추가 실패');
      }
    } catch (error) {
      console.error('오류 발생:', error);
    }
  };

  const handleGenerateImageWithInput = async () => {
    const prompt = `${message}`;
    const generatedImageUrl = await generateImage(prompt);
    setImage(generatedImageUrl);
  };

  const handleGenerateImageWithAI = async () => {
    const genre = '선택한 장르'; // 장르를 어떻게 선택할지에 따라 달라질 수 있습니다.
    const generatedPrompt = await generatePrompt(message, genre);
    const generatedImageUrl = await generateImage(generatedPrompt);
    setImage(generatedImageUrl);
  };

  const handleGenreChange = (event) => {
    setGenre(event.target.value);
  };

  const handleInsertImage = () => {
    setSelectedImage(image); // 생성된 이미지를 트윗에 포함
    setImagePreview(null); // 미리보기 제거
    setImage(null); // 생성된 이미지 미리보기 제거
  };

  const handleCancelImage = () => {
    setImage(null); // 생성된 이미지 미리보기 제거
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
        {imagePreview && (
            <Box sx={{ width: '100%' }}>
              <img src={imagePreview} alt="Preview" style={{ width: '50%', height: '50%' }} />
            </Box>
          )}
        {image && (
        <Box sx={{ textAlign: 'center' }}>
          <img src={image} alt="Generated" style={{ width: '100%', height: 'auto' }} />
          <Button variant="contained" onClick={handleInsertImage}>
            삽입
          </Button>
          <Button variant="contained" onClick={handleCancelImage}>
            취소
          </Button>
        </Box>
        )}
        {selectedImage && (
            <Box sx={{ textAlign: 'center' }}>
              <img src={selectedImage} alt="Selected" style={{ width: '100%', height: 'auto' }} />
            </Box>
          )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginTop: 1 }}>
          <Button variant="contained" component="label" sx={{ height: 'fit-content' }}>
            이미지 선택
            <input
              type="file"
              hidden
              ref={fileInputRef}
              onChange={handleImageChange}
            />
          </Button>
        </Box>
        <Box sx={{ margin: 2 }}>
          {/* ... */}
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
          {image && (
            <Box sx={{ my: 2, textAlign: 'center' }}>
              <img src={image} alt="Generated" style={{ maxWidth: '100%', height: 'auto' }} />
            </Box>
          )}
          <Button type="submit" variant="contained" color="primary">
            입력
          </Button>
        </Box>
      </form>
    </Box>
  );
}

export default TweetForm;
