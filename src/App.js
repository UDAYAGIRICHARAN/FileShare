import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import UploadedFilesPage from './pages/UploadedFilesPage';
import AccessFilesPage from './pages/AccessFilesPage';
import SharedWithPage from './pages/SharedWithPage'; // Import SharedWithPage
import ViewFilePage from './pages/ViewFilePage'; // Import ViewFilePage
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/uploaded-files"
          element={
            <ProtectedRoute>
              <UploadedFilesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/current-access-files"
          element={
            <ProtectedRoute>
              <AccessFilesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shared-with/:fileId"
          element={
            <ProtectedRoute>
              <SharedWithPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-file/:encryptedFileId" // Add the view route
          element={
            <ProtectedRoute>
              <ViewFilePage />
            </ProtectedRoute>
          }
        />

        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 404 Route */}
        <Route path="*" element={<p>404 Not Found</p>} />
      </Routes>
    </Router>
  );
}

export default App;
