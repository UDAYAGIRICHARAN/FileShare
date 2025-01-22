import React, { useContext, useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Avatar, Box, Button, Tab, Tabs } from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';
import { getUserDetails } from '../api/userApi';
import { logoutUser } from '../api/authApi';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const [user, setUser] = useState(null);
  const { refreshToken, clearTokens } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState(location.pathname);

  // Fetch user details on mount
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await getUserDetails();
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user details:', error);
      }
    };

    if (refreshToken) {
      fetchUserDetails();
    }
  }, [refreshToken]);

  useEffect(() => {
    setValue(location.pathname);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await logoutUser(refreshToken);
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      clearTokens();
      navigate('/login');
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{ bgcolor: '#2E3B55', width: '100%' }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between', // Ensures space between user info and logout
          alignItems: 'center',
        }}
      >
        {/* Left Section: User Info */}
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: '#FF7043', mr: 2 }}>
              {user.username[0].toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#FFF' }}>
                Hi, {user.Name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#D1D9E6' }}>
                @{user.username}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Center Section: Navigation Tabs */}
        <Tabs
          value={value}
          onChange={(e, newValue) => navigate(newValue)}
          textColor="inherit"
          TabIndicatorProps={{ style: { backgroundColor: '#FF7043' } }}
          sx={{ flexGrow: 1, justifyContent: 'center' }}
        >
          <Tab label="Home" value="/" sx={{ textTransform: 'none' }} />
          <Tab label="Uploaded Files" value="/uploaded-files" sx={{ textTransform: 'none' }} />
          <Tab label="Accessible Files" value="/current-access-files" sx={{ textTransform: 'none' }} />
      
        </Tabs>

        {/* Right Section: Logout Button */}
        <Box>
          <Button
            variant="contained"
            color="error"
            onClick={handleLogout}
            sx={{
              textTransform: 'none',
              fontWeight: 'bold',
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
