import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  FileCopy as FileCopyIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CryptoJS from 'crypto-js';
import { uploadFile } from '../api/fileApi'; // Import the uploadFile function

const HomePage = () => {
  const [file, setFile] = useState(null); // Selected file
  const [fileContent, setFileContent] = useState(null); // File content as ArrayBuffer
  const [aesKey, setAESKey] = useState(''); // AES Key
  const [aesIv, setAESIv] = useState(''); // AES IV
  const [uploading, setUploading] = useState(false); // Uploading state
  const [success, setSuccess] = useState(false); // Success state
  const [error, setError] = useState(''); // Error state

  const navigate = useNavigate(); // For navigation

  // Generate AES Key and IV
  useEffect(() => {
    const generateAESKeyAndIV = () => {
      const key = CryptoJS.lib.WordArray.random(32).toString(
        CryptoJS.enc.Hex
      ); // 256-bit key
      const iv = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex); // 128-bit IV
      setAESKey(key);
      setAESIv(iv);
    };

    generateAESKeyAndIV();
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setError('No file selected.');
      return;
    }

    setFile(selectedFile);
    setError('');
    setSuccess(false);

    const reader = new FileReader();
    reader.onload = () => {
      setFileContent(reader.result); // Read and save the file content as ArrayBuffer
    };
    reader.readAsArrayBuffer(selectedFile); // Read the file as ArrayBuffer
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!fileContent) {
      setError('Please select a file before uploading.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess(false);

    try {
      // Encrypt the file content
      const key = CryptoJS.enc.Hex.parse(aesKey);
      const iv = CryptoJS.enc.Hex.parse(aesIv);

      // Convert ArrayBuffer to WordArray
      const wordArray = CryptoJS.lib.WordArray.create(fileContent);

      const encrypted = CryptoJS.AES.encrypt(wordArray, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      const encryptedContent = CryptoJS.enc.Base64.stringify(
        encrypted.ciphertext
      );

      // Prepare JSON payload
      const payload = {
        file_name: file.name,
        encrypted_content: encryptedContent,
        aes_key: aesKey,
        aes_iv: aesIv,
      };

      // Call the API helper to upload the file
      await uploadFile(payload);

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to upload the file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Header />
      <Container maxWidth="md" sx={{ mt: 10, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Secure File Upload
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Your files will be encrypted with AES-256 before uploading for enhanced
          security.
        </Typography>

        {/* File Upload Section */}
        <Box
          sx={{
            mt: 4,
            p: 3,
            border: '1px dashed #ddd',
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            bgcolor: '#f9f9f9',
          }}
        >
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{
              bgcolor: '#1976d2',
              '&:hover': {
                bgcolor: '#125ea8',
              },
            }}
          >
            Select File
            <input type="file" hidden onChange={handleFileChange} />
          </Button>

          {file && <Typography variant="body2">{file.name}</Typography>}

          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploading || !file}
            sx={{
              mt: 2,
              bgcolor: '#4caf50',
              '&:hover': {
                bgcolor: '#388e3c',
              },
            }}
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>

          {uploading && <CircularProgress size={24} sx={{ mt: 2 }} />}
        </Box>

        {/* Success/Error Messages */}
        {success && (
          <Alert severity="success" sx={{ mt: 4 }}>
            File uploaded successfully and securely!
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 4 }}>
            {error}
          </Alert>
        )}

        {/* Navigation Buttons */}
        <Box
          sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}
        >
          <Button
            variant="outlined"
            startIcon={<FileCopyIcon />}
            onClick={() => navigate('/uploaded-files')}
          >
            View Uploaded Files
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileCopyIcon />}
            onClick={() => navigate('/current-access-files')}
          >
            View Current Access Files
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default HomePage;
