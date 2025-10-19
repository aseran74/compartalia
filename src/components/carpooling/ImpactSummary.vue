<template>
  <div class="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xl font-semibold">Tu Impacto Ambiental</h3>
      <div class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
    </div>
    
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div class="text-center">
        <p class="text-3xl font-bold">{{ impact.co2Saved }} kg</p>
        <p class="text-sm opacity-90">CO2 Ahorrado</p>
      </div>
      <div class="text-center">
        <p class="text-3xl font-bold">{{ impact.treesEquivalent }}</p>
        <p class="text-sm opacity-90">Árboles Equivalentes</p>
      </div>
    </div>
    
    <div class="bg-white bg-opacity-20 rounded-lg p-4">
      <div class="flex items-center justify-between">
        <span class="text-sm">Progreso del mes</span>
        <span class="text-sm font-semibold">{{ impact.monthlyProgress }}%</span>
      </div>
      <div class="mt-2 bg-white bg-opacity-20 rounded-full h-2">
        <div 
          class="bg-white rounded-full h-2 transition-all duration-300" 
          :style="{ width: impact.monthlyProgress + '%' }"
        ></div>
      </div>
    </div>
    
    <div class="mt-4 text-center">
      <p class="text-sm opacity-90">
        🌱 Has contribuido a un planeta más limpio
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { userMetricsService, type UserImpact } from '@/services/userMetricsService';

const { userProfile } = useAuth();

const impact = ref<UserImpact>({
  co2Saved: 0,
  treesEquivalent: 0,
  monthlyProgress: 0
});

onMounted(async () => {
  await loadImpactData();
});

const loadImpactData = async () => {
  try {
    if (!userProfile.value) {
      console.log('Usuario no autenticado, usando datos por defecto');
      return;
    }

    // Obtener datos de impacto reales del usuario
    const userImpact = await userMetricsService.getUserImpact(
      userProfile.value.id,
      userProfile.value.role
    );
    
    impact.value = userImpact;

    console.log('Datos de impacto cargados para usuario:', userProfile.value.name);
  } catch (error) {
    console.error('Error loading impact data:', error);
  }
};
</script>
