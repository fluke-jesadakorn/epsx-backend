import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration object
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase app
export const initializeFirebase = () => {
  const app = initializeApp(firebaseConfig);
  // Note: Analytics only works in browser environment
  if (typeof window !== 'undefined') {
    const analytics = getAnalytics(app);
    return { app, analytics };
  }
  return { app };
};

// TODO: Future features
// - Add Firebase Authentication integration
// - Add Firestore database integration
// - Add Firebase Cloud Messaging for notifications
// - Add Firebase Storage for file uploads
// - Add Firebase Functions for serverless computing
