<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">
        🧪 Prueba de SearchTrips con Cliente Limpio
      </h1>

      <!-- Formulario de Prueba -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4">Formulario de Búsqueda</h2>
        <form @submit.prevent="searchTrips" class="space-y-4">
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
              {{ isLoading ? 'Buscando...' : 'Buscar Viajes' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Resultados -->
      <div v-if="hasSearched" class="space-y-6">
        <div class="text-center">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            Resultados de la Búsqueda
          </h2>
          <p class="text-gray-600">
            {{ trips.length }} viajes encontrados
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-8">
          <div class="animate-spin mx-auto w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <p class="mt-4 text-gray-600">Buscando viajes...</p>
        </div>

        <!-- No Results -->
        <div v-else-if="trips.length === 0" class="text-center py-8">
          <div class="text-6xl mb-4">😔</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No se encontraron viajes</h3>
          <p class="text-gray-600">Intenta con otros términos de búsqueda</p>
        </div>

        <!-- Trip Cards -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="trip in trips" 
            :key="trip.id"
            class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ trip.origin_name }} → {{ trip.destination_name }}
                </h3>
                <p class="text-sm text-gray-600">
                  {{ formatTime(trip.departure_time) }}
                </p>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-blue-600">
                  {{ trip.price_per_seat }}€
                </div>
                <div class="text-sm text-gray-500">por asiento</div>
              </div>
            </div>

            <div class="space-y-2 mb-4">
              <div class="flex items-center text-sm text-gray-600">
                <span class="w-4 h-4 mr-2">👥</span>
                {{ trip.available_seats }} asientos disponibles
              </div>
              <div v-if="trip.description" class="text-sm text-gray-600">
                {{ trip.description }}
              </div>
            </div>

            <div class="text-xs text-gray-500">
              ID: {{ trip.id }}
            </div>
          </div>
        </div>
      </div>

      <!-- Debug Info -->
      <div v-if="debugInfo" class="mt-8 bg-gray-100 rounded-lg p-6">
        <h3 class="text-lg font-semibold mb-4">Información de Debug</h3>
        <pre class="text-sm text-gray-700 whitespace-pre-wrap">{{ JSON.stringify(debugInfo, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { SimpleTripService, type Trip } from '@/services/simpleTripService'

// Estado del formulario
const searchForm = reactive({
  origin: '',
  destination: ''
})

// Estado de la búsqueda
const isLoading = ref(false)
const hasSearched = ref(false)
const trips = ref<Trip[]>([])
const debugInfo = ref<any>(null)

// Función de búsqueda
const searchTrips = async () => {
  if (!searchForm.origin || !searchForm.destination) {
    alert('Por favor, completa todos los campos')
    return
  }

  isLoading.value = true
  hasSearched.value = true

  try {
    console.log('🔍 TestSearchTrips - Iniciando búsqueda...')
    console.log('Parámetros:', { origin: searchForm.origin, destination: searchForm.destination })
    
    const results = await SimpleTripService.searchTrips(
      searchForm.origin,
      searchForm.destination,
      50
    )

    trips.value = results
    debugInfo.value = {
      searchParams: { origin: searchForm.origin, destination: searchForm.destination },
      resultsCount: results.length,
      timestamp: new Date().toISOString(),
      results: results.slice(0, 3) // Solo los primeros 3 para debug
    }

    console.log(`✅ TestSearchTrips - Búsqueda completada: ${results.length} viajes encontrados`)
  } catch (error) {
    console.error('❌ TestSearchTrips - Error en la búsqueda:', error)
    alert('Error al buscar viajes. Por favor, intenta de nuevo.')
    trips.value = []
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
</script>
