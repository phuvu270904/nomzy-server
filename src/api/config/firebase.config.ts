import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

let firebaseApp: admin.app.App;

export function initializeFirebaseApp() {
  if (!firebaseApp) {
    // Check if we have environment variables for Firebase service account
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_CLIENT_EMAIL
    ) {
      // Initialize with environment variables
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
    } else {
      // If there's a service account file instead of environment variables
      try {
        firebaseApp = admin.initializeApp({
          credential: admin.credential.applicationDefault(),
        });
      } catch (error) {
        console.error('Error initializing Firebase:', error);
        throw new Error('Firebase configuration is missing or invalid');
      }
    }
  }
  return firebaseApp;
}

export function getFirebaseApp(): admin.app.App {
  if (!firebaseApp) {
    return initializeFirebaseApp();
  }
  return firebaseApp;
}

export function getAuth() {
  return getFirebaseApp().auth();
}

export function getMessaging() {
  return getFirebaseApp().messaging();
}
