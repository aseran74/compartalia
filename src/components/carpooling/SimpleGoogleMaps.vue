<template>
  <div class="simple-google-maps">
    <div class="map-header">
      <h3>🗺️ Google Maps Real</h3>
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

    <!-- Leyenda -->
    <div class="map-legend">
      <div class="legend-item">
        <span class="legend-color origin-color"></span> Origen
      </div>
      <div class="legend-item">
        <span class="legend-color destination-color"></span> Destino
      </div>
      <div class="legend-item">
        <span class="legend-color stop-color"></span> Parada
      </div>
      <div class="legend-item">
        <span class="legend-color route-color"></span> Ruta
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
  generatedStops: any[];
}>();

// Referencias
const mapContainer = ref<HTMLElement | null>(null);

// Estado del mapa
const mapType = ref<'roadmap' | 'satellite'>('roadmap');
let googleMap: any = null;
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

  console.log('🗺️ Inicializando Google Maps...');

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
      drawRoute();
    }

  } catch (error) {
    console.error('❌ Error inicializando Google Maps:', error);
  }
};

// Dibujar ruta
const drawRoute = () => {
  if (!props.origin?.coordinates || !props.destination?.coordinates || !googleMap) {
    return;
  }

  console.log('🛣️ Dibujando ruta en Google Maps...');

  // Usar nuestros datos de ruta calculada
  if (props.routeData?.coordinates && props.routeData.coordinates.length > 2) {
    // Crear una ruta personalizada usando nuestros datos
    const route = new google.maps.Polyline({
      path: props.routeData.coordinates,
      geodesic: true,
      strokeColor: '#3b82f6',
      strokeOpacity: 0.8,
      strokeWeight: 4
    });
    
    route.setMap(googleMap);
    
    // Ajustar el zoom para mostrar toda la ruta
    const bounds = new google.maps.LatLngBounds();
    props.routeData.coordinates.forEach((coord: any) => {
      bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
    });
    googleMap.fitBounds(bounds);
    
    console.log('✅ Ruta dibujada usando datos calculados');
  }

  // Añadir marcadores
  addMarkers();
};

// Añadir marcadores
const addMarkers = () => {
  if (!googleMap) return;

  console.log('📍 Añadiendo marcadores...');

  // Limpiar marcadores existentes
  stopMarkers.forEach(marker => marker.setMap(null));
  stopMarkers = [];

  // Marcador de origen
  if (props.origin?.coordinates) {
    const originMarker = new google.maps.Marker({
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
    stopMarkers.push(originMarker);
  }

  // Marcador de destino
  if (props.destination?.coordinates) {
    const destinationMarker = new google.maps.Marker({
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
    stopMarkers.push(destinationMarker);
  }

  // Marcadores de paradas
  props.generatedStops.forEach((stop, index) => {
    const stopMarker = new google.maps.Marker({
      position: stop.position,
      map: googleMap,
      title: `Parada ${index + 1}: ${stop.distanceFromOrigin.toFixed(1)} km`,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#f59e0b',
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 1.5,
        scale: 6
      }
    });
    stopMarkers.push(stopMarker);
  });

  console.log(`✅ ${stopMarkers.length} marcadores añadidos`);
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
    drawRoute();
  }
}, { deep: true });

watch(() => props.generatedStops, () => {
  if (googleMap) {
    addMarkers();
  }
}, { deep: true });

// Lifecycle
onMounted(() => {
  console.log('🚀 Componente SimpleGoogleMaps montado');
  loadGoogleMapsAPI();
});

onUnmounted(() => {
  console.log('🧹 Limpiando marcadores de Google Maps');
  stopMarkers.forEach(marker => marker.setMap(null));
});
</script>

<style scoped>
.simple-google-maps {
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

.map-legend {
  display: flex;
  gap: 15px;
  padding: 10px 20px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #4b5563;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  margin-right: 8px;
  border: 1px solid #e2e8f0;
}

.origin-color { background-color: #10b981; }
.destination-color { background-color: #ef4444; }
.stop-color { background-color: #f59e0b; }
.route-color { background-color: #3b82f6; }
</style>
