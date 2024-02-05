import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';
import { useUserContext } from './UserContext';

function TweetForm() {
  const [message, setMessage] = useState('');
  const { user } = useUserContext();
  const authToken = user?.token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('http://localhost:8000/tweets/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${authToken}`  // 토큰 사용 예시
            },
            body: JSON.stringify({ content: message }),
        });
      if (response.status === 201) {
        // 성공적으로 메시지가 추가됨
        setMessage('');
        console.log('메시지가 성공적으로 추가되었습니다.');
      } else {
        console.error('메시지 추가 실패');
      }
    } catch (error) {
      console.error('오류 발생:', error);
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
        <Button type="submit" variant="contained" color="primary">
          입력
        </Button>
      </form>
    </Box>
  );
}

export default TweetForm;
