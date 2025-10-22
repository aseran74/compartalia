<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <img src="/images/logo/Compartalia2.png" alt="Compartalia Logo" class="h-8 w-auto object-contain" />
          </div>
          <div class="flex items-center space-x-4">
            <button 
              @click="$router.push('/login')"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          🚗 Buscar Viajes (Híbrido)
        </h1>
        <p class="text-xl text-gray-600">
          Búsqueda inteligente por texto y geolocalización
        </p>
      </div>

      <!-- Search Form -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <form @submit.prevent="searchTrips" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Origen -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                🚗 Origen
              </label>
              <div class="relative">
                <input
                  v-model="searchForm.origin"
                  @input="onOriginInput"
                  @focus="showOriginSuggestions = true"
                  @blur="hideOriginSuggestions"
                  type="text"
                  placeholder="Ej: Torrejón de Ardoz"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <!-- Sugerencias de origen -->
                <div 
                  v-if="showOriginSuggestions && originSuggestions.length > 0"
                  class="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
                >
                  <div
                    v-for="suggestion in originSuggestions"
                    :key="suggestion.id"
                    @mousedown="selectOriginSuggestion(suggestion)"
                    class="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div class="font-medium">{{ suggestion.name }}</div>
                    <div class="text-sm text-gray-600">{{ suggestion.address }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Destino -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                🎯 Destino
              </label>
              <div class="relative">
                <input
                  v-model="searchForm.destination"
                  @input="onDestinationInput"
                  @focus="showDestinationSuggestions = true"
                  @blur="hideDestinationSuggestions"
                  type="text"
                  placeholder="Ej: Chamartín, Madrid Centro"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <!-- Sugerencias de destino -->
                <div 
                  v-if="showDestinationSuggestions && destinationSuggestions.length > 0"
                  class="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
                >
                  <div
                    v-for="suggestion in destinationSuggestions"
                    :key="suggestion.id"
                    @mousedown="selectDestinationSuggestion(suggestion)"
                    class="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div class="font-medium">{{ suggestion.name }}</div>
                    <div class="text-sm text-gray-600">{{ suggestion.address }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Opciones de búsqueda -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <label class="flex items-center">
                <input
                  v-model="searchOptions.useGeolocation"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">Usar geolocalización</span>
              </label>
              <div class="flex items-center space-x-2">
                <label class="text-sm text-gray-700">Radio:</label>
                <select
                  v-model="searchOptions.maxDistanceKm"
                  class="rounded border-gray-300 text-sm"
                >
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="20">20 km</option>
                </select>
              </div>
            </div>
          </div>

          <div class="flex justify-center">
            <button
              type="submit"
              :disabled="isLoading"
              class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <span v-if="isLoading" class="animate-spin mr-2">⏳</span>
              {{ isLoading ? 'Buscando...' : '🔍 Buscar Viajes' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Results -->
      <div v-if="hasSearched" class="space-y-6">
        <div class="text-center">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            Resultados de la Búsqueda
          </h2>
          <p class="text-gray-600">
            {{ searchResults.length }} viajes encontrados
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-8">
          <div class="animate-spin mx-auto w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <p class="mt-4 text-gray-600">Buscando viajes...</p>
        </div>

        <!-- No Results -->
        <div v-else-if="searchResults.length === 0" class="text-center py-8">
          <div class="text-6xl mb-4">😔</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No se encontraron viajes</h3>
          <p class="text-gray-600">Intenta con otros términos de búsqueda</p>
        </div>

        <!-- Trip Cards -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="result in searchResults" 
            :key="result.trip.id"
            class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ result.trip.origin_name }} → {{ result.trip.destination_name }}
                </h3>
                <p class="text-sm text-gray-600">
                  {{ formatTime(result.trip.departure_time) }}
                </p>
                <!-- Indicador de tipo de coincidencia -->
                <div class="mt-1">
                  <span 
                    class="inline-block px-2 py-1 text-xs rounded-full"
                    :class="getMatchTypeClass(result.matchType)"
                  >
                    {{ getMatchTypeLabel(result.matchType) }}
                  </span>
                  <span v-if="result.distance" class="ml-2 text-xs text-gray-500">
                    {{ result.distance.toFixed(1) }} km
                  </span>
                </div>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-blue-600">
                  {{ result.trip.price_per_seat }}€
                </div>
                <div class="text-sm text-gray-500">por asiento</div>
              </div>
            </div>

            <div class="space-y-2 mb-4">
              <div class="flex items-center text-sm text-gray-600">
                <span class="w-4 h-4 mr-2">👥</span>
                {{ result.trip.available_seats }} asientos disponibles
              </div>
              <div v-if="result.trip.description" class="text-sm text-gray-600">
                {{ result.trip.description }}
              </div>
            </div>

            <div class="flex space-x-2">
              <button 
                @click="viewTripDetails(result.trip)"
                class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm"
              >
                Ver Detalles
              </button>
              <button 
                @click="bookTrip(result.trip)"
                class="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 text-sm"
              >
                Reservar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Debug Info (solo en desarrollo) -->
      <div v-if="debugInfo && hasSearched" class="mt-8 bg-gray-100 rounded-lg p-4">
        <h3 class="font-semibold mb-2">Debug Info:</h3>
        <pre class="text-xs text-gray-600">{{ JSON.stringify(debugInfo, null, 2) }}</pre>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { HybridTripService, type SearchResult } from '@/services/hybridTripService'

// Servicio híbrido
const hybridService = new HybridTripService()

// Estado del formulario
const searchForm = reactive({
  origin: '',
  destination: ''
})

// Opciones de búsqueda
const searchOptions = reactive({
  useGeolocation: true,
  maxDistanceKm: 10
})

// Estado de la búsqueda
const isLoading = ref(false)
const hasSearched = ref(false)
const searchResults = ref<SearchResult[]>([])
const debugInfo = ref<any>(null)

// Sugerencias
const originSuggestions = ref<any[]>([])
const destinationSuggestions = ref<any[]>([])
const showOriginSuggestions = ref(false)
const showDestinationSuggestions = ref(false)

// Función de búsqueda
const searchTrips = async () => {
  if (!searchForm.origin || !searchForm.destination) {
    alert('Por favor, completa todos los campos')
    return
  }

  isLoading.value = true
  hasSearched.value = true

  try {
    console.log('🔍 HybridTripSearch - Iniciando búsqueda híbrida...')
    console.log('Parámetros:', { 
      origin: searchForm.origin, 
      destination: searchForm.destination,
      options: searchOptions
    })
    
    const results = await hybridService.searchTrips(
      searchForm.origin,
      searchForm.destination,
      searchOptions
    )

    searchResults.value = results
    debugInfo.value = {
      searchParams: { 
        origin: searchForm.origin, 
        destination: searchForm.destination,
        options: searchOptions
      },
      resultsCount: results.length,
      timestamp: new Date().toISOString(),
      results: results.slice(0, 3) // Solo los primeros 3 para debug
    }

    console.log(`✅ HybridTripSearch - Búsqueda completada: ${results.length} viajes encontrados`)
  } catch (error) {
    console.error('❌ HybridTripSearch - Error en la búsqueda:', error)
    alert('Error al buscar viajes. Por favor, intenta de nuevo.')
    searchResults.value = []
  } finally {
    isLoading.value = false
  }
}

// Manejo de sugerencias
const onOriginInput = async () => {
  if (searchForm.origin.length < 3) {
    originSuggestions.value = []
    return
  }
  
  try {
    originSuggestions.value = await hybridService.getSuggestions(searchForm.origin, 'origin')
  } catch (error) {
    console.error('Error obteniendo sugerencias de origen:', error)
  }
}

const onDestinationInput = async () => {
  if (searchForm.destination.length < 3) {
    destinationSuggestions.value = []
    return
  }
  
  try {
    destinationSuggestions.value = await hybridService.getSuggestions(searchForm.destination, 'destination')
  } catch (error) {
    console.error('Error obteniendo sugerencias de destino:', error)
  }
}

const selectOriginSuggestion = (suggestion: any) => {
  searchForm.origin = suggestion.name
  showOriginSuggestions.value = false
}

const selectDestinationSuggestion = (suggestion: any) => {
  searchForm.destination = suggestion.name
  showDestinationSuggestions.value = false
}

const hideOriginSuggestions = () => {
  setTimeout(() => {
    showOriginSuggestions.value = false
  }, 200)
}

const hideDestinationSuggestions = () => {
  setTimeout(() => {
    showDestinationSuggestions.value = false
  }, 200)
}

// Funciones auxiliares
const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const getMatchTypeClass = (matchType: string) => {
  switch (matchType) {
    case 'exact_text':
      return 'bg-green-100 text-green-800'
    case 'geolocation':
      return 'bg-blue-100 text-blue-800'
    case 'proximity':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getMatchTypeLabel = (matchType: string) => {
  switch (matchType) {
    case 'exact_text':
      return 'Texto exacto'
    case 'geolocation':
      return 'Geolocalización'
    case 'proximity':
      return 'Proximidad'
    default:
      return 'Otro'
  }
}

const viewTripDetails = (trip: any) => {
  console.log('Ver detalles del viaje:', trip)
  alert(`Detalles del viaje:\n${trip.origin_name} → ${trip.destination_name}\nPrecio: ${trip.price_per_seat}€\nAsientos: ${trip.available_seats}`)
}

const bookTrip = (trip: any) => {
  console.log('Reservar viaje:', trip)
  alert('Función de reserva en desarrollo')
}
</script>
