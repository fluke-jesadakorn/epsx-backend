# Firebase Integration Guide

## Backend Setup (NestJS)

The backend is already configured with Firebase Admin SDK. Ensure your `.env` file has the following Firebase configurations:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_STORAGE_BUCKET=your-storage-bucket
```

To get these credentials:
1. Go to Firebase Console -> Project Settings -> Service Accounts
2. Click "Generate New Private Key"
3. Use the downloaded JSON file to fill in the environment variables

## Frontend Setup (Next.js)

1. Install the required dependencies:

```bash
npm install firebase
# or
yarn add firebase
```

2. Create `src/config/firebase.config.ts`:

```typescript
// src/config/firebase.config.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
```

3. Create `.env.local` in your Next.js project:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

Get these values from:
1. Go to Firebase Console -> Project Settings -> General
2. Scroll down to "Your apps" section
3. Click the web app icon (</>)
4. Register app and copy the configuration

## Connecting Frontend to Backend

1. Create an authentication utility in your Next.js app:

```typescript
// src/utils/auth.ts
import { auth } from '@/config/firebase.config';

export const getIdToken = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in');
  return await user.getIdToken();
};

export const appendAuthHeader = async (headers: HeadersInit = {}) => {
  const token = await getIdToken();
  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
};
```

2. Use the auth utility in your API calls:

```typescript
// src/utils/api.ts
import { appendAuthHeader } from './auth';

export const api = {
  async get(endpoint: string) {
    const headers = await appendAuthHeader();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      headers,
    });
    return response.json();
  },

  async post(endpoint: string, data: any) {
    const headers = await appendAuthHeader({
      'Content-Type': 'application/json',
    });
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return response.json();
  },
  // Add other methods as needed
};
```

3. Example usage in a Next.js component:

```typescript
// src/app/example/page.tsx
'use client';

import { useState } from 'react';
import { auth } from '@/config/firebase.config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { api } from '@/utils/api';

export default function ExamplePage() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Login with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get data from backend using Firebase token
      const data = await api.get('/protected-endpoint');
      console.log('Protected data:', data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of your component
}
```

## Security Notes

1. Backend Verification:
   - The backend is already set up to verify Firebase tokens
   - Use the `FirebaseService.verifyIdToken()` method to validate incoming tokens

2. Frontend Security:
   - Always use environment variables with `NEXT_PUBLIC_` prefix for client-side Firebase config
   - Never expose admin credentials on the frontend
   - Implement proper security rules in Firebase Console for Firestore and Storage

3. CORS:
   - Ensure your NestJS backend is configured to accept requests from your Next.js frontend domain

4. Environment Variables:
   - Keep backend Firebase admin credentials secure and never expose them
   - Frontend Firebase config variables are public and safe to expose (they're restricted by Firebase security rules)
