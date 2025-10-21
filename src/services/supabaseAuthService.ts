import { supabase } from '@/config/supabase';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role: 'conductor' | 'pasajero';
  created_at: string;
  updated_at: string;
  avatar_url?: string | null;
  phone?: string | null;
  preferences?: Record<string, any>;
}

class SupabaseAuthService {
  private currentUser: User | null = null;
  private userProfile: UserProfile | null = null;
  private authStateCallbacks: Array<(user: User | null, profile: UserProfile | null) => void> = [];

  constructor() {
    // Listen to auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('=== SUPABASE AUTH STATE CHANGE ===');
      console.log('Event:', event);
      console.log('Session:', session);
      console.log('User:', session?.user);
      
      this.currentUser = session?.user || null;
      
      if (session?.user) {
        console.log('User logged in, syncing profile...');
        // Sync user profile with Supabase
        await this.syncUserProfile(session.user);
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
      console.log('=== END AUTH STATE CHANGE ===');
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      console.log('Login successful:', data.user);
      return data.user;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  // Register with email and password
  async register(email: string, password: string, name?: string, role: 'conductor' | 'pasajero' = 'pasajero') {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0],
            role: role
          },
          emailRedirectTo: undefined // No redirect, confirm immediately
        }
      });
      
      if (error) throw error;
      
      console.log('Registration successful:', data.user);
      
      // Si el usuario se creó pero no está confirmado, intentar confirmarlo automáticamente
      if (data.user && !data.user.email_confirmed_at) {
        console.log('User created but not confirmed, attempting auto-confirmation...');
        // El usuario se creará y estará disponible para login inmediatamente
      }
      
      return data.user;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  }

  // Login with Google
  async loginWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
      
      console.log('Google login initiated:', data);
      return data;
    } catch (error) {
      console.error('Error logging in with Google:', error);
      throw error;
    }
  }

  // Logout
  async logout() {
    try {
      console.log('=== STARTING LOGOUT ===');
      console.log('Current user before logout:', this.currentUser);
      console.log('Current profile before logout:', this.userProfile);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('Supabase signOut completed, clearing local state...');
      this.currentUser = null;
      this.userProfile = null;
      
      console.log('Local state cleared');
      console.log('Current user after logout:', this.currentUser);
      console.log('Current profile after logout:', this.userProfile);
      console.log('=== LOGOUT COMPLETED ===');
    } catch (error) {
      console.error('Error logging out:', error);
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

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Debug function to check current state
  debugCurrentState() {
    console.log('=== SUPABASE AUTH SERVICE DEBUG ===');
    console.log('Current User:', this.currentUser);
    console.log('Current User Profile:', this.userProfile);
    console.log('Is Authenticated:', this.isAuthenticated());
    console.log('========================');
    return {
      user: this.currentUser,
      userProfile: this.userProfile,
      isAuthenticated: this.isAuthenticated()
    };
  }

  // Force profile sync
  async forceProfileSync() {
    if (this.currentUser) {
      console.log('Forcing profile sync for:', this.currentUser.id);
      await this.syncUserProfile(this.currentUser);
      return this.userProfile;
    }
    return null;
  }

  // Sync user profile with Supabase
  private async syncUserProfile(user: User) {
    try {
      console.log('Syncing user profile for:', user.id);
      console.log('User data:', {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.user_metadata?.full_name
      });
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        // If profile doesn't exist, create it
        await this.createUserProfile(user);
        return;
      }

      console.log('User profile synced successfully:', data);
      this.userProfile = data as UserProfile;
    } catch (error) {
      console.error('Error syncing user profile:', error);
    }
  }

  // Create user profile in Supabase
  private async createUserProfile(user: User) {
    try {
      const userName = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';
      const avatarUrl = user.user_metadata?.avatar_url;
      
      console.log('Creating user profile:', { 
        id: user.id, 
        email: user.email, 
        name: userName,
        avatarUrl: avatarUrl
      });

      const profileData = {
        id: user.id,
        email: user.email || '',
        name: userName,
        role: 'pasajero',
        avatar_url: avatarUrl,
        phone: null,
        preferences: {
          role: 'pasajero',
          notifications: true,
          language: 'es',
          theme: 'light',
          google_user: !!avatarUrl,
          display_name: userName
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
        .eq('id', this.currentUser.id);

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

export const supabaseAuthService = new SupabaseAuthService();
