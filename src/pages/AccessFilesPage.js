import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Header from '../components/Header';

const AccessFilesPage = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccessFiles = async () => {
      try {
        const response = await axiosInstance.get('/api/current-access-files/');
        console.log('Fetched files:', response.data.files); // Debugging: Check response data
        setFiles(response.data.files || []);
      } catch (err) {
        console.error('Error fetching files:', err); // Debugging
        setError('Failed to fetch accessible files.');
      } finally {
        setLoading(false);
      }
    };
    fetchAccessFiles();
  }, []);

  function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  const handleDownload = async (encryptedFileId, fileName) => {
    if (!encryptedFileId) {
      alert('Invalid file ID. Unable to download.');
      return;
    }

    try {
      const response = await axiosInstance.get(`/api/access/${encryptedFileId}/`);

      const {
        encrypted_content,
        aes_key,
        aes_iv,
        file_name,
      } = response.data;

      // Decode Base64 data
      const encryptedContentBytes = base64ToArrayBuffer(encrypted_content);
      const aesKeyBytes = base64ToArrayBuffer(aes_key);
      const aesIvBytes = base64ToArrayBuffer(aes_iv);

      // Import the AES key
      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        aesKeyBytes,
        'AES-CBC',
        false,
        ['decrypt']
      );

      // Decrypt the content
      const decryptedContent = await window.crypto.subtle.decrypt(
        {
          name: 'AES-CBC',
          iv: aesIvBytes,
        },
        cryptoKey,
        encryptedContentBytes
      );

      // Create a Blob from the decrypted content
      const blob = new Blob([decryptedContent]);

      // Trigger the download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || file_name || 'downloaded_file');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading and decrypting file:', err);
      alert('Failed to download file.');
    }
  };

  return (
    <>
      <Header />
      <Container maxWidth="md" sx={{ mt: 10 }}>
        <Typography variant="h4" gutterBottom>
          Accessible Files
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>File</TableCell>
                  <TableCell>Shared By</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.encrypted_file_id}>
                    <TableCell>{file.file_name}</TableCell>
                    <TableCell>{file.shared_by}</TableCell>
                    <TableCell>
                      {file.download_permission && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() =>
                            handleDownload(file.encrypted_file_id, file.file_name)
                          }
                        >
                          Download
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => navigate(`/view-file/${file.encrypted_file_id}`)}
                        style={{ marginLeft: '10px' }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </>
  );
};

export default AccessFilesPage;
