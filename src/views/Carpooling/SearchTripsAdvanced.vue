<template>
  <div class="search-trips">
    <h2>Buscar Viaje</h2>

    <form @submit.prevent="searchTrips">
      <div class="form-group">
        <label>¿Desde dónde sales?</label>
        <input 
          v-model="pickupLocation" 
          type="text" 
          placeholder="Tu ubicación de recogida"
        />
      </div>

      <div class="form-group">
        <label>¿A dónde vas?</label>
        <input 
          v-model="dropoffLocation" 
          type="text" 
          placeholder="Tu destino"
        />
      </div>

      <div class="form-group">
        <label>Fecha</label>
        <input v-model="searchDate" type="date" />
      </div>

      <button type="submit" :disabled="loading" class="btn-search">
        {{ loading ? 'Buscando...' : 'Buscar Viajes' }}
      </button>
    </form>

    <!-- Resultados -->
    <div v-if="matches.length > 0" class="results">
      <h3>{{ matches.length }} viaje(s) encontrado(s)</h3>

      <div 
        v-for="match in matches" 
        :key="match.trip.id" 
        class="trip-card"
      >
        <div class="trip-header">
          <div class="driver-info">
            <div class="driver-avatar">
              {{ match.trip.driver_name?.charAt(0) || 'D' }}
            </div>
            <div>
              <h4>{{ match.trip.driver_name || 'Conductor' }}</h4>
              <p class="trip-time">
                {{ formatTime(match.trip.departure_time) }}
              </p>
            </div>
          </div>
          <div class="trip-seats">
            {{ match.trip.available_seats }} plazas
          </div>
        </div>

        <div class="trip-route">
          <div class="route-point">
            <span class="route-icon origin">📍</span>
            <div>
              <strong>Origen:</strong> {{ formatAddress(match.trip.origin) }}
            </div>
          </div>
          <div class="route-line"></div>
          <div class="route-point">
            <span class="route-icon destination">🎯</span>
            <div>
              <strong>Destino:</strong> {{ formatAddress(match.trip.destination) }}
            </div>
          </div>
        </div>

        <!-- Información del match -->
        <div class="match-info">
          <div class="match-detail">
            <span class="match-label">🚶 Recogida:</span>
            <span class="match-value">
              {{ match.pickupDistance.toFixed(2) }} km de tu ubicación
            </span>
          </div>
          <div class="match-detail">
            <span class="match-label">📍 Bajada:</span>
            <span class="match-value">
              {{ match.dropoffDistance.toFixed(2) }} km de tu destino
            </span>
          </div>
          <div class="match-detail">
            <span class="match-label">⭐ Compatibilidad:</span>
            <span :class="getMatchClass(match.matchScore)">
              {{ getMatchLabel(match.matchScore) }}
            </span>
          </div>
        </div>

        <!-- Mapa de la ruta del viaje -->
        <div v-if="match.trip.route_data" class="trip-route-map">
          <RouteMapComplete
            :origin="{ 
              id: 'origin', 
              name: 'Origen', 
              address: formatAddress(match.trip.origin), 
              coordinates: match.trip.origin, 
              type: 'origin' 
            }"
            :destination="{ 
              id: 'destination', 
              name: 'Destino', 
              address: formatAddress(match.trip.destination), 
              coordinates: match.trip.destination, 
              type: 'destination' 
            }"
            :route-data="match.trip.route_data"
            :generated-stops="match.trip.stops || []"
          />
        </div>

        <div class="trip-actions">
          <button 
            @click="requestBooking(match)" 
            class="btn-book"
          >
            Solicitar Plaza
          </button>
          <button 
            @click="viewDetails(match)" 
            class="btn-details"
          >
            Ver Detalles
          </button>
        </div>
      </div>
    </div>

    <!-- Sin resultados -->
    <div v-else-if="searched && matches.length === 0" class="no-results">
      <p>😔 No se encontraron viajes compatibles con tu búsqueda.</p>
      <p class="hint">
        Intenta ampliar tu radio de búsqueda o buscar en fechas cercanas.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { supabase } from '@/config/supabase';
import routeService from '@/services/routeService';
import RouteMapComplete from '@/components/carpooling/RouteMapComplete.vue';
import type { Trip } from '@/types/carpooling';

const pickupLocation = ref('');
const dropoffLocation = ref('');
const searchDate = ref('2024-01-18');
const loading = ref(false);
const searched = ref(false);
const matches = ref<any[]>([]);

/**
 * Geocodifica dirección
 */
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

/**
 * Busca viajes compatibles
 */
async function searchTrips() {
  try {
    loading.value = true;
    searched.value = true;

    console.log('🔍 Buscando viajes con:', {
      pickup: pickupLocation.value,
      dropoff: dropoffLocation.value,
      date: searchDate.value
    });

    // Geocodificar ubicaciones
    const pickupCoords = await geocode(pickupLocation.value + ', Madrid, España');
    const dropoffCoords = await geocode(dropoffLocation.value + ', Madrid, España');

    console.log('📍 Coordenadas obtenidas:', { pickupCoords, dropoffCoords });

    if (!pickupCoords || !dropoffCoords) {
      alert('No se pudieron encontrar las ubicaciones. Verifica las direcciones.');
      return;
    }

    // Buscar viajes activos en la fecha
    const startOfDay = new Date(searchDate.value);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(searchDate.value);
    endOfDay.setHours(23, 59, 59, 999);

    console.log('📅 Buscando viajes entre:', startOfDay.toISOString(), 'y', endOfDay.toISOString());

    const { data: trips, error } = await supabase
      .from('trips')
      .select(`
        *,
        trip_waypoints (*)
      `)
      .eq('status', 'active')
      .gte('departure_time', startOfDay.toISOString())
      .lte('departure_time', endOfDay.toISOString())
      .gt('available_seats', 0);

    if (error) throw error;

    console.log('🚗 Viajes encontrados:', trips?.length || 0, trips);

    // Formatear datos para el matching
    const tripsWithStops = trips?.map(trip => ({
      ...trip,
      driver_name: 'Conductor', // Por ahora hardcoded
      stops: trip.trip_waypoints?.map((wp: any) => ({
        position: { lat: wp.lat, lng: wp.lng },
        stopOrder: wp.order || 0,
        distanceFromOrigin: 0
      })) || []
    })) || [];

    console.log('🚗 Viajes con paradas:', tripsWithStops);

    // Encontrar matches
    matches.value = await routeService.findMatchingTrips(
      pickupCoords,
      dropoffCoords,
      tripsWithStops
    );

    console.log('🎯 Matches encontrados:', matches.value.length, matches.value);

  } catch (error) {
    console.error('❌ Error buscando viajes:', error);
    alert('Error al buscar viajes');
  } finally {
    loading.value = false;
  }
}

/**
 * Solicita una reserva
 */
async function requestBooking(match: any) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert('Necesitas iniciar sesión para solicitar una plaza');
      return;
    }

    const { error } = await supabase
      .from('bookings')
      .insert({
        trip_id: match.trip.id,
        passenger_id: user.id,
        pickup_location: match.pickupStop.position,
        dropoff_location: match.dropoffStop.position,
        status: 'pending',
        match_distance: match.pickupDistance + match.dropoffDistance
      });

    if (error) throw error;

    alert('¡Solicitud enviada! El conductor recibirá una notificación.');
    
  } catch (error) {
    console.error('❌ Error solicitando reserva:', error);
    alert('Error al enviar solicitud');
  }
}

function viewDetails(match: any) {
  console.log('Ver detalles de:', match);
  // Navegar a página de detalles o abrir modal
}

function formatTime(timestamp: string | Date) {
  return new Date(timestamp).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatAddress(coords: { lat: number; lng: number }) {
  // En producción, hacer reverse geocoding
  return `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
}

function getMatchClass(score: number) {
  if (score < 0.5) return 'match-excellent';
  if (score < 1) return 'match-good';
  return 'match-ok';
}

function getMatchLabel(score: number) {
  if (score < 0.5) return 'Excelente';
  if (score < 1) return 'Bueno';
  return 'Aceptable';
}
</script>

<style scoped>
.search-trips {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-search {
  width: 100%;
  padding: 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 30px;
}

.btn-search:hover:not(:disabled) {
  background: #2563eb;
}

.btn-search:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.results h3 {
  margin-bottom: 20px;
  color: #1f2937;
}

.trip-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.trip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.driver-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.driver-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
}

.trip-header h4 {
  margin: 0;
  font-size: 16px;
}

.trip-time {
  margin: 4px 0 0 0;
  color: #6b7280;
  font-size: 14px;
}

.trip-seats {
  background: #dbeafe;
  color: #1e40af;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
}

.trip-route {
  margin: 15px 0;
}

.route-point {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px 0;
}

.route-icon {
  font-size: 16px;
}

.route-line {
  height: 2px;
  background: #e5e7eb;
  margin: 8px 0 8px 26px;
}

.match-info {
  background: #f9fafb;
  padding: 15px;
  border-radius: 6px;
  margin: 15px 0;
}

.match-detail {
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
  font-size: 14px;
}

.match-label {
  font-weight: 600;
}

.match-excellent {
  color: #059669;
  font-weight: 600;
}

.match-good {
  color: #d97706;
  font-weight: 600;
}

.match-ok {
  color: #dc2626;
  font-weight: 600;
}

.trip-route-map {
  margin: 15px 0;
  border-radius: 8px;
  overflow: hidden;
}

.trip-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn-book {
  flex: 1;
  padding: 10px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
}

.btn-book:hover {
  background: #059669;
}

.btn-details {
  flex: 1;
  padding: 10px;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
}

.btn-details:hover {
  background: #4b5563;
}

.no-results {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.hint {
  font-size: 14px;
  margin-top: 10px;
}
</style>
