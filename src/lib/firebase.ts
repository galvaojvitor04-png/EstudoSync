import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "dauntless-coda-7szp9",
  appId: "1:121102444121:web:695213fc83ac679560f348",
  apiKey: "AIzaSyAhHbv4DlSB2Ig-hCe30pVWX2Orc8kgUMo",
  authDomain: "dauntless-coda-7szp9.firebaseapp.com",
  storageBucket: "dauntless-coda-7szp9.firebasestorage.app",
  messagingSenderId: "121102444121"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence for Firestore
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
  } else if (err.code == 'unimplemented') {
    console.warn('The current browser does not support all of the features required to enable persistence');
  }
});

// Set Auth Persistence
setPersistence(auth, browserLocalPersistence);
