import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemText, Box, Typography, Button, Toolbar, IconButton } from '@mui/material';
import { useUserContext } from './UserContext';
import WhoToFollow from './whoToFollow';
import localImage from '../assets/dragon.png';

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
                        justifyContent: 'space-between' // Push logout to the bottom
                    },
                }}
                variant="permanent"
                anchor="left"
            >
                <Toolbar sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}> {/* Added gap */}
                    <IconButton edge="start" color="inherit" aria-label="logo">
                        <img src={localImage} alt="Logo" style={{ width: '50px', height: '50px' }} />
                    </IconButton>
                    <Typography variant="h6" noWrap sx={{ color: '#8CC63F' }}> {/* noWrap prevents text from wrapping */}
                        Kiwitter
                    </Typography>
                </Toolbar>
                <List>
                    {[
                        { text: 'Home', to: '/' },
                        { text: 'Bookmarks', to: '/bookmarks' },
                        { text: 'Chat', to: '/chat' },
                        // { text: 'My Vibe', to: '/mood-painter'},
                        { text: 'My Vibe', to: '/my-vibe'},
                        { text: 'Profile', to: '/profile' },
                    ].map((item) => (
                        <ListItem button key={item.text} component={Link} to={item.to} sx={{ justifyContent: 'center' }}>
                            <ListItemText 
                                primary={item.text}
                                primaryTypographyProps={{
                                    variant: 'h6',
                                    style: { fontWeight: 'bold', textAlign: 'center' },
                                }}
                            />
                        </ListItem>
                    ))}
                </List>
                <Button
                    sx={{ alignSelf: 'center', marginBottom: '10px' }} // Align the logout button to the center and push it to the bottom
                    variant="contained"
                    color="primary"
                    onClick={handleLogout}
                >
                    로그아웃
                </Button>
            </Drawer>
            
            <Box
                component="main"
                sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }} // Adjusted width for sm breakpoint and up
            >
                <Outlet />
            </Box>
            <Box // WhoToFollow positioned as a sidebar
                sx={{
                    width: { sm: 300 }, // Width for sm breakpoint and up
                    flexShrink: { sm: 0 }, // Prevent shrinking on sm breakpoint and up
                    display: { xs: 'none', sm: 'block' }, // Displayed as block on sm breakpoint and up
                }}
            >
                <WhoToFollow />
            </Box>
        </Box>
    );
};

export default Layout;
;
