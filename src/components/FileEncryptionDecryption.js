import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Visibility as VisibilityIcon } from '@mui/icons-material';

const FileEncryptionDecryption = ({ onEncrypt, onDecrypt }) => {
  const [file, setFile] = useState(null); // Selected file
  const [encryptedFile, setEncryptedFile] = useState(null); // Encrypted file Blob
  const [decryptedContent, setDecryptedContent] = useState(''); // Decrypted file content
  const [aesKey, setAESKey] = useState(''); // AES Key
  const [aesIV, setAESIv] = useState(''); // AES IV
  const [error, setError] = useState(''); // Error state
  const [loading, setLoading] = useState(false); // Loading state

  // Generate AES Key and IV
  const generateAESKeyAndIV = () => {
    const key = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex); // 256-bit key
    const iv = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex); // 128-bit IV
    setAESKey(key);
    setAESIv(iv);
    return { key, iv };
  };

  // Encrypt the file
  const handleEncryptFile = () => {
    if (!file) {
      setError('Please select a file to encrypt.');
      return;
    }

    setError('');
    setLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const { key, iv } = generateAESKeyAndIV();
        const fileContent = reader.result;

        // Encrypt the file content using AES-256
        const encrypted = CryptoJS.AES.encrypt(fileContent, CryptoJS.enc.Hex.parse(key), {
          iv: CryptoJS.enc.Hex.parse(iv),
          mode: CryptoJS.mode.CFB,
          padding: CryptoJS.pad.Pkcs7,
        }).toString();

        // Create an encrypted file Blob
        const encryptedBlob = new Blob([encrypted], { type: 'text/plain' });
        setEncryptedFile(encryptedBlob);

        // Notify parent component of the encryption result
        if (onEncrypt) {
          onEncrypt({
            encryptedBlob,
            key,
            iv,
          });
        }

        console.log('Encryption successful!');
      } catch (encryptionError) {
        setError('Failed to encrypt the file.');
      } finally {
        setLoading(false);
      }
    };

    reader.readAsText(file); // Read file content as text for encryption
  };

  // Decrypt the file
  const handleDecryptFile = () => {
    if (!encryptedFile || !aesKey || !aesIV) {
      setError('Please provide the encrypted file, AES key, and IV to decrypt.');
      return;
    }

    setError('');
    setLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const encryptedContent = reader.result;

        // Decrypt the content
        const decrypted = CryptoJS.AES.decrypt(encryptedContent, CryptoJS.enc.Hex.parse(aesKey), {
          iv: CryptoJS.enc.Hex.parse(aesIV),
          mode: CryptoJS.mode.CFB,
          padding: CryptoJS.pad.Pkcs7,
        }).toString(CryptoJS.enc.Utf8);

        setDecryptedContent(decrypted);

        // Notify parent component of the decryption result
        if (onDecrypt) {
          onDecrypt(decrypted);
        }

        console.log('Decryption successful!');
      } catch (decryptionError) {
        setError('Failed to decrypt the file. Please check your AES key and IV.');
      } finally {
        setLoading(false);
      }
    };

    reader.readAsText(encryptedFile); // Read encrypted file content for decryption
  };

  return (
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
      <Typography variant="h6" gutterBottom>
        File Encryption & Decryption
      </Typography>

      {/* File Selection */}
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
        <input
          type="file"
          hidden
          onChange={(e) => {
            setFile(e.target.files[0]);
            setDecryptedContent('');
          }}
        />
      </Button>

      {file && <Typography variant="body2">{file.name}</Typography>}

      {/* Encrypt File */}
      <Button
        variant="contained"
        onClick={handleEncryptFile}
        disabled={loading || !file}
        sx={{
          mt: 2,
          bgcolor: '#4caf50',
          '&:hover': {
            bgcolor: '#388e3c',
          },
        }}
      >
        Encrypt File
      </Button>

      {/* Decrypt File */}
      {encryptedFile && (
        <Button
          variant="outlined"
          startIcon={<VisibilityIcon />}
          onClick={handleDecryptFile}
          disabled={loading || !encryptedFile || !aesKey || !aesIV}
          sx={{
            mt: 2,
          }}
        >
          Decrypt File
        </Button>
      )}

      {loading && <CircularProgress size={24} sx={{ mt: 2 }} />}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Decrypted Content */}
      {decryptedContent && (
        <Alert severity="success" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
          {decryptedContent}
        </Alert>
      )}
    </Box>
  );
};

export default FileEncryptionDecryption;
