<template>
  <div class="relative" ref="dropdownRef">
    <button
      class="flex items-center text-gray-700 dark:text-gray-400"
      @click.prevent="toggleDropdown"
    >
      <span class="mr-3 overflow-hidden rounded-full h-11 w-11">
        <div v-if="userProfile?.name" class="w-full h-full bg-green-600 rounded-full flex items-center justify-center">
          <span class="text-white text-sm font-semibold">
            {{ userProfile.name.charAt(0).toUpperCase() }}
          </span>
        </div>
        <img v-else src="/images/user/owner.jpg" alt="User" />
      </span>

      <span class="block mr-1 font-medium text-theme-sm">{{ userProfile?.name?.split(' ')[0] || 'Usuario' }}</span>

      <ChevronDownIcon :class="{ 'rotate-180': dropdownOpen }" />
    </button>

    <!-- Dropdown Start -->
    <div
      v-if="dropdownOpen"
      class="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
    >
      <div>
        <span class="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
          {{ userProfile?.name || 'Usuario' }}
        </span>
        <span class="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
          {{ userProfile?.email || 'usuario@compartalia.com' }}
        </span>
        <span v-if="userProfile?.role" class="mt-0.5 block text-theme-xs text-green-600 font-medium">
          {{ userProfile.role === 'conductor' ? 'Conductor' : 'Pasajero' }}
        </span>
      </div>

      <ul class="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
        <li v-for="item in menuItems" :key="item.href">
          <router-link
            :to="item.href"
            class="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
          >
            <!-- SVG icon would go here -->
            <component
              :is="item.icon"
              class="text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
            />
            {{ item.text }}
          </router-link>
        </li>
      </ul>
      <button
        @click="signOut"
        class="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 w-full text-left"
      >
        <LogoutIcon
          class="text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
        />
        Cerrar sesión
      </button>
    </div>
    <!-- Dropdown End -->
  </div>
</template>

<script setup>
import { UserCircleIcon, ChevronDownIcon, LogoutIcon, SettingsIcon, InfoCircleIcon } from '@/icons'
import { RouterLink } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuth } from '@/composables/useAuth'

const dropdownOpen = ref(false)
const dropdownRef = ref(null)

// Auth composable
const { userProfile, logout } = useAuth()

const menuItems = [
  { href: '/profile', icon: UserCircleIcon, text: 'Editar perfil' },
  { href: '/carpooling/miembros', icon: SettingsIcon, text: 'Configuración' },
  { href: '/carpooling/mensajeria', icon: InfoCircleIcon, text: 'Soporte' },
]

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

const signOut = async () => {
  try {
    await logout()
    console.log('Signed out successfully')
    closeDropdown()
    // Redirect to landing page
    window.location.href = '/'
  } catch (error) {
    console.error('Error signing out:', error)
  }
}

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  // Debug: Log auth state
  console.log('UserMenu mounted - Auth state:', {
    userProfile: userProfile.value,
    hasUserProfile: !!userProfile.value,
    userProfileKeys: userProfile.value ? Object.keys(userProfile.value) : 'No profile'
  })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
