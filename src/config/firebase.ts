// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDzyhdNuoDcZN49QURXJfreMjWX-R97kjU",
  authDomain: "quincenalia-5eaa2.firebaseapp.com",
  projectId: "quincenalia-5eaa2",
  storageBucket: "quincenalia-5eaa2.firebasestorage.app",
  messagingSenderId: "754938560838",
  appId: "1:754938560838:web:f8912f3d195eb1b9aee547",
  measurementId: "G-NT6JBGS3EC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Analytics (only in browser)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
