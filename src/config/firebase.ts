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

// Initialize Firebase Authentication
// Usar getAuth directamente para mejor compatibilidad en todos los entornos (web, Netlify, Android)
let authInstance;
try {
  authInstance = getAuth(app);
  // Configure auth settings for better Google Sign-In support
  if (authInstance) {
    authInstance.useDeviceLanguage();
    console.log('✅ Firebase Auth inicializado correctamente');
  }
} catch (error) {
  console.error('❌ Error inicializando Firebase Auth:', error);
  throw error;
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = authInstance;

// Initialize Analytics (only in browser and if available)
let analyticsInstance = null;
try {
  if (typeof window !== 'undefined' && window.navigator) {
    analyticsInstance = getAnalytics(app);
    console.log('✅ Firebase Analytics inicializado');
  }
} catch (error) {
  console.warn('⚠️ Firebase Analytics no disponible (normal en SSR o algunos entornos):', error);
}
export const analytics = analyticsInstance;

// Debug function to check Firebase configuration
export const debugFirebaseConfig = () => {
  console.log('=== FIREBASE CONFIG DEBUG ===');
  console.log('Project ID:', firebaseConfig.projectId);
  console.log('Auth Domain:', firebaseConfig.authDomain);
  console.log('API Key:', firebaseConfig.apiKey ? 'Present' : 'Missing');
  console.log('Auth Instance:', auth);
  console.log('=============================');
};

export default app;
