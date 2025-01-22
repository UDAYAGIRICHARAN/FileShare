import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import axiosInstance from '../api/axiosInstance';

const handleDownload = async (fileId) => {
  try {
    // Fetch encrypted content, key, and IV from the server
    const response = await axiosInstance.get(`/api/access/${fileId}/`);
    const { encrypted_content, key, iv, file_name } = response.data;

    // Decrypt the content using AES
    const decryptedContent = CryptoJS.AES.decrypt(
      CryptoJS.enc.Hex.parse(encrypted_content),
      CryptoJS.enc.Hex.parse(key),
      {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CFB,
        padding: CryptoJS.pad.Pkcs7,
      }
    ).toString(CryptoJS.enc.Utf8);

    // Create a Blob and download the file
    const blob = new Blob([decryptedContent], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', file_name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Download error:', err);
    alert('Failed to download the file.');
  }
};
