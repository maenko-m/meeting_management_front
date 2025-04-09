import type { AppProps } from 'next/app';
import Sidebar from '../components/Sidebar';
import PushSubscription from '../components/PushSubscription';
import '../styles/global.css';
import '../styles/AddEventFrom.css';
import '../styles/MeetingRoomCardStyles.css';
import { ThemeProvider } from '@mui/material';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';
import theme from '../styles/theme';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const AuthenticatedApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      const isAuthPage = router.pathname === '/auth'; 

      if (!user && !isAuthPage) {

        router.push('/auth');
      } else if (user && isAuthPage) {

        router.push('/events');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <span>Загрузка...</span>
        </div>
      </ThemeProvider>
    );
  }

  const isAuthPage = router.pathname === '/auth';
  if ((!user && !isAuthPage) || (user && isAuthPage)) {
    return null; 
  }

  return (
    <ThemeProvider theme={theme}>
      {user && <PushSubscription userId={user.id} />}
      <div style={{ display: 'flex', width: "96%", padding: "4vh 2%", gap: "2%", overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ width: "100%", overflowY: 'auto' }}>
          <Component {...pageProps} />
        </div>
      </div>
    </ThemeProvider>
  );
};



export default function MyApp(props: AppProps) {
  return (
    <NotificationProvider>
      <AuthProvider>
        <AuthenticatedApp {...props} />
      </AuthProvider>
    </NotificationProvider>
    
  );
}