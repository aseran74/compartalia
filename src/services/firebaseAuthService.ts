import { auth } from '@/config/firebase';
import { supabase } from '@/config/supabase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential
} from 'firebase/auth';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';
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
      console.log('User UID:', user?.uid);
      console.log('User Email:', user?.email);
      
      this.currentUser = user;
      
      if (user) {
        console.log('User logged in, fetching profile from database...');
        // Try to get user profile from Supabase database
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', user.email)
            .single();

          if (profile && !error) {
            console.log('Profile found in database:', profile);
            this.userProfile = {
              id: profile.id,
              email: profile.email,
              name: profile.name,
              role: profile.role,
              avatar_url: profile.avatar_url,
              phone: profile.phone,
              preferences: profile.preferences || {}
            };
          } else {
            console.log('Profile not found in database, creating default...');
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
          }
        } catch (error) {
          console.error('Error fetching profile from database:', error);
          // Fallback to Firebase user data
          this.userProfile = {
            id: user.uid,
            email: user.email || '',
            name: user.displayName || user.email?.split('@')[0] || 'Usuario',
            role: 'pasajero',
            avatar_url: user.photoURL || null,
            phone: user.phoneNumber || null,
            preferences: {}
          };
        }
      } else {
        console.log('User logged out, clearing profile...');
        this.userProfile = null;
        
        // Force redirect to login if not on public pages
        const currentPath = window.location.pathname;
        const publicPaths = ['/', '/buscar-viajes', '/login', '/register'];
        
        if (!publicPaths.includes(currentPath)) {
          console.log('Redirecting to login from:', currentPath);
          window.location.href = '/login';
        }
      }
      
      console.log('Current user after change:', this.currentUser);
      console.log('User profile after change:', this.userProfile);
      console.log('Number of callbacks to notify:', this.authStateCallbacks.length);
      
      // Notify all callbacks
      this.authStateCallbacks.forEach((callback, index) => {
        console.log(`Notifying callback ${index} with:`, { user: this.currentUser, profile: this.userProfile });
        try {
          callback(this.currentUser, this.userProfile);
        } catch (error) {
          console.error(`Error in callback ${index}:`, error);
        }
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

  // Login with Google (universal: mobile nativo + web)
  async loginWithGoogle() {
    try {
      if (Capacitor.isNativePlatform()) {
        // Móvil nativo
        console.log('🔵 Iniciando login con Google en plataforma nativa...');
        const result = await FirebaseAuthentication.signInWithGoogle({
          webClientId: '754938560838-e9qdg9aqgi1i3oaipcf2pvkkr4nj8a7u.apps.googleusercontent.com'
        });
        
        console.log('🔵 Resultado de Capacitor Firebase Auth:', result);
        console.log('🔵 Credential:', result.credential);
        console.log('🔵 ID Token:', result.credential?.idToken);
        console.log('🔵 Access Token:', result.credential?.accessToken);
        
        if (!result.credential?.idToken) {
          throw new Error('No se obtuvo idToken de Google');
        }
        
        // Crear credencial de Firebase con idToken y accessToken si está disponible
        const idToken = result.credential.idToken;
        const accessToken = result.credential.accessToken;
        
        let firebaseCredential;
        // GoogleAuthProvider.credential acepta idToken solo, o idToken + accessToken
        // Si accessToken está presente y es válido, usarlo; si no, solo idToken
        if (accessToken && typeof accessToken === 'string' && accessToken.length > 0) {
          // Si tenemos accessToken válido, usarlo también (más completo)
          console.log('🔵 Usando idToken + accessToken para credencial');
          firebaseCredential = GoogleAuthProvider.credential(idToken, accessToken);
        } else {
          // Solo con idToken (suficiente para Firebase Auth)
          console.log('🔵 Usando solo idToken para credencial');
          firebaseCredential = GoogleAuthProvider.credential(idToken);
        }
        
        console.log('🔵 Firebase credential creada:', firebaseCredential);
        
        const signInResult = await signInWithCredential(auth, firebaseCredential);
        const user = signInResult.user;
        console.log('🔵 Login exitoso, usuario:', user.email);
        return user;
      } else {
        // Web
        console.log('🌐 Iniciando login con Google en web...');
        
        // Verificar que auth esté inicializado
        if (!auth) {
          throw new Error('Firebase Auth no está inicializado. Verifica la configuración.');
        }
        
        const provider = new GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        provider.setCustomParameters({ prompt: 'select_account' });
        
        console.log('🌐 Auth instance:', auth);
        console.log('🌐 Auth current user before:', auth.currentUser);
        console.log('🌐 Provider:', provider);
        
        try {
          const result = await signInWithPopup(auth, provider);
          console.log('🌐 Login exitoso, usuario:', result.user.email);
          return result.user;
        } catch (popupError: any) {
          console.error('🌐 Error en signInWithPopup:', popupError);
          
          // Si falla signInWithPopup, podría ser problema de dominio o configuración
          if (popupError.code === 'auth/unauthorized-domain') {
            throw new Error('Este dominio no está autorizado en Firebase. Verifica compartalia.netlify.app en Firebase Console > Authentication > Settings > Authorized domains.');
          }
          
          throw popupError;
        }
      }
    } catch (error: any) {
      console.error('❌ Firebase Google login error:', error);
      console.error('❌ Error code:', error?.code);
      console.error('❌ Error message:', error?.message);
      console.error('❌ Error stack:', error?.stack);
      
      // Handle specific error cases
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('El popup de Google fue cerrado. Por favor, intenta de nuevo.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('El popup de Google fue bloqueado. Por favor, permite popups para este sitio.');
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('Dominio no autorizado. Contacta al administrador.');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Google Sign-In no está habilitado. Contacta al administrador.');
      } else if (error.code === 'auth/argument-error') {
        throw new Error('Error en los argumentos de autenticación. Verifica la configuración de Firebase.');
      } else {
        throw new Error(error.message || 'Error al iniciar sesión con Google');
      }
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
