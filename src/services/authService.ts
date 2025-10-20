import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { supabase } from '@/config/supabase';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role: 'conductor' | 'pasajero';
  created_at: string;
  updated_at: string;
}

class AuthService {
  private currentUser: FirebaseUser | null = null;
  private userProfile: UserProfile | null = null;
  private authStateCallbacks: Array<(user: FirebaseUser | null, profile: UserProfile | null) => void> = [];

  constructor() {
    // Listen to auth state changes
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      if (user) {
        // Sync user profile with Supabase
        await this.syncUserProfile(user);
      } else {
        this.userProfile = null;
      }
      
      // Notify all callbacks
      this.authStateCallbacks.forEach(callback => callback(user, this.userProfile));
    });
  }

  // Subscribe to auth state changes
  onAuthStateChanged(callback: (user: FirebaseUser | null, profile: UserProfile | null) => void) {
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  // Register with email and password
  async register(email: string, password: string, name?: string, role: 'conductor' | 'pasajero' = 'pasajero') {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Supabase
      await this.createUserProfile(userCredential.user, name, role);
      
      return userCredential.user;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  }

  // Login with Google
  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      
      // Configurar el proveedor de Google
      provider.addScope('email');
      provider.addScope('profile');
      
      // Usar popup para mejor UX
      const result = await signInWithPopup(auth, provider);
      
      console.log('Google login successful:', result.user);
      return result.user;
    } catch (error) {
      console.error('Error logging in with Google:', error);
      throw error;
    }
  }

  // Login with Google (redirect method - for mobile)
  async loginWithGoogleRedirect() {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error('Error with Google redirect:', error);
      throw error;
    }
  }

  // Handle Google redirect result
  async handleGoogleRedirectResult() {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        console.log('Google redirect result:', result.user);
        return result.user;
      }
      return null;
    } catch (error) {
      console.error('Error handling Google redirect result:', error);
      throw error;
    }
  }

  // Logout
  async logout() {
    try {
      await signOut(auth);
      this.userProfile = null;
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return this.currentUser;
  }

  // Get user profile
  getUserProfile(): UserProfile | null {
    return this.userProfile;
  }

  // Debug function to check current state
  debugCurrentState() {
    console.log('=== AUTH SERVICE DEBUG ===');
    console.log('Current Firebase User:', this.currentUser);
    console.log('Current User Profile:', this.userProfile);
    console.log('Is Authenticated:', this.isAuthenticated());
    console.log('========================');
    return {
      firebaseUser: this.currentUser,
      userProfile: this.userProfile,
      isAuthenticated: this.isAuthenticated()
    };
  }

  // Force profile sync
  async forceProfileSync() {
    if (this.currentUser) {
      console.log('Forcing profile sync for:', this.currentUser.uid);
      await this.syncUserProfile(this.currentUser);
      return this.userProfile;
    }
    return null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Create user profile in Supabase
  private async createUserProfile(firebaseUser: FirebaseUser, name?: string, role: 'conductor' | 'pasajero' = 'pasajero') {
    try {
      // Para usuarios de Google, usar displayName y photoURL si están disponibles
      const userName = name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario';
      const photoURL = firebaseUser.photoURL;
      
      console.log('Creating user profile:', { 
        uid: firebaseUser.uid, 
        email: firebaseUser.email, 
        name: userName,
        photoURL: photoURL,
        role 
      });

      const profileData = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: userName,
        role: role,
        avatar_url: photoURL,
        phone: null,
        preferences: {
          role: role,
          notifications: true,
          language: 'es',
          theme: 'light',
          google_user: !!firebaseUser.photoURL,
          display_name: firebaseUser.displayName
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData]);

      if (error) {
        console.error('Error creating user profile:', error);
        throw error;
      }

      console.log('User profile created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // Sync user profile with Supabase
  private async syncUserProfile(firebaseUser: FirebaseUser) {
    try {
      console.log('Syncing user profile for:', firebaseUser.uid);
      console.log('Firebase user data:', {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL
      });
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', firebaseUser.uid)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        // If profile doesn't exist, create it
        await this.createUserProfile(firebaseUser);
        return;
      }

      console.log('User profile synced successfully:', data);
      this.userProfile = data as UserProfile;
    } catch (error) {
      console.error('Error syncing user profile:', error);
    }
  }


  // Update user profile
  async updateProfile(updates: Partial<UserProfile>) {
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.currentUser.uid);

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      // Refresh user profile
      await this.syncUserProfile(this.currentUser);
      
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
