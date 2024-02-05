// CommentInput.jsx
import React, { useState } from 'react';
import { TextField, Button, Grid } from '@mui/material';

function CommentInput({ onSubmit, placeholder }) {
    const [content, setContent] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(content);
        setContent('');
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center' }}>
            <TextField
                fullWidth
                size="small"
                variant="outlined"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                margin="dense"
                style={{ marginRight: '8px' }}
            />
            <Button type="submit" variant="contained" color="primary" size="small">
                입력
            </Button>
        </form>
    );
}

export default CommentInput;
