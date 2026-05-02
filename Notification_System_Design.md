# Campus Notifications Microservice Design

## Stage 1: Priority Inbox Logic

### Scoring Formula
The priority score for each notification is calculated using the following exact formula:
`score = type_weight * 1000 + (1 / (seconds_elapsed + 1))`

**Weights:**
- **Placement:** 3
- **Result:** 2
- **Event:** 1

This formula ensures that type takes absolute precedence (e.g., any Placement notification scores >3000, while Results score >2000), and within each type, newer notifications score higher due to the inverse decay of `seconds_elapsed`.

### Min-Heap Algorithm
To find the Top-N notifications efficiently from a large stream:
1. Initialize a **min-heap** of size `N`.
2. For each notification in the dataset (size `M`):
   - Calculate its priority score.
   - If the heap has fewer than `N` elements, push the current notification onto the heap.
   - If the heap is full, compare the current notification's score with the score of the element at the top of the heap (the smallest score in the current top-N).
   - If the current score is larger, replace the top element with the current notification and re-heapify.
3. After processing all elements, the heap contains the `N` highest-scoring notifications.

### Complexity
- **Time Complexity:** `O(M log N)` where `M` is the total number of notifications and `N` is the number of top elements requested. This is much more efficient than sorting the entire list `O(M log M)` when `N << M`.
- **Space Complexity:** `O(N)` to store the heap.

### Real-Time Handling
The system handles new notifications by:
- **Polling:** The frontend auto-refreshes every 30 seconds to fetch new data.
- **Dynamic Scoring:** Since the score depends on `seconds_elapsed`, the scores are recalculated on every refresh to ensure the ranking reflects the passage of time.
- **Visual Feedback:** "New" chips and bold text distinguish unread notifications, which are tracked via `localStorage`.

## Stage 2: Frontend Architecture

### Technology Stack
- **Next.js 14 (Pages Router):** For routing and SSR/SSG capabilities.
- **Material UI v5:** For premium dark-mode styling and robust components.
- **TypeScript:** For type safety across the notification data model.

### State Management
- **Unread Count:** Managed globally in `_app.tsx` and updated via a callback passed to pages.
- **Viewed Tracking:** IDs are stored in `localStorage` under `campus_viewed_ids`.
- **Visibility Observer:** An `IntersectionObserver` marks notifications as read only after they have been on screen for 2 seconds.
