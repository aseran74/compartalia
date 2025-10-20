import { ref, computed, onMounted, onUnmounted } from 'vue';
import { authService, type UserProfile } from '@/services/authService';

export function useAuth() {
  const isLoading = ref(true);
  const user = ref(authService.getCurrentUser());
  const userProfile = ref<UserProfile | null>(authService.getUserProfile());

  const isAuthenticated = computed(() => user.value !== null);
  const isConductor = computed(() => userProfile.value?.role === 'conductor');
  const isPasajero = computed(() => userProfile.value?.role === 'pasajero');

  // Login function
  const login = async (email: string, password: string) => {
    try {
      isLoading.value = true;
      await authService.login(email, password);
      user.value = authService.getCurrentUser();
      userProfile.value = authService.getUserProfile();
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
      await authService.register(email, password, name, role);
      user.value = authService.getCurrentUser();
      userProfile.value = authService.getUserProfile();
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
      await authService.logout();
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
      await authService.loginWithGoogle();
      user.value = authService.getCurrentUser();
      userProfile.value = authService.getUserProfile();
    } catch (error) {
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // Update profile function
  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      await authService.updateProfile(updates);
      userProfile.value = authService.getUserProfile();
    } catch (error) {
      throw error;
    }
  };

  // Initialize auth state
  let unsubscribe: (() => void) | null = null;

  onMounted(() => {
    // Listen to auth state changes
    unsubscribe = authService.onAuthStateChanged((firebaseUser, profile) => {
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
    updateProfile
  };
}
