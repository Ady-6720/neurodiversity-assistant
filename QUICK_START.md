# NeuroEase - Quick Start Guide (Firebase)

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Add Project"
3. Name it (e.g., "neuroease-app")
4. Follow the wizard

### Step 3: Enable Services
**Authentication:**
- Go to Authentication → Get Started
- Enable "Email/Password"

**Firestore:**
- Go to Firestore Database → Create Database
- Choose "Production mode"
- Select your region

### Step 4: Get Firebase Config
1. Project Settings → General
2. Scroll to "Your apps"
3. Click Web icon (</>)
4. Copy the config values

### Step 5: Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Step 6: Add Security Rules
Go to Firestore → Rules, paste this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    match /user_profiles/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    match /{collection}/{docId} {
      allow read, write: if isAuthenticated() && 
        resource.data.user_id == request.auth.uid;
      allow create: if isAuthenticated() && 
        request.resource.data.user_id == request.auth.uid;
    }
  }
}
```

Click **Publish**.

### Step 7: Run the App
```bash
npm start
```

Press:
- `w` for web
- `a` for Android
- `i` for iOS

## ✅ You're Done!

Create an account and start using NeuroEase!

## 📚 Need More Help?
- **Full Setup Guide**: See `FIREBASE_SETUP.md`
- **Migration Details**: See `MIGRATION_SUMMARY.md`
- **Project Structure**: See `PROJECT_INDEX.md`

## 🐛 Common Issues

**"Missing environment variables"**
→ Check `.env.local` exists and has all 6 Firebase variables

**"Permission denied"**
→ Publish the security rules in Firestore

**"Index required"**
→ Click the link in the error to create the index

## 🎯 What's Changed?

✅ **Backend**: Supabase → Firebase  
✅ **Database**: PostgreSQL → Firestore  
✅ **Auth**: Supabase Auth → Firebase Auth  
❌ **UI/Screens**: No changes (as requested)

## 📱 Features Available

- ✅ User Authentication
- ✅ Task Management
- ✅ Schedule Planning
- ✅ Sensory Tools
- ✅ Cognitive Exercises
- ✅ Focus Sessions
- ✅ Progress Tracking

Enjoy using NeuroEase! 🎉
