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
          🚗 Buscar Viajes
        </h1>
        <p class="text-xl text-gray-600">
          Encuentra viajes compartidos en Madrid y alrededores
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
              <input
                v-model="searchForm.origin"
                type="text"
                placeholder="Ej: Torrejón de Ardoz"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <!-- Destino -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                🎯 Destino
              </label>
              <input
                v-model="searchForm.destination"
                type="text"
                placeholder="Ej: Madrid Centro"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div class="flex justify-center">
            <button
              type="submit"
              :disabled="isLoading"
              class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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

            <div class="flex space-x-2">
              <button 
                @click="viewTripDetails(trip)"
                class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm"
              >
                Ver Detalles
              </button>
              <button 
                @click="bookTrip(trip)"
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
    console.log('🔍 Iniciando búsqueda de viajes...')
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
      timestamp: new Date().toISOString()
    }

    console.log(`✅ Búsqueda completada: ${results.length} viajes encontrados`)
  } catch (error) {
    console.error('❌ Error en la búsqueda:', error)
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

const viewTripDetails = (trip: Trip) => {
  console.log('Ver detalles del viaje:', trip)
  alert(`Detalles del viaje:\n${trip.origin_name} → ${trip.destination_name}\nPrecio: ${trip.price_per_seat}€\nAsientos: ${trip.available_seats}`)
}

const bookTrip = (trip: Trip) => {
  console.log('Reservar viaje:', trip)
  alert('Función de reserva en desarrollo')
}
</script>
