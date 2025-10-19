<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">🔍 Buscar Viajes</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">📝 Información del Viaje</h2>
      
      <form @submit.prevent="searchTrips" class="space-y-6">
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

        <!-- Filtros adicionales -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          <!-- Rango de precios -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">💰 Rango de precios (€)</label>
            <div class="space-y-3">
              <div class="flex items-center space-x-4">
                <span class="text-sm font-medium text-blue-600">{{ priceRange[0] }}€</span>
                <span class="text-sm text-gray-600">-</span>
                <span class="text-sm font-medium text-blue-600">{{ priceRange[1] }}€</span>
              </div>
              
              <!-- Range Slider personalizado -->
              <div class="relative">
                <div class="w-full h-2 bg-gray-200 rounded-lg relative">
                  <!-- Rango seleccionado -->
                  <div 
                    class="absolute h-2 bg-blue-500 rounded-lg"
                    :style="{
                      left: (priceRange[0] / 100) * 100 + '%',
                      width: ((priceRange[1] - priceRange[0]) / 100) * 100 + '%'
                    }"
                  ></div>
                  
                  <!-- Thumb mínimo -->
                  <input
                    v-model.number="priceRange[0]"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    class="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
                    :class="{ 'z-10': priceRange[0] === priceRange[1] }"
                  />
                  
                  <!-- Thumb máximo -->
                  <input
                    v-model.number="priceRange[1]"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    class="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
                  />
                </div>
              </div>
              
              <div class="flex justify-between text-xs text-gray-500">
                <span>0€</span>
                <span>100€</span>
              </div>
            </div>
          </div>
        </div>
        
        <button @click="searchTrips" :disabled="loading" class="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
          {{ loading ? 'Buscando...' : '🔍 Buscar Viajes' }}
        </button>
      </form>
    </div>

    <!-- Resultados -->
    <div v-if="searchResults.length > 0" class="search-results">
      <h3 class="text-xl font-semibold mb-4">🚗 Viajes Encontrados ({{ searchResults.length }})</h3>
      
      <div class="grid gap-4">
        <div 
          v-for="result in searchResults" 
          :key="result.trip.id"
          class="bg-white rounded-lg shadow-md p-4 border border-gray-200"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <span class="text-lg font-semibold">{{ result.trip.origin_name }}</span>
                <span class="text-gray-400">→</span>
                <span class="text-lg font-semibold">{{ result.trip.destination_name }}</span>
              </div>
              <div class="text-sm text-gray-600 mb-2">
                <span class="font-medium">{{ result.matchTypeLabel }}</span>
                <span class="ml-2">• {{ result.matchDistance.toFixed(2) }} km</span>
              </div>
              <div class="text-sm text-gray-600">
                <span>👤 {{ result.trip.driver_name || 'Conductor' }}</span>
                <span class="ml-4">🕐 {{ result.trip.departure_time || 'N/A' }}</span>
                <span class="ml-4">💺 {{ result.trip.available_seats || 'N/A' }} asientos</span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-green-600">€{{ result.trip.price_per_seat }}</div>
              <button class="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Reservar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sin resultados -->
    <div v-else-if="hasSearched && searchResults.length === 0" class="text-center py-12">
      <div class="text-6xl mb-4">😔</div>
      <h3 class="text-xl font-semibold mb-2">No se encontraron viajes</h3>
      <p class="text-gray-600 mb-4">
        Intenta ampliar el radio de búsqueda o busca en una zona diferente.
      </p>
      <div class="text-sm text-gray-500">
        💡 Sugerencias:<br>
        • Aumenta el radio de búsqueda<br>
        • Verifica que la dirección esté bien escrita<br>
        • Busca en horarios con más tráfico (mañanas y tardes)
      </div>
    </div>

    <!-- Logs de debug -->
    <div v-if="logs.length > 0" class="mt-6 bg-gray-100 rounded-lg p-4">
      <h4 class="font-semibold mb-2">📝 Logs de Debug</h4>
      <div class="text-sm font-mono space-y-1">
        <div v-for="(log, index) in logs" :key="index" class="text-gray-700">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
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
const priceRange = ref([0, 100]);

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
  { name: 'Collado Villalba, Madrid', population: '64,000', lat: 40.6447, lng: -4.0075 },
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
    addLog(`💰 Rango de precios: ${priceRange.value[0]}€ - ${priceRange.value[1]}€`);
    
    const results = await TripMatchingService.searchTrips(
      userAddress.value,
      destinationAddress.value || undefined,
      searchRadius.value
    );
    
    // Filtrar por rango de precios
    const filteredResults = results.filter(result => {
      const price = result.trip.price_per_seat;
      return price >= priceRange.value[0] && price <= priceRange.value[1];
    });
    
    searchResults.value = filteredResults;
    
    if (filteredResults.length > 0) {
      addLog(`✅ Encontrados ${filteredResults.length} viajes compatibles`);
      filteredResults.forEach((result, idx) => {
        addLog(`🚗 Viaje ${idx + 1}: ${result.matchType} a ${result.matchDistance.toFixed(2)} km`);
      });
    } else {
      addLog('❌ No se encontraron viajes compatibles en el rango de precios seleccionado');
    }
    
  } catch (error) {
    addLog(`❌ Error en la búsqueda: ${error}`);
  } finally {
    loading.value = false;
  }
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

// Función para asegurar que el rango sea válido
function validatePriceRange() {
  if (priceRange.value[0] > priceRange.value[1]) {
    priceRange.value[0] = priceRange.value[1]
  }
  if (priceRange.value[1] < priceRange.value[0]) {
    priceRange.value[1] = priceRange.value[0]
  }
}

// Watchers para validar el rango
watch(priceRange, () => {
  validatePriceRange()
}, { deep: true })

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
.slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
  outline: none;
}

.slider-thumb::-webkit-slider-track {
  background: transparent;
  height: 8px;
}

.slider-thumb::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  background: #3b82f6;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.slider-thumb::-webkit-slider-thumb:hover {
  background: #2563eb;
  transform: scale(1.1);
}

.slider-thumb::-moz-range-track {
  background: transparent;
  height: 8px;
  border: none;
}

.slider-thumb::-moz-range-thumb {
  background: #3b82f6;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.slider-thumb::-moz-range-thumb:hover {
  background: #2563eb;
  transform: scale(1.1);
}

/* Asegurar que los thumbs no se superpongan */
.slider-thumb:first-of-type {
  z-index: 2;
}

.slider-thumb:last-of-type {
  z-index: 1;
}
</style>
