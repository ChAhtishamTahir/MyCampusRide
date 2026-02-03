import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  Typography
} from '@mui/material';
import { notificationService } from '../services';

const SendNotificationModal = ({ open, onClose, onSuccess, user }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'medium',
    recipientType: 'all'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      
      // Role-based authorization
      if (user?.role === 'driver') {
        // Drivers send targeted notifications to their students and copy to admin
        response = await notificationService.sendTargetedNotification({
          title: formData.title,
          message: formData.message,
          priority: formData.priority,
          targetType: formData.recipientType // 'students' or 'admin'
        });
      } else {
        // Admins can send to all types
        if (formData.recipientType === 'all') {
          response = await notificationService.broadcastNotification({
            title: formData.title,
            message: formData.message,
            priority: formData.priority,
            targetRoles: ['admin', 'driver', 'student']
          });
        } else {
          // Map frontend values to backend enum values
          const roleMapping = {
            'students': 'student',
            'drivers': 'driver',
            'admins': 'admin',
            'admin': 'admin'
          };
          
          const backendRole = roleMapping[formData.recipientType] || formData.recipientType;
          
          response = await notificationService.createNotification({
            title: formData.title,
            message: formData.message,
            priority: formData.priority,
            receiverRole: backendRole,
            receiverId: null // Broadcast to role
          });
        }
      }

      if (onSuccess) {
        onSuccess(response.data);
      }
      handleClose();
    } catch (err) {
      console.error('Error sending notification:', err);
      setError(err.response?.data?.message || err.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      message: '',
      priority: 'medium',
      recipientType: 'all'
    });
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Send Notification</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            
            <TextField
              autoFocus
              margin="dense"
              name="title"
              label="Notification Title"
              fullWidth
              variant="outlined"
              value={formData.title}
              onChange={handleChange}
              required
            />
            
            <TextField
              margin="dense"
              name="message"
              label="Message"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={formData.message}
              onChange={handleChange}
              required
            />
            
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={formData.priority}
                label="Priority"
                onChange={handleChange}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Recipient Type</InputLabel>
              <Select
                name="recipientType"
                value={formData.recipientType}
                label="Recipient Type"
                onChange={handleChange}
              >
                {user?.role === 'admin' && <MenuItem value="all">All Users</MenuItem>}
                <MenuItem value="students">Students on My Bus</MenuItem>
                <MenuItem value="admin">Admin Only</MenuItem>
                {user?.role === 'admin' && (
                  <>
                    <MenuItem value="drivers">Drivers Only</MenuItem>
                    <MenuItem value="admins">Admins Only</MenuItem>
                  </>
                )}
              </Select>
            </FormControl>
            
            {user?.role === 'driver' && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Note: Your notifications will be sent to students assigned to your bus, and admins will receive copies.
              </Typography>
            )}
            {user?.role === 'admin' && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Note: You can send notifications to different user groups.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Send'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SendNotificationModal;