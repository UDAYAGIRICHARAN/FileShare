import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { accessToken } = useContext(AuthContext);

  // If there's no access token, redirect to login
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children; // If token exists, render the protected content
};

export default ProtectedRoute;
