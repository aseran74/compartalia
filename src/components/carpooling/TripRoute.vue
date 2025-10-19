<template>
  <div class="trip-route">
    <!-- Botón para expandir/contraer la ruta -->
    <button
      @click="toggleExpanded"
      class="w-full flex items-center justify-between p-3 rounded-lg border border-stroke bg-white hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:hover:bg-gray-800 transition-colors"
    >
      <div class="flex items-center space-x-3">
        <div class="flex flex-col items-center">
          <div class="h-3 w-3 rounded-full bg-primary"></div>
          <div class="mt-2 h-8 w-0.5 bg-body-color"></div>
          <div class="h-3 w-3 rounded-full bg-secondary"></div>
        </div>
        <div class="text-left">
          <p class="font-medium text-black dark:text-white">{{ trip.origin.name }}</p>
          <p class="text-sm text-body-color">{{ trip.destination.name }}</p>
          <p class="text-xs text-body-color">{{ routeDistance }} • {{ routeDuration }}</p>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <span class="text-sm text-body-color">{{ waypoints.length }} puntos</span>
        <span class="text-body-color">▼</span>
      </div>
    </button>

    <!-- Contenido expandible -->
    <div v-if="isExpanded" class="mt-3 p-4 rounded-lg border border-stroke bg-gray-50 dark:border-strokedark dark:bg-gray-800">
      <!-- Mapa de la ruta -->
      <div class="mb-4">
        <h4 class="mb-2 text-sm font-semibold text-black dark:text-white">
          Ruta del Viaje
        </h4>
        <SimpleRouteMap 
          :origin="trip.origin"
          :destination="trip.destination"
          :show-waypoints="true"
        />
      </div>

      <!-- Lista de waypoints -->
      <div class="mb-4">
        <h4 class="mb-3 text-sm font-semibold text-black dark:text-white">
          Puntos de Recogida en la Ruta
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
            <div class="flex-shrink-0">
              <span class="text-xs text-body-color">
                {{ formatTimeFromDistance(waypoint.distance) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Información adicional -->
      <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div class="rounded border border-stroke bg-white p-3 dark:border-strokedark dark:bg-boxdark">
          <div class="flex items-center space-x-2">
            <span class="text-primary">📍</span>
            <div>
              <p class="text-xs text-body-color">Distancia Total</p>
              <p class="text-sm font-semibold text-black dark:text-white">{{ routeDistance }}</p>
            </div>
          </div>
        </div>
        
        <div class="rounded border border-stroke bg-white p-3 dark:border-strokedark dark:bg-boxdark">
          <div class="flex items-center space-x-2">
            <span class="text-secondary">⏱️</span>
            <div>
              <p class="text-xs text-body-color">Duración</p>
              <p class="text-sm font-semibold text-black dark:text-white">{{ routeDuration }}</p>
            </div>
          </div>
        </div>
        
        <div class="rounded border border-stroke bg-white p-3 dark:border-strokedark dark:bg-boxdark">
          <div class="flex items-center space-x-2">
            <span class="text-success">🚗</span>
            <div>
              <p class="text-xs text-body-color">Puntos de Recogida</p>
              <p class="text-sm font-semibold text-black dark:text-white">{{ waypoints.length }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import SimpleRouteMap from './SimpleRouteMap.vue';
import type { Location, Trip } from '@/types/carpooling';

interface Props {
  trip: Trip;
}

const props = defineProps<Props>();

// Estado
const isExpanded = ref(false);
const waypoints = ref<any[]>([]);

// Información de la ruta
const routeDistance = computed(() => {
  if (props.trip.route?.distance) {
    return formatDistance(props.trip.route.distance);
  }
  return 'Calculando...';
});

const routeDuration = computed(() => {
  if (props.trip.route?.estimatedDuration) {
    return `${props.trip.route.estimatedDuration} min`;
  }
  return 'Calculando...';
});

// Métodos
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
  if (isExpanded.value && waypoints.value.length === 0) {
    generateWaypoints();
  }
};

const generateWaypoints = () => {
  // Generar waypoints simulados basados en la ruta
  const origin = props.trip.origin;
  const destination = props.trip.destination;
  const totalDistance = props.trip.route?.distance || calculateDistance(origin, destination);
  
  waypoints.value = [];
  
  for (let i = 0; i <= 8; i++) {
    const ratio = i / 8;
    const lat = origin.lat + (destination.lat - origin.lat) * ratio;
    const lng = origin.lng + (destination.lng - origin.lng) * ratio;
    const distance = Math.round(totalDistance * ratio);

    waypoints.value.push({
      lat,
      lng,
      distance,
      index: i
    });
  }
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

const formatTimeFromDistance = (distance: number): string => {
  // Estimación: 15 m/s promedio en ciudad
  const timeMinutes = Math.round(distance / (15 * 60));
  return `${timeMinutes} min`;
};

const calculateDistance = (
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number => {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = (point1.lat * Math.PI) / 180;
  const φ2 = (point2.lat * Math.PI) / 180;
  const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
  const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Generar waypoints al montar si está expandido
onMounted(() => {
  if (isExpanded.value) {
    generateWaypoints();
  }
});
</script>

<style scoped>
.trip-route {
  width: 100%;
}

/* Animación suave para el botón */
button {
  transition: all 0.2s ease-in-out;
}

/* Animación para el icono de expansión */
.rotate-180 {
  transform: rotate(180deg);
}
</style>
