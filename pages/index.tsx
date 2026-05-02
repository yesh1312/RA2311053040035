import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, ToggleButton, ToggleButtonGroup, Button, 
  Badge, Skeleton, Stack, IconButton, Tooltip 
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { 
  Notification, NotificationType, fetchAllNotifications, 
  getViewedIds, markAllAsViewed, TYPE_COLORS 
} from '../lib/notifications';
import NotificationCard from '../components/NotificationCard';

interface Props {
  refreshUnread: () => void;
}

export default function AllNotifications({ refreshUnread }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<NotificationType | 'All'>('All');
  const [viewedIds, setViewedIds] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllNotifications(filter === 'All' ? undefined : filter);
      setNotifications(data);
      setViewedIds(getViewedIds());
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Update viewed status when localStorage changes (polled or triggered)
  useEffect(() => {
    const handleStorage = () => setViewedIds(getViewedIds());
    window.addEventListener('storage', handleStorage);
    // Local polling for faster UI feedback within same tab
    const localInterval = setInterval(handleStorage, 1000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(localInterval);
    };
  }, []);

  const handleMarkAllRead = () => {
    const ids = notifications.map(n => n.ID);
    markAllAsViewed(ids);
    setViewedIds(getViewedIds());
    refreshUnread();
  };

  const counts = {
    All: notifications.length,
    Placement: notifications.filter(n => n.Type === 'Placement').length,
    Result: notifications.filter(n => n.Type === 'Result').length,
    Event: notifications.filter(n => n.Type === 'Event').length,
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={800}>Notifications</Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh">
            <IconButton onClick={loadData} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button 
            variant="outlined" 
            startIcon={<DoneAllIcon />} 
            onClick={handleMarkAllRead}
            disabled={notifications.length === 0}
          >
            Mark all read
          </Button>
        </Stack>
      </Box>

      <Box mb={3} sx={{ overflowX: 'auto', pb: 1 }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, val) => val && setFilter(val)}
          aria-label="type filter"
          size="small"
        >
          <ToggleButton value="All" sx={{ px: 2 }}>
            <Badge badgeContent={counts.All} color="primary" sx={{ '& .MuiBadge-badge': { right: -10, top: 0 } }}>
              All
            </Badge>
          </ToggleButton>
          {(['Placement', 'Result', 'Event'] as NotificationType[]).map(type => (
            <ToggleButton key={type} value={type} sx={{ px: 2 }}>
              <Badge 
                badgeContent={counts[type]} 
                sx={{ 
                  '& .MuiBadge-badge': { 
                    right: -10, 
                    top: 0, 
                    bgcolor: TYPE_COLORS[type], 
                    color: '#fff' 
                  } 
                }}
              >
                {type}
              </Badge>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {loading ? (
        <Stack spacing={2}>
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} variant="rounded" height={120} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
          ))}
        </Stack>
      ) : notifications.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Typography color="text.secondary">No notifications found.</Typography>
        </Box>
      ) : (
        <Box>
          {notifications.map(notif => (
            <NotificationCard 
              key={notif.ID} 
              notification={notif} 
              isViewed={viewedIds.includes(notif.ID)} 
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
