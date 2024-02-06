import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemText, Box, Typography } from '@mui/material';

const drawerWidth = 240;

const Layout = () => {
    return (
        <Box sx={{ display: 'flex' }}>
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
                variant="permanent"
                anchor="left"
            >
                <List>
                    {[
                        { text: 'Home', to: '/' },
                        { text: 'Bookmarks', to: '/bookmarks' },
                        { text: 'Chat', to: '/chat' },
                        { text: 'My Vibe', to: '/mood-painter'},
                        { text: 'Profile', to: '/profile' },
                    ].map((item) => (
                        <ListItem button key={item.text} component={Link} to={item.to}>
                            <ListItemText primary={item.text} />
                        </ListItem>
                    ))}
                </List>
            </Drawer>
            <Box
                component="main"
                sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
            >
                {/* Outlet을 사용하여 자식 라우트 컴포넌트를 렌더링 */}
                <Outlet />
            </Box>
            <footer style={{ width: '100%', position: 'fixed', bottom: 0 }}>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ p: 2 }}>
                    © 2024 올해는 나의 것!
                </Typography>
            </footer>
            
        </Box>
    );
};

export default Layout;
;
