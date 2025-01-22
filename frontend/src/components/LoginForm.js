import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/authApi';
import { AuthContext } from '../contexts/AuthContext';

const LoginForm = () => {
  const { saveTokens } = useContext(AuthContext);
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const data = await loginUser(credentials);
      saveTokens(data.access, data.refresh);
      navigate('/'); // Redirect to home
    } catch (error) {
      if (error.response?.data) {
        setErrorMessage(error.response.data.detail || 'Login failed.');
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="login-form">
      <h2>Login</h2>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Sign In</button>
      </form>
      <div className="login-actions">
        <button onClick={() => navigate('/forgot-password')}>Forgot Password?</button>
        <p>
          Don't have an account?{' '}
          <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => navigate('/register')}>
            Register here
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
