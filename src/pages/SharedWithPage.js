import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Alert,
  CircularProgress,
  Checkbox,
  Paper,
  Button,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Header from '../components/Header'; // Import Header component

const SharedWithPage = () => {
  const { fileId } = useParams();
  const [sharedUsers, setSharedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSharedUsers = async () => {
      try {
        const response = await axiosInstance.get(`/api/shared-with/${fileId}/`);
        setSharedUsers(response.data.shared_users || []);
      } catch (err) {
        setError('Failed to fetch shared users.');
      } finally {
        setLoading(false);
      }
    };
    fetchSharedUsers();
  }, [fileId]);

  const handleEditPermission = async (username, permissionType, value) => {
    try {
      await axiosInstance.post(`/api/update-permission/${fileId}/`, {
        username,
        permission_type: permissionType,
        value,
      });

      alert('Permission updated successfully.');
      setSharedUsers((prev) =>
        prev.map((user) =>
          user.username === username
            ? { ...user, [permissionType]: value }
            : user
        )
      );
    } catch (err) {
      alert('Failed to update permission.');
    }
  };

  const handleRevokeAccess = async (username) => {
    try {
      await axiosInstance.post(`/api/revoke/${fileId}/`, { username });

      alert('Access revoked successfully.');
      setSharedUsers((prev) => prev.filter((user) => user.username !== username));
    } catch (err) {
      alert('Failed to revoke access.');
    }
  };

  return (
    <>
      <Header /> {/* Add the Header component */}
      <Container maxWidth="md" sx={{ mt: 10 }}>
        <Typography variant="h4" gutterBottom>
          Shared With
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Paper sx={{ p: 2 }}>
            {sharedUsers.length > 0 ? (
              sharedUsers.map((user) => (
                <div
                  key={user.username}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 16,
                  }}
                >
                  <Typography>
                    {user.username} ({user.email || 'No email available'})
                  </Typography>
                  <div>
                    <Checkbox
                      checked={user.view_permission}
                      onChange={(e) =>
                        handleEditPermission(user.username, 'view_permission', e.target.checked)
                      }
                    />
                    <Typography variant="caption">View</Typography>
                    <Checkbox
                      checked={user.download_permission}
                      onChange={(e) =>
                        handleEditPermission(user.username, 'download_permission', e.target.checked)
                      }
                    />
                    <Typography variant="caption">Download</Typography>
                    <Button
                      color="error"
                      variant="outlined"
                      onClick={() => handleRevokeAccess(user.username)}
                      sx={{ ml: 2 }}
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <Typography>No users have access to this file.</Typography>
            )}
          </Paper>
        )}
      </Container>
    </>
  );
};

export default SharedWithPage;
