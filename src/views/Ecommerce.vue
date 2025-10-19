<template>
  <admin-layout>
    <div class="space-y-6">
      <!-- Header del Dashboard -->
      <div class="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Dashboard Compartalia</h1>
            <p class="text-gray-600 mt-1">Bienvenido de vuelta, {{ userProfile?.name || 'Usuario' }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500">Última actualización</p>
            <p class="text-sm font-medium text-gray-900">{{ currentDate }}</p>
          </div>
        </div>
      </div>

      <!-- Métricas Principales -->
      <compartalia-metrics />

      <!-- Resumen de Impacto Ambiental -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <impact-summary />
        <recent-messages />
      </div>

      <!-- Acciones Rápidas -->
      <div class="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <router-link 
            to="/carpooling/create-trip-madrid"
            class="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-900">Crear Viaje</p>
              <p class="text-sm text-gray-600">Publica un nuevo viaje</p>
            </div>
          </router-link>

          <router-link 
            to="/carpooling/search-trips"
            class="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-900">Buscar Viajes</p>
              <p class="text-sm text-gray-600">Encuentra viajes disponibles</p>
            </div>
          </router-link>

          <router-link 
            to="/carpooling/mensajeria"
            class="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <div class="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-900">Mensajería</p>
              <p class="text-sm text-gray-600">Chatea con otros usuarios</p>
            </div>
          </router-link>

          <router-link 
            to="/carpooling/miembros"
            class="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <div class="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-900">Miembros</p>
              <p class="text-sm text-gray-600">Gestiona tus contactos</p>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import AdminLayout from '../components/layout/AdminLayout.vue';
import CompartaliaMetrics from '../components/carpooling/CompartaliaMetrics.vue';
import ImpactSummary from '../components/carpooling/ImpactSummary.vue';
import RecentMessages from '../components/carpooling/RecentMessages.vue';
import { useAuth } from '@/composables/useAuth';

const { userProfile } = useAuth();

const currentDate = computed(() => {
  return new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});
</script>
