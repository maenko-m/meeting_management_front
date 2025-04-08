import { useState } from 'react';
import { TextField, Button, Typography, Dialog } from '@mui/material';
import { Box, ThemeProvider } from '@mui/system';
import { useRouter } from 'next/router';
import '../../styles/global.css';
import theme from '../../styles/theme';
import { login as apiLogin } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const Login = () => {
  const [open] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showNotification } = useNotification()
  const { login } = useAuth();

  const isFormValid = email.trim() !== "" && password.trim() !== "";

  const handleLogin = async () => {
    setLoading(true);

    try {
      const token = await apiLogin({
        email,
        password,
      });
      login(token);
      router.push('/events');
    } catch (err) {
      showNotification(
        err instanceof Error ? err.message : 'Ошибка авторизации',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={open}  sx={{ "& .MuiPaper-root": { padding: 3, boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" } }}>
        <Box sx={{ minWidth: "400px" }}>

          <Box sx={{ display: "flex" }}>
              <img src="/images/account-icon.svg" alt="icon" style={{ marginRight: 5 }} />
              <Typography variant="h5">Вход</Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3 }}>
            <TextField label="Почта" variant="outlined" fullWidth onChange={(e) => setEmail(e.target.value)} disabled={loading}/>
            <TextField label="Пароль" variant="outlined" type="password" fullWidth onChange={(e) => setPassword(e.target.value)} disabled={loading}/>
            <Button
              variant="contained"
              color="primary"
              disabled={!isFormValid || loading}
              onClick={handleLogin}
            >
              {loading ? 'Загрузка...' : '→ Войти'}
            </Button>
          </Box>
        </Box>
      </Dialog>
    </ThemeProvider>
  );
};

export default Login;
