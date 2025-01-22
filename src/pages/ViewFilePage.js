import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, CircularProgress, Alert, Button, Box } from '@mui/material';
import axiosInstance from '../api/axiosInstance';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import Header from '../components/Header'; // Import the Header component

const ViewFilePage = () => {
  const { encryptedFileId } = useParams();
  const navigate = useNavigate();
  const [pdfData, setPdfData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAndRenderPDF = async () => {
      try {
        const response = await axiosInstance.get(`/api/view/${encryptedFileId}/`);
        const { encrypted_content, aes_key, aes_iv } = response.data;

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

        // Convert ArrayBuffer to Blob
        const blob = new Blob([decryptedContent], { type: 'application/pdf' });

        setPdfData(blob);
      } catch (err) {
        setError('Failed to load PDF content.');
        console.error('Error fetching or decrypting file content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndRenderPDF();
  }, [encryptedFileId]);

  function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  return (
    <>
      <Header /> {/* Add Header component */}
      <Container maxWidth="md" sx={{ mt: 12 }}> {/* Adjust margin to account for fixed header */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" color="secondary" onClick={() => navigate(-1)}>
            Exit
          </Button>
        </Box>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : pdfData ? (
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <div
              style={{
                height: '800px',
                border: '1px solid rgba(0, 0, 0, 0.3)',
              }}
            >
              <Viewer fileUrl={URL.createObjectURL(pdfData)} />
            </div>
          </Worker>
        ) : null}
      </Container>
    </>
  );
};

export default ViewFilePage;
