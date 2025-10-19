<template>
  <div class="test-route-stops">
    <h2>🛣️ Test Ruta y Paradas por Carretera Real</h2>
    <div class="test-description">
      <p>Calcula la ruta entre origen y destino siguiendo las <strong>carreteras reales</strong> (no línea recta).</p>
      <div class="info-box">
        <p><strong>🚗 Carreteras Reales:</strong> La ruta sigue el trayecto real por carreteras, no en línea recta.</p>
        <p><strong>📍 Paradas Inteligentes:</strong> Genera paradas cada 3km siguiendo exactamente la ruta de carretera.</p>
        <p><strong>🗺️ API Real:</strong> Usa Google Maps API para rutas y paradas precisas.</p>
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
        <div class="form-group">
          <label>Intervalo (km)</label>
          <input v-model.number="interval" type="number" min="1" max="10" step="0.5" />
        </div>
      </div>
      
      <button @click="testRouteStops" :disabled="loading" class="btn-test">
        {{ loading ? 'Calculando...' : 'Calcular Ruta y Paradas' }}
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
            <strong>{{ generatedStops.length }}</strong>
            <small>Paradas sobre trayecto</small>
          </div>
          <div class="summary-item route-source">
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
                  :stops="generatedStops"
                />
              </div>

      <!-- Análisis detallado de paradas -->
      <div class="stops-analysis">
        <h3>🔍 Análisis de Paradas</h3>
        
        <div class="analysis-grid">
          <div class="analysis-card">
            <h4>📏 Distancias entre Paradas</h4>
            <div class="distance-list">
              <div v-for="(distance, idx) in stopDistances" :key="idx" class="distance-item">
                <span class="distance-label">Parada {{ idx + 1 }} → {{ idx + 2 }}</span>
                <span class="distance-value" :class="getDistanceClass(distance)">
                  {{ distance.toFixed(2) }} km
                </span>
              </div>
            </div>
          </div>

          <div class="analysis-card">
            <h4>📊 Estadísticas</h4>
            <div class="stats-list">
              <div class="stat-item">
                <span>Distancia promedio:</span>
                <strong>{{ averageDistance.toFixed(2) }} km</strong>
              </div>
              <div class="stat-item">
                <span>Desviación estándar:</span>
                <strong>{{ standardDeviation.toFixed(2) }} km</strong>
              </div>
              <div class="stat-item">
                <span>Intervalo objetivo:</span>
                <strong>{{ interval }} km</strong>
              </div>
              <div class="stat-item">
                <span>Precisión:</span>
                <strong :class="getPrecisionClass(precision)">
                  {{ precision.toFixed(1) }}%
                </strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Lista detallada de paradas -->
        <div class="detailed-stops">
          <h4>📍 Paradas Detalladas</h4>
          <div class="stops-table">
            <div class="table-header">
              <div>#</div>
              <div>Coordenadas</div>
              <div>Distancia desde origen</div>
              <div>Distancia al anterior</div>
              <div>Estado</div>
            </div>
            <div 
              v-for="(stop, idx) in generatedStops" 
              :key="idx"
              class="table-row"
            >
              <div class="stop-number">{{ idx + 1 }}</div>
              <div class="stop-coords">
                {{ stop.position.lat.toFixed(4) }}, {{ stop.position.lng.toFixed(4) }}
              </div>
              <div class="stop-distance">
                {{ stop.distanceFromOrigin.toFixed(2) }} km
              </div>
              <div class="stop-segment">
                {{ idx === 0 ? 'Origen' : (stopDistances[idx - 1]?.toFixed(2) || '0.00') + ' km' }}
              </div>
              <div class="stop-status" :class="getStopStatusClass(idx)">
                {{ getStopStatus(idx) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Logs -->
      <div class="logs-section">
        <h3>📝 Logs de Debug</h3>
        <div class="logs-container">
          <div v-for="(log, idx) in logs" :key="idx" class="log-item">
            {{ log }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import routeServiceHybrid from '@/services/routeServiceHybrid';
import SimpleRouteMap from '@/components/carpooling/SimpleRouteMap.vue';
import type { Location } from '@/types/carpooling';

// Estado del formulario
const origin = ref('Chamartín, Madrid');
const destination = ref('Getafe, Madrid');
const interval = ref(3);
const loading = ref(false);

// Resultados
const routeResult = ref<any>(null);
const generatedStops = ref<any[]>([]);
const originLocation = ref<Location | null>(null);
const destinationLocation = ref<Location | null>(null);
const logs = ref<string[]>([]);

// Computed para análisis
const stopDistances = computed(() => {
  if (generatedStops.value.length < 2) return [];
  
  const distances = [];
  for (let i = 1; i < generatedStops.value.length; i++) {
    const prev = generatedStops.value[i - 1];
    const current = generatedStops.value[i];
    const distance = routeServiceHybrid.calculateDistance(prev.position, current.position);
    distances.push(distance);
  }
  return distances;
});

const averageDistance = computed(() => {
  if (stopDistances.value.length === 0) return 0;
  return stopDistances.value.reduce((sum, dist) => sum + dist, 0) / stopDistances.value.length;
});

const standardDeviation = computed(() => {
  if (stopDistances.value.length === 0) return 0;
  const avg = averageDistance.value;
  const variance = stopDistances.value.reduce((sum, dist) => sum + Math.pow(dist - avg, 2), 0) / stopDistances.value.length;
  return Math.sqrt(variance);
});

const precision = computed(() => {
  if (stopDistances.value.length === 0) return 0;
  const avg = averageDistance.value;
  const target = interval.value;
  return Math.max(0, 100 - Math.abs((avg - target) / target * 100));
});

// Funciones de utilidad
function addLog(message: string) {
  const timestamp = new Date().toLocaleTimeString();
  logs.value.push(`[${timestamp}] ${message}`);
  console.log(message);
}

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

async function testRouteStops() {
  loading.value = true;
  logs.value = [];
  
  try {
    addLog('🔍 Calculando ruta por carretera real...');
    addLog(`📍 Origen: ${origin.value}`);
    addLog(`🎯 Destino: ${destination.value}`);
    
    // Geocodificar
    addLog('🌍 Geocodificando direcciones...');
    const originCoords = await geocode(origin.value);
    const destCoords = await geocode(destination.value);
    
    if (!originCoords || !destCoords) {
      addLog('❌ Error en geocodificación');
      return;
    }
    
    addLog(`✅ Origen: ${originCoords.lat.toFixed(4)}, ${originCoords.lng.toFixed(4)}`);
    addLog(`✅ Destino: ${destCoords.lat.toFixed(4)}, ${destCoords.lng.toFixed(4)}`);
    
    // Crear objetos Location
    originLocation.value = {
      id: 'test-origin',
      name: origin.value,
      address: origin.value,
      coordinates: originCoords,
      type: 'origin'
    };
    
    destinationLocation.value = {
      id: 'test-destination',
      name: destination.value,
      address: destination.value,
      coordinates: destCoords,
      type: 'destination'
    };
    
    // Obtener ruta por carretera real
    addLog('🗺️ Calculando ruta por carretera real...');
    const route = await routeServiceHybrid.getRoute(originCoords, destCoords);
    
    addLog(`✅ Ruta calculada desde ${route.source}`);
    addLog(`📏 Distancia: ${route.distance.toFixed(2)} km`);
    addLog(`⏱️ Duración: ${Math.round(route.duration)} min`);
    addLog(`📍 Puntos de ruta: ${route.coordinates.length}`);
    addLog(`🗺️ Fuente de ruta: ${route.source}`);
    addLog(`🛣️ La ruta sigue carreteras reales, no línea recta`);
    
    routeResult.value = route;
    
    // Generar paradas cada X km siguiendo la ruta real
    addLog(`🛑 Generando paradas cada ${interval.value} km siguiendo el trayecto REAL de carreteras...`);
    const stops = routeServiceHybrid.generateStops(route, interval.value);
    
    addLog(`✅ ${stops.length} paradas generadas siguiendo el trayecto real de carreteras`);
    
    // Mostrar detalles de cada parada
    stops.forEach((stop, idx) => {
      addLog(`📍 Parada ${idx + 1}: ${stop.position.lat.toFixed(4)}, ${stop.position.lng.toFixed(4)} (${stop.distanceFromOrigin.toFixed(2)} km desde origen)`);
    });
    
    generatedStops.value = stops;
    
    addLog('✅ Ruta y paradas calculadas exitosamente - Paradas sobre trayecto real de carreteras');
    
  } catch (error) {
    addLog(`❌ Error: ${error}`);
  } finally {
    loading.value = false;
  }
}

// Funciones de estilo
function getDistanceClass(distance: number) {
  const target = interval.value;
  const diff = Math.abs(distance - target);
  
  if (diff <= 0.2) return 'distance-excellent';
  if (diff <= 0.5) return 'distance-good';
  return 'distance-poor';
}

function getPrecisionClass(precision: number) {
  if (precision >= 90) return 'precision-excellent';
  if (precision >= 75) return 'precision-good';
  return 'precision-poor';
}

function getStopStatusClass(index: number) {
  if (index === 0) return 'status-origin';
  if (index === generatedStops.value.length - 1) return 'status-destination';
  return 'status-stop';
}

function getStopStatus(index: number) {
  if (index === 0) return 'Origen';
  if (index === generatedStops.value.length - 1) return 'Destino';
  return 'Parada';
}

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
.test-route-stops {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.test-description {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.test-description p {
  margin: 0 0 10px 0;
  color: #374151;
}

.info-box {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  padding: 15px;
  margin-top: 15px;
}

.info-box p {
  margin: 0 0 8px 0;
  color: #1e40af;
  font-size: 14px;
}

.info-box p:last-child {
  margin-bottom: 0;
}

.test-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
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
  align-self: end;
}

.btn-test:hover:not(:disabled) {
  background: #2563eb;
}

.btn-test:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.results {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.route-summary {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.summary-item {
  text-align: center;
  padding: 15px;
  background: #f8fafc;
  border-radius: 6px;
}

.summary-item strong {
  display: block;
  font-size: 24px;
  color: #3b82f6;
  margin-bottom: 5px;
}

.summary-item small {
  color: #6b7280;
  font-size: 14px;
}

.route-source strong {
  color: #059669;
}

.route-source strong:contains("⚠️") {
  color: #d97706;
}

.route-source strong:contains("❓") {
  color: #6b7280;
}

.map-section {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stops-analysis {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.analysis-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.analysis-card {
  background: #f8fafc;
  padding: 15px;
  border-radius: 6px;
}

.analysis-card h4 {
  margin: 0 0 15px 0;
  color: #1f2937;
}

.distance-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.distance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: white;
  border-radius: 4px;
}

.distance-label {
  font-size: 14px;
}

.distance-value {
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
}

.distance-excellent {
  background: #d1fae5;
  color: #065f46;
}

.distance-good {
  background: #fef3c7;
  color: #92400e;
}

.distance-poor {
  background: #fee2e2;
  color: #991b1b;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.stat-item:last-child {
  border-bottom: none;
}

.precision-excellent {
  color: #059669;
}

.precision-good {
  color: #d97706;
}

.precision-poor {
  color: #dc2626;
}

.detailed-stops {
  margin-top: 20px;
}

.stops-table {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 60px 1fr 120px 120px 80px;
  background: #f8fafc;
  font-weight: 600;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.table-row {
  display: grid;
  grid-template-columns: 60px 1fr 120px 120px 80px;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  align-items: center;
}

.table-row:last-child {
  border-bottom: none;
}

.stop-number {
  background: #3b82f6;
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

.stop-coords {
  font-family: monospace;
  font-size: 12px;
  color: #6b7280;
}

.stop-distance,
.stop-segment {
  font-size: 14px;
  text-align: center;
}

.stop-status {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  text-align: center;
  font-weight: 600;
}

.status-origin {
  background: #d1fae5;
  color: #065f46;
}

.status-destination {
  background: #fee2e2;
  color: #991b1b;
}

.status-stop {
  background: #fef3c7;
  color: #92400e;
}

.logs-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .analysis-grid {
    grid-template-columns: 1fr;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 5px;
  }
  
  .table-header > div,
  .table-row > div {
    text-align: left;
  }
}
</style>
