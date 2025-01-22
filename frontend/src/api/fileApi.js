import axiosInstance from './axiosInstance';

// UPLOAD FILE
export const uploadFile = async (payload) => {
  try {
    const response = await axiosInstance.post('/api/upload/', payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`, // Include the access token
        'Content-Type': 'application/json',
      },
    });

    console.log('Upload successful:', response.data);
    return response.data;
  } catch (err) {
    console.error('Upload error:', err.response?.data || err.message);
    throw new Error(err.response?.data?.error || 'Upload failed.');
  }
};
