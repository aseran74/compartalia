<template>
  <div class="create-trip">
    <h2>Crear Nuevo Viaje</h2>
    
    <form @submit.prevent="createTrip">
      <!-- Origen -->
      <div class="form-group">
        <label>Origen</label>
        <input 
          v-model="origin" 
          type="text" 
          placeholder="Ej: Chamartín, Madrid"
          @blur="geocodeOrigin"
        />
      </div>

      <!-- Destino -->
      <div class="form-group">
        <label>Destino</label>
        <input 
          v-model="destination" 
          type="text" 
          placeholder="Ej: Getafe, Madrid"
          @blur="geocodeDestination"
        />
      </div>

      <!-- Fecha y hora -->
      <div class="form-group">
        <label>Fecha y hora de salida</label>
        <input v-model="departureTime" type="datetime-local" />
      </div>

      <!-- Plazas disponibles -->
      <div class="form-group">
        <label>Plazas disponibles</label>
        <input v-model.number="availableSeats" type="number" min="1" max="7" />
      </div>

      <!-- Vista previa de la ruta -->
      <div v-if="routePreview" class="route-preview">
        <h3>Vista previa de la ruta</h3>
        <p><strong>Distancia:</strong> {{ routePreview.distance.toFixed(2) }} km</p>
        <p><strong>Duración estimada:</strong> {{ Math.round(routePreview.duration) }} min</p>
        <p><strong>Paradas generadas:</strong> {{ routePreview.stops.length }}</p>
        
        <div class="stops-list">
          <div v-for="(stop, idx) in routePreview.stops" :key="idx" class="stop-item">
            <span class="stop-number">{{ idx + 1 }}</span>
            <span class="stop-distance">{{ stop.distanceFromOrigin.toFixed(1) }} km</span>
          </div>
        </div>

        <!-- Mapa (simplificado) -->
        <div ref="mapContainer" class="map-container">
          <div class="map-placeholder">
            🗺️ Mapa de la ruta
            <div class="route-info">
              <p>Origen: {{ originCoords ? `${originCoords.lat.toFixed(4)}, ${originCoords.lng.toFixed(4)}` : 'No geocodificado' }}</p>
              <p>Destino: {{ destinationCoords ? `${destinationCoords.lat.toFixed(4)}, ${destinationCoords.lng.toFixed(4)}` : 'No geocodificado' }}</p>
            </div>
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        :disabled="loading || !routePreview"
        class="btn-primary"
      >
        {{ loading ? 'Creando...' : 'Crear Viaje' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { supabase } from '@/config/supabase';
import routeService from '@/services/routeService';

const origin = ref('');
const destination = ref('');
const departureTime = ref('');
const availableSeats = ref(3);
const loading = ref(false);
const routePreview = ref<any>(null);

const originCoords = ref<{ lat: number; lng: number } | null>(null);
const destinationCoords = ref<{ lat: number; lng: number } | null>(null);

/**
 * Geocodifica dirección a coordenadas
 * Usa Nominatim (OSM) como fallback
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

async function geocodeOrigin() {
  if (origin.value) {
    console.log('📍 Geocodificando origen:', origin.value);
    originCoords.value = await geocode(origin.value + ', Madrid, España');
    console.log('📍 Origen geocodificado:', originCoords.value);
    await calculateRoute();
  }
}

async function geocodeDestination() {
  if (destination.value) {
    console.log('🎯 Geocodificando destino:', destination.value);
    destinationCoords.value = await geocode(destination.value + ', Madrid, España');
    console.log('🎯 Destino geocodificado:', destinationCoords.value);
    await calculateRoute();
  }
}

/**
 * Calcula la ruta y genera paradas automáticas
 */
async function calculateRoute() {
  if (!originCoords.value || !destinationCoords.value) return;

  try {
    loading.value = true;
    console.log('🛣️ Calculando ruta...');
    
    // Obtener ruta
    const route = await routeService.getRoute(
      originCoords.value,
      destinationCoords.value
    );

    console.log('🛣️ Ruta calculada:', route);

    // Generar paradas cada 3 km
    const stops = routeService.generateStops(route.coordinates, 3);

    console.log('🛑 Paradas generadas:', stops);

    routePreview.value = {
      distance: route.distance,
      duration: route.duration,
      geometry: route.geometry,
      coordinates: route.coordinates,
      stops
    };

    console.log('✅ Vista previa de ruta creada:', routePreview.value);
    
  } catch (error) {
    console.error('❌ Error calculando ruta:', error);
    alert('Error al calcular la ruta. Verifica las direcciones.');
  } finally {
    loading.value = false;
  }
}

/**
 * Crea el viaje en Supabase
 */
async function createTrip() {
  if (!routePreview.value) {
    alert('Por favor calcula la ruta primero');
    return;
  }

  try {
    loading.value = true;

    // Obtener usuario actual (simulado por ahora)
    const userId = 'user-123'; // En producción: await supabase.auth.getUser()

    console.log('💾 Creando viaje en Supabase...');

    // Crear viaje
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert({
        driver_id: userId,
        origin: originCoords.value,
        destination: destinationCoords.value,
        departure_time: departureTime.value,
        available_seats: availableSeats.value,
        route_polyline: routePreview.value.geometry,
        total_distance: routePreview.value.distance,
        status: 'active',
        trip_type: 'recurrente',
        pricing_model: 'per_trip',
        price_per_seat: 5.0,
        description: `Viaje de ${origin.value} a ${destination.value}`
      })
      .select()
      .single();

    if (tripError) throw tripError;

    console.log('✅ Viaje creado:', trip);

    // Crear paradas
    const stopsData = routePreview.value.stops.map((stop: any) => ({
      trip_id: trip.id,
      lat: stop.position.lat,
      lng: stop.position.lng,
      order: stop.stopOrder,
      distance_from_origin: stop.distanceFromOrigin
    }));

    console.log('🛑 Insertando paradas:', stopsData);

    const { error: stopsError } = await supabase
      .from('trip_waypoints')
      .insert(stopsData);

    if (stopsError) throw stopsError;

    console.log('✅ Paradas creadas exitosamente');

    alert('¡Viaje creado con éxito!');
    
    // Resetear formulario
    resetForm();
    
  } catch (error) {
    console.error('❌ Error creando viaje:', error);
    alert('Error al crear el viaje: ' + (error as Error).message);
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  origin.value = '';
  destination.value = '';
  departureTime.value = '';
  availableSeats.value = 3;
  routePreview.value = null;
  originCoords.value = null;
  destinationCoords.value = null;
}
</script>

<style scoped>
.create-trip {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
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
  font-size: 14px;
}

.route-preview {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.stops-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.stop-item {
  background: white;
  padding: 8px 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
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

.map-container {
  height: 300px;
  background: #e5e7eb;
  border-radius: 4px;
  margin-top: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-placeholder {
  text-align: center;
  color: #6b7280;
}

.route-info {
  margin-top: 10px;
  font-size: 12px;
}

.route-info p {
  margin: 5px 0;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
</style>
