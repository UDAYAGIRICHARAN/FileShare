import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../api/authApi';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token)
        .then((data) => {
          setStatusMessage(data.message);
        })
        .catch((error) => {
          if (error.response) {
            setStatusMessage(error.response.data.error);
          } else {
            setStatusMessage('Verification failed');
          }
        });
    } else {
      setStatusMessage('No verification token found.');
    }
  }, [searchParams]);

  return (
    <div>
      <h2>Email Verification</h2>
      <p>{statusMessage}</p>
    </div>
  );
};

export default EmailVerification;
