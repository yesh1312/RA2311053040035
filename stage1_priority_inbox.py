import requests
import heapq
import datetime
import os
import json
from datetime import datetime as dt

# Configuration
N = 10  # Top-N results
BASE_URL = os.getenv("CAMPUS_API_URL", "http://20.207.122.201/evaluation-service/notifications")
TOKEN = os.getenv("CAMPUS_API_TOKEN", "your_bearer_token_here")

TYPE_WEIGHTS = {
    "Placement": 3,
    "Result": 2,
    "Event": 1
}

TYPE_ICONS = {
    "Placement": "[JOB]",
    "Result": "[RES]",
    "Event": "[EVT]"
}

def calculate_score(notif_type, timestamp_str):
    """
    score = type_weight * 1000 + (1 / (seconds_elapsed + 1))
    """
    weight = TYPE_WEIGHTS.get(notif_type, 1)
    
    # Parse timestamp: "2026-04-22 17:51:30" -> replace space with T
    ts_iso = timestamp_str.replace(" ", "T")
    notif_time = dt.fromisoformat(ts_iso)
    now = dt.now()
    
    seconds_elapsed = max(0, (now - notif_time).total_seconds())
    
    score = weight * 1000 + (1 / (seconds_elapsed + 1))
    return score, seconds_elapsed

def fetch_notifications():
    notifications = []
    page = 1
    limit = 50
    headers = {"Authorization": f"Bearer {TOKEN}"}
    
    print(f"Fetching notifications from {BASE_URL}...")
    
    while True:
        try:
            response = requests.get(
                BASE_URL, 
                params={"page": page, "limit": limit}, 
                headers=headers,
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            batch = data.get("notifications", [])
            if not batch:
                break
            
            notifications.extend(batch)
            print(f"Fetched page {page} ({len(batch)} items)")
            
            # Check if we've reached the end (simple check if batch size < limit)
            if len(batch) < limit:
                break
                
            page += 1
        except Exception as e:
            print(f"Error fetching data: {e}")
            break
            
    return notifications

    return notifications

def generate_mock_data():
    mock_data = []
    now = dt.now()
    # 40 Placements
    for i in range(40):
        ts = (now - datetime.timedelta(hours=i*2)).strftime("%Y-%m-%d %H:%M:%S")
        mock_data.append({"ID": f"placement-{i}", "Type": "Placement", "Message": f"Placement Opportunity {i+1}: Tech Giant hiring.", "Timestamp": ts})
    # 40 Results
    for i in range(40):
        ts = (now - datetime.timedelta(hours=i*5)).strftime("%Y-%m-%d %H:%M:%S")
        mock_data.append({"ID": f"result-{i}", "Type": "Result", "Message": f"Result: Semester {i//5 + 1} published.", "Timestamp": ts})
    # 30 Events
    for i in range(30):
        ts = (now - datetime.timedelta(days=i)).strftime("%Y-%m-%d %H:%M:%S")
        mock_data.append({"ID": f"event-{i}", "Type": "Event", "Message": f"Event: Campus {['Workshop', 'Hackathon'][i%2]}", "Timestamp": ts})
    # High Priority
    mock_data.append({"ID": "priority-1", "Type": "Placement", "Message": "CRITICAL: Google Shortlist Out!", "Timestamp": now.strftime("%Y-%m-%d %H:%M:%S")})
    return mock_data

MOCK_NOTIFICATIONS = generate_mock_data()

def main():
    if TOKEN == "your_bearer_token_here":
        print("WARNING: Using default placeholder token. Falling back to sample data.")
        all_notifs = MOCK_NOTIFICATIONS
    else:
        all_notifs = fetch_notifications()

    if not all_notifs:
        print("No notifications found. Falling back to sample data.")
        all_notifs = MOCK_NOTIFICATIONS

    print(f"Processing {len(all_notifs)} notifications...")
    
    # Min-heap of size N to find top-N (O(M log N))
    # Heap stores (score, notification_data)
    top_n_heap = []

    for notif in all_notifs:
        notif_type = notif.get("Type", "Event")
        timestamp_str = notif.get("Timestamp", "")
        
        if not timestamp_str:
            continue
            
        score, seconds_elapsed = calculate_score(notif_type, timestamp_str)
        
        # We use (score, id, notif) to handle potential score ties and keep data
        # but primarily we compare by score
        entry = (score, seconds_elapsed, notif)
        
        if len(top_n_heap) < N:
            heapq.heappush(top_n_heap, entry)
        else:
            # If current score is higher than the smallest score in heap
            if score > top_n_heap[0][0]:
                heapq.heapreplace(top_n_heap, entry)

    # Sort results descending by score
    results = sorted(top_n_heap, key=lambda x: x[0], reverse=True)

    print(f"\n--- Top {N} Priority Inbox ---")
    print(f"{'Rank':<5} {'Type':<12} {'Message':<40} {'ID':<10} {'Score':<10}")
    print("-" * 80)
    
    for i, (score, age_sec, notif) in enumerate(results, 1):
        n_type = notif.get("Type", "Unknown")
        icon = TYPE_ICONS.get(n_type, "❓")
        msg = notif.get("Message", "")[:37] + "..." if len(notif.get("Message", "")) > 37 else notif.get("Message", "")
        n_id = str(notif.get("ID", ""))[:8]
        ts = notif.get("Timestamp", "")
        
        # Calculate human readable age
        if age_sec < 60:
            age_str = f"{int(age_sec)}s"
        elif age_sec < 3600:
            age_str = f"{int(age_sec // 60)}m"
        else:
            age_str = f"{int(age_sec // 3600)}h"

        print(f"{i:<5} {icon} {n_type:<8} {msg:<40} {n_id:<10} {score:.2f}")
        print(f"      Time: {ts} | Age: {age_str}")
        print("-" * 80)

if __name__ == "__main__":
    main()
