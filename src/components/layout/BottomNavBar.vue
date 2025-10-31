<template>
  <nav
    v-if="showBottomNav"
    class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center shadow-lg z-50 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] lg:hidden bottom-nav"
  >
    <router-link to="/" class="flex flex-col items-center justify-center text-gray-600 transition-colors px-4 py-2 flex-1 max-w-[100px]" exact-active-class="router-link-active">
      <Home class="w-6 h-6" />
      <span class="text-xs mt-1">Inicio</span>
    </router-link>
    <router-link to="/buscar-viajes" class="flex flex-col items-center justify-center text-gray-600 transition-colors px-4 py-2 flex-1 max-w-[100px]" exact-active-class="router-link-active">
      <Search class="w-6 h-6" />
      <span class="text-xs mt-1">Buscar</span>
    </router-link>
    <router-link to="/notificaciones" class="flex flex-col items-center justify-center text-gray-600 transition-colors px-4 py-2 flex-1 max-w-[100px]" exact-active-class="router-link-active">
      <div class="relative">
        <Bell class="w-6 h-6" />
        <span v-if="notificaciones > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {{ notificaciones }}
        </span>
      </div>
      <span class="text-xs mt-1">Avisos</span>
    </router-link>
    <router-link to="/perfil" class="flex flex-col items-center justify-center text-gray-600 transition-colors px-4 py-2 flex-1 max-w-[100px]" exact-active-class="router-link-active">
      <User class="w-6 h-6" />
      <span class="text-xs mt-1">Perfil</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { Home, Search, Bell, User } from 'lucide-vue-next';

const notificaciones = ref(0); // Conecta a tu store/realtime push
const route = useRoute();
const showBottomNav = computed(() => !(route.path.startsWith('/login') || route.path.startsWith('/registro')));
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
