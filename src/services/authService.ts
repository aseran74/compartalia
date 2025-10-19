import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
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

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Create user profile in Supabase
  private async createUserProfile(firebaseUser: FirebaseUser, name?: string, role: 'conductor' | 'pasajero' = 'pasajero') {
    try {
      // Para usuarios de Google, usar displayName si está disponible
      const userName = name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario';
      
      console.log('Creating user profile:', { 
        uid: firebaseUser.uid, 
        email: firebaseUser.email, 
        name: userName, 
        role 
      });

      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: userName,
            role: role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

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
