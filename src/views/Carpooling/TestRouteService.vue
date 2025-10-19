<template>
  <div class="test-route-service">
    <h2>🧪 Test Route Service</h2>
    
    <div class="test-section">
      <h3>📋 Configuración Actual</h3>
      <div class="config-info">
        <p><strong>OpenRouteService:</strong> {{ hasORS ? '✅ Configurado' : '❌ Sin API key' }}</p>
        <p><strong>Google Maps:</strong> {{ hasGoogle ? '✅ Configurado' : '❌ Sin API key' }}</p>
        <p><strong>Mapbox:</strong> {{ hasMapbox ? '✅ Configurado' : '❌ Sin API key' }}</p>
      </div>
    </div>

    <div class="test-section">
      <h3>🗺️ Prueba de Rutas</h3>
      
      <div class="form-row">
        <div class="form-group">
          <label>Origen</label>
          <input v-model="testOrigin" placeholder="Chamartín, Madrid" />
        </div>
        <div class="form-group">
          <label>Destino</label>
          <input v-model="testDestination" placeholder="Getafe, Madrid" />
        </div>
      </div>

      <button @click="testRoute" :disabled="testing" class="btn-test">
        {{ testing ? 'Probando...' : 'Probar Ruta' }}
      </button>

      <div v-if="routeResult" class="result-section">
        <h4>📊 Resultado:</h4>
        <div class="route-info">
          <p><strong>Fuente:</strong> {{ routeResult.source }}</p>
          <p><strong>Distancia:</strong> {{ routeResult.distance.toFixed(2) }} km</p>
          <p><strong>Duración:</strong> {{ Math.round(routeResult.duration) }} min</p>
          <p><strong>Coordenadas:</strong> {{ routeResult.coordinates.length }} puntos</p>
        </div>

        <!-- Mapa completo de la ruta -->
        <div class="route-map-section">
          <RouteMapComplete
            :origin="originLocation"
            :destination="destinationLocation"
            :route-data="routeResult"
            :generated-stops="generatedStops"
          />
        </div>

        <div class="stops-preview">
          <h5>🛑 Paradas Generadas (cada 3km):</h5>
          <div class="stops-list">
            <div v-for="(stop, idx) in generatedStops" :key="idx" class="stop-item">
              <span class="stop-number">{{ idx + 1 }}</span>
              <span class="stop-coords">{{ stop.position.lat.toFixed(4) }}, {{ stop.position.lng.toFixed(4) }}</span>
              <span class="stop-distance">{{ stop.distanceFromOrigin.toFixed(1) }} km</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="test-section">
      <h3>🎯 Prueba de Matching</h3>
      
      <div class="form-row">
        <div class="form-group">
          <label>Pickup del usuario</label>
          <input v-model="userPickup" placeholder="Moncloa, Madrid" />
        </div>
        <div class="form-group">
          <label>Dropoff del usuario</label>
          <input v-model="userDropoff" placeholder="Legazpi, Madrid" />
        </div>
      </div>

      <button @click="testMatching" :disabled="testingMatch" class="btn-test">
        {{ testingMatch ? 'Probando...' : 'Probar Matching' }}
      </button>

      <div v-if="matchResult" class="result-section">
        <h4>🎯 Resultado del Matching:</h4>
        <div v-if="matchResult.length > 0" class="matches-list">
          <div v-for="(match, idx) in matchResult" :key="idx" class="match-item">
            <div class="match-header">
              <strong>Match {{ idx + 1 }}</strong>
              <span class="match-score">Score: {{ match.matchScore.toFixed(2) }}</span>
            </div>
            <div class="match-details">
              <p>🚶 Pickup: {{ match.pickupDistance.toFixed(2) }} km</p>
              <p>📍 Dropoff: {{ match.dropoffDistance.toFixed(2) }} km</p>
              <p>🚗 Viaje: {{ match.trip.origin.lat.toFixed(2) }}, {{ match.trip.origin.lng.toFixed(2) }} → {{ match.trip.destination.lat.toFixed(2) }}, {{ match.trip.destination.lng.toFixed(2) }}</p>
            </div>
          </div>
        </div>
        <div v-else class="no-matches">
          <p>😔 No se encontraron matches compatibles</p>
        </div>
      </div>
    </div>

    <div class="test-section">
      <h3>📝 Logs</h3>
      <div class="logs-container">
        <div v-for="(log, idx) in logs" :key="idx" class="log-item">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import routeServiceHybrid from '@/services/routeServiceHybrid';
import RouteMapComplete from '@/components/carpooling/RouteMapComplete.vue';
import type { Location } from '@/types/carpooling';

// Estado del formulario
const testOrigin = ref('Chamartín, Madrid');
const testDestination = ref('Getafe, Madrid');
const userPickup = ref('Moncloa, Madrid');
const userDropoff = ref('Legazpi, Madrid');

// Estado de las pruebas
const testing = ref(false);
const testingMatch = ref(false);
const routeResult = ref<any>(null);
const generatedStops = ref<any[]>([]);
const matchResult = ref<any[]>([]);
const logs = ref<string[]>([]);

// Variables para el mapa
const originLocation = ref<Location | null>(null);
const destinationLocation = ref<Location | null>(null);

// Configuración
const hasORS = computed(() => !!import.meta.env.VITE_ORS_API_KEY && import.meta.env.VITE_ORS_API_KEY !== 'NO_API_KEY');
const hasGoogle = computed(() => !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && import.meta.env.VITE_GOOGLE_MAPS_API_KEY !== 'NO_API_KEY');
const hasMapbox = computed(() => !!import.meta.env.VITE_MAPBOX_ACCESS_TOKEN && import.meta.env.VITE_MAPBOX_ACCESS_TOKEN !== 'NO_API_KEY');

// Función para agregar logs
const addLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString();
  logs.value.push(`[${timestamp}] ${message}`);
  console.log(message);
};

// Función para geocodificar
async function geocode(address: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    };
  }
  return null;
}

// Prueba de rutas
async function testRoute() {
  testing.value = true;
  logs.value = [];
  
  try {
    addLog('🔍 Geocodificando direcciones...');
    
    const originCoords = await geocode(testOrigin.value);
    const destCoords = await geocode(testDestination.value);
    
    if (!originCoords || !destCoords) {
      addLog('❌ Error en geocodificación');
      return;
    }
    
    addLog(`📍 Origen: ${originCoords.lat}, ${originCoords.lng}`);
    addLog(`🎯 Destino: ${destCoords.lat}, ${destCoords.lng}`);
    
    // Crear objetos Location para el mapa
    originLocation.value = {
      id: 'test-origin',
      name: testOrigin.value,
      address: testOrigin.value,
      coordinates: originCoords,
      type: 'origin'
    };
    
    destinationLocation.value = {
      id: 'test-destination',
      name: testDestination.value,
      address: testDestination.value,
      coordinates: destCoords,
      type: 'destination'
    };
    
    addLog('🗺️ Obteniendo ruta...');
    const route = await routeServiceHybrid.getRoute(originCoords, destCoords);
    
    addLog(`✅ Ruta obtenida desde ${route.source}`);
    addLog(`📏 Distancia: ${route.distance.toFixed(2)} km`);
    addLog(`⏱️ Duración: ${Math.round(route.duration)} min`);
    
    routeResult.value = route;
    
    addLog('🛑 Generando paradas...');
    const stops = routeServiceHybrid.generateStops(route.coordinates, 3);
    generatedStops.value = stops;
    
    addLog(`✅ ${stops.length} paradas generadas`);
    
  } catch (error) {
    addLog(`❌ Error: ${error}`);
  } finally {
    testing.value = false;
  }
}

// Prueba de matching
async function testMatching() {
  testingMatch.value = true;
  
  try {
    addLog('🔍 Probando matching de viajes...');
    
    const pickupCoords = await geocode(userPickup.value);
    const dropoffCoords = await geocode(userDropoff.value);
    
    if (!pickupCoords || !dropoffCoords) {
      addLog('❌ Error en geocodificación para matching');
      return;
    }
    
    // Simular algunos viajes para testing
    const mockTrips = [
      {
        id: 'trip-1',
        origin: { lat: 40.4168, lng: -3.7038 }, // Madrid centro
        destination: { lat: 40.3047, lng: -3.7309 }, // Getafe
        driver_name: 'Conductor 1',
        stops: []
      },
      {
        id: 'trip-2',
        origin: { lat: 40.4168, lng: -3.7038 }, // Madrid centro
        destination: { lat: 40.4192, lng: -3.7015 }, // Moncloa
        driver_name: 'Conductor 2',
        stops: []
      }
    ];
    
    const matches = await routeServiceHybrid.findMatchingTrips(
      pickupCoords,
      dropoffCoords,
      mockTrips
    );
    
    matchResult.value = matches;
    addLog(`🎯 ${matches.length} matches encontrados`);
    
  } catch (error) {
    addLog(`❌ Error en matching: ${error}`);
  } finally {
    testingMatch.value = false;
  }
}

onMounted(() => {
  addLog('🚀 Test Route Service iniciado');
  addLog(`🔧 ORS: ${hasORS.value ? 'Disponible' : 'No disponible'}`);
  addLog(`🗺️ Google: ${hasGoogle.value ? 'Disponible' : 'No disponible'}`);
  addLog(`📦 Mapbox: ${hasMapbox.value ? 'Disponible' : 'No disponible'}`);
});
</script>

<style scoped>
.test-route-service {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.test-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.test-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #1f2937;
}

.config-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 5px;
}

.form-group input {
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

.btn-test {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
}

.btn-test:hover:not(:disabled) {
  background: #2563eb;
}

.btn-test:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.result-section {
  margin-top: 20px;
  padding: 15px;
  background: #f9fafb;
  border-radius: 6px;
}

.route-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
}

.route-map-section {
  margin: 20px 0;
  border-radius: 8px;
  overflow: hidden;
}

.stops-preview {
  margin-top: 15px;
}

.stops-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.stop-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
}

.stop-number {
  background: #3b82f6;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
}

.matches-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.match-item {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.match-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.match-score {
  background: #10b981;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.match-details {
  font-size: 14px;
}

.match-details p {
  margin: 5px 0;
}

.no-matches {
  text-align: center;
  padding: 20px;
  color: #6b7280;
}

.logs-container {
  background: #1f2937;
  color: #10b981;
  padding: 15px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.log-item {
  margin-bottom: 2px;
}
</style>
