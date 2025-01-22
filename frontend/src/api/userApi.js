// src/api/userApi.js
import axiosInstance from './axiosInstance';

// GET USER DETAILS
export const getUserDetails = async () => {
  try {
    const response = await axiosInstance.get('/api/user-details/', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`, // Include the access token
      },
    });
    return response;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};
