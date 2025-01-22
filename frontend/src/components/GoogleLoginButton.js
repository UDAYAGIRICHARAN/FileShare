// src/components/GoogleLoginButton.js
import React, { useState, useContext } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../contexts/AuthContext';
import { googleAuth } from '../api/authApi';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

const GoogleLoginButton = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const { saveTokens } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse; // Google ID Token
      const data = await googleAuth(credential); // Exchange it with your backend for JWT
      saveTokens(data.access, data.refresh);
      navigate('/'); // Redirect to home after successful login
    } catch (error) {
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.error || 'Google login failed.');
      } else {
        setErrorMessage('Google login failed. Please try again later.');
      }
    }
  };

  const handleError = () => {
    setErrorMessage('Google login was not successful. Please try again.');
  };

  return (
    <Box sx={{ mt: 2, textAlign: 'center' }}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        render={(renderProps) => (
          <Button
            onClick={renderProps.onClick}
            disabled={renderProps.disabled}
            variant="outlined"
            color="primary"
            startIcon={<GoogleIcon />}
            fullWidth
            sx={{
              textTransform: 'none',
              fontSize: '16px',
              py: 1.5,
              borderColor: 'rgba(0, 0, 0, 0.3)',
              '&:hover': { borderColor: 'rgba(0, 0, 0, 0.6)' },
            }}
          >
            Sign in with Google
          </Button>
        )}
      />
      {errorMessage && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
};

export default GoogleLoginButton;
