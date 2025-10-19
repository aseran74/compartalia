<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <!-- Viajes Realizados -->
    <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-500">Viajes Realizados</p>
          <p class="text-2xl font-semibold text-gray-900">{{ metrics.tripsCompleted }}</p>
          <p class="text-sm text-green-600">+{{ metrics.tripsThisMonth }} este mes</p>
        </div>
      </div>
    </div>

    <!-- CO2 Ahorrado -->
    <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-500">CO2 Ahorrado</p>
          <p class="text-2xl font-semibold text-gray-900">{{ metrics.co2Saved }} kg</p>
          <p class="text-sm text-green-600">+{{ metrics.co2ThisMonth }} kg este mes</p>
        </div>
      </div>
    </div>

    <!-- Dinero Ahorrado -->
    <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <div class="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-500">Dinero Ahorrado</p>
          <p class="text-2xl font-semibold text-gray-900">{{ metrics.moneySaved }}€</p>
          <p class="text-sm text-green-600">+{{ metrics.moneyThisMonth }}€ este mes</p>
        </div>
      </div>
    </div>

    <!-- Mensajes -->
    <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <div class="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
          </div>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-500">Mensajes</p>
          <p class="text-2xl font-semibold text-gray-900">{{ metrics.messages }}</p>
          <p class="text-sm text-blue-600">{{ metrics.unreadMessages }} sin leer</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { userMetricsService, type UserMetrics } from '@/services/userMetricsService';

const { userProfile } = useAuth();

const metrics = ref<UserMetrics>({
  tripsCompleted: 0,
  tripsThisMonth: 0,
  co2Saved: 0,
  co2ThisMonth: 0,
  moneySaved: 0,
  moneyThisMonth: 0,
  messages: 0,
  unreadMessages: 0
});

onMounted(async () => {
  await loadMetrics();
});

const loadMetrics = async () => {
  try {
    if (!userProfile.value) {
      console.log('Usuario no autenticado, usando datos por defecto');
      return;
    }

    // Obtener métricas reales del usuario
    const userMetrics = await userMetricsService.getUserMetrics(
      userProfile.value.id,
      userProfile.value.role
    );
    
    metrics.value = userMetrics;

    console.log('Métricas cargadas para usuario:', userProfile.value.name);
  } catch (error) {
    console.error('Error loading metrics:', error);
  }
};
</script>
