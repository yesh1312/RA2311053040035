import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, ToggleButton, ToggleButtonGroup, Button, 
  Select, MenuItem, FormControl, InputLabel, Stack, Skeleton
} from '@mui/material';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { 
  Notification, NotificationType, fetchAllNotifications, 
  getViewedIds, markAllAsViewed, calculateScore 
} from '../lib/notifications';
import NotificationCard from '../components/NotificationCard';

interface Props {
  refreshUnread: () => void;
}

export default function PriorityInbox({ refreshUnread }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<NotificationType | 'All'>('All');
  const [topN, setTopN] = useState(10);
  const [viewedIds, setViewedIds] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllNotifications(filter === 'All' ? undefined : filter);
      
      // Calculate scores and sort
      const scored = data.map(n => ({
        ...n,
        score: calculateScore(n.Type, n.Timestamp)
      })).sort((a, b) => (b.score || 0) - (a.score || 0));

      setNotifications(scored.slice(0, topN));
      setViewedIds(getViewedIds());
    } finally {
      setLoading(false);
    }
  }, [filter, topN]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    const handleStorage = () => setViewedIds(getViewedIds());
    const localInterval = setInterval(handleStorage, 1000);
    return () => clearInterval(localInterval);
  }, []);

  const handleMarkTheseRead = () => {
    const ids = notifications.map(n => n.ID);
    markAllAsViewed(ids);
    setViewedIds(getViewedIds());
    refreshUnread();
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={800}>Priority Inbox</Typography>
        <Button 
          variant="outlined" 
          startIcon={<DoneAllIcon />} 
          onClick={handleMarkTheseRead}
          disabled={notifications.length === 0}
        >
          Mark these as read
        </Button>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3} alignItems={{ sm: 'center' }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, val) => val && setFilter(val)}
          size="small"
        >
          <ToggleButton value="All">All</ToggleButton>
          <ToggleButton value="Placement">Placement</ToggleButton>
          <ToggleButton value="Result">Result</ToggleButton>
          <ToggleButton value="Event">Event</ToggleButton>
        </ToggleButtonGroup>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="top-n-label">Show Top</InputLabel>
          <Select
            labelId="top-n-label"
            value={topN}
            label="Show Top"
            onChange={(e) => setTopN(e.target.value as number)}
          >
            {[5, 10, 15, 20, 25, 50].map(val => (
              <MenuItem key={val} value={val}>{val}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {loading ? (
        <Stack spacing={2}>
          {[1, 2, 3].map(i => (
            <Skeleton key={i} variant="rounded" height={120} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
          ))}
        </Stack>
      ) : notifications.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Typography color="text.secondary">No priority notifications found.</Typography>
        </Box>
      ) : (
        <Box>
          {notifications.map((notif, index) => (
            <NotificationCard 
              key={notif.ID} 
              notification={notif} 
              isViewed={viewedIds.includes(notif.ID)} 
              rank={index + 1}
              score={notif.score}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
