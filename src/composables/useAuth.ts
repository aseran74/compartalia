import { ref, computed, onMounted, onUnmounted } from 'vue';
import { firebaseAuthService, type UserProfile } from '@/services/firebaseAuthService';
import type { User } from 'firebase/auth';

export function useAuth() {
  const isLoading = ref(true);
  const user = ref<User | null>(firebaseAuthService.getCurrentUser());
  const userProfile = ref<UserProfile | null>(firebaseAuthService.getUserProfile());

  const isAuthenticated = computed(() => user.value !== null);
  const isConductor = computed(() => userProfile.value?.role === 'conductor');
  const isPasajero = computed(() => userProfile.value?.role === 'pasajero');

  // Login function
  const login = async (email: string, password: string) => {
    try {
      isLoading.value = true;
      await firebaseAuthService.login(email, password);
      user.value = firebaseAuthService.getCurrentUser();
      userProfile.value = firebaseAuthService.getUserProfile();
    } catch (error) {
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // Register function
  const register = async (email: string, password: string, name?: string, role: 'conductor' | 'pasajero' = 'pasajero') => {
    try {
      isLoading.value = true;
      await firebaseAuthService.register(email, password, name, role);
      user.value = firebaseAuthService.getCurrentUser();
      userProfile.value = firebaseAuthService.getUserProfile();
    } catch (error) {
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      isLoading.value = true;
      await firebaseAuthService.logout();
      // No limpiar manualmente aquí, dejar que onAuthStateChanged lo maneje
    } catch (error) {
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // Google login function
  const loginWithGoogle = async () => {
    try {
      isLoading.value = true;
      await firebaseAuthService.loginWithGoogle();
      user.value = firebaseAuthService.getCurrentUser();
      userProfile.value = firebaseAuthService.getUserProfile();
    } catch (error) {
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // Update profile function
  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      // For Firebase, we'll just update the local profile
      if (userProfile.value) {
        userProfile.value = { ...userProfile.value, ...updates };
      }
    } catch (error) {
      throw error;
    }
  };

  // Initialize auth state
  let unsubscribe: (() => void) | null = null;

  onMounted(() => {
    // Listen to auth state changes
    unsubscribe = firebaseAuthService.onAuthStateChanged((firebaseUser, profile) => {
      console.log('Auth state changed:', { firebaseUser, profile });
      user.value = firebaseUser;
      userProfile.value = profile;
      isLoading.value = false;
    });
  });

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  // Debug function
  const debugAuthState = () => {
    return firebaseAuthService.debugCurrentState();
  };

  // Force profile sync function
  const forceProfileSync = async () => {
    try {
      // For Firebase, just return current profile
      const profile = firebaseAuthService.getUserProfile();
      userProfile.value = profile;
      return profile;
    } catch (error) {
      console.error('Error forcing profile sync:', error);
      throw error;
    }
  };

  // Make debug functions available globally
  if (typeof window !== 'undefined') {
    (window as any).debugAuth = debugAuthState;
    (window as any).forceProfileSync = forceProfileSync;
  }

  return {
    user,
    userProfile,
    isAuthenticated,
    isConductor,
    isPasajero,
    isLoading,
    login,
    register,
    loginWithGoogle,
    logout,
    updateProfile,
    debugAuthState
  };
}
