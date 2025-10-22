<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">
        🧪 Test Hybrid Component
      </h1>

      <!-- Test Form -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4">Formulario de Prueba</h2>
        <form @submit.prevent="testSearch" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Origen
              </label>
              <input
                v-model="searchForm.origin"
                type="text"
                placeholder="Ej: Torrejón de Ardoz"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Destino
              </label>
              <input
                v-model="searchForm.destination"
                type="text"
                placeholder="Ej: Chamartín"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          
          <div class="flex justify-center">
            <button
              type="submit"
              :disabled="isLoading"
              class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {{ isLoading ? 'Probando...' : 'Probar Búsqueda' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Test Results -->
      <div v-if="hasTested" class="space-y-6">
        <div class="text-center">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            Resultados de la Prueba
          </h2>
          <p class="text-gray-600">
            {{ results.length }} viajes encontrados
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-8">
          <div class="animate-spin mx-auto w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <p class="mt-4 text-gray-600">Probando búsqueda...</p>
        </div>

        <!-- No Results -->
        <div v-else-if="results.length === 0" class="text-center py-8">
          <div class="text-6xl mb-4">😔</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No se encontraron viajes</h3>
          <p class="text-gray-600">Intenta con otros términos de búsqueda</p>
        </div>

        <!-- Results -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="result in results" 
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
          </div>
        </div>
      </div>

      <!-- Debug Info -->
      <div v-if="debugInfo" class="mt-8 bg-gray-100 rounded-lg p-6">
        <h3 class="text-lg font-semibold mb-4">Debug Info:</h3>
        <pre class="text-sm text-gray-700 whitespace-pre-wrap">{{ JSON.stringify(debugInfo, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { SimpleHybridService, type SearchResult } from '@/services/simpleHybridService'

// Servicio híbrido simplificado
const hybridService = new SimpleHybridService()

// Estado del formulario
const searchForm = reactive({
  origin: '',
  destination: ''
})

// Estado de la prueba
const isLoading = ref(false)
const hasTested = ref(false)
const results = ref<SearchResult[]>([])
const debugInfo = ref<any>(null)

// Función de prueba
const testSearch = async () => {
  if (!searchForm.origin || !searchForm.destination) {
    alert('Por favor, completa todos los campos')
    return
  }

  isLoading.value = true
  hasTested.value = true

  try {
    console.log('🔍 TestHybrid - Iniciando prueba...')
    console.log('Parámetros:', { 
      origin: searchForm.origin, 
      destination: searchForm.destination
    })
    
    const searchResults = await hybridService.searchTrips(
      searchForm.origin,
      searchForm.destination,
      {
        useGeolocation: true,
        maxDistanceKm: 10,
        limit: 50
      }
    )

    results.value = searchResults
    debugInfo.value = {
      searchParams: { 
        origin: searchForm.origin, 
        destination: searchForm.destination
      },
      resultsCount: searchResults.length,
      timestamp: new Date().toISOString(),
      results: searchResults.slice(0, 3) // Solo los primeros 3 para debug
    }

    console.log(`✅ TestHybrid - Prueba completada: ${searchResults.length} viajes encontrados`)
  } catch (error) {
    console.error('❌ TestHybrid - Error en la prueba:', error)
    alert('Error al probar búsqueda. Por favor, revisa la consola.')
    results.value = []
    debugInfo.value = {
      error: error,
      timestamp: new Date().toISOString()
    }
  } finally {
    isLoading.value = false
  }
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
</script>
