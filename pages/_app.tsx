import type { AppProps } from 'next/app';
import { ThemeProvider, CssBaseline, Box, Container } from '@mui/material';
import theme from '../lib/theme';
import Navbar from '../components/Navbar';
import { useState, useEffect, useCallback } from 'react';
import { fetchAllNotifications, getViewedIds } from '../lib/notifications';

export default function App({ Component, pageProps }: AppProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  const updateUnreadCount = useCallback(async () => {
    try {
      const all = await fetchAllNotifications();
      const viewed = getViewedIds();
      const unread = all.filter(n => !viewed.includes(n.ID)).length;
      setUnreadCount(unread);
    } catch (e) {
      console.error('Failed to update unread count', e);
    }
  }, []);

  useEffect(() => {
    updateUnreadCount();
    const interval = setInterval(updateUnreadCount, 30000);
    
    // Listen for storage changes to sync unread count across tabs/components
    const handleStorage = () => updateUnreadCount();
    window.addEventListener('storage', handleStorage);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, [updateUnreadCount]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar unreadCount={unreadCount} />
      <Box component="main" sx={{ py: 4, minHeight: '100vh' }}>
        <Container maxWidth="md">
          <Component {...pageProps} refreshUnread={updateUnreadCount} />
        </Container>
      </Box>
    </ThemeProvider>
  );
}
