import { initializeApp } from "firebase/app";
import { getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyCc7gZdVoqgmNHvlvDi3cYj06XxfsMBMkw",
    authDomain: "mac-a-thon2026.firebaseapp.com",
    projectId: "mac-a-thon2026",
    storageBucket: "mac-a-thon2026.firebasestorage.app",
    messagingSenderId: "223194563239",
    appId: "1:223194563239:web:2fb2defc3444091650d182",
    measurementId: "G-EM22TREX94"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;