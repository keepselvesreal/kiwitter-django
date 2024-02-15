import React from 'react';
import { Link } from '@mui/material';

export const parseHashtags = (content, navigate) => {
    return content.split(/(\s+)/).map((part, index) => {
        if (part.startsWith('#')) {
            return (
                <Link
                    key={index}
                    component="button"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate(`/hashtags/${part.slice(1)}`);
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    {part}
                </Link>
            );
        }
        return part;
    });
};
