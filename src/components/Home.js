import React from 'react';
import { Container, Typography } from '@mui/material';
import Header from '../components/Header';
import FileEncryptionDecryption from '../components/FileEncryptionDecryption';

const HomePage = () => {
  const handleEncryption = ({ encryptedBlob, key, iv }) => {
    console.log('Encryption Results:');
    console.log('Encrypted Blob:', encryptedBlob);
    console.log('AES Key:', key);
    console.log('AES IV:', iv);
  };

  const handleDecryption = (decryptedContent) => {
    console.log('Decrypted Content:', decryptedContent);
  };

  return (
    <>
      <Header />
      <Container maxWidth="md" sx={{ mt: 10 }}>
        <Typography variant="h4" gutterBottom>
          Secure File Encryption & Decryption
        </Typography>
        <FileEncryptionDecryption
          onEncrypt={handleEncryption}
          onDecrypt={handleDecryption}
        />
      </Container>
    </>
  );
};

export default HomePage;
