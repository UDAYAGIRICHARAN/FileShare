// src/pages/LoginPage.js
import React, { useState, useContext } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Link,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { loginUser } from '../api/authApi';
import GoogleLoginButton from '../components/GoogleLoginButton';

const LoginPage = () => {
  const navigate = useNavigate();
  const { saveTokens } = useContext(AuthContext);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const data = await loginUser(credentials);
      saveTokens(data.access, data.refresh);
      setSuccessMessage('Login successful! Redirecting...');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 10 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Welcome Back
      </Typography>
      <Typography variant="body1" align="center" gutterBottom>
        Login to your account
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        {successMessage && <Alert severity="success">{successMessage}</Alert>}
        <TextField
          fullWidth
          label="Username"
          name="username"
          margin="normal"
          value={credentials.username}
          onChange={handleChange}
          required
        />
        <TextField
          fullWidth
          label="Password"
          name="password"
          type="password"
          margin="normal"
          value={credentials.password}
          onChange={handleChange}
          required
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>

        {/* Google Login Button */}
        <GoogleLoginButton />

        <Box display="flex" justifyContent="space-between" sx={{ mt: 2 }}>
          <Link component="button" onClick={() => navigate('/forgot-password')} underline="hover">
            Forgot Password?
          </Link>
          <Link component="button" onClick={() => navigate('/register')} underline="hover">
            Don't have an account? Register
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
