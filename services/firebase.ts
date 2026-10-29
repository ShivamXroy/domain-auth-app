import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import { Platform } from 'react-native';

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseConfigured = Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
const app = getApps().length ? getApp() : initializeApp(config);

// Metro selects Firebase's React Native entry point at runtime. Its RN-only
// persistence export is intentionally absent from browser-oriented TypeScript types.
const nativePersistence = (FirebaseAuth as typeof FirebaseAuth & {
  getReactNativePersistence: (storage: typeof AsyncStorage) => unknown;
}).getReactNativePersistence;

export const auth = Platform.OS === 'web'
  ? FirebaseAuth.getAuth(app) // Firebase defaults to durable browser persistence.
  : FirebaseAuth.initializeAuth(app, { persistence: nativePersistence(AsyncStorage) as never });
