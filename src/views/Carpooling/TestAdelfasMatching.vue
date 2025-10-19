<template>
  <div class="test-adelfas-matching">
    <h2>🧪 Test: Matching Calle de las Adelfas</h2>
    
    <div class="test-info">
      <div class="info-box">
        <h3>📍 Dirección de Prueba</h3>
        <p><strong>Calle de las Adelfas, 38, Madrid</strong></p>
        <p>Esta dirección debería coincidir con la <strong>Parada 4</strong> del viaje Chamartín-Getafe</p>
      </div>
      
      <div class="info-box">
        <h3>🎯 Viaje de Referencia</h3>
        <p><strong>Chamartín → Getafe</strong></p>
        <p>Paradas cada 3km por A-5 y M-30</p>
      </div>
    </div>

    <div class="test-form">
      <button @click="testAdelfasMatching" :disabled="loading" class="btn-test">
        {{ loading ? 'Probando...' : '🧪 Probar Matching Adelfas' }}
      </button>
    </div>

    <div v-if="testResult" class="test-results">
      <h3>📊 Resultados del Test</h3>
      
      <div class="result-card">
        <div class="result-header">
          <h4>{{ testResult.matchFound ? '✅ Match Encontrado' : '❌ No Match' }}</h4>
        </div>
        
        <div v-if="testResult.matchFound" class="match-details">
          <div class="match-info">
            <div class="match-type">
              <strong>Tipo de Match:</strong> 
              <span class="match-badge" :class="getMatchTypeClass(testResult.matchType)">
                {{ getMatchTypeLabel(testResult.matchType) }}
              </span>
            </div>
            
            <div class="distance-info">
              <strong>Distancia:</strong> {{ testResult.distance.toFixed(2) }} km
            </div>
            
            <div class="stop-info">
              <strong>Parada:</strong> {{ testResult.stopInfo?.name || 'N/A' }}
            </div>
            
            <div class="stop-address">
              <strong>Dirección:</strong> {{ testResult.stopInfo?.address || 'N/A' }}
            </div>
          </div>
        </div>
        
        <div v-else class="no-match">
          <p>❌ No se encontró ningún match para la dirección de prueba</p>
          <p>Verifica que la parada esté dentro del radio de 1km</p>
        </div>
      </div>
    </div>

    <!-- Logs de debug -->
    <div v-if="logs.length > 0" class="debug-logs">
      <h3>📝 Logs de Debug</h3>
      <div class="logs-container">
        <div v-for="(log, idx) in logs" :key="idx" class="log-item">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TripMatchingService, { type SearchResult } from '@/services/tripMatchingService';
import TripDataService from '@/services/tripDataService';

const loading = ref(false);
const testResult = ref<any>(null);
const logs = ref<string[]>([]);

function addLog(message: string) {
  const timestamp = new Date().toLocaleTimeString();
  logs.value.push(`[${timestamp}] ${message}`);
  console.log(message);
}

async function testAdelfasMatching() {
  loading.value = true;
  logs.value = [];
  testResult.value = null;
  
  try {
    addLog('🧪 Iniciando test de matching para Calle de las Adelfas...');
    
    const testAddress = 'Calle de las Adelfas, 38, Madrid';
    addLog(`📍 Dirección de prueba: ${testAddress}`);
    
    // Buscar viajes
    const results = await TripMatchingService.searchTrips(testAddress, undefined, 1);
    
    addLog(`🔍 Búsqueda completada. Encontrados: ${results.length} resultados`);
    
    if (results.length > 0) {
      const match = results[0]; // Primer resultado
      addLog(`✅ Match encontrado: ${match.matchType}`);
      addLog(`📏 Distancia: ${match.matchDistance.toFixed(2)} km`);
      addLog(`🚏 Parada: ${match.matchingStop.id}`);
      
      // Obtener información detallada de la parada
      const trip = TripDataService.getTripById(match.trip.id);
      const stopInfo = trip?.stops.find(s => s.id === match.matchingStop.id);
      
      testResult.value = {
        matchFound: true,
        matchType: match.matchType,
        distance: match.matchDistance,
        stopInfo: stopInfo,
        trip: match.trip
      };
      
      addLog(`📍 Información de parada: ${stopInfo?.name || 'N/A'}`);
    } else {
      addLog('❌ No se encontraron matches');
      testResult.value = {
        matchFound: false
      };
    }
    
  } catch (error) {
    addLog(`❌ Error en el test: ${error}`);
    testResult.value = {
      matchFound: false,
      error: error
    };
  } finally {
    loading.value = false;
  }
}

function getMatchTypeClass(matchType: string): string {
  switch (matchType) {
    case 'origin': return 'match-origin';
    case 'destination': return 'match-destination';
    case 'stop': return 'match-stop';
    default: return 'match-unknown';
  }
}

function getMatchTypeLabel(matchType: string): string {
  switch (matchType) {
    case 'origin': return '🎯 Origen exacto';
    case 'destination': return '📍 Destino exacto';
    case 'stop': return '🚏 Parada cercana';
    default: return '❓ Desconocido';
  }
}
</script>

<style scoped>
.test-adelfas-matching {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.test-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.info-box {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #3b82f6;
}

.info-box h3 {
  margin: 0 0 10px 0;
  color: #1f2937;
}

.test-form {
  text-align: center;
  margin-bottom: 30px;
}

.btn-test {
  background: #10b981;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.btn-test:hover:not(:disabled) {
  background: #059669;
}

.btn-test:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.test-results {
  margin-bottom: 30px;
}

.result-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.result-header h4 {
  margin: 0 0 15px 0;
  color: #1f2937;
}

.match-details {
  background: #f8fafc;
  padding: 15px;
  border-radius: 6px;
}

.match-info > div {
  margin-bottom: 10px;
}

.match-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  margin-left: 8px;
}

.match-origin {
  background: #d1fae5;
  color: #065f46;
}

.match-destination {
  background: #fee2e2;
  color: #991b1b;
}

.match-stop {
  background: #fef3c7;
  color: #92400e;
}

.no-match {
  text-align: center;
  color: #dc2626;
}

.debug-logs {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  .test-info {
    grid-template-columns: 1fr;
  }
}
</style>
