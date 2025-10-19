<template>
  <div class="google-route-map">
    <!-- Mapa de Google Maps -->
    <div 
      ref="mapContainer" 
      class="w-full h-96 rounded-lg border border-stroke dark:border-strokedark"
      :class="{ 'bg-gray-100 dark:bg-gray-800': !mapLoaded }"
    >
      <div v-if="!mapLoaded" class="flex items-center justify-center h-full">
        <div class="text-center">
          <svg class="mx-auto h-8 w-8 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Cargando mapa...</p>
        </div>
      </div>
    </div>

    <!-- Información de la ruta -->
    <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
      <div class="rounded-sm border border-stroke bg-white p-4 dark:border-strokedark dark:bg-boxdark">
        <div class="flex items-center space-x-2">
          <svg class="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <div>
            <p class="text-sm text-body-color">Distancia</p>
            <p class="font-semibold text-black dark:text-white">{{ routeInfo.distance }}</p>
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
            <p class="font-semibold text-black dark:text-white">{{ routeInfo.duration }}</p>
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
            <p class="font-semibold text-black dark:text-white">{{ waypoints.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de waypoints -->
    <div v-if="waypoints.length > 0" class="mt-4">
      <h4 class="mb-3 text-lg font-semibold text-black dark:text-white">
        Puntos de Recogida Disponibles
      </h4>
      <div class="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(waypoint, index) in waypoints"
          :key="index"
          class="rounded-sm border border-stroke bg-white p-3 dark:border-strokedark dark:bg-boxdark"
        >
          <div class="flex items-center space-x-2">
            <div class="h-3 w-3 rounded-full bg-red-500"></div>
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

    <!-- Mensaje de error si no hay API key -->
    <div v-if="!hasApiKey" class="mt-4 rounded-sm border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
      <div class="flex items-start space-x-2">
        <svg class="h-5 w-5 text-orange-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <div>
          <h3 class="text-sm font-medium text-orange-800 dark:text-orange-200">
            API Key de Google Maps no configurada
          </h3>
          <p class="mt-1 text-sm text-orange-700 dark:text-orange-300">
            Para mostrar el mapa interactivo, necesitas configurar VITE_GOOGLE_MAPS_API_KEY en tu archivo .env
          </p>
          <div class="mt-2">
            <a 
              href="https://console.cloud.google.com/" 
              target="_blank"
              class="text-sm text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
            >
              Obtener API Key →
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import type { Location } from '@/types/carpooling';
import routeService from '@/services/routeService';

interface Props {
  origin: Location | null;
  destination: Location | null;
  showWaypoints?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showWaypoints: true
});

// Referencias
const mapContainer = ref<HTMLElement>();
const map = ref<google.maps.Map>();
const directionsService = ref<google.maps.DirectionsService>();
const directionsRenderer = ref<google.maps.DirectionsRenderer>();

// Estado
const mapLoaded = ref(false);
const hasApiKey = ref(false);
const routeInfo = ref({
  distance: 'Calculando...',
  duration: 'Calculando...'
});
const waypoints = ref<any[]>([]);

// Verificar si hay API key
const checkApiKey = () => {
  hasApiKey.value = !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!hasApiKey.value) {
    console.warn('Google Maps API key not configured');
  }
};

// Cargar Google Maps API
const loadGoogleMaps = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=geometry&language=es&region=es`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps API'));
    
    document.head.appendChild(script);
  });
};

// Inicializar el mapa
const initMap = async () => {
  if (!mapContainer.value || !hasApiKey.value) return;

  try {
    await loadGoogleMaps();

    // Crear el mapa
    map.value = new google.maps.Map(mapContainer.value, {
      zoom: 12,
      center: { lat: 40.4168, lng: -3.7038 }, // Centro de Madrid
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    // Inicializar servicios
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

    mapLoaded.value = true;

    // Calcular ruta si tenemos origen y destino
    if (props.origin && props.destination) {
      await calculateRoute();
    }

  } catch (error) {
    console.error('Error initializing Google Maps:', error);
    mapLoaded.value = false;
  }
};

// Calcular la ruta
const calculateRoute = async () => {
  if (!props.origin || !props.destination || !directionsService.value || !directionsRenderer.value) {
    return;
  }

  try {
    const request: google.maps.DirectionsRequest = {
      origin: new google.maps.LatLng(props.origin.lat, props.origin.lng),
      destination: new google.maps.LatLng(props.destination.lat, props.destination.lng),
      travelMode: google.maps.TravelMode.DRIVING,
      avoidHighways: false,
      avoidTolls: false,
      language: 'es',
      region: 'es'
    };

    const result = await directionsService.value.route(request);

    if (result.status === google.maps.DirectionsStatus.OK) {
      directionsRenderer.value.setDirections(result);

      // Extraer información de la ruta
      const route = result.routes[0];
      const leg = route.legs[0];

      routeInfo.value = {
        distance: leg.distance?.text || 'N/A',
        duration: leg.duration?.text || 'N/A'
      };

      // Obtener waypoints usando el routeService
      const routeInfoFromService = await routeService.calculateRoute(props.origin, props.destination);
      if (routeInfoFromService) {
        waypoints.value = routeInfoFromService.waypoints;

        // Añadir marcadores de waypoints al mapa
        addWaypointMarkers();
      }

    } else {
      console.error('Error calculating route:', result.status);
    }

  } catch (error) {
    console.error('Error in route calculation:', error);
  }
};

// Añadir marcadores de waypoints
const addWaypointMarkers = () => {
  if (!map.value || !props.showWaypoints) return;

  waypoints.value.forEach((waypoint, index) => {
    if (index === 0 || index === waypoints.value.length - 1) return; // Saltar origen y destino

    const marker = new google.maps.Marker({
      position: new google.maps.LatLng(waypoint.lat, waypoint.lng),
      map: map.value,
      title: `Punto de recogida ${index + 1}`,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#ef4444',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2
      },
      label: {
        text: `${index + 1}`,
        color: '#ffffff',
        fontSize: '12px',
        fontWeight: 'bold'
      }
    });

    // InfoWindow para cada waypoint
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div class="p-2">
          <h3 class="font-semibold text-sm">Punto de recogida ${index + 1}</h3>
          <p class="text-xs text-gray-600">${formatDistance(waypoint.distance)} desde origen</p>
        </div>
      `
    });

    marker.addListener('click', () => {
      infoWindow.open(map.value, marker);
    });
  });
};

// Formatear distancia
const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else {
    return `${(meters / 1000).toFixed(1)}km`;
  }
};

// Watchers
watch([() => props.origin, () => props.destination], async () => {
  if (mapLoaded.value && props.origin && props.destination) {
    await nextTick();
    await calculateRoute();
  }
}, { deep: true });

// Lifecycle
onMounted(async () => {
  checkApiKey();
  if (hasApiKey.value) {
    await nextTick();
    await initMap();
  }
});
</script>

<style scoped>
.google-route-map {
  width: 100%;
}

/* Estilos para el mapa */
:deep(.gm-style) {
  border-radius: 0.5rem;
}

:deep(.gm-style-iw) {
  border-radius: 0.375rem;
}

:deep(.gm-style-iw-c) {
  padding: 0;
  border-radius: 0.375rem;
}
</style>
