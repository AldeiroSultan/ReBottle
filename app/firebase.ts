import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCBsmxvChAroPEcpBt1QQDcqKsD5tXfy5s",
  authDomain: "rebottles-f86a0.firebaseapp.com",
  projectId: "rebottles-f86a0",
  storageBucket: "rebottles-f86a0.firebasestorage.app",
  messagingSenderId: "418636504786",
  appId: "1:418636504786:web:e5cf02530342438013970b",
  measurementId: "G-EQYECG66XC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };