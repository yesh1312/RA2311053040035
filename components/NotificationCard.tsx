import React, { useEffect, useRef } from 'react';
import { Box, Paper, Typography, Chip, Badge, styled } from '@mui/material';
import { Notification, TYPE_COLORS, markAsViewed } from '../lib/notifications';
import { formatDistanceToNow } from 'date-fns';

const StyledPaper = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isViewed' && prop !== 'typeColor',
})<{ isViewed?: boolean; typeColor: string }>(({ theme, isViewed, typeColor }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  position: 'relative',
  borderLeft: `4px solid ${typeColor}`,
  opacity: isViewed ? 0.7 : 1,
  transition: 'transform 0.2s ease-in-out, opacity 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  cursor: 'pointer',
}));

const RankBadge = styled(Box)(({ theme }) => ({
  width: 24,
  height: 24,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  marginRight: theme.spacing(1),
}));

interface Props {
  notification: Notification;
  isViewed: boolean;
  rank?: number;
  score?: number;
}

const NotificationCard: React.FC<Props> = ({ notification, isViewed, rank, score }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const typeColor = TYPE_COLORS[notification.Type] || '#ccc';

  useEffect(() => {
    if (isViewed) return;

    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            markAsViewed(notification.ID);
            // We don't need to observe anymore after marking
            observer.disconnect();
          }
        },
        { threshold: 0.5 } // 50% visibility
      );

      if (cardRef.current) {
        observer.observe(cardRef.current);
      }

      return () => observer.disconnect();
    }, 2000);

    return () => clearTimeout(timer);
  }, [notification.ID, isViewed]);

  return (
    <StyledPaper 
      ref={cardRef} 
      isViewed={isViewed} 
      typeColor={typeColor}
    >
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
        <Box display="flex" alignItems="center">
          {rank !== undefined && <RankBadge sx={{ bgcolor: typeColor }}>{rank}</RankBadge>}
          <Chip 
            label={notification.Type} 
            size="small" 
            sx={{ 
              bgcolor: 'transparent', 
              border: `1px solid ${typeColor}`,
              color: typeColor,
              fontWeight: 600,
              mr: 1
            }} 
          />
          {!isViewed && (
            <Chip 
              label="New" 
              size="small" 
              color="primary" 
              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
            />
          )}
        </Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', opacity: 0.8 }}>
          {formatDistanceToNow(new Date(notification.Timestamp.replace(' ', 'T')), { addSuffix: true })}
        </Typography>
      </Box>

      <Typography 
        variant="body1" 
        sx={{ 
          fontWeight: isViewed ? 400 : 600,
          mb: 1,
          color: isViewed ? 'text.secondary' : 'text.primary'
        }}
      >
        {notification.Message}
      </Typography>

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
          ID: {notification.ID.substring(0, 8)}...
        </Typography>
        {score !== undefined && (
          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
            Score: {score.toFixed(2)}
          </Typography>
        )}
      </Box>
    </StyledPaper>
  );
};

export default NotificationCard;
