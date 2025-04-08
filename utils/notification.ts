interface NotificationHandler {
    showNotification: (message: string, severity?: 'error' | 'info' | 'success' | 'warning') => void;
}
  
let notificationHandler: NotificationHandler | null = null;
  

export const setNotificationHandler = (handler: NotificationHandler) => {
    notificationHandler = handler;
};
  
export const notify = (message: string, severity: 'error' | 'info' | 'success' | 'warning' = 'info') => {
    if (notificationHandler) {
      notificationHandler.showNotification(message, severity);
    } else {
      console.error('Notification handler not set:', message);
    }
};