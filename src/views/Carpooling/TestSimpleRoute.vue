<template>
  <div class="test-simple-route">
    <h2>🛣️ Test Ruta por Carretera Real</h2>
    <div class="test-description">
      <p>Calcula la ruta entre origen y destino siguiendo las <strong>carreteras reales</strong> (no línea recta).</p>
      <div class="info-box">
        <p><strong>🚗 Carreteras Reales:</strong> La ruta sigue el trayecto real por carreteras, no en línea recta.</p>
        <p><strong>📍 Solo Origen-Destino:</strong> Muestra únicamente la ruta directa entre los dos puntos.</p>
      </div>
    </div>
    
    <div class="test-form">
      <div class="form-row">
        <div class="form-group">
          <label>Origen</label>
          <input v-model="origin" placeholder="Chamartín, Madrid" />
        </div>
        <div class="form-group">
          <label>Destino</label>
          <input v-model="destination" placeholder="Getafe, Madrid" />
        </div>
      </div>
      
      <button @click="calculateRoute" :disabled="loading" class="btn-test">
        {{ loading ? 'Calculando...' : 'Calcular Ruta' }}
      </button>
    </div>

    <div v-if="routeResult" class="results">
      <div class="route-summary">
        <h3>📊 Resumen de la Ruta</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <strong>{{ routeResult.distance.toFixed(2) }} km</strong>
            <small>Distancia total</small>
          </div>
          <div class="summary-item">
            <strong>{{ Math.round(routeResult.duration) }} min</strong>
            <small>Duración</small>
          </div>
          <div class="summary-item">
            <strong>{{ routeResult.coordinates.length }}</strong>
            <small>Puntos de ruta</small>
          </div>
          <div class="summary-item">
            <strong>{{ getRouteSourceLabel(routeResult.source) }}</strong>
            <small>Fuente de ruta</small>
          </div>
        </div>
      </div>

      <!-- Mapa con ruta simple -->
      <div class="map-section">
        <SimpleRouteMap
          :origin="originLocation"
          :destination="destinationLocation"
          :route-data="routeResult"
        />
      </div>

      <!-- Logs de debug -->
      <div class="debug-logs">
        <h3>🔍 Logs de Debug</h3>
        <div class="logs-container">
          <div v-for="(log, index) in logs" :key="index" class="log-entry">
            {{ log }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import routeServiceHybrid from '@/services/routeServiceHybrid';
import { GeolocationService } from '@/services/geolocation';
import SimpleRouteMap from '@/components/carpooling/SimpleRouteMap.vue';
import type { Location } from '@/types/carpooling';

// Servicios
const geolocationService = new GeolocationService();

// Estado del formulario
const origin = ref('Chamartín, Madrid');
const destination = ref('Getafe, Madrid');
const loading = ref(false);
const routeResult = ref<any | null>(null);
const logs = ref<string[]>([]);

// Variables para el mapa
const originLocation = ref<Location | null>(null);
const destinationLocation = ref<Location | null>(null);

const addLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString();
  logs.value.push(`[${timestamp}] ${message}`);
  console.log(`[${timestamp}] ${message}`);
};

const calculateRoute = async () => {
  loading.value = true;
  logs.value = [];
  routeResult.value = null;
  originLocation.value = null;
  destinationLocation.value = null;

  addLog('🔍 Calculando ruta por carretera real...');
  addLog(`📍 Origen: ${origin.value}`);
  addLog(`🎯 Destino: ${destination.value}`);
  
  // Debug: Verificar API keys
  addLog('🔑 Verificando API keys...');
  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const orsApiKey = import.meta.env.VITE_ORS_API_KEY;
  addLog(`🗺️ Google Maps API Key: ${googleApiKey ? 'Presente' : 'Ausente'}`);
  addLog(`🗺️ OpenRouteService API Key: ${orsApiKey ? 'Presente' : 'Ausente'}`);
  
  // Debug: Mostrar las primeras letras de las API keys para verificar
  if (googleApiKey && googleApiKey !== 'tu_google_maps_api_key_aqui') {
    addLog(`🔑 Google API Key: ${googleApiKey.substring(0, 10)}...`);
  } else {
    addLog(`❌ Google API Key: ${googleApiKey || 'NO_DEFINIDA'}`);
  }
  
  if (orsApiKey && orsApiKey !== 'tu_openrouteservice_api_key_aqui') {
    addLog(`🔑 ORS API Key: ${orsApiKey.substring(0, 10)}...`);
  } else {
    addLog(`❌ ORS API Key: ${orsApiKey || 'NO_DEFINIDA'}`);
  }

  try {
    // 1. Geolocalizar origen y destino
    addLog('🌍 Geocodificando direcciones...');
    const originLocationData = await geolocationService.geocodeAddress(origin.value);
    const destLocationData = await geolocationService.geocodeAddress(destination.value);

    if (!originLocationData || !destLocationData) {
      addLog('❌ No se pudieron geocodificar las direcciones.');
      loading.value = false;
      return;
    }

    addLog(`✅ Origen: ${originLocationData.coordinates.lat.toFixed(4)}, ${originLocationData.coordinates.lng.toFixed(4)}`);
    addLog(`✅ Destino: ${destLocationData.coordinates.lat.toFixed(4)}, ${destLocationData.coordinates.lng.toFixed(4)}`);

    // Asignar las ubicaciones para el mapa
    originLocation.value = originLocationData;
    destinationLocation.value = destLocationData;

    // 2. Obtener ruta por carretera real
    addLog('🗺️ Calculando ruta por carretera real...');
    const route = await routeServiceHybrid.getRoute(originLocationData.coordinates, destLocationData.coordinates);
    
    if (!route) {
      addLog('❌ No se pudo obtener la ruta.');
      loading.value = false;
      return;
    }

    addLog(`✅ Ruta calculada desde ${route.source}`);
    addLog(`📏 Distancia: ${route.distance.toFixed(2)} km`);
    addLog(`⏱️ Duración: ${Math.round(route.duration)} min`);
    addLog(`📍 Puntos de ruta: ${route.coordinates.length}`);
    addLog(`🗺️ Fuente de ruta: ${route.source}`);
    addLog(`🛣️ La ruta sigue carreteras reales, no línea recta`);
    
    routeResult.value = route;
    
    addLog('✅ Ruta calculada exitosamente - Solo origen y destino por carretera real');

  } catch (error) {
    addLog(`❌ Error: ${error}`);
  } finally {
    loading.value = false;
  }
};

function getRouteSourceLabel(source: string) {
  switch (source) {
    case 'google-detailed':
      return '🗺️ Google Detallada';
    case 'ors-detailed':
      return '🗺️ ORS Detallada';
    case 'google':
      return '🗺️ Google Básica';
    case 'openrouteservice':
      return '🗺️ ORS Básica';
    case 'fallback':
      return '⚠️ Fallback';
    default:
      return '❓ Desconocida';
  }
}
</script>

<style scoped>
.test-simple-route {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Inter', sans-serif;
}

h2 {
  color: #1f2937;
  margin-bottom: 10px;
  font-size: 1.875rem;
  font-weight: 700;
}

.test-description {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.test-description p {
  margin: 0 0 10px 0;
  color: #374151;
  font-size: 1rem;
}

.info-box {
  margin-top: 15px;
  padding: 15px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.info-box p {
  margin: 5px 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.test-form {
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #374151;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

.btn-test {
  background: #3b82f6;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-test:hover:not(:disabled) {
  background: #2563eb;
}

.btn-test:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.results {
  margin-top: 30px;
}

.route-summary {
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.route-summary h3 {
  margin: 0 0 15px 0;
  color: #1f2937;
  font-size: 1.25rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.summary-item {
  text-align: center;
  padding: 15px;
  background: #f8fafc;
  border-radius: 6px;
}

.summary-item strong {
  display: block;
  font-size: 1.25rem;
  color: #3b82f6;
  margin-bottom: 5px;
}

.summary-item small {
  color: #6b7280;
  font-size: 0.75rem;
}

.map-section {
  margin-bottom: 30px;
}

.debug-logs {
  padding: 20px;
  background: #1f2937;
  border-radius: 8px;
  color: white;
}

.debug-logs h3 {
  margin: 0 0 15px 0;
  color: #f3f4f6;
  font-size: 1.125rem;
}

.logs-container {
  max-height: 300px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  line-height: 1.4;
}

.log-entry {
  margin-bottom: 2px;
  color: #d1d5db;
}

.log-entry:last-child {
  margin-bottom: 0;
}
</style>
