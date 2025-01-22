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
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Header from '../components/Header';

const UploadedFilesPage = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [shareDetails, setShareDetails] = useState({
    user_id: '',
    view_permission: false,
    download_permission: false,
    expiration: 24, // Default expiration in hours
  });

  const navigate = useNavigate();

  // Fetch uploaded files on mount
  useEffect(() => {
    const fetchUploadedFiles = async () => {
      try {
        const response = await axiosInstance.get('/api/all-files/');
        setFiles(response.data.files || []);
      } catch (err) {
        console.error('Error fetching files:', err);
        setError('Failed to fetch uploaded files.');
      } finally {
        setLoading(false);
      }
    };

    fetchUploadedFiles();
  }, []);
// Utility function to convert Base64 to ArrayBuffer
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
  
  const openShareDialogHandler = (encryptedFileId) => {
    setSelectedFileId(encryptedFileId);
    setOpenShareDialog(true);
  };

  const handleShareFile = async () => {
    if (!selectedFileId) {
      alert('No file selected for sharing.');
      return;
    }

    try {
      const response = await axiosInstance.post(`/api/share/${selectedFileId}/`, shareDetails);
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/view-file/${selectedFileId}`;
      setShareableLink(link);
      alert(response.data.message || 'File shared successfully.');
    } catch (err) {
      console.error('Error sharing file:', err);
      alert('Failed to share file. Please try again.');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink).then(() => {
      alert('Link copied to clipboard!');
    });
  };

  const handleViewSharedWith = (encryptedFileId) => {
    navigate(`/shared-with/${encryptedFileId}`);
  };

  return (
    <>
      <Header />
      <Container maxWidth="md" sx={{ mt: 10 }}>
        <Typography variant="h4" gutterBottom>
          Uploaded Files
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
                  <TableCell>File Name</TableCell>
                  <TableCell>Uploaded At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.encrypted_file_id}>
                    <TableCell>{file.file_name}</TableCell>
                    <TableCell>{new Date(file.uploaded_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleDownload(file.encrypted_file_id, file.file_name)}
                      >
                        Download
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        sx={{ ml: 2 }}
                        onClick={() => openShareDialogHandler(file.encrypted_file_id)}
                      >
                        Share
                      </Button>
                      <Button
                        variant="text"
                        color="info"
                        sx={{ ml: 2 }}
                        onClick={() => handleViewSharedWith(file.encrypted_file_id)}
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Share Dialog */}
        <Dialog open={openShareDialog} onClose={() => setOpenShareDialog(false)}>
          <DialogTitle>Share File</DialogTitle>
          <DialogContent>
            <TextField
              label="User ID"
              fullWidth
              value={shareDetails.user_id}
              onChange={(e) => setShareDetails({ ...shareDetails, user_id: e.target.value })}
              sx={{ mt: 2 }}
            />
            <TextField
              label="Expiration (hours)"
              fullWidth
              type="number"
              value={shareDetails.expiration}
              onChange={(e) => setShareDetails({ ...shareDetails, expiration: e.target.value })}
              sx={{ mt: 2 }}
            />
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 16 }}>
              <Checkbox
                checked={shareDetails.view_permission}
                onChange={(e) =>
                  setShareDetails({ ...shareDetails, view_permission: e.target.checked })
                }
              />
              <Typography variant="body2" sx={{ mr: 4 }}>
                Allow View
              </Typography>
              <Checkbox
                checked={shareDetails.download_permission}
                onChange={(e) =>
                  setShareDetails({ ...shareDetails, download_permission: e.target.checked })
                }
              />
              <Typography variant="body2">Allow Download</Typography>
            </div>
          </DialogContent>
          <DialogActions>
            {shareableLink && (
              <TextField
                fullWidth
                value={shareableLink}
                InputProps={{
                  readOnly: true,
                }}
                sx={{ mt: 2, mx: 2 }}
              />
            )}
            <Button onClick={() => setOpenShareDialog(false)} color="secondary">
              Cancel
            </Button>
            {!shareableLink && (
              <Button onClick={handleShareFile} color="primary">
                Generate Link
              </Button>
            )}
            {shareableLink && (
              <Button onClick={handleCopyLink} color="primary">
                Copy Link
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default UploadedFilesPage;
