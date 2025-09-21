// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCxHXdiCYcPgE8x6j4GGFsMr3OCt8jIW4Y",
  authDomain: "sincere-point-468505-j9.firebaseapp.com",
  projectId: "sincere-point-468505-j9",
  storageBucket: "sincere-point-468505-j9.firebasestorage.app",
  messagingSenderId: "288946940789",
  appId: "1:288946940789:web:3e5684a9a108d7f9f0013c",
  measurementId: "G-XCNYVGMWQ2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;
