import type { AppProps } from 'next/app';
import Sidebar from '../components/Sidebar';
import '../styles/global.css';
import { ThemeProvider } from '@mui/material';
import { AuthProvider, useAuth } from '../context/AuthContext';
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
      <div style={{ display: 'flex', gap: '60px', padding: '60px', width: 'calc(100% - 60px * 2)', height: 'calc(100vh - 60px * 2)', overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ width: "1485px", overflowY: 'auto' }}>
          <Component {...pageProps} />
        </div>
      </div>
    </ThemeProvider>
  );
};



export default function MyApp(props: AppProps) {
  return (
    <AuthProvider>
      <AuthenticatedApp {...props} />
    </AuthProvider>
  );
}