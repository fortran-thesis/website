/**
 * Firebase Client SDK — singleton initialisation
 *
 * All Firebase Web config values are read from `NEXT_PUBLIC_FIREBASE_*`
 * environment variables (set in `.env.local` or your hosting env).
 *
 * Required env vars:
 *   NEXT_PUBLIC_FIREBASE_API_KEY
 *   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
 *   NEXT_PUBLIC_FIREBASE_PROJECT_ID
 *   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
 *   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
 *   NEXT_PUBLIC_FIREBASE_APP_ID
 *
 * Optional:
 *   NEXT_PUBLIC_FIREBASE_VAPID_KEY  — required for web push (getToken)
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectAuthEmulator, getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let firebaseApp: FirebaseApp | null = null;

/** Returns the singleton FirebaseApp (creates it on first call). */
export function getFirebaseApp(): FirebaseApp {
  if (firebaseApp) return firebaseApp;

  firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

  // Connect to emulators in development BEFORE any other operations
  if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_API_URL?.includes('localhost')) {
    try {
      const db = getFirestore(firebaseApp);
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log('[Firebase] Connected to Firestore emulator');

      const auth = getAuth(firebaseApp);
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      console.log('[Firebase] Connected to Auth emulator');
    } catch (error: any) {
      // Already connected, or emulator not available
      if (!error.message?.includes('already connected')) {
        console.warn('[Firebase] Could not connect to emulator:', error.message);
      }
    }
  }

  return firebaseApp;
}
