<template>
  <div class="flex items-center">
    <div class="flex items-center text-gray-700 dark:text-gray-400">
      <span class="mr-3 overflow-hidden rounded-full h-11 w-11">
        <div v-if="profile?.name" class="w-full h-full bg-green-600 rounded-full flex items-center justify-center">
          <span class="text-white text-sm font-semibold">
            {{ profile.name.charAt(0).toUpperCase() }}
          </span>
        </div>
        <div v-else class="w-full h-full bg-gray-400 rounded-full flex items-center justify-center">
          <span class="text-white text-sm font-semibold">U</span>
        </div>
      </span>

      <span class="block mr-1 font-medium text-theme-sm">
        {{ profile?.name?.split(' ')[0] || 'Usuario' }}
      </span>
    </div>

    <!-- Dropdown -->
    <div v-if="showDropdown" class="relative ml-2">
      <button
        @click="toggleDropdown"
        class="flex items-center"
      >
        <ChevronDownIcon :class="{ 'rotate-180': dropdownOpen }" class="w-4 h-4" />
      </button>

      <!-- Dropdown Menu -->
      <div
        v-if="dropdownOpen"
        class="absolute right-0 mt-2 w-64 flex flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-800 dark:bg-gray-dark z-50"
      >
        <div class="pb-3 border-b border-gray-200 dark:border-gray-800">
          <span class="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {{ profile?.name || 'Usuario' }}
          </span>
          <span class="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {{ profile?.email || 'Cargando...' }}
          </span>
          <span v-if="profile?.role" class="mt-0.5 block text-theme-xs text-green-600 font-medium">
            {{ profile.role === 'conductor' ? 'Conductor' : 'Pasajero' }}
          </span>
        </div>

        <ul class="flex flex-col gap-1 pt-4 pb-3">
          <li>
            <router-link
              to="/profile"
              class="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              @click="closeDropdown"
            >
              <UserCircleIcon class="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-"/> Editar perfil
            </router-link>
          </li>
          <li>
            <router-link
              to="/carpooling/miembros"
              class="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              @click="closeDropdown"
            >
              <SettingsIcon class="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"/> Configuración
            </router-link>
          </li>
          <li>
            <router-link
              to="/carpooling/mensajeria"
              class="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              @click="closeDropdown"
            >
              <InfoCircleIcon class="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"/> Soporte
            </router-link>
          </li>
        </ul>

        <button
          @click="handleLogout"
          class="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 w-full text-left"
        >
          <LogoutIcon class="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"/>
          Cerrar sesión
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ChevronDownIcon, UserCircleIcon, SettingsIcon, InfoCircleIcon } from '@heroicons/vue/24/outline'
import { LogoutIcon } from '@heroicons/vue/24/solid'
import { supabase } from '@/config/supabase'
import { auth } from '@/config/firebase'
import { signOut } from 'firebase/auth'

interface UserProfile {
  id: string
  email: string
  name: string
  role: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

interface Props {
  showDropdown?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDropdown: true
})

const emit = defineEmits<{
  logout: []
}>()

const profile = ref<UserProfile | null>(null)
const dropdownOpen = ref(false)
const loading = ref(true)

// Get current user ID from Firebase
const getCurrentUserId = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe()
      resolve(user?.uid || null)
    })
  })
}

// Fetch user profile from Supabase
const fetchUserProfile = async () => {
  try {
    loading.value = true
    const userId = await getCurrentUserId()
    
    if (!userId) {
      console.log('No user authenticated')
      return
    }

    console.log('Fetching profile for user:', userId)
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return
    }

    console.log('User profile loaded:', data)
    profile.value = data
  } catch (error) {
    console.error('Error in fetchUserProfile:', error)
  } finally {
    loading.value = false
  }
}

// Toggle dropdown
const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

// Close dropdown
const closeDropdown = () => {
  dropdownOpen.value = false
}

// Handle logout
const handleLogout = async () => {
  try {
    await signOut(auth)
    profile.value = null
    emit('logout')
    closeDropdown()
  } catch (error) {
    console.error('Error logging out:', error)
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    closeDropdown()
  }
}

onMounted(() => {
  fetchUserProfile()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}
</style>
