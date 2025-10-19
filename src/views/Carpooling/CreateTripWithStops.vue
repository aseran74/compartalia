<template>
  <div class="create-trip-with-stops">
    <h2>🚗 Crear Viaje con Paradas</h2>
    
    <div class="form-container">
      <form @submit.prevent="createTrip">
        <!-- Información básica del viaje -->
        <div class="form-section">
          <h3>📍 Información del Viaje</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label>Origen</label>
              <input v-model="tripForm.origin_name" placeholder="Ej: Chamartín, Madrid" required />
            </div>
            <div class="form-group">
              <label>Destino</label>
              <input v-model="tripForm.destination_name" placeholder="Ej: Getafe, Madrid" required />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Conductor</label>
              <input v-model="tripForm.driver_name" placeholder="Tu nombre" required />
            </div>
            <div class="form-group">
              <label>Rating</label>
              <input v-model.number="tripForm.driver_rating" type="number" min="1" max="5" step="0.1" required />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Asientos disponibles</label>
              <input v-model.number="tripForm.available_seats" type="number" min="1" max="8" required />
            </div>
            <div class="form-group">
              <label>Hora de salida</label>
              <input v-model="tripForm.departure_time" type="time" required />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Precio (€)</label>
              <input v-model.number="tripForm.price_per_seat" type="number" min="0" step="0.50" required />
            </div>
            <div class="form-group">
              <label>Días de la semana</label>
              <div class="days-selector">
                <label v-for="day in daysOfWeek" :key="day.value" class="day-checkbox">
                  <input 
                    type="checkbox" 
                    :value="day.value" 
                    v-model="tripForm.days_of_week"
                  />
                  {{ day.label }}
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="form-actions">
          <button type="button" @click="geocodeAddresses" :disabled="loading" class="btn-geocode">
            {{ loading ? 'Geocodificando...' : '🗺️ Obtener Coordenadas' }}
          </button>
          
          <button type="submit" :disabled="loading || !coordinatesReady" class="btn-create">
            {{ loading ? 'Creando...' : '🚗 Crear Viaje' }}
          </button>
        </div>

        <!-- Información de coordenadas -->
        <div v-if="coordinatesReady" class="coordinates-info">
          <h3>📍 Coordenadas Obtenidas</h3>
          <div class="coordinates-grid">
            <div class="coordinate-item">
              <strong>Origen:</strong> {{ tripForm.origin_lat.toFixed(6) }}, {{ tripForm.origin_lng.toFixed(6) }}
            </div>
            <div class="coordinate-item">
              <strong>Destino:</strong> {{ tripForm.destination_lat.toFixed(6) }}, {{ tripForm.destination_lng.toFixed(6) }}
            </div>
          </div>
        </div>

        <!-- Información de paradas -->
        <div v-if="stopsInfo.length > 0" class="stops-info">
          <h3>🚏 Paradas Generadas</h3>
          <div class="stops-grid">
            <div v-for="(stop, idx) in stopsInfo" :key="idx" class="stop-item">
              <div class="stop-number">{{ idx + 1 }}</div>
              <div class="stop-details">
                <div class="stop-name">{{ stop.name }}</div>
                <div class="stop-address">{{ stop.address }}</div>
                <div class="stop-distance">{{ stop.distance_from_origin.toFixed(1) }} km desde origen</div>
              </div>
            </div>
          </div>
        </div>
      </form>
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
import { ref, reactive } from 'vue';
import SupabaseTripsService from '@/services/supabaseTrips';
import { GeolocationService } from '@/services/geolocation';

const geolocationService = new GeolocationService();

const loading = ref(false);
const coordinatesReady = ref(false);
const logs = ref<string[]>([]);
const stopsInfo = ref<any[]>([]);

const daysOfWeek = [
  { value: 1, label: 'L' },
  { value: 2, label: 'M' },
  { value: 3, label: 'X' },
  { value: 4, label: 'J' },
  { value: 5, label: 'V' },
  { value: 6, label: 'S' },
  { value: 7, label: 'D' }
];

const tripForm = reactive({
  origin_name: 'Chamartín, Madrid',
  origin_lat: 0,
  origin_lng: 0,
  destination_name: 'Getafe, Madrid',
  destination_lat: 0,
  destination_lng: 0,
  driver_name: 'María García',
  driver_rating: 4.8,
  available_seats: 3,
  departure_time: '08:30',
  price_per_seat: 4.50,
  days_of_week: [1, 2, 3, 4, 5], // Lunes a Viernes
  is_active: true
});

function addLog(message: string) {
  const timestamp = new Date().toLocaleTimeString();
  logs.value.push(`[${timestamp}] ${message}`);
  console.log(message);
}

async function geocodeAddresses() {
  loading.value = true;
  logs.value = [];
  
  try {
    addLog('🗺️ Geocodificando direcciones...');
    
    // Geocodificar origen
    addLog(`📍 Geocodificando origen: ${tripForm.origin_name}`);
    const originCoords = await geolocationService.geocodeAddress(tripForm.origin_name);
    if (!originCoords) {
      addLog('❌ Error geocodificando origen');
      return;
    }
    
    tripForm.origin_lat = originCoords.lat;
    tripForm.origin_lng = originCoords.lng;
    addLog(`✅ Origen: ${originCoords.lat.toFixed(6)}, ${originCoords.lng.toFixed(6)}`);
    
    // Geocodificar destino
    addLog(`📍 Geocodificando destino: ${tripForm.destination_name}`);
    const destCoords = await geolocationService.geocodeAddress(tripForm.destination_name);
    if (!destCoords) {
      addLog('❌ Error geocodificando destino');
      return;
    }
    
    tripForm.destination_lat = destCoords.lat;
    tripForm.destination_lng = destCoords.lng;
    addLog(`✅ Destino: ${destCoords.lat.toFixed(6)}, ${destCoords.lng.toFixed(6)}`);
    
    coordinatesReady.value = true;
    addLog('✅ Coordenadas obtenidas correctamente');
    
  } catch (error) {
    addLog(`❌ Error en geocodificación: ${error}`);
  } finally {
    loading.value = false;
  }
}

async function createTrip() {
  loading.value = true;
  
  try {
    addLog('🚗 Creando viaje en Supabase...');
    
    const trip = await SupabaseTripsService.createTrip(tripForm);
    
    if (trip) {
      addLog(`✅ Viaje creado exitosamente con ID: ${trip.id}`);
      addLog(`📍 ${trip.stops?.length || 0} paradas generadas`);
      
      // Mostrar información de paradas
      if (trip.stops) {
        stopsInfo.value = trip.stops;
      }
      
      // Limpiar formulario
      resetForm();
    } else {
      addLog('❌ Error creando el viaje');
    }
    
  } catch (error) {
    addLog(`❌ Error: ${error}`);
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  coordinatesReady.value = false;
  stopsInfo.value = [];
  logs.value = [];
}
</script>

<style scoped>
.create-trip-with-stops {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.form-container {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.form-section {
  margin-bottom: 30px;
}

.form-section h3 {
  margin: 0 0 20px 0;
  color: #1f2937;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 10px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 8px;
  color: #374151;
}

.form-group input {
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
}

.days-selector {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}

.day-checkbox {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  cursor: pointer;
}

.day-checkbox input {
  width: auto;
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin: 30px 0;
}

.btn-geocode, .btn-create {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 16px;
}

.btn-geocode {
  background: #6b7280;
  color: white;
}

.btn-geocode:hover:not(:disabled) {
  background: #4b5563;
}

.btn-create {
  background: #10b981;
  color: white;
}

.btn-create:hover:not(:disabled) {
  background: #059669;
}

.btn-geocode:disabled, .btn-create:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.coordinates-info, .stops-info {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}

.coordinates-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.coordinate-item {
  background: white;
  padding: 15px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 14px;
}

.stops-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.stop-item {
  background: white;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.stop-number {
  background: #3b82f6;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.stop-details {
  flex: 1;
}

.stop-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.stop-address {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 2px;
}

.stop-distance {
  font-size: 12px;
  color: #9ca3af;
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
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .coordinates-grid {
    grid-template-columns: 1fr;
  }
  
  .stops-grid {
    grid-template-columns: 1fr;
  }
  
  .days-selector {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
