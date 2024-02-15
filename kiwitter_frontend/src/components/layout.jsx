import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemText, ListItemIcon, Box, Typography, Button, Toolbar, IconButton } from '@mui/material';
import { useUserContext } from './UserContext';
import WhoToFollow from './whoToFollow';
import localImage from '../assets/dragon.png';
import HomeIcon from '@mui/icons-material/Home';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ChatIcon from '@mui/icons-material/Chat';
import MoodIcon from '@mui/icons-material/Mood';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const drawerWidth = 240;

const Layout = () => {
    const { logoutUser } = useUserContext();
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        navigate("/login");
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'column', // Align drawer items vertically
                        // justifyContent: 'space-between', // Push logout to the bottom
                        paddingTop: 0,
                        ml: 3
                    },
                }}
                variant="permanent"
                anchor="left"
            >
                <Toolbar sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2, mb: 2 }}> {/* Added gap */}
                    <IconButton edge="start" color="inherit" aria-label="logo">
                        <img src={localImage} alt="Logo" style={{ width: '50px', height: '50px' }} />
                    </IconButton>
                    <Typography variant="h5" noWrap sx={{ color: '#8CC63F' }}> {/* noWrap prevents text from wrapping */}
                        Kiwitter
                    </Typography>
                </Toolbar>
                <Box sx={{ flexGrow: 1, mt: 1 }}>
                    <List>
                        {[
                            { text: 'Home', to: '/', icon: <HomeIcon /> },
                            { text: 'Bookmarks', to: '/bookmarks', icon: <BookmarkIcon /> },
                            { text: 'Chat', to: '/chat', icon: <ChatIcon /> },
                            { text: 'My Vibe', to: '/my-vibe', icon: <MoodIcon /> },
                            { text: 'Profile', to: '/profile', icon: <AccountCircleIcon /> },
                        ].map((item) => (
                            <ListItem button key={item.text} component={Link} to={item.to} sx={{ justifyContent: 'center' }}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText 
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        variant: 'h5',
                                        style: { fontWeight: 'bold', textAlign: 'center' },
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>
                <Button
                    sx={{ alignSelf: 'center', mb: 2 }} // Align the logout button to the center and push it to the bottom
                    variant="contained"
                    color="primary"
                    onClick={handleLogout}
                >
                    로그아웃
                </Button>
            </Drawer>
            
            <Box
                component="main"
                sx={{ 
                    flexGrow: 1, 
                    bgcolor: 'background.default', 
                    p: 3, 
                    width: { sm: `calc(100% - ${drawerWidth}px)` } }} // Adjusted width for sm breakpoint and up
            >
                <Outlet />
            </Box>
            <Box sx={{ 
                width: { xs: '100%', sm: 300 }, 
                flexShrink: { sm: 0 }, 
                display: { xs: 'none', sm: 'block' },
                position: 'sticky',
                top: 0, 
                mr: 3 
            }}
            > 
                <WhoToFollow />
            </Box>
        </Box>
    );
};

export default Layout;
;
