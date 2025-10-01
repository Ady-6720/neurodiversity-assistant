# Create These Indexes in Firebase Console

Go to: https://console.firebase.google.com/project/neuroease2/firestore/indexes

Click "Add Index" for each one:

## Index 1: Tasks - Basic
- Collection: `tasks`
- Field 1: `user_id` → Ascending
- Field 2: `created_at` → Descending
- Query scope: Collection
- Click CREATE

## Index 2: Tasks - Completed Filter
- Collection: `tasks`
- Field 1: `user_id` → Ascending
- Field 2: `completed` → Ascending
- Field 3: `created_at` → Descending
- Click CREATE

## Index 3: Tasks - Due Date
- Collection: `tasks`
- Field 1: `user_id` → Ascending
- Field 2: `completed` → Ascending
- Field 3: `due_date` → Ascending
- Click CREATE

## Index 4: Schedules - Date & Time
- Collection: `schedules`
- Field 1: `user_id` → Ascending
- Field 2: `scheduled_date` → Ascending
- Field 3: `scheduled_time` → Ascending
- Click CREATE

## Index 5: Schedules - Date Only
- Collection: `schedules`
- Field 1: `user_id` → Ascending
- Field 2: `scheduled_date` → Ascending
- Click CREATE

## Index 6: Cognitive - Basic
- Collection: `cognitive_exercises`
- Field 1: `user_id` → Ascending
- Field 2: `created_at` → Descending
- Click CREATE

## Index 7: Cognitive - By Type
- Collection: `cognitive_exercises`
- Field 1: `user_id` → Ascending
- Field 2: `exercise_type` → Ascending
- Field 3: `completed` → Ascending
- Field 4: `created_at` → Descending
- Click CREATE

## Index 8: Cognitive - Completed
- Collection: `cognitive_exercises`
- Field 1: `user_id` → Ascending
- Field 2: `completed` → Ascending
- Field 3: `created_at` → Descending
- Click CREATE

## Index 9: Focus - Basic
- Collection: `focus_sessions`
- Field 1: `user_id` → Ascending
- Field 2: `started_at` → Descending
- Click CREATE

## Index 10: Focus - Completed
- Collection: `focus_sessions`
- Field 1: `user_id` → Ascending
- Field 2: `completed` → Ascending
- Field 3: `started_at` → Descending
- Click CREATE

## Index 11: Sensory Events
- Collection: `sensory_events`
- Field 1: `user_id` → Ascending
- Field 2: `created_at` → Descending
- Click CREATE

---

After creating all indexes, wait 2-3 minutes for them to build, then refresh your app!
