import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../components/UserContext';
import { Box, TextField, Button, Typography, Container, CircularProgress, IconButton } from '@mui/material';
import localImage from '../assets/dragon.png';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { loginUser } = useUserContext();
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await loginUser(username, password);
            navigate('/');
        } catch (error) {
            console.error("Login error: ", error.response ? error.response.data : 'Error');
            setError('Failed to login. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <IconButton edge="start" color="inherit" aria-label="logo">
                    <img src={localImage} alt="Logo" style={{ width: '150px', height: '150px' }} />
                </IconButton>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress size={24} /> : '로그인'}
                    </Button>
                    {error && (
                        <Typography color="error" textAlign="center">
                            {error}
                        </Typography>
                    )}
                </Box>
            </Box>
        </Container>
    );
};

export default Login;


