<template>
  <div class="simple-trip-route">
    <!-- Botón simple para expandir -->
    <button
      @click="toggleExpanded"
      class="w-full flex items-center justify-between p-3 rounded-lg border border-stroke bg-white hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark transition-colors"
    >
      <div class="flex items-center space-x-3">
        <div class="flex flex-col items-center">
          <div class="h-3 w-3 rounded-full bg-primary"></div>
          <div class="mt-2 h-8 w-0.5 bg-body-color"></div>
          <div class="h-3 w-3 rounded-full bg-secondary"></div>
        </div>
        <div class="text-left">
          <p class="font-medium text-black dark:text-white">{{ trip.origin?.name || 'Origen' }}</p>
          <p class="text-sm text-body-color">{{ trip.destination?.name || 'Destino' }}</p>
          <p class="text-xs text-body-color">{{ routeDistance }} • {{ routeDuration }}</p>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <span class="text-sm text-body-color">Ver ruta</span>
        <span class="text-body-color">{{ isExpanded ? '▲' : '▼' }}</span>
      </div>
    </button>

    <!-- Contenido expandible -->
    <div v-if="isExpanded" class="mt-3 p-4 rounded-lg border border-stroke bg-gray-50 dark:border-strokedark dark:bg-gray-800">
      <h4 class="mb-3 text-sm font-semibold text-black dark:text-white">
        Ruta del Viaje
      </h4>
      
      <!-- Mapa simple -->
      <div class="mb-4 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <div class="text-center">
          <div class="text-4xl mb-2">🗺️</div>
          <p class="text-sm text-gray-600 dark:text-gray-400">Mapa de la ruta</p>
          <p class="text-xs text-gray-500 dark:text-gray-500">{{ routeDistance }} • {{ routeDuration }}</p>
        </div>
      </div>

      <!-- Lista de waypoints -->
      <div class="mb-4">
        <h4 class="mb-3 text-sm font-semibold text-black dark:text-white">
          Puntos de Recogida
        </h4>
        <div class="space-y-2">
          <div
            v-for="(waypoint, index) in waypoints"
            :key="index"
            class="flex items-center space-x-3 p-2 rounded border border-stroke bg-white dark:border-strokedark dark:bg-boxdark"
          >
            <div class="flex-shrink-0">
              <div 
                :class="{
                  'bg-primary': index === 0,
                  'bg-secondary': index === waypoints.length - 1,
                  'bg-red-500': index > 0 && index < waypoints.length - 1
                }"
                class="h-6 w-6 rounded-full flex items-center justify-center"
              >
                <span class="text-xs font-bold text-white">{{ index + 1 }}</span>
              </div>
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-black dark:text-white">
                {{ getWaypointLabel(index) }}
              </p>
              <p class="text-xs text-body-color">
                {{ formatDistance(waypoint.distance) }} desde origen
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Trip } from '@/types/carpooling';

interface Props {
  trip: Trip;
}

const props = defineProps<Props>();

// Estado
const isExpanded = ref(false);

// Información de la ruta
const routeDistance = computed(() => {
  if (props.trip.route?.distance) {
    return formatDistance(props.trip.route.distance);
  }
  return '18.2 km'; // Fallback
});

const routeDuration = computed(() => {
  if (props.trip.route?.estimatedDuration) {
    return `${props.trip.route.estimatedDuration} min`;
  }
  return '25 min'; // Fallback
});

// Waypoints simulados
const waypoints = computed(() => {
  const points = [];
  for (let i = 0; i <= 8; i++) {
    points.push({
      distance: Math.round((props.trip.route?.distance || 18200) * (i / 8)),
      index: i
    });
  }
  return points;
});

// Métodos
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

const getWaypointLabel = (index: number) => {
  if (index === 0) return 'Origen';
  if (index === waypoints.value.length - 1) return 'Destino';
  return `Punto de recogida ${index}`;
};

const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else {
    return `${(meters / 1000).toFixed(1)}km`;
  }
};
</script>

<style scoped>
.simple-trip-route {
  width: 100%;
}

button {
  transition: all 0.2s ease-in-out;
}
</style>
