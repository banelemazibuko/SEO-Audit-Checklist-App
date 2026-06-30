// Firebase app initialization and configuration using environment variables.

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Read config from .env.local — Vite exposes only VITE_* variables to the browser
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Helpful error if .env.local is missing or wrong format (common beginner mistake)
const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
  throw new Error(
    `Firebase config missing: ${missingKeys.join(', ')}. ` +
      'Check .env.local uses VITE_FIREBASE_* variables (not JavaScript code). ' +
      'Restart npm run dev after editing .env.local.',
  );
}

// Initialize Firebase once — all other firebase/* files import from here
const app = initializeApp(firebaseConfig);

// Auth service — sign up, log in, log out
export const auth = getAuth(app);

// Firestore database — save and load audit sessions
export const db = getFirestore(app);
