import React, { useState, useRef } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';

const CustomInputComponent = ({ onMessageSubmit }) => {
    const [message, setMessage] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);

    const handleImageChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            const selectedFile = event.target.files[0];
            setImage(selectedFile);
            setImagePreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (onMessageSubmit) {
            onMessageSubmit({ message, image });
        }
        // 폼 제출 후 입력 필드 초기화
        setMessage('');
        setImage(null);
        setImagePreview('');
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
                fullWidth
                label="메시지를 입력하세요..."
                multiline
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                variant="outlined"
            />
            {imagePreview && (
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ display: 'block' }}>이미지 미리보기:</Typography>
                    <img src={imagePreview} alt="Preview" style={{ maxHeight: '200px', maxWidth: '100%' }} />
                </Box>
            )}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                style={{ display: 'none' }}
            />
            <Button variant="contained" onClick={() => fileInputRef.current.click()}>
                이미지 선택
            </Button>
            <Button type="submit" variant="contained" color="primary">
                입력
            </Button>
        </Box>
    );
};

export default CustomInputComponent;
