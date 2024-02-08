import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';

function EditTweetForm({ content, onSave, onCancel }) {
    const [editedContent, setEditedContent] = useState(content);

    return (
        <div>
            <TextField
                fullWidth
                multiline
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
            />
            <Button onClick={() => onSave(editedContent)}>저장</Button>
            <Button onClick={onCancel}>취소</Button>
        </div>
    );
}

export default EditTweetForm;
