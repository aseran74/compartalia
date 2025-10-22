<template>
  <div class="simple-route-map">
    <div class="map-header">
      <h3>🗺️ Ruta por Carretera Real</h3>
      <div class="route-stats">
        <span class="stat-item">
          <strong>{{ routeData?.distance?.toFixed(2) || '0.00' }} km</strong>
          <small>Distancia</small>
        </span>
        <span class="stat-item">
          <strong>{{ Math.round(routeData?.duration || 0) }} min</strong>
          <small>Duración</small>
        </span>
        <span class="stat-item">
          <strong>{{ routeData?.coordinates?.length || 0 }}</strong>
          <small>Puntos</small>
        </span>
      </div>
    </div>

    <!-- Mapa de Google Maps -->
    <div class="map-container">
      <div ref="mapContainer" class="google-map"></div>
      <div class="map-controls">
        <button @click="toggleMapType" class="control-btn">
          {{ mapType === 'roadmap' ? 'Satélite' : 'Mapa' }}
        </button>
        <button @click="centerMap" class="control-btn">
          🎯 Centrar
        </button>
      </div>
    </div>

    <!-- Información de la ruta -->
    <div class="route-info">
      <div class="info-item">
        <strong>Origen:</strong> {{ origin?.name || 'No especificado' }}
      </div>
      <div class="info-item">
        <strong>Destino:</strong> {{ destination?.name || 'No especificado' }}
      </div>
      <div class="info-item">
        <strong>Ruta:</strong> {{ routeData?.source || 'No calculada' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';

// Props
const props = defineProps<{
  origin: any;
  destination: any;
  routeData: any;
  stops?: any[];
}>();

// Referencias
const mapContainer = ref<HTMLElement | null>(null);

// Estado del mapa
const mapType = ref<'roadmap' | 'satellite'>('roadmap');
let googleMap: any = null;
let originMarker: any = null;
let destinationMarker: any = null;
let routePolyline: any = null;
let stopMarkers: any[] = [];

// Verificar API key
const hasGoogleMapsAPI = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  console.log('🔑 Google Maps API Key:', apiKey ? 'Presente' : 'Ausente');
  return !!apiKey && apiKey !== 'NO_API_KEY';
};

// Inicializar Google Maps
const initGoogleMap = () => {
  if (!mapContainer.value || !hasGoogleMapsAPI()) {
    console.error('❌ No se puede inicializar Google Maps');
    return;
  }

  console.log('🗺️ Inicializando Google Maps para ruta simple...');

  try {
    // Crear mapa
    googleMap = new google.maps.Map(mapContainer.value, {
      zoom: 10,
      center: { lat: 40.4168, lng: -3.7038 }, // Madrid
      mapTypeId: mapType.value === 'roadmap' ? google.maps.MapTypeId.ROADMAP : google.maps.MapTypeId.SATELLITE
    });

    console.log('✅ Google Maps inicializado correctamente');
    
    // Dibujar ruta si hay datos
    if (props.routeData && props.origin && props.destination) {
      drawSimpleRoute();
    }

  } catch (error) {
    console.error('❌ Error inicializando Google Maps:', error);
  }
};

// Dibujar ruta simple (solo origen-destino por carretera)
const drawSimpleRoute = () => {
  if (!props.origin?.coordinates || !props.destination?.coordinates || !googleMap) {
    console.warn('⚠️ Faltan datos para dibujar la ruta');
    return;
  }

  console.log('🛣️ Dibujando ruta simple por carretera real...');

  // Limpiar elementos anteriores
  clearMap();

  // Usar nuestros datos de ruta calculada (ya incluye el trayecto por carretera)
  if (props.routeData?.coordinates && props.routeData.coordinates.length > 2) {
    // Crear la ruta usando nuestros datos (ya calculados por carretera real)
    routePolyline = new google.maps.Polyline({
      path: props.routeData.coordinates,
      geodesic: true,
      strokeColor: '#3b82f6',
      strokeOpacity: 0.8,
      strokeWeight: 4
    });
    
    routePolyline.setMap(googleMap);
    
    console.log('✅ Ruta dibujada siguiendo carreteras reales');
    console.log(`📍 Ruta tiene ${props.routeData.coordinates.length} puntos siguiendo carreteras`);
    
    // Ajustar el zoom para mostrar toda la ruta
    const bounds = new google.maps.LatLngBounds();
    props.routeData.coordinates.forEach((coord: any) => {
      bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
    });
    googleMap.fitBounds(bounds);
  } else {
    // Fallback: línea recta si no hay datos de ruta
    console.warn('⚠️ No hay datos de ruta detallada, usando línea recta');
    routePolyline = new google.maps.Polyline({
      path: [props.origin.coordinates, props.destination.coordinates],
      geodesic: true,
      strokeColor: '#ef4444',
      strokeOpacity: 0.6,
      strokeWeight: 2
    });
    routePolyline.setMap(googleMap);
  }

  // Añadir marcadores de origen y destino
  addOriginDestinationMarkers();
  
  // Añadir marcadores de paradas si existen
  addStopMarkers();
};

// Añadir marcadores de origen y destino
const addOriginDestinationMarkers = () => {
  if (!googleMap) return;

  console.log('📍 Añadiendo marcadores de origen y destino...');

  // Marcador de origen
  if (props.origin?.coordinates) {
    originMarker = new google.maps.Marker({
      position: props.origin.coordinates,
      map: googleMap,
      title: `Origen: ${props.origin.name || 'Inicio'}`,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#10b981',
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 2,
        scale: 8
      }
    });
  }

  // Marcador de destino
  if (props.destination?.coordinates) {
    destinationMarker = new google.maps.Marker({
      position: props.destination.coordinates,
      map: googleMap,
      title: `Destino: ${props.destination.name || 'Final'}`,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#ef4444',
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 2,
        scale: 8
      }
    });
  }

  console.log('✅ Marcadores de origen y destino añadidos');
};

// Añadir marcadores de paradas
const addStopMarkers = () => {
  if (!googleMap || !props.stops || props.stops.length === 0) {
    console.log('📍 No hay paradas para mostrar');
    return;
  }

  console.log(`📍 Añadiendo ${props.stops.length} marcadores de paradas...`);

  // Limpiar marcadores de paradas anteriores
  clearStopMarkers();

  props.stops.forEach((stop, index) => {
    const stopMarker = new google.maps.Marker({
      position: stop.position,
      map: googleMap,
      title: `Parada ${index + 1}: ${stop.distanceFromOrigin.toFixed(2)} km desde origen`,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#fbbf24', // Amarillo para las paradas
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 2,
        scale: 6
      },
      label: {
        text: `${index + 1}`,
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold'
      }
    });

    stopMarkers.push(stopMarker);
  });

  console.log(`✅ ${stopMarkers.length} marcadores de paradas añadidos`);
};

// Limpiar marcadores de paradas
const clearStopMarkers = () => {
  stopMarkers.forEach(marker => {
    marker.setMap(null);
  });
  stopMarkers = [];
};

// Limpiar mapa
const clearMap = () => {
  if (originMarker) {
    originMarker.setMap(null);
    originMarker = null;
  }
  if (destinationMarker) {
    destinationMarker.setMap(null);
    destinationMarker = null;
  }
  if (routePolyline) {
    routePolyline.setMap(null);
    routePolyline = null;
  }
  clearStopMarkers();
};

// Controles del mapa
const toggleMapType = () => {
  if (googleMap) {
    mapType.value = mapType.value === 'roadmap' ? 'satellite' : 'roadmap';
    googleMap.setMapTypeId(mapType.value);
  }
};

const centerMap = () => {
  if (!googleMap || !props.origin?.coordinates || !props.destination?.coordinates) return;
  
  const bounds = new google.maps.LatLngBounds();
  bounds.extend(props.origin.coordinates);
  bounds.extend(props.destination.coordinates);
  
  // Incluir paradas en el bounds si existen
  if (props.stops && props.stops.length > 0) {
    props.stops.forEach(stop => {
      bounds.extend(stop.position);
    });
  }
  
  googleMap.fitBounds(bounds);
};

// Cargar Google Maps API
const loadGoogleMapsAPI = () => {
  if (!hasGoogleMapsAPI()) {
    console.warn('⚠️ No hay API key de Google Maps');
    return;
  }

  if (window.google) {
    console.log('✅ Google Maps ya está cargado');
    initGoogleMap();
    return;
  }

  console.log('📡 Cargando Google Maps API...');

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=geometry&loading=async`;
  script.onload = () => {
    console.log('✅ Google Maps API cargado exitosamente');
    initGoogleMap();
  };
  script.onerror = (error) => {
    console.error('❌ Error cargando Google Maps API:', error);
  };
  document.head.appendChild(script);
};

// Watchers
watch(() => props.routeData, () => {
  if (googleMap && props.routeData) {
    console.log('🔄 Datos de ruta cambiados, redibujando...');
    drawSimpleRoute();
  }
}, { deep: true });

watch(() => props.stops, () => {
  if (googleMap && props.stops) {
    console.log('🔄 Paradas cambiadas, actualizando marcadores...');
    addStopMarkers();
  }
}, { deep: true });

// Lifecycle
onMounted(() => {
  console.log('🚀 Componente SimpleRouteMap montado');
  loadGoogleMapsAPI();
});

onUnmounted(() => {
  console.log('🧹 Limpiando mapa simple');
  clearMap();
});
</script>

<style scoped>
.simple-route-map {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  font-family: 'Inter', sans-serif;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.map-header h3 {
  font-size: 1.25rem;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.route-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  text-align: center;
}

.stat-item strong {
  display: block;
  font-size: 1rem;
  color: #3b82f6;
  font-weight: 600;
}

.stat-item small {
  font-size: 0.75rem;
  color: #6b7280;
}

.map-container {
  position: relative;
  height: 500px;
  width: 100%;
}

.google-map {
  width: 100%;
  height: 100%;
}

.map-controls {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 10px;
  z-index: 10;
}

.control-btn {
  background-color: white;
  border: 1px solid #d1d5db;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease;
}

.control-btn:hover {
  background-color: #f3f4f6;
}

.route-info {
  display: flex;
  gap: 20px;
  padding: 15px 20px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  font-size: 0.875rem;
}

.info-item {
  color: #4b5563;
}

.info-item strong {
  color: #1f2937;
}
</style>