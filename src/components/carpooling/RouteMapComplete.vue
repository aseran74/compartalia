<template>
  <div class="route-map-complete">
    <div class="map-header">
      <h3>🗺️ Ruta Completa</h3>
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

    <!-- Google Maps (si está disponible) -->
    <div v-if="hasGoogleMaps && !showFallback" class="google-map-container">
      <div ref="googleMapContainer" class="google-map"></div>
      <div class="map-controls">
        <button @click="toggleMapType" class="control-btn">
          {{ mapType === 'roadmap' ? 'Satélite' : 'Mapa' }}
        </button>
        <button @click="centerMap" class="control-btn">
          🎯 Centrar
        </button>
      </div>
    </div>

    <!-- Mapa SVG de Fallback -->
    <div v-else class="svg-map-container">
      <div class="map-info">
        <p v-if="!hasGoogleMaps" class="map-warning">
          ⚠️ Sin Google Maps API key - Usando mapa simplificado
        </p>
        <p v-else class="map-info-text">
          📍 Mostrando ruta simplificada
        </p>
      </div>
      
      <div class="svg-map-wrapper">
        <svg 
          ref="svgMap" 
          class="svg-map" 
          :viewBox="`${bounds.minX - padding} ${bounds.minY - padding} ${bounds.width + padding * 2} ${bounds.height + padding * 2}`"
        >
          <!-- Fondo del mapa -->
          <rect 
            :x="bounds.minX - padding" 
            :y="bounds.minY - padding" 
            :width="bounds.width + padding * 2" 
            :height="bounds.height + padding * 2"
            fill="#f8fafc"
            stroke="#e2e8f0"
            stroke-width="2"
          />
          
          <!-- Calles y carreteras simuladas -->
          <defs>
            <!-- Patrón de calles menores -->
            <pattern id="streets" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" stroke-width="0.8"/>
              <circle cx="15" cy="15" r="1" fill="#cbd5e1"/>
            </pattern>
            
            <!-- Patrón de carreteras principales -->
            <pattern id="roads" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#d1d5db" stroke-width="2"/>
              <path d="M 30 0 L 30 60 M 0 30 L 60 30" fill="none" stroke="#9ca3af" stroke-width="1.5"/>
              <circle cx="30" cy="30" r="2" fill="#6b7280"/>
            </pattern>
            
            <!-- Patrón de autopistas -->
            <pattern id="highways" width="120" height="120" patternUnits="userSpaceOnUse">
              <path d="M 120 0 L 0 0 0 120" fill="none" stroke="#4b5563" stroke-width="3"/>
              <path d="M 60 0 L 60 120 M 0 60 L 120 60" fill="none" stroke="#374151" stroke-width="2"/>
              <circle cx="60" cy="60" r="3" fill="#1f2937"/>
            </pattern>
          </defs>
          
          <!-- Aplicar patrones de calles en diferentes zonas -->
          <rect :x="bounds.minX - padding" :y="bounds.minY - padding" :width="bounds.width + padding * 2" :height="bounds.height + padding * 2" fill="url(#streets)"/>
          
          <!-- Superponer carreteras principales -->
          <rect :x="bounds.minX - padding" :y="bounds.minY - padding" :width="bounds.width + padding * 2" :height="bounds.height + padding * 2" fill="url(#roads)" opacity="0.7"/>
          
          <!-- Superponer autopistas -->
          <rect :x="bounds.minX - padding" :y="bounds.minY - padding" :width="bounds.width + padding * 2" :height="bounds.height + padding * 2" fill="url(#highways)" opacity="0.5"/>
          
          <!-- Línea de ruta -->
          <path 
            v-if="routePath"
            :d="routePath"
            fill="none"
            stroke="#3b82f6"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          
          <!-- Puntos de la ruta -->
          <circle 
            v-for="(point, index) in routeData?.coordinates || []"
            :key="index"
            :cx="point.x"
            :cy="point.y"
            r="2"
            fill="#3b82f6"
            stroke="white"
            stroke-width="1"
            class="route-point"
          >
            <title>{{ index + 1 }}: {{ point.lat.toFixed(4) }}, {{ point.lng.toFixed(4) }}</title>
          </circle>
          
          <!-- Origen -->
          <g v-if="originPoint">
            <circle 
              :cx="originPoint.x"
              :cy="originPoint.y"
              r="8"
              fill="#10b981"
              stroke="white"
              stroke-width="3"
              class="origin-marker"
            >
              <title>Origen: {{ origin?.name || 'Inicio' }}</title>
            </circle>
            <text 
              :x="originPoint.x" 
              :y="originPoint.y - 15" 
              text-anchor="middle" 
              class="location-label origin-label"
            >
              {{ getLocationLabel(origin?.coordinates, 'origin') }}
            </text>
          </g>
          
          <!-- Destino -->
          <g v-if="destinationPoint">
            <circle 
              :cx="destinationPoint.x"
              :cy="destinationPoint.y"
              r="8"
              fill="#ef4444"
              stroke="white"
              stroke-width="3"
              class="destination-marker"
            >
              <title>Destino: {{ destination?.name || 'Final' }}</title>
            </circle>
            <text 
              :x="destinationPoint.x" 
              :y="destinationPoint.y - 15" 
              text-anchor="middle" 
              class="location-label destination-label"
            >
              {{ getLocationLabel(destination?.coordinates, 'destination') }}
            </text>
          </g>
          
          <!-- Etiquetas de autopistas (solo para rutas de Madrid) -->
          <g v-if="isMadridRoute" class="highway-labels">
            <text 
              :x="bounds.minX + bounds.width * 0.3" 
              :y="bounds.minY + bounds.height * 0.2" 
              text-anchor="middle" 
              class="highway-label"
            >
              A-5
            </text>
            <text 
              :x="bounds.minX + bounds.width * 0.7" 
              :y="bounds.minY + bounds.height * 0.4" 
              text-anchor="middle" 
              class="highway-label"
            >
              M-30
            </text>
          </g>
          
          <!-- Paradas generadas -->
          <circle 
            v-for="(stop, index) in generatedStops"
            :key="`stop-${index}`"
            :cx="stop.x"
            :cy="stop.y"
            r="4"
            fill="#f59e0b"
            stroke="white"
            stroke-width="1.5"
            class="stop-marker"
          >
            <title>Parada {{ index + 1 }}: {{ stop.distanceFromOrigin.toFixed(1) }} km</title>
          </circle>
          
          <!-- Etiquetas -->
          <text 
            v-if="originPoint"
            :x="originPoint.x"
            :y="originPoint.y - 10"
            text-anchor="middle"
            class="marker-label origin-label"
          >
            🏁 Origen
          </text>
          
          <text 
            v-if="destinationPoint"
            :x="destinationPoint.x"
            :y="destinationPoint.y - 10"
            text-anchor="middle"
            class="marker-label destination-label"
          >
            🎯 Destino
          </text>
        </svg>
      </div>
      
      <!-- Leyenda -->
      <div class="map-legend">
        <div class="legend-item">
          <div class="legend-color origin"></div>
          <span>Origen</span>
        </div>
        <div class="legend-item">
          <div class="legend-color destination"></div>
          <span>Destino</span>
        </div>
        <div class="legend-item">
          <div class="legend-color route"></div>
          <span>Ruta</span>
        </div>
        <div class="legend-item">
          <div class="legend-color stops"></div>
          <span>Paradas</span>
        </div>
      </div>
    </div>

    <!-- Información detallada -->
    <div class="route-details">
      <h4>📋 Detalles de la Ruta</h4>
      
      <div class="details-grid">
        <div class="detail-item">
          <strong>Fuente:</strong> {{ routeData?.source || 'Desconocida' }}
        </div>
        <div class="detail-item">
          <strong>Puntos de ruta:</strong> {{ routeData?.coordinates?.length || 0 }}
        </div>
        <div class="detail-item">
          <strong>Paradas generadas:</strong> {{ generatedStops.length }}
        </div>
        <div class="detail-item">
          <strong>Intervalo:</strong> 3 km
        </div>
      </div>

      <!-- Lista de paradas -->
      <div v-if="generatedStops.length > 0" class="stops-list">
        <h5>🛑 Paradas de Recogida</h5>
        <div class="stops-grid">
          <div 
            v-for="(stop, index) in generatedStops" 
            :key="index"
            class="stop-item"
          >
            <div class="stop-number">{{ index + 1 }}</div>
            <div class="stop-info">
              <div class="stop-coords">
                {{ stop.position.lat.toFixed(4) }}, {{ stop.position.lng.toFixed(4) }}
              </div>
              <div class="stop-distance">{{ stop.distanceFromOrigin.toFixed(1) }} km desde origen</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { Location, Route } from '@/types/carpooling';

interface Props {
  origin?: Location;
  destination?: Location;
  routeData?: {
    distance: number;
    duration: number;
    coordinates: Array<{ lat: number; lng: number }>;
    source: string;
  };
  generatedStops?: Array<{
    position: { lat: number; lng: number };
    stopOrder: number;
    distanceFromOrigin: number;
  }>;
}

const props = withDefaults(defineProps<Props>(), {
  generatedStops: () => []
});

// Referencias
const googleMapContainer = ref<HTMLElement>();
const svgMap = ref<SVGElement>();

// Estado del mapa
const showFallback = ref(false);
const mapType = ref<'roadmap' | 'satellite'>('roadmap');
let googleMap: any = null;
let directionsService: any = null;
let directionsRenderer: any = null;

// Computed
const hasGoogleMaps = computed(() => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  console.log('🔑 Google Maps API Key:', apiKey ? 'Presente' : 'Ausente');
  console.log('🔑 API Key valor:', apiKey);
  return !!apiKey && apiKey !== 'NO_API_KEY';
});

// Calcular bounds para SVG
const bounds = computed(() => {
  const coords = props.routeData?.coordinates || [];
  if (coords.length === 0) return { minX: 0, minY: 0, width: 100, height: 100 };
  
  const lats = coords.map(c => c.lat);
  const lngs = coords.map(c => c.lng);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  
  // Convertir a coordenadas SVG (simplificado)
  const scale = 1000; // Factor de escala
  const minX = minLng * scale;
  const maxX = maxLng * scale;
  const minY = -maxLat * scale; // Invertir Y para SVG
  const maxY = -minLat * scale;
  
  return {
    minX,
    minY,
    width: maxX - minX,
    height: maxY - minY
  };
});

const padding = 50;

// Convertir coordenadas a puntos SVG
const routeData = computed(() => {
  if (!props.routeData?.coordinates) return null;
  
  return {
    ...props.routeData,
    coordinates: props.routeData.coordinates.map(coord => ({
      ...coord,
      x: coord.lng * 1000,
      y: -coord.lat * 1000
    }))
  };
});

const originPoint = computed(() => {
  if (!props.origin?.coordinates) return null;
  return {
    x: props.origin.coordinates.lng * 1000,
    y: -props.origin.coordinates.lat * 1000
  };
});

const destinationPoint = computed(() => {
  if (!props.destination?.coordinates) return null;
  return {
    x: props.destination.coordinates.lng * 1000,
    y: -props.destination.coordinates.lat * 1000
  };
});

// Convertir paradas a puntos SVG
const generatedStops = computed(() => {
  return props.generatedStops.map(stop => ({
    ...stop,
    x: stop.position.lng * 1000,
    y: -stop.position.lat * 1000
  }));
});

// Generar path SVG para la ruta
const routePath = computed(() => {
  if (!routeData.value?.coordinates.length) return '';
  
  const coords = routeData.value.coordinates;
  let path = `M ${coords[0].x} ${coords[0].y}`;
  
  for (let i = 1; i < coords.length; i++) {
    path += ` L ${coords[i].x} ${coords[i].y}`;
  }
  
  return path;
});

// Inicializar Google Maps
const initGoogleMap = () => {
  if (!googleMapContainer.value || !hasGoogleMaps.value) return;
  
  try {
    googleMap = new google.maps.Map(googleMapContainer.value, {
      zoom: 10,
      center: { lat: 40.4168, lng: -3.7038 }, // Madrid
      mapTypeId: mapType.value === 'roadmap' ? google.maps.MapTypeId.ROADMAP : google.maps.MapTypeId.SATELLITE
    });
    
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
      map: googleMap,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#3b82f6',
        strokeWeight: 4,
        strokeOpacity: 0.8
      }
    });
    
    drawGoogleMapRoute();
  } catch (error) {
    console.error('Error inicializando Google Maps:', error);
    showFallback.value = true;
  }
};

// Dibujar ruta en Google Maps usando los datos ya calculados
const drawGoogleMapRoute = () => {
  if (!props.routeData?.coordinates || !directionsRenderer) {
    return;
  }
  
  console.log('🗺️ Dibujando ruta en Google Maps usando datos ya calculados...');
  
  // Crear una ruta personalizada usando nuestros datos
  const route = new google.maps.Polyline({
    path: props.routeData.coordinates,
    geodesic: true,
    strokeColor: '#3b82f6',
    strokeOpacity: 0.8,
    strokeWeight: 4
  });
  
  // Limpiar renderer existente
  directionsRenderer.setMap(null);
  
  // Añadir nuestra ruta al mapa
  route.setMap(googleMap);
  
  // Ajustar el zoom para mostrar toda la ruta
  const bounds = new google.maps.LatLngBounds();
  props.routeData.coordinates.forEach(coord => {
    bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
  });
  googleMap.fitBounds(bounds);
  
  // Añadir marcadores de origen y destino
  addOriginDestinationMarkers();
  
  // Añadir marcadores de paradas
  addStopMarkers();
};

// Añadir marcadores de origen y destino
const addOriginDestinationMarkers = () => {
  if (!googleMap || !props.origin?.coordinates || !props.destination?.coordinates) return;
  
  console.log('📍 Añadiendo marcadores de origen y destino...');
  
  // Marcador de origen
  new google.maps.Marker({
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
  
  // Marcador de destino
  new google.maps.Marker({
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
};

// Añadir marcadores de paradas en Google Maps
const addStopMarkers = () => {
  if (!googleMap || !props.generatedStops.length) return;
  
  console.log('🛑 Añadiendo marcadores de paradas sobre la ruta...');
  
  props.generatedStops.forEach((stop, index) => {
    new google.maps.Marker({
      position: stop.position,
      map: googleMap,
      title: `Parada ${index + 1}: ${stop.distanceFromOrigin.toFixed(1)} km`,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#f59e0b',
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 2
      }
    });
  });
};

// Alternar tipo de mapa
const toggleMapType = () => {
  mapType.value = mapType.value === 'roadmap' ? 'satellite' : 'roadmap';
  if (googleMap) {
    googleMap.setMapTypeId(mapType.value === 'roadmap' ? google.maps.MapTypeId.ROADMAP : google.maps.MapTypeId.SATELLITE);
  }
};

// Centrar mapa
const centerMap = () => {
  if (!googleMap || !props.origin?.coordinates || !props.destination?.coordinates) return;
  
  const bounds = new google.maps.LatLngBounds();
  bounds.extend(props.origin.coordinates);
  bounds.extend(props.destination.coordinates);
  
  googleMap.fitBounds(bounds);
};

// Cargar Google Maps API
const loadGoogleMaps = () => {
  console.log('🗺️ Intentando cargar Google Maps...');
  console.log('🗺️ hasGoogleMaps:', hasGoogleMaps.value);
  console.log('🗺️ window.google existe:', !!window.google);
  
  if (!hasGoogleMaps.value) {
    console.warn('⚠️ No hay API key de Google Maps, usando fallback SVG');
    showFallback.value = true;
    return;
  }
  
  if (window.google) {
    console.log('✅ Google Maps ya está cargado');
    initGoogleMap();
    return;
  }
  
  console.log('📡 Cargando Google Maps API desde:', `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=geometry`);
  
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=geometry&loading=async`;
  script.onload = () => {
    console.log('✅ Google Maps API cargado exitosamente');
    initGoogleMap();
  };
  script.onerror = (error) => {
    console.error('❌ Error cargando Google Maps API:', error);
    showFallback.value = true;
  };
  document.head.appendChild(script);
};

// Watchers
watch(() => props.routeData, () => {
  if (hasGoogleMaps.value && !showFallback.value) {
    drawGoogleMapRoute();
  }
}, { deep: true });

watch(() => props.generatedStops, () => {
  if (hasGoogleMaps.value && !showFallback.value && googleMap) {
    // Limpiar marcadores existentes y redibujar
    drawGoogleMapRoute();
  }
}, { deep: true });

// Funciones de utilidad
const isMadridRoute = computed(() => {
  if (!props.origin?.coordinates || !props.destination?.coordinates) return false;
  
  // Verificar si es la ruta Chamartín → Getafe
  const isChamartin = isNearPoint(props.origin.coordinates, 40.4740, -3.6827);
  const isGetafe = isNearPoint(props.destination.coordinates, 40.3071, -3.7332);
  
  return isChamartin && isGetafe;
});

const isNearPoint = (point: { lat: number; lng: number } | undefined, targetLat: number, targetLng: number, tolerance = 0.01) => {
  if (!point) return false;
  
  const latDiff = Math.abs(point.lat - targetLat);
  const lngDiff = Math.abs(point.lng - targetLng);
  
  return latDiff < tolerance && lngDiff < tolerance;
};

const getLocationLabel = (coordinates: { lat: number; lng: number } | undefined, type: 'origin' | 'destination') => {
  if (!coordinates) return type === 'origin' ? '🏁 Origen' : '🎯 Destino';
  
  // Chamartín
  if (isNearPoint(coordinates, 40.4740, -3.6827)) {
    return '🏢 Chamartín';
  }
  
  // Getafe
  if (isNearPoint(coordinates, 40.3071, -3.7332)) {
    return '🏭 Getafe';
  }
  
  // Otras ubicaciones conocidas se pueden añadir aquí
  return type === 'origin' ? '🏁 Origen' : '🎯 Destino';
};

// Lifecycle
onMounted(() => {
  if (hasGoogleMaps.value) {
    loadGoogleMaps();
  }
});

onUnmounted(() => {
  if (directionsRenderer) {
    directionsRenderer.setMap(null);
  }
});
</script>

<style scoped>
.route-map-complete {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.map-header {
  background: #f8fafc;
  padding: 15px 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.map-header h3 {
  margin: 0;
  color: #1f2937;
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
  font-size: 18px;
  color: #3b82f6;
}

.stat-item small {
  color: #6b7280;
  font-size: 12px;
}

.google-map-container {
  position: relative;
  height: 400px;
}

.google-map {
  width: 100%;
  height: 100%;
}

.map-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
}

.control-btn {
  background: white;
  border: 1px solid #d1d5db;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.control-btn:hover {
  background: #f9fafb;
}

.svg-map-container {
  height: 400px;
  display: flex;
  flex-direction: column;
}

.map-info {
  padding: 10px 20px;
  background: #fef3c7;
  border-bottom: 1px solid #f59e0b;
}

.map-warning {
  margin: 0;
  color: #92400e;
  font-size: 14px;
}

.map-info-text {
  margin: 0;
  color: #92400e;
  font-size: 14px;
}

.svg-map-wrapper {
  flex: 1;
  overflow: hidden;
}

.svg-map {
  width: 100%;
  height: 100%;
}

.marker-label {
  font-size: 12px;
  font-weight: 600;
  fill: #1f2937;
}

.origin-label {
  fill: #10b981;
}

.destination-label {
  fill: #ef4444;
}

.highway-label {
  font-size: 14px;
  font-weight: 700;
  fill: #1f2937;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
}

.highway-labels {
  opacity: 0.8;
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
  gap: 5px;
  font-size: 12px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-color.origin {
  background: #10b981;
}

.legend-color.destination {
  background: #ef4444;
}

.legend-color.route {
  background: #3b82f6;
}

.legend-color.stops {
  background: #f59e0b;
}

.route-details {
  padding: 20px;
}

.route-details h4 {
  margin: 0 0 15px 0;
  color: #1f2937;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
}

.detail-item {
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 4px;
  font-size: 14px;
}

.stops-list h5 {
  margin: 0 0 10px 0;
  color: #1f2937;
}

.stops-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.stop-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f8fafc;
  border-radius: 6px;
  border-left: 4px solid #f59e0b;
}

.stop-number {
  background: #f59e0b;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.stop-info {
  flex: 1;
}

.stop-coords {
  font-size: 11px;
  color: #6b7280;
  font-family: monospace;
}

.stop-distance {
  font-size: 12px;
  color: #1f2937;
  font-weight: 500;
}

/* Hover effects */
.route-point:hover {
  r: 4;
  cursor: pointer;
}

.stop-marker:hover {
  r: 6;
  cursor: pointer;
}

.origin-marker:hover {
  r: 8;
  cursor: pointer;
}

.destination-marker:hover {
  r: 8;
  cursor: pointer;
}
</style>
