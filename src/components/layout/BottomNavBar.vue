<template>
  <nav
    v-if="showBottomNav"
    class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center shadow-lg z-50 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] lg:hidden bottom-nav"
  >
    <!-- Botón 1: Inicio -->
    <button 
      @click="handleHomeClick" 
      :class="{ 'router-link-active': route.path === '/' }"
      class="flex flex-col items-center justify-center text-gray-600 transition-colors px-4 py-2 flex-1 max-w-[100px] hover:text-blue-500"
    >
      <Home class="w-6 h-6" :class="{ 'text-blue-500': route.path === '/' }" />
      <span class="text-xs mt-1" :class="{ 'font-semibold text-blue-500': route.path === '/' }">Inicio</span>
    </button>

    <!-- Botón 2: Buscar Viajes (Público) -->
    <button 
      @click="handleSearchClick" 
      :class="{ 'router-link-active': route.path === '/buscar-viajes' }"
      class="flex flex-col items-center justify-center text-gray-600 transition-colors px-4 py-2 flex-1 max-w-[100px] hover:text-blue-500"
    >
      <Search class="w-6 h-6" :class="{ 'text-blue-500': route.path === '/buscar-viajes' }" />
      <span class="text-xs mt-1" :class="{ 'font-semibold text-blue-500': route.path === '/buscar-viajes' }">Buscar</span>
    </button>

    <!-- Botón 3: Dashboard (Requiere login) -->
    <button 
      @click="handleDashboardClick" 
      :class="{ 'router-link-active': route.path === '/dashboard' }"
      class="flex flex-col items-center justify-center text-gray-600 transition-colors px-4 py-2 flex-1 max-w-[100px] hover:text-blue-500"
    >
      <LayoutDashboard class="w-6 h-6" :class="{ 'text-blue-500': route.path === '/dashboard' }" />
      <span class="text-xs mt-1" :class="{ 'font-semibold text-blue-500': route.path === '/dashboard' }">Dashboard</span>
    </button>

    <!-- Botón 4: Publicar Viaje (Requiere login) -->
    <button 
      @click="handleCreateTripClick" 
      :class="{ 'router-link-active': route.path === '/carpooling/create-trip' }"
      class="flex flex-col items-center justify-center text-gray-600 transition-colors px-4 py-2 flex-1 max-w-[100px] hover:text-blue-500"
    >
      <Plus class="w-6 h-6" :class="{ 'text-blue-500': route.path === '/carpooling/create-trip' }" />
      <span class="text-xs mt-1" :class="{ 'font-semibold text-blue-500': route.path === '/carpooling/create-trip' }">Publicar</span>
    </button>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Home, Search, LayoutDashboard, Plus } from 'lucide-vue-next';
import { useAuth } from '@/composables/useAuth';

const route = useRoute();
const router = useRouter();

// Usar el composable de autenticación de Firebase
const { isAuthenticated } = useAuth();

// Mostrar navbar solo si no estamos en login o registro
const showBottomNav = computed(() => !(route.path.startsWith('/login') || route.path.startsWith('/registro')));

// Handlers de navegación

// 1. Inicio - Siempre accesible
const handleHomeClick = () => {
  router.push('/');
};

// 2. Buscar Viajes - Siempre accesible (público)
const handleSearchClick = () => {
  router.push('/buscar-viajes');
};

// 3. Dashboard - Requiere login
const handleDashboardClick = () => {
  if (isAuthenticated.value) {
    router.push('/dashboard');
  } else {
    router.push({ path: '/login', query: { redirect: '/dashboard' } });
  }
};

// 4. Publicar Viaje - Requiere login
const handleCreateTripClick = () => {
  if (isAuthenticated.value) {
    router.push('/carpooling/create-trip');
  } else {
    router.push({ path: '/login', query: { redirect: '/carpooling/create-trip' } });
  }
};
</script>

<style scoped>
.router-link-active {
  color: #3B82F6; /* Tailwind blue-500 */
}

.router-link-active .w-6 {
  transform: scale(1.12);
}

.router-link-active span {
  font-weight: 600;
}

/* Asegurar que la navbar se muestre en móvil web (Netlify) */
.bottom-nav {
  display: flex !important;
}

@media (min-width: 1024px) {
  .bottom-nav {
    display: none !important;
  }
}
</style>