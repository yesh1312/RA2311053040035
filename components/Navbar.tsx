import React from 'react';
import { AppBar, Toolbar, Typography, Button, Badge, Box, useMediaQuery, useTheme, IconButton } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import SchoolIcon from '@mui/icons-material/School';

interface Props {
  unreadCount: number;
}

const Navbar: React.FC<Props> = ({ unreadCount }) => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const isActive = (path: string) => router.pathname === path;

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        bgcolor: 'rgba(15, 15, 26, 0.8)', 
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        boxShadow: 'none'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box display="flex" alignItems="center" component={Link} href="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
          <SchoolIcon sx={{ mr: 1, color: 'primary.main', fontSize: 30 }} />
          {!isMobile && (
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
              Campus<Box component="span" sx={{ color: 'primary.main' }}>Notify</Box>
            </Typography>
          )}
        </Box>

        <Box display="flex" gap={1}>
          <Link href="/" passHref legacyBehavior>
            {isMobile ? (
              <IconButton color={isActive('/') ? 'primary' : 'inherit'}>
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            ) : (
              <Button 
                variant={isActive('/') ? 'contained' : 'text'} 
                startIcon={
                  <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                }
              >
                All
              </Button>
            )}
          </Link>

          <Link href="/priority" passHref legacyBehavior>
            {isMobile ? (
              <IconButton color={isActive('/priority') ? 'primary' : 'inherit'}>
                <PriorityHighIcon />
              </IconButton>
            ) : (
              <Button 
                variant={isActive('/priority') ? 'contained' : 'text'} 
                startIcon={<PriorityHighIcon />}
              >
                Priority
              </Button>
            )}
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
