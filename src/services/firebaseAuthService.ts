import { auth } from '@/config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import type { User } from 'firebase/auth';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role: 'conductor' | 'pasajero';
  avatar_url?: string | null;
  phone?: string | null;
  preferences?: Record<string, any>;
}

class FirebaseAuthService {
  private currentUser: User | null = null;
  private userProfile: UserProfile | null = null;
  private authStateCallbacks: Array<(user: User | null, profile: UserProfile | null) => void> = [];

  constructor() {
    // Listen to auth state changes
    onAuthStateChanged(auth, async (user) => {
      console.log('=== FIREBASE AUTH STATE CHANGE ===');
      console.log('User:', user);
      
      this.currentUser = user;
      
      if (user) {
        console.log('User logged in, creating profile...');
        // Create user profile from Firebase user
        this.userProfile = {
          id: user.uid,
          email: user.email || '',
          name: user.displayName || user.email?.split('@')[0] || 'Usuario',
          role: 'pasajero', // Default role
          avatar_url: user.photoURL || null,
          phone: user.phoneNumber || null,
          preferences: {}
        };
      } else {
        console.log('User logged out, clearing profile...');
        this.userProfile = null;
      }
      
      console.log('Current user after change:', this.currentUser);
      console.log('User profile after change:', this.userProfile);
      
      // Notify all callbacks
      this.authStateCallbacks.forEach(callback => {
        console.log('Notifying callback with:', { user: this.currentUser, profile: this.userProfile });
        callback(this.currentUser, this.userProfile);
      });
      console.log('=== END FIREBASE AUTH STATE CHANGE ===');
    });
  }

  // Subscribe to auth state changes
  onAuthStateChanged(callback: (user: User | null, profile: UserProfile | null) => void) {
    this.authStateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateCallbacks.indexOf(callback);
      if (index > -1) {
        this.authStateCallbacks.splice(index, 1);
      }
    };
  }

  // Login with email and password
  async login(email: string, password: string) {
    try {
      console.log('=== FIREBASE LOGIN START ===');
      console.log('Email:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('Firebase login successful:', user);
      return user;
    } catch (error) {
      console.error('Firebase login error:', error);
      throw error;
    }
  }

  // Register with email and password
  async register(email: string, password: string, name?: string, role: 'conductor' | 'pasajero' = 'pasajero') {
    try {
      console.log('=== FIREBASE REGISTER START ===');
      console.log('Email:', email, 'Name:', name, 'Role:', role);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('Firebase registration successful:', user);
      return user;
    } catch (error) {
      console.error('Firebase registration error:', error);
      throw error;
    }
  }

  // Login with Google
  async loginWithGoogle() {
    try {
      console.log('=== FIREBASE GOOGLE LOGIN START ===');
      
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      console.log('Firebase Google login successful:', user);
      return user;
    } catch (error) {
      console.error('Firebase Google login error:', error);
      throw error;
    }
  }

  // Logout
  async logout() {
    try {
      console.log('=== FIREBASE LOGOUT START ===');
      console.log('Current user before logout:', this.currentUser);
      
      await signOut(auth);
      
      console.log('Firebase logout completed');
      console.log('=== FIREBASE LOGOUT END ===');
    } catch (error) {
      console.error('Firebase logout error:', error);
      throw error;
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Get user profile
  getUserProfile(): UserProfile | null {
    return this.userProfile;
  }

  // Debug function
  debugCurrentState() {
    return {
      currentUser: this.currentUser,
      userProfile: this.userProfile,
      authStateCallbacks: this.authStateCallbacks.length
    };
  }
}

// Export singleton instance
export const firebaseAuthService = new FirebaseAuthService();
export default firebaseAuthService;
