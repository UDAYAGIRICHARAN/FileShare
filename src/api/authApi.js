// src/api/authApi.js
import axiosInstance from './axiosInstance';

// REGISTER
export const registerUser = async (userData) => {
  // userData = { username, password, email, role? }
  const response = await axiosInstance.post('/api/register/', userData);
  return response.data; // { message: "...", or error }
};



// LOGIN
export const loginUser = async (credentials) => {
  // credentials = { username, password }
  const response = await axiosInstance.post('/api/login/', credentials);
  return response.data; // { access, refresh } on success
};

// LOGOUT
export const logoutUser = async (refreshToken) => {
  // refreshToken = stored refresh token in client
  const response = await axiosInstance.post('/api/logout/', { refresh: refreshToken });
  return response.data; // { message: "Logout successful" }
};




// GOOGLE OAUTH EXCHANGE
// This call sends the Google ID token (the 'credential') to your Django backend
export const googleAuth = async (googleIdToken) => {
  const response = await axiosInstance.post('/api/google-login/', { token: googleIdToken });
  return response.data; // { access, refresh }
};

// VERIFY EMAIL (optional, if you want to handle it in React)
export const verifyEmail = async (token) => {
  const response = await axiosInstance.get(`/api/verify-email/?token=${token}`);
  return response.data; // { message: "...", or error }
};
