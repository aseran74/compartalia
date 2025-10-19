<template>
  <div class="trip-search">
    <h2>🔍 Buscar Viajes Compartidos</h2>
    
    <div class="search-form">
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">📝 Información del Viaje</h2>
        
        <div class="space-y-6">
          <!-- Origen -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">📍 Origen</label>
            
            <!-- Opciones predefinidas -->
            <div class="mb-3">
              <p class="text-sm text-gray-600 mb-2">Ciudades del extrarradio de Madrid:</p>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  v-for="city in madridCities.slice(0, 16)"
                  :key="city.name"
                  @click="selectPredefinedOrigin(city)"
                  type="button"
                  class="px-3 py-2 text-sm bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {{ city.name.split(',')[0] }}
                </button>
              </div>
            </div>
            
            <!-- Búsqueda personalizada -->
            <div class="relative">
              <input
                v-model="userAddress"
                @input="searchOriginPlaces"
                @focus="showOriginSuggestions = true"
                @blur="hideOriginSuggestions"
                type="text"
                placeholder="O busca otra ciudad..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <!-- Sugerencias de origen -->
              <div v-if="showOriginSuggestions && originSuggestions.length > 0" class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <div
                  v-for="(suggestion, index) in originSuggestions"
                  :key="index"
                  @click="selectOriginPlace(suggestion)"
                  class="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div class="font-medium text-gray-900">{{ suggestion.main_text }}</div>
                  <div class="text-sm text-gray-600">{{ suggestion.secondary_text }}</div>
                </div>
              </div>
            </div>
            
            <!-- Ubicación exacta del origen -->
            <div class="mt-3">
              <label class="block text-sm font-medium text-gray-700 mb-2">📍 Ubicación exacta del origen</label>
              <input
                v-model="originExactLocation"
                type="text"
                placeholder="Ej: Estación de tren, centro comercial, parada de autobús..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Destino -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">🎯 Destino</label>
            
            <!-- Opciones predefinidas -->
            <div class="mb-3">
              <p class="text-sm text-gray-600 mb-2">Destinos populares en Madrid:</p>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                <button
                  v-for="destination in popularDestinations"
                  :key="destination.name"
                  @click="selectPredefinedDestination(destination)"
                  type="button"
                  class="px-3 py-2 text-sm bg-green-50 border border-green-200 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {{ destination.name }}
                </button>
              </div>
            </div>
            
            <!-- Búsqueda personalizada -->
            <div class="relative">
              <input
                v-model="destinationAddress"
                @input="searchDestinationPlaces"
                @focus="showDestinationSuggestions = true"
                @blur="hideDestinationSuggestions"
                type="text"
                placeholder="O busca otro destino específico..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <!-- Sugerencias de destino -->
              <div v-if="showDestinationSuggestions && destinationSuggestions.length > 0" class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <div
                  v-for="(suggestion, index) in destinationSuggestions"
                  :key="index"
                  @click="selectDestinationPlace(suggestion)"
                  class="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div class="font-medium text-gray-900">{{ suggestion.main_text }}</div>
                  <div class="text-sm text-gray-600">{{ suggestion.secondary_text }}</div>
                </div>
              </div>
            </div>
            
            <!-- Ubicación exacta del destino -->
            <div class="mt-3">
              <label class="block text-sm font-medium text-gray-700 mb-2">🎯 Ubicación exacta del destino</label>
              <input
                v-model="destinationExactLocation"
                type="text"
                placeholder="Ej: Oficina, universidad, hospital, estación de metro..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Número de plazas -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">👥 Número de plazas</label>
            <input
              v-model.number="numberOfSeats"
              type="number"
              min="1"
              max="8"
              placeholder="Ej: 2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Radio de búsqueda -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">📏 Radio de búsqueda (km)</label>
            <input 
              v-model.number="searchRadius" 
              type="number" 
              min="0.5" 
              max="5" 
              step="0.5"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <button @click="searchTrips" :disabled="loading" class="btn-search">
          {{ loading ? 'Buscando...' : '🔍 Buscar Viajes' }}
        </button>
      </div>
    </div>

    <!-- Resultados -->
    <div v-if="searchResults.length > 0" class="search-results">
      <h3>🚗 Viajes Encontrados ({{ searchResults.length }})</h3>
      
      <div class="results-grid">
        <div 
          v-for="result in searchResults" 
          :key="result.trip.id"
          class="trip-card"
        >
          <div class="trip-header">
            <div class="route-info">
              <div class="route-points">
                <span class="origin">📍 {{ result.trip.origin_name }}</span>
                <span class="arrow">→</span>
                <span class="destination">🎯 {{ result.trip.destination_name }}</span>
              </div>
        <div class="route-stats">
          <span class="distance">{{ result.trip.route_distance || 'N/A' }} km</span>
          <span class="duration">{{ result.trip.route_duration || 'N/A' }} min</span>
          <span class="price">€{{ result.trip.price_per_seat }}</span>
        </div>
            </div>
          </div>

          <div class="match-info">
            <div class="match-badge" :class="getMatchTypeClass(result.matchType)">
              {{ getMatchTypeLabel(result.matchType) }}
            </div>
            <div class="pickup-info">
              <strong>Punto de recogida:</strong> {{ result.pickupPoint.name }}
            </div>
            <div v-if="result.matchType === 'stop'" class="stop-details">
              <small>📍 {{ result.trip.stops?.find(s => s.id === result.matchingStop.id)?.name || 'Parada intermedia' }}</small>
            </div>
            <div class="distance-info">
              <strong>Distancia desde ti:</strong> {{ result.matchDistance.toFixed(2) }} km
            </div>
          </div>

          <div class="trip-details">
            <div class="driver-info">
              <span class="driver-name">👤 {{ result.trip.driver_name || 'Conductor' }}</span>
              <span class="driver-rating">⭐ {{ result.trip.driver_rating || '5.0' }}</span>
            </div>
            <div class="trip-meta">
              <span class="departure">🕐 Salida: {{ result.trip.departure_time || 'N/A' }}</span>
              <span class="seats">💺 {{ result.trip.available_seats || 'N/A' }} asientos libres</span>
            </div>
          </div>

          <div class="trip-actions">
            <button class="btn-reserve">Reservar</button>
            <button class="btn-details" @click="showTripDetails(result)">Ver Detalles</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Sin resultados -->
    <div v-else-if="hasSearched && !loading" class="no-results">
      <div class="no-results-content">
        <h3>😔 No se encontraron viajes</h3>
        <p>Intenta ampliar el radio de búsqueda o busca en una zona diferente.</p>
        <div class="suggestions">
          <h4>💡 Sugerencias:</h4>
          <ul>
            <li>Aumenta el radio de búsqueda</li>
            <li>Verifica que la dirección esté bien escrita</li>
            <li>Busca en horarios con más tráfico (mañanas y tardes)</li>
          </ul>
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
import { ref, onMounted } from 'vue';
import TripMatchingService, { type SearchResult } from '@/services/tripMatchingService';

// Declaraciones de tipos para Google Maps
interface GooglePlace {
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
  place_id: string;
}

interface GooglePlacesService {
  textSearch: (request: GooglePlacesRequest, callback: (results: GooglePlace[], status: string) => void) => void;
}

interface GooglePlacesRequest {
  query: string;
  fields: string[];
  locationBias: { lat: number; lng: number };
  radius: number;
}

interface GoogleMaps {
  maps: {
    places: {
      PlacesService: new (element: HTMLElement) => GooglePlacesService;
      PlacesServiceStatus: {
        OK: string;
      };
    };
  };
}

declare global {
  interface Window {
    google: GoogleMaps;
  }
}

// Interfaces para los tipos
interface PlaceSuggestion {
  main_text: string;
  secondary_text: string;
  place_id: string;
  lat: number;
  lng: number;
}

interface City {
  name: string;
  population: string;
  lat: number;
  lng: number;
}

interface Destination {
  name: string;
  lat: number;
  lng: number;
}

// Estado del formulario
const userAddress = ref('C. de las Adelfas, 38, Madrid');
const destinationAddress = ref('');
const searchRadius = ref(1);
const loading = ref(false);
const hasSearched = ref(false);

// Nuevas variables para la funcionalidad mejorada
const originExactLocation = ref('');
const destinationExactLocation = ref('');
const numberOfSeats = ref(1);

// Google Places API
const originSuggestions = ref<PlaceSuggestion[]>([]);
const destinationSuggestions = ref<PlaceSuggestion[]>([]);
const showOriginSuggestions = ref(false);
const showDestinationSuggestions = ref(false);
const googlePlacesService = ref<GooglePlacesService | null>(null);

// Ciudades del extrarradio de Madrid con población
const madridCities = [
  { name: 'Móstoles, Madrid', population: '210,000', lat: 40.3222, lng: -3.8647 },
  { name: 'Alcalá de Henares, Madrid', population: '195,000', lat: 40.4817, lng: -3.3643 },
  { name: 'Fuenlabrada, Madrid', population: '193,000', lat: 40.2842, lng: -3.7942 },
  { name: 'Leganés, Madrid', population: '190,000', lat: 40.3277, lng: -3.7656 },
  { name: 'Getafe, Madrid', population: '185,000', lat: 40.3071, lng: -3.7332 },
  { name: 'Alcorcón, Madrid', population: '170,000', lat: 40.3478, lng: -3.8244 },
  { name: 'Torrejón de Ardoz, Madrid', population: '132,000', lat: 40.4594, lng: -3.4697 },
  { name: 'Parla, Madrid', population: '130,000', lat: 40.2361, lng: -3.7675 },
  { name: 'Alcobendas, Madrid', population: '118,000', lat: 40.5474, lng: -3.6420 },
  { name: 'Las Rozas de Madrid, Madrid', population: '96,000', lat: 40.4929, lng: -3.8739 },
  { name: 'San Sebastián de los Reyes, Madrid', population: '90,000', lat: 40.5474, lng: -3.6256 },
  { name: 'Pozuelo de Alarcón, Madrid', population: '88,000', lat: 40.4329, lng: -3.8146 },
  { name: 'Coslada, Madrid', population: '83,000', lat: 40.4238, lng: -3.5613 },
  { name: 'Valdemoro, Madrid', population: '77,000', lat: 40.1908, lng: -3.6758 },
  { name: 'Rivas-Vaciamadrid, Madrid', population: '88,000', lat: 40.3333, lng: -3.5333 },
  { name: 'Majadahonda, Madrid', population: '72,000', lat: 40.4738, lng: -3.8725 },
  { name: 'Collado Villalba, Madrid', population: '64rine', lat: 40.6447, lng: -4.0075 },
  { name: 'Arganda del Rey, Madrid', population: '57,000', lat: 40.3000, lng: -3.4333 },
  { name: 'Pinto, Madrid', population: '52,000', lat: 40.2417, lng: -3.7000 },
  { name: 'Villaviciosa de Odón, Madrid', population: '48,000', lat: 40.3578, lng: -3.9000 },
  { name: 'Boadilla del Monte, Madrid', population: '46,000', lat: 40.4089, lng: -3.8750 },
  { name: 'San Fernando de Henares, Madrid', population: '43,000', lat: 40.4239, lng: -3.5333 },
  { name: 'Mejorada del Campo, Madrid', population: '39,000', lat: 40.3833, lng: -3.4833 },
  { name: 'Villanueva de la Cañada, Madrid', population: '36,000', lat: 40.4333, lng: -4.0000 },
  { name: 'Ciempozuelos, Madrid', population: '33,000', lat: 40.1589, lng: -3.6167 },
  { name: 'Navalcarnero, Madrid', population: '30,000', lat: 40.2833, lng: -4.0167 },
  { name: 'Colmenar Viejo, Madrid', population: '28,000', lat: 40.6500, lng: -3.7667 },
  { name: 'Humanes de Madrid, Madrid', population: '25,000', lat: 40.2500, lng: -3.8167 },
  { name: 'Velilla de San Antonio, Madrid', population: '22,000', lat: 40.3667, lng: -3.4833 },
  { name: 'Galapagar, Madrid', population: '20,000', lat: 40.5833, lng: -4.0000 },
  { name: 'Moralzarzal, Madrid', population: '18,000', lat: 40.6833, lng: -3.9667 },
  { name: 'Villanueva del Pardillo, Madrid', population: '15,000', lat: 40.4333, lng: -3.9667 },
  { name: 'Villalbilla, Madrid', population: '12,000', lat: 40.4333, lng: -3.3167 },
  { name: 'Villanueva de la Torre, Madrid', population: '10,000', lat: 40.5833, lng: -3.3333 }
];

// Destinos populares en Madrid
const popularDestinations = [
  { name: 'Puerta del Sol', lat: 40.4168, lng: -3.7038 },
  { name: 'Gran Vía', lat: 40.4192, lng: -3.7075 },
  { name: 'Chamartín', lat: 40.4740, lng: -3.6827 },
  { name: 'Atocha', lat: 40.4078, lng: -3.6893 },
  { name: 'Nuevos Ministerios', lat: 40.4460, lng: -3.6910 },
  { name: 'Plaza de Castilla', lat: 40.4663, lng: -3.6896 },
  { name: 'Moncloa', lat: 40.4350, lng: -3.7200 },
  { name: 'Plaza de España', lat: 40.4239, lng: -3.7146 },
  { name: 'AZCA', lat: 40.4460, lng: -3.6910 },
  { name: 'Cuatro Torres', lat: 40.4770, lng: -3.6900 },
  { name: 'Universidad Complutense', lat: 40.4495, lng: -3.7292 },
  { name: 'Hospital La Paz', lat: 40.4790, lng: -3.6900 }
];

// Resultados
const searchResults = ref<SearchResult[]>([]);
const logs = ref<string[]>([]);

// Funciones de utilidad
function addLog(message: string) {
  const timestamp = new Date().toLocaleTimeString();
  logs.value.push(`[${timestamp}] ${message}`);
  console.log(message);
}

async function searchTrips() {
  if (!userAddress.value.trim()) {
    addLog('❌ Por favor, introduce una dirección de origen');
    return;
  }

  loading.value = true;
  hasSearched.value = true;
  logs.value = [];
  
  try {
    addLog('🔍 Iniciando búsqueda de viajes...');
    addLog(`📍 Dirección: ${userAddress.value}`);
    addLog(`📏 Radio: ${searchRadius.value} km`);
    
    const results = await TripMatchingService.searchTrips(
      userAddress.value,
      destinationAddress.value || undefined,
      searchRadius.value
    );
    
    searchResults.value = results;
    
    if (results.length > 0) {
      addLog(`✅ Encontrados ${results.length} viajes compatibles`);
      results.forEach((result, idx) => {
        addLog(`🚗 Viaje ${idx + 1}: ${result.matchType} a ${result.matchDistance.toFixed(2)} km`);
      });
    } else {
      addLog('❌ No se encontraron viajes compatibles');
    }
    
  } catch (error) {
    addLog(`❌ Error en la búsqueda: ${error}`);
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

function showTripDetails(result: SearchResult) {
  addLog(`📋 Mostrando detalles del viaje: ${result.trip.id}`);
  // Aquí se podría abrir un modal o navegar a una página de detalles
}

// Google Places API functions
function initializeGooglePlaces() {
  if (window.google && window.google.maps && window.google.maps.places) {
    googlePlacesService.value = new window.google.maps.places.PlacesService(document.createElement('div'))
    addLog('🗺️ Google Places API inicializada')
  } else {
    addLog('⚠️ Google Places API no disponible')
  }
}

function searchOriginPlaces() {
  if (!googlePlacesService.value) {
    initializeGooglePlaces()
    return
  }

  const request = {
    query: userAddress.value,
    fields: ['name', 'formatted_address', 'geometry', 'place_id'],
    locationBias: { lat: 40.4168, lng: -3.7038 }, // Madrid center
    radius: 50000 // 50km radius
  }

  googlePlacesService.value.textSearch(request, (results: GooglePlace[], status: string) => {
    if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
      originSuggestions.value = results.map(place => ({
        main_text: place.name,
        secondary_text: place.formatted_address,
        place_id: place.place_id,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      }))
    } else {
      originSuggestions.value = []
    }
  })
}

function searchDestinationPlaces() {
  if (!googlePlacesService.value) {
    initializeGooglePlaces()
    return
  }

  const request = {
    query: destinationAddress.value,
    fields: ['name', 'formatted_address', 'geometry', 'place_id'],
    locationBias: { lat: 40.4168, lng: -3.7038 }, // Madrid center
    radius: 30000 // 30km radius
  }

  googlePlacesService.value.textSearch(request, (results: GooglePlace[], status: string) => {
    if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
      destinationSuggestions.value = results.map(place => ({
        main_text: place.name,
        secondary_text: place.formatted_address,
        place_id: place.place_id,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      }))
    } else {
      destinationSuggestions.value = []
    }
  })
}

function selectOriginPlace(suggestion: PlaceSuggestion) {
  userAddress.value = suggestion.main_text
  showOriginSuggestions.value = false
  originSuggestions.value = []
  addLog(`📍 Origen seleccionado: ${suggestion.main_text}`)
}

function selectDestinationPlace(suggestion: PlaceSuggestion) {
  destinationAddress.value = suggestion.main_text
  showDestinationSuggestions.value = false
  destinationSuggestions.value = []
  addLog(`🎯 Destino seleccionado: ${suggestion.main_text}`)
}

function hideOriginSuggestions() {
  setTimeout(() => {
    showOriginSuggestions.value = false
  }, 200)
}

function hideDestinationSuggestions() {
  setTimeout(() => {
    showDestinationSuggestions.value = false
  }, 200)
}

// Funciones para seleccionar opciones predefinidas
function selectPredefinedOrigin(city: City) {
  userAddress.value = city.name
  addLog(`📍 Origen predefinido seleccionado: ${city.name} (${city.population} hab.)`)
}

function selectPredefinedDestination(destination: Destination) {
  destinationAddress.value = destination.name
  addLog(`🎯 Destino predefinido seleccionado: ${destination.name}`)
}

// Inicializar Google Places API cuando el componente se monte
onMounted(() => {
  // Esperar a que Google Maps esté cargado
  const checkGoogleMaps = () => {
    if (window.google && window.google.maps && window.google.maps.places) {
      initializeGooglePlaces()
    } else {
      setTimeout(checkGoogleMaps, 100)
    }
  }
  checkGoogleMaps()
})
</script>

<style scoped>
.trip-search {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.search-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 2fr 2fr auto;
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
  color: #374151;
}

.form-group input {
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.btn-search {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 16px;
}

.btn-search:hover:not(:disabled) {
  background: #2563eb;
}

.btn-search:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.search-results {
  margin-bottom: 20px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.trip-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.trip-header {
  margin-bottom: 15px;
}

.route-points {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.origin, .destination {
  font-weight: 600;
  color: #374151;
}

.arrow {
  color: #6b7280;
  font-weight: bold;
}

.route-stats {
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: #6b7280;
}

.route-stats span {
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
}

.match-info {
  background: #f8fafc;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
}

.match-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
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

.pickup-info, .distance-info {
  font-size: 14px;
  margin-bottom: 4px;
}

.stop-details {
  margin-bottom: 4px;
}

.stop-details small {
  color: #6b7280;
  font-style: italic;
}

.trip-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 14px;
}

.driver-info, .trip-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.driver-rating {
  color: #f59e0b;
}

.trip-actions {
  display: flex;
  gap: 10px;
}

.btn-reserve {
  background: #10b981;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  flex: 1;
}

.btn-reserve:hover {
  background: #059669;
}

.btn-details {
  background: #6b7280;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-details:hover {
  background: #4b5563;
}

.no-results {
  background: white;
  padding: 40px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.suggestions {
  text-align: left;
  margin-top: 20px;
}

.suggestions ul {
  list-style: none;
  padding: 0;
}

.suggestions li {
  padding: 5px 0;
  color: #6b7280;
}

.debug-logs {
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
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .route-points {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .trip-details {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
