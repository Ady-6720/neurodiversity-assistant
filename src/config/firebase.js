// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log('✅ Firebase app initialized');

// Initialize Firebase Auth
const auth = getAuth(app);
console.log('✅ Firebase Auth initialized');

// Initialize Firestore
const db = getFirestore(app);
console.log('✅ Firestore initialized');

export { app, auth, db };
