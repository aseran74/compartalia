<template>
  <div class="route-map-container">
    <!-- Mapa -->
    <div ref="mapContainer" class="w-full h-96 rounded-lg border border-stroke dark:border-strokedark"></div>
    
    <!-- Información de la ruta -->
    <div v-if="routeInfo" class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
      <div class="rounded-sm border border-stroke bg-white p-4 dark:border-strokedark dark:bg-boxdark">
        <div class="flex items-center space-x-2">
          <svg class="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <div>
            <p class="text-sm text-body-color">Distancia</p>
            <p class="font-semibold text-black dark:text-white">{{ formatDistance(routeInfo.distance) }}</p>
          </div>
        </div>
      </div>
      
      <div class="rounded-sm border border-stroke bg-white p-4 dark:border-strokedark dark:bg-boxdark">
        <div class="flex items-center space-x-2">
          <svg class="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <p class="text-sm text-body-color">Duración</p>
            <p class="font-semibold text-black dark:text-white">{{ formatDuration(routeInfo.duration) }}</p>
          </div>
        </div>
      </div>
      
      <div class="rounded-sm border border-stroke bg-white p-4 dark:border-strokedark dark:bg-boxdark">
        <div class="flex items-center space-x-2">
          <svg class="h-5 w-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <div>
            <p class="text-sm text-body-color">Puntos de recogida</p>
            <p class="font-semibold text-black dark:text-white">{{ routeInfo.waypoints?.length || 0 }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Lista de waypoints -->
    <div v-if="routeInfo?.waypoints?.length > 0" class="mt-4">
      <h4 class="mb-3 text-lg font-semibold text-black dark:text-white">
        Puntos de Recogida Disponibles
      </h4>
      <div class="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(waypoint, index) in routeInfo.waypoints"
          :key="index"
          class="rounded-sm border border-stroke bg-white p-3 dark:border-strokedark dark:bg-boxdark"
        >
          <div class="flex items-center space-x-2">
            <div class="h-3 w-3 rounded-full bg-primary"></div>
            <div>
              <p class="text-sm font-medium text-black dark:text-white">
                Punto {{ index + 1 }}
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
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import type { Location } from '@/types/carpooling';
import routeService from '@/services/routeService';

interface RouteInfo {
  distance: number; // en metros
  duration: number; // en segundos
  waypoints: Array<{
    lat: number;
    lng: number;
    distance: number;
  }>;
  encodedPolyline?: string;
}

interface Props {
  origin: Location | null;
  destination: Location | null;
  showWaypoints?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showWaypoints: true
});

const mapContainer = ref<HTMLDivElement | null>(null);
const routeInfo = ref<RouteInfo | null>(null);
const map = ref<google.maps.Map | null>(null);
const directionsService = ref<google.maps.DirectionsService | null>(null);
const directionsRenderer = ref<google.maps.DirectionsRenderer | null>(null);

// Cargar Google Maps API si no está cargada
const loadGoogleMaps = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=geometry&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Error loading Google Maps'));
    document.head.appendChild(script);
  });
};

// Inicializar el mapa
const initMap = async () => {
  if (!mapContainer.value) return;

  try {
    await loadGoogleMaps();
    
    map.value = new google.maps.Map(mapContainer.value, {
      zoom: 12,
      center: { lat: 40.4168, lng: -3.7038 }, // Madrid por defecto
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    directionsService.value = new google.maps.DirectionsService();
    directionsRenderer.value = new google.maps.DirectionsRenderer({
      map: map.value,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#3b82f6',
        strokeWeight: 4,
        strokeOpacity: 0.8
      }
    });

    // Calcular ruta si tenemos origen y destino
    if (props.origin && props.destination) {
      await calculateRoute();
    }
  } catch (error) {
    console.error('Error initializing map:', error);
  }
};

// Calcular la ruta
const calculateRoute = async () => {
  if (!props.origin || !props.destination || !directionsService.value || !directionsRenderer.value) {
    return;
  }

  try {
    const request: google.maps.DirectionsRequest = {
      origin: { lat: props.origin.lat, lng: props.origin.lng },
      destination: { lat: props.destination.lat, lng: props.destination.lng },
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false
    };

    const result = await directionsService.value.route(request);
    
    if (result.routes[0]) {
      directionsRenderer.value.setDirections(result);
      
      const route = result.routes[0];
      const leg = route.legs[0];
      
      // Obtener información de la ruta
      routeInfo.value = {
        distance: leg.distance?.value || 0,
        duration: leg.duration?.value || 0,
        waypoints: [],
        encodedPolyline: route.overview_polyline?.encoded_polyline
      };

      // Calcular waypoints usando nuestro servicio
      if (routeInfo.value.encodedPolyline) {
        const waypoints = routeService.getWaypointsFromPolyline(
          routeInfo.value.encodedPolyline, 
          props.origin
        );
        
        routeInfo.value.waypoints = waypoints;
        
        // Agregar marcadores para los waypoints
        if (props.showWaypoints && waypoints.length > 0) {
          waypoints.forEach((waypoint, index) => {
            new google.maps.Marker({
              position: { lat: waypoint.lat, lng: waypoint.lng },
              map: map.value,
              title: `Punto de recogida ${index + 1} - ${Math.round(waypoint.distance)}m desde origen`,
              icon: {
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="8" fill="#ef4444" stroke="#ffffff" stroke-width="2"/>
                    <text x="10" y="14" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${index + 1}</text>
                  </svg>
                `)}`,
                scaledSize: new google.maps.Size(20, 20),
                anchor: new google.maps.Point(10, 10)
              }
            });
          });
        }
      }
    }
  } catch (error) {
    console.error('Error calculating route:', error);
  }
};

// Formatear distancia
const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${meters}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

// Formatear duración
const formatDuration = (seconds: number): string => {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes}min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}min`;
};

// Watchers para recalcular cuando cambien las props
watch([() => props.origin, () => props.destination], async () => {
  if (map.value && props.origin && props.destination) {
    await calculateRoute();
  }
}, { deep: true });

onMounted(async () => {
  await nextTick();
  await initMap();
});

onUnmounted(() => {
  if (directionsRenderer.value) {
    directionsRenderer.value.setMap(null);
  }
});
</script>

<style scoped>
.route-map-container {
  width: 100%;
}

/* Estilos para el mapa */
.gm-style-iw {
  border-radius: 8px;
}

.gm-style-iw-c {
  border-radius: 8px;
}
</style>
