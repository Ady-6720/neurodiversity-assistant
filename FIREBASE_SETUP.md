# Firebase Setup Guide for NeuroEase

## 🚀 Quick Setup Steps

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project" or "Create a Project"
3. Enter project details:
   - **Project Name**: `neuroease-app` (or your preferred name)
   - **Enable Google Analytics**: Optional (recommended for tracking)
   - **Analytics Account**: Choose existing or create new

### 2. Register Your App
1. In Firebase Console, click the **Web** icon (</>) to add a web app
2. Register app:
   - **App nickname**: `NeuroEase Web App`
   - **Firebase Hosting**: Check if you plan to use hosting (optional)
3. Copy the Firebase configuration object

### 3. Get Your Project Credentials
After app registration, you'll see your config. Copy these values:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### 4. Set Up Environment Variables (REQUIRED)
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Edit `.env.local` and add your actual Firebase credentials:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

⚠️ **SECURITY WARNING**: Never commit `.env.local` to version control. It's already in `.gitignore`.

### 5. Enable Firebase Authentication
1. In Firebase Console, go to **Authentication** → **Get Started**
2. Click **Sign-in method** tab
3. Enable **Email/Password**:
   - Toggle "Email/Password" to **Enabled**
   - Click **Save**
4. Optional: Enable other providers (Google, GitHub, etc.)

### 6. Set Up Firestore Database
1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** (we'll add security rules next)
4. Select a location closest to your users
5. Click **Enable**

### 7. Configure Firestore Security Rules
1. Go to **Firestore Database** → **Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // User profiles - users can only access their own profile
    match /user_profiles/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // Tasks - users can only access their own tasks
    match /tasks/{taskId} {
      allow read, write: if isAuthenticated() && 
        resource.data.user_id == request.auth.uid;
      allow create: if isAuthenticated() && 
        request.resource.data.user_id == request.auth.uid;
    }
    
    // Schedules - users can only access their own schedules
    match /schedules/{scheduleId} {
      allow read, write: if isAuthenticated() && 
        resource.data.user_id == request.auth.uid;
      allow create: if isAuthenticated() && 
        request.resource.data.user_id == request.auth.uid;
    }
    
    // Sensory preferences - users can only access their own preferences
    match /sensory_preferences/{prefId} {
      allow read, write: if isAuthenticated() && 
        resource.data.user_id == request.auth.uid;
      allow create: if isAuthenticated() && 
        request.resource.data.user_id == request.auth.uid;
    }
    
    // Sensory events - users can only access their own events
    match /sensory_events/{eventId} {
      allow read, write: if isAuthenticated() && 
        resource.data.user_id == request.auth.uid;
      allow create: if isAuthenticated() && 
        request.resource.data.user_id == request.auth.uid;
    }
    
    // Focus sessions - users can only access their own sessions
    match /focus_sessions/{sessionId} {
      allow read, write: if isAuthenticated() && 
        resource.data.user_id == request.auth.uid;
      allow create: if isAuthenticated() && 
        request.resource.data.user_id == request.auth.uid;
    }
    
    // Cognitive exercises - users can only access their own exercises
    match /cognitive_exercises/{exerciseId} {
      allow read, write: if isAuthenticated() && 
        resource.data.user_id == request.auth.uid;
      allow create: if isAuthenticated() && 
        request.resource.data.user_id == request.auth.uid;
    }
    
    // Communication templates - users can only access their own templates
    match /communication_templates/{templateId} {
      allow read, write: if isAuthenticated() && 
        resource.data.user_id == request.auth.uid;
      allow create: if isAuthenticated() && 
        request.resource.data.user_id == request.auth.uid;
    }
    
    // Cognitive entries - users can only access their own entries
    match /cognitive_entries/{entryId} {
      allow read, write: if isAuthenticated() && 
        resource.data.user_id == request.auth.uid;
      allow create: if isAuthenticated() && 
        request.resource.data.user_id == request.auth.uid;
    }
  }
}
```

3. Click **Publish**

### 8. Create Firestore Indexes (Optional but Recommended)
For better query performance, create composite indexes:

1. Go to **Firestore Database** → **Indexes** tab
2. Create indexes for common queries:

**Tasks Index:**
- Collection: `tasks`
- Fields: `user_id` (Ascending), `created_at` (Descending)

**Cognitive Exercises Index:**
- Collection: `cognitive_exercises`
- Fields: `user_id` (Ascending), `created_at` (Descending)

**Schedules Index:**
- Collection: `schedules`
- Fields: `user_id` (Ascending), `scheduled_date` (Ascending)

*Note: Firebase will automatically suggest creating indexes when you run queries that need them.*

## 🗄️ Firestore Collections Structure

### Collections Created by the App:

- **user_profiles**: User information and preferences
  - Fields: `id`, `display_name`, `email`, `neurodiversity_type`, `preferences`, `created_at`, `updated_at`

- **tasks**: Task management
  - Fields: `user_id`, `title`, `description`, `priority`, `category`, `due_date`, `completed`, `created_at`, etc.

- **schedules**: Calendar and routine management
  - Fields: `user_id`, `title`, `scheduled_time`, `scheduled_date`, `duration_minutes`, `activity_type`, etc.

- **sensory_preferences**: Sensory sensitivity tracking
  - Fields: `user_id`, `sensory_type`, `sensitivity_level`, `triggers`, `coping_strategies`, etc.

- **sensory_events**: Sensory event logging
  - Fields: `user_id`, `sensory_type`, `intensity_level`, `triggers`, `notes`, `created_at`

- **focus_sessions**: Pomodoro and focus tracking
  - Fields: `user_id`, `session_type`, `planned_duration_minutes`, `actual_duration_minutes`, `completed`, etc.

- **cognitive_exercises**: Cognitive exercise tracking
  - Fields: `user_id`, `exercise_id`, `exercise_name`, `score`, `accuracy_percentage`, `created_at`, etc.

- **communication_templates**: Pre-written communication aids
  - Fields: `user_id`, `title`, `template_text`, `category`, `is_favorite`, etc.

- **cognitive_entries**: Memory aids and planning notes
  - Fields: `user_id`, `entry_type`, `title`, `content`, `tags`, `created_at`, etc.

## 🧪 Testing Your Setup

1. Start your app: `npm start`
2. Try creating an account
3. Check Firebase Console → **Authentication** → **Users**
4. Verify user profile was created in **Firestore Database** → **Data** → **user_profiles**

## 🔒 Security Notes

- Never commit your Firebase config to public repositories (use environment variables)
- The API key is safe for client-side use (it's designed for that)
- Firestore security rules ensure users can only access their own data
- For production, consider additional security measures like App Check

## 📚 Differences from Supabase

### Key Changes:
1. **Authentication**: Firebase Auth instead of Supabase Auth
2. **Database**: Firestore (NoSQL) instead of PostgreSQL
3. **Queries**: Firestore queries instead of SQL-like queries
4. **Security**: Security Rules instead of Row Level Security (RLS)
5. **Real-time**: Firestore real-time listeners (can be added later)

### Migration Notes:
- Document IDs in Firestore are auto-generated or custom strings
- Firestore uses collections and documents (NoSQL) vs tables and rows (SQL)
- Composite queries may require indexes
- No built-in triggers (use Cloud Functions if needed)

## 🆘 Troubleshooting

**Authentication not working?**
- Check your Firebase config in `.env.local`
- Verify Email/Password is enabled in Firebase Console
- Check browser console for errors

**Database errors?**
- Ensure Firestore is created and enabled
- Check security rules are published
- Verify user is authenticated

**Permission denied errors?**
- Check Firestore security rules
- Ensure `user_id` field matches authenticated user's UID
- Verify user is logged in

**Need help?**
- Firebase docs: [firebase.google.com/docs](https://firebase.google.com/docs)
- Firestore docs: [firebase.google.com/docs/firestore](https://firebase.google.com/docs/firestore)
- Community: [stackoverflow.com/questions/tagged/firebase](https://stackoverflow.com/questions/tagged/firebase)

## 📦 Next Steps

After setup:
1. Test authentication flow
2. Create sample tasks and verify they appear in Firestore
3. Test cognitive exercises and check data storage
4. Customize user preferences
5. Consider adding Cloud Functions for advanced features
6. Set up Firebase Analytics for usage tracking

---

**Migration Complete!** 🎉 Your app now uses Firebase instead of Supabase.
