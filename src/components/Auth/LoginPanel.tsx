import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Card,
  Typography,
  Container,
  Stack,
  Alert,
} from '@mui/material';
import { signInWithEmail, signInWithGoogle, signUpWithEmail } from '../services/auth';

interface LoginPanelProps {
  onLoginSuccess: (user: any) => void;
  onDemoMode: () => void;
}

export function LoginPanel({ onLoginSuccess, onDemoMode }: LoginPanelProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const user = await signInWithEmail(email, password);
      if (user) onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Помилка входу');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const user = await signInWithGoogle();
      if (user) onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Помилка входу через Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    onDemoMode();
  };

  return (
    <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Stack spacing={3} sx={{ width: '100%' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
            IW
          </Typography>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Облік майна
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Робочий простір для таблиць, полів, блоків, статусів і структурованого обліку майна.
          </Typography>
        </Box>

        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Вхід до системи
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              disabled={isLoading}
              placeholder="name@example.com"
            />
            <TextField
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              disabled={isLoading}
              placeholder="Ваш пароль"
            />

            <Button
              variant="contained"
              onClick={handleEmailLogin}
              disabled={isLoading || !email || !password}
              fullWidth
            >
              Увійти
            </Button>

            <Button
              variant="outlined"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              fullWidth
            >
              Увійти через Google
            </Button>

            <Button
              variant="text"
              onClick={handleDemoLogin}
              disabled={isLoading}
              fullWidth
            >
              Demo mode
            </Button>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
