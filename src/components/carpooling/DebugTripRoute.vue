<template>
  <div class="debug-trip-route p-4 border border-red-500 bg-red-50">
    <h3 class="text-lg font-bold text-red-800">DEBUG: TripRoute Component</h3>
    
    <!-- Información del trip -->
    <div class="mt-2">
      <p><strong>Trip ID:</strong> {{ trip?.id || 'NO ID' }}</p>
      <p><strong>Origin:</strong> {{ trip?.origin?.name || 'NO ORIGIN' }}</p>
      <p><strong>Destination:</strong> {{ trip?.destination?.name || 'NO DESTINATION' }}</p>
      <p><strong>Route exists:</strong> {{ trip?.route ? 'YES' : 'NO' }}</p>
      <p><strong>Route distance:</strong> {{ trip?.route?.distance || 'NO DISTANCE' }}</p>
    </div>

    <!-- Botón simple -->
    <button 
      @click="toggleExpanded"
      class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      {{ isExpanded ? 'Ocultar' : 'Mostrar' }} Ruta
    </button>

    <!-- Contenido expandible -->
    <div v-if="isExpanded" class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
      <h4 class="font-bold text-blue-800">Ruta Expandida</h4>
      <p>Origen: {{ trip?.origin?.name }}</p>
      <p>Destino: {{ trip?.destination?.name }}</p>
      <p>Distancia: {{ trip?.route?.distance || 'N/A' }}</p>
      <p>Duración: {{ trip?.route?.estimatedDuration || 'N/A' }} min</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Trip } from '@/types/carpooling';

interface Props {
  trip: Trip;
}

const props = defineProps<Props>();

// Estado
const isExpanded = ref(false);

// Métodos
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
  console.log('Toggle clicked, isExpanded:', isExpanded.value);
  console.log('Trip data:', props.trip);
};
</script>

<style scoped>
.debug-trip-route {
  width: 100%;
}
</style>
