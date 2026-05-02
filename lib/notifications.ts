export type NotificationType = 'Placement' | 'Result' | 'Event';

export interface Notification {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string;
  score?: number;
}

const BASE_URL = '/api/notifications';
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

export const TYPE_WEIGHTS: Record<NotificationType, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

export const TYPE_COLORS: Record<NotificationType, string> = {
  Placement: '#6C63FF',
  Result: '#FF6584',
  Event: '#29B6F6',
};

export const calculateScore = (type: NotificationType, timestamp: string): number => {
  const weight = TYPE_WEIGHTS[type] || 1;
  const tsISO = timestamp.replace(' ', 'T');
  const notifTime = new Date(tsISO).getTime();
  const now = new Date().getTime();
  const secondsElapsed = Math.max(0, (now - notifTime) / 1000);
  
  return weight * 1000 + (1 / (secondsElapsed + 1));
};

const MOCK_NOTIFICATIONS: Notification[] = [
  ...Array.from({ length: 40 }).map((_, i) => ({
    ID: `placement-${i}`,
    Type: 'Placement' as NotificationType,
    Message: `Placement Opportunity ${i + 1}: Major tech company hiring for various roles.`,
    Timestamp: new Date(Date.now() - (i * 1000 * 60 * 60 * 2)).toISOString().replace('T', ' ').split('.')[0],
  })),
  ...Array.from({ length: 40 }).map((_, i) => ({
    ID: `result-${i}`,
    Type: 'Result' as NotificationType,
    Message: `Result Declaration: Semester ${Math.floor(i/5) + 1} exam results for batch ${2020 + (i%4)} are out.`,
    Timestamp: new Date(Date.now() - (i * 1000 * 60 * 60 * 5)).toISOString().replace('T', ' ').split('.')[0],
  })),
  ...Array.from({ length: 30 }).map((_, i) => ({
    ID: `event-${i}`,
    Type: 'Event' as NotificationType,
    Message: `Campus Event: Join us for the ${['Workshop', 'Seminar', 'Hackathon', 'Cultural Fest'][i%4]} this weekend.`,
    Timestamp: new Date(Date.now() - (i * 1000 * 60 * 60 * 24)).toISOString().replace('T', ' ').split('.')[0],
  })),
  // High Priority (Recent Placements)
  {
    ID: 'priority-1',
    Type: 'Placement',
    Message: 'CRITICAL: Google interview shortlists are live! Check immediately.',
    Timestamp: new Date(Date.now() - 1000 * 60).toISOString().replace('T', ' ').split('.')[0],
  },
  {
    ID: 'priority-2',
    Type: 'Result',
    Message: 'URGENT: Final year re-evaluation results published.',
    Timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString().replace('T', ' ').split('.')[0],
  }
];

export const fetchAllNotifications = async (typeFilter?: NotificationType): Promise<Notification[]> => {
  let allNotifications: Notification[] = [];
  let page = 1;
  const limit = 50;

  while (true) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (typeFilter && typeFilter !== ('All' as any)) {
      params.append('notification_type', typeFilter);
    }

    try {
      const response = await fetch(`${BASE_URL}?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch notifications');

      const data = await response.json();
      const batch = data.notifications || [];
      
      allNotifications = [...allNotifications, ...batch];
      
      if (batch.length < limit) break;
      page++;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback to mock data if API fails or is unauthorized
      allNotifications = MOCK_NOTIFICATIONS;
      break;
    }
  }

  // If we couldn't get any notifications (e.g. 401), use mock data
  if (allNotifications.length === 0) {
    allNotifications = MOCK_NOTIFICATIONS;
  }

  // Filter by type if needed
  if (typeFilter && typeFilter !== ('All' as any)) {
    allNotifications = allNotifications.filter(n => n.Type === typeFilter);
  }

  // Sort newest first by default
  return allNotifications.sort((a, b) => 
    new Date(b.Timestamp.replace(' ', 'T')).getTime() - new Date(a.Timestamp.replace(' ', 'T')).getTime()
  );
};

export const getViewedIds = (): string[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('campus_viewed_ids');
  return stored ? JSON.parse(stored) : [];
};

export const markAsViewed = (id: string) => {
  if (typeof window === 'undefined') return;
  const viewed = getViewedIds();
  if (!viewed.includes(id)) {
    localStorage.setItem('campus_viewed_ids', JSON.stringify([...viewed, id]));
  }
};

export const markAllAsViewed = (ids: string[]) => {
  if (typeof window === 'undefined') return;
  const viewed = getViewedIds();
  const newViewed = Array.from(new Set([...viewed, ...ids]));
  localStorage.setItem('campus_viewed_ids', JSON.stringify(newViewed));
};
