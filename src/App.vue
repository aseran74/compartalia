<template>
  <ThemeProvider>
    <SidebarProvider>
      <RouterView />
      <ToastContainer />
      <BottomNavBar />
    </SidebarProvider>
  </ThemeProvider>
</template>

<script setup lang="ts">
import ThemeProvider from './components/layout/ThemeProvider.vue'
import SidebarProvider from './components/layout/SidebarProvider.vue'
import ToastContainer from './components/ui/ToastContainer.vue'
import BottomNavBar from './components/layout/BottomNavBar.vue'
import { useCapacitor } from './composables/useCapacitor'

// Inicializar Capacitor
useCapacitor()
</script>