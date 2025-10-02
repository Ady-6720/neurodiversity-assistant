// src/config/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, inMemoryPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// Get Firebase credentials from environment variables
// You MUST create a .env.local file with your actual credentials
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

console.log('🔥 Firebase Config Loading...');
console.log('API Key present:', !!firebaseConfig.apiKey);
console.log('Project ID:', firebaseConfig.projectId);

// Validate that environment variables are set
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Firebase config:', firebaseConfig);
  throw new Error(
    'Missing Firebase environment variables. Please create a .env.local file with:\n' +
    'EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key\n' +
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain\n' +
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id\n' +
    'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket\n' +
    'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id\n' +
    'EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id\n\n' +
    'See FIREBASE_SETUP.md for detailed instructions.'
  );
}

console.log('✅ Firebase config validated');

// Initialize Firebase (reuse existing app if already initialized)
let app;
let auth;
let db;

try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized');

  // Initialize Firebase Auth
  auth = getAuth(app);
  console.log('✅ Firebase Auth initialized');

  // Set persistence based on platform (async, don't block)
  if (Platform.OS === 'web') {
    setPersistence(auth, browserLocalPersistence)
      .then(() => console.log('✅ Web persistence enabled'))
      .catch((error) => console.warn('⚠️ Persistence warning:', error.message));
  }

  // Initialize Firestore
  db = getFirestore(app);
  console.log('✅ Firestore initialized');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  throw error;
}

export { app, auth, db };
