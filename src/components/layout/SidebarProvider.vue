<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { provide } from 'vue'
import { useSidebarProvider } from '@/composables/useSidebar'

const sidebarContext = useSidebarProvider()

// Hacer disponible el contexto para los componentes hijos
provide('sidebar', sidebarContext)
</script>
