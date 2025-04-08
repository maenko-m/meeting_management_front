import React, { createContext, useContext, useState, useEffect } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';
import { setNotificationHandler } from '../utils/notification';

interface NotificationState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

interface NotificationContextType {
  showNotification: (message: string, severity?: AlertColor) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
});

const showNotification = (message: string, severity: AlertColor = 'info') => {
    setNotification({ open: true, message, severity });
};

 useEffect(() => {

    setNotificationHandler({ showNotification });
}, []);

const handleClose = () => {
    setNotification((prev) => ({ ...prev, open: false }));
};

return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};