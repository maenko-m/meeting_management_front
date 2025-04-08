import React from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface NotificationProps {
  open: boolean;
  onClose: () => void;
  message: string;
  severity?: AlertColor; // 'error', 'warning', 'info', 'success'
  autoHideDuration?: number; 
}

const Notification: React.FC<NotificationProps> = ({
  open,
  onClose,
  message,
  severity = 'info',
  autoHideDuration = 6000,
}) => {
  return (
    <Snackbar open={open} autoHideDuration={autoHideDuration} onClose={onClose}>
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;