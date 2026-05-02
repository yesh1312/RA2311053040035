# Campus Notifications Microservice

A full-stack campus notification system featuring a Python-based priority engine and a Next.js real-time dashboard.

## Features
- **Priority Inbox**: Automated ranking based on notification type (Placement > Result > Event) and time decay.
- **Real-time Dashboard**: Built with Next.js 14 and Material UI v5, featuring live unread tracking.
- **Smart Mark-as-Read**: Notifications are marked as viewed only after 2 seconds of screen visibility (Intersection Observer).
- **Mobile Responsive**: Fully adaptive design with glassmorphism aesthetics.
- **API Proxy**: Secure server-side proxy to handle external API requests.

## Project Structure
- `stage1_priority_inbox.py`: Python priority scoring script.
- `/pages`: Next.js pages (All Notifications, Priority Inbox, API Proxy).
- `/components`: Reusable MUI components (Navbar, NotificationCard).
- `/lib`: Shared logic (Theme, Notification API, Scoring).
- `/github_assets`: Project media and walkthroughs.

## Setup

### Prerequisites
- Node.js 18+
- Python 3.10+

### Installation
1. Install frontend dependencies:
   ```bash
   npm install
   ```
2. Install Python dependencies:
   ```bash
   pip install requests
   ```

### Configuration
Create a `.env.local` file:
```bash
NEXT_PUBLIC_API_TOKEN=your_token_here
NEXT_PUBLIC_API_URL=http://20.207.122.201/evaluation-service/notifications
```

### Running the App
**Frontend:**
```bash
npm run dev
```

**Priority Script:**
```bash
python stage1_priority_inbox.py
```

## System Design
See [Notification_System_Design.md](./Notification_System_Design.md) for details on the scoring formula and min-heap algorithm.
