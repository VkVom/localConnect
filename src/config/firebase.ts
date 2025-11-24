import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// --------------------------------------------------------
// KEEP YOUR EXISTING KEYS HERE
// --------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyB5KprJ0PmMF2m_5IPyKoGk2wNuckdVpLg",
  authDomain: "localconnect-94d31.firebaseapp.com",
  projectId: "localconnect-94d31",
  storageBucket: "localconnect-94d31.firebasestorage.app",
  messagingSenderId: "367421152628",
  appId: "1:367421152628:web:9e9b19261e66303afc6021"
};;
// --------------------------------------------------------

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Enable Offline Persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});