// src/components/LogoutButton.js
import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { logoutUser } from '../api/authApi';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const { refreshToken, clearTokens } = useContext(AuthContext);
  const navigate = useNavigate();

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
    <Button
      variant="contained"
      color="error"
      onClick={handleLogout}
      sx={{ textTransform: 'none' }}
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
