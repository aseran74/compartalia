import { ref, computed, onMounted, onUnmounted } from 'vue';
import { supabaseAuthService, type UserProfile } from '@/services/supabaseAuthService';

export function useAuth() {
  const isLoading = ref(true);
  const user = ref(supabaseAuthService.getCurrentUser());
  const userProfile = ref<UserProfile | null>(supabaseAuthService.getUserProfile());

  const isAuthenticated = computed(() => user.value !== null);
  const isConductor = computed(() => userProfile.value?.role === 'conductor');
  const isPasajero = computed(() => userProfile.value?.role === 'pasajero');

  // Login function
  const login = async (email: string, password: string) => {
    try {
      isLoading.value = true;
      await supabaseAuthService.login(email, password);
      user.value = supabaseAuthService.getCurrentUser();
      userProfile.value = supabaseAuthService.getUserProfile();
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
      await supabaseAuthService.register(email, password, name, role);
      user.value = supabaseAuthService.getCurrentUser();
      userProfile.value = supabaseAuthService.getUserProfile();
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
      await supabaseAuthService.logout();
      user.value = null;
      userProfile.value = null;
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
      await supabaseAuthService.loginWithGoogle();
      user.value = supabaseAuthService.getCurrentUser();
      userProfile.value = supabaseAuthService.getUserProfile();
    } catch (error) {
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // Update profile function
  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      await supabaseAuthService.updateProfile(updates);
      userProfile.value = supabaseAuthService.getUserProfile();
    } catch (error) {
      throw error;
    }
  };

  // Initialize auth state
  let unsubscribe: (() => void) | null = null;

  onMounted(() => {
    // Listen to auth state changes
    unsubscribe = supabaseAuthService.onAuthStateChanged((supabaseUser, profile) => {
      console.log('Auth state changed:', { supabaseUser, profile });
      user.value = supabaseUser;
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
    return supabaseAuthService.debugCurrentState();
  };

  // Force profile sync function
  const forceProfileSync = async () => {
    try {
      const profile = await supabaseAuthService.forceProfileSync();
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
