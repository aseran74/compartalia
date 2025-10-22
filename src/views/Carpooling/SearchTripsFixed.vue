<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <AppSidebar />
    
    <!-- Main Content -->
    <div class="flex flex-1 flex-col overflow-hidden" :class="{ 'ml-0 lg:ml-[90px]': !isExpanded, 'ml-0 lg:ml-[280px]': isExpanded }">
      <!-- Header -->
      <AppHeader />
      
      <!-- Page Content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6 xl:p-7.5 dark:bg-boxdark">
        <!-- Header -->
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-black dark:text-white">
            Buscar Viajes
          </h1>
          <p class="text-sm font-medium text-body-color">
            Encuentra viajes compatibles con tu ruta
          </p>
        </div>

        <!-- Formulario de Búsqueda Simplificado -->
        <div class="mb-8 rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <form @submit.prevent="searchTrips" class="space-y-6">
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <!-- Origen -->
              <div>
                <label class="mb-2.5 block text-black dark:text-white">
                  Origen
                </label>
                <input
                  v-model="searchForm.origin"
                  type="text"
                  placeholder="Ej: Torrejón de Ardoz"
                  class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  required
                />
              </div>

              <!-- Destino -->
              <div>
                <label class="mb-2.5 block text-black dark:text-white">
                  Destino
                </label>
                <input
                  v-model="searchForm.destination"
                  type="text"
                  placeholder="Ej: Chamartín, Madrid Centro"
                  class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  required
                />
              </div>
            </div>

            <!-- Botón de Búsqueda -->
            <div class="text-center">
              <button
                type="submit"
                :disabled="isSearching"
                class="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-center font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
              >
                <svg v-if="isSearching" class="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isSearching ? 'Buscando...' : 'Buscar Viajes' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Resultados de Búsqueda -->
        <div v-if="searchResults.length > 0" class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-black dark:text-white">
              {{ searchResults.length }} viajes encontrados
            </h2>
          </div>

          <!-- Lista de Viajes -->
          <div class="space-y-4">
            <div
              v-for="trip in searchResults"
              :key="trip.id"
              class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <!-- Información del Viaje -->
                  <div class="mb-4">
                    <h3 class="text-lg font-semibold text-black dark:text-white mb-2">
                      {{ trip.origin_name }} → {{ trip.destination_name }}
                    </h3>
                    <p class="text-sm text-body-color">
                      {{ formatTime(trip.departure_time) }}
                    </p>
                  </div>

                  <!-- Detalles del Viaje -->
                  <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p class="text-sm text-body-color">Precio</p>
                      <p class="font-medium text-black dark:text-white">
                        {{ trip.price_per_seat }}€
                      </p>
                    </div>
                    <div>
                      <p class="text-sm text-body-color">Asientos</p>
                      <p class="font-medium text-black dark:text-white">
                        {{ trip.available_seats }} disponibles
                      </p>
                    </div>
                    <div>
                      <p class="text-sm text-body-color">Estado</p>
                      <p class="font-medium text-black dark:text-white">
                        {{ trip.status }}
                      </p>
                    </div>
                    <div>
                      <p class="text-sm text-body-color">ID</p>
                      <p class="font-medium text-black dark:text-white text-xs">
                        {{ trip.id.substring(0, 8) }}...
                      </p>
                    </div>
                  </div>

                  <!-- Descripción -->
                  <div v-if="trip.description" class="mt-4">
                    <p class="text-sm text-body-color">{{ trip.description }}</p>
                  </div>
                </div>

                <!-- Botones de Acción -->
                <div class="ml-4 flex flex-col space-y-2">
                  <button
                    @click="viewTripDetails(trip)"
                    class="rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20"
                  >
                    Ver Detalles
                  </button>
                  <button
                    @click="bookTrip(trip)"
                    class="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                  >
                    Reservar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div v-else-if="hasSearched && !isSearching" class="text-center py-12">
          <div class="text-6xl mb-4">😔</div>
          <h3 class="text-xl font-semibold text-black dark:text-white mb-2">
            No se encontraron viajes
          </h3>
          <p class="text-body-color">
            Intenta con otros términos de búsqueda o verifica la ortografía
          </p>
        </div>

        <!-- Debug Info (solo en desarrollo) -->
        <div v-if="debugInfo && hasSearched" class="mt-8 bg-gray-100 rounded-lg p-4">
          <h3 class="font-semibold mb-2">Debug Info:</h3>
          <pre class="text-xs text-gray-600">{{ JSON.stringify(debugInfo, null, 2) }}</pre>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { SimpleTripService, type Trip } from '@/services/simpleTripService'
import { useSidebar } from '@/composables/useSidebar'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'

const router = useRouter()
const { isExpanded } = useSidebar()

// Estado del formulario
const searchForm = reactive({
  origin: '',
  destination: ''
})

// Estado de la búsqueda
const isSearching = ref(false)
const hasSearched = ref(false)
const searchResults = ref<Trip[]>([])
const debugInfo = ref<any>(null)

// Función de búsqueda
const searchTrips = async () => {
  if (!searchForm.origin || !searchForm.destination) {
    alert('Por favor, completa todos los campos')
    return
  }

  isSearching.value = true
  hasSearched.value = true

  try {
    console.log('🔍 SearchTripsFixed - Iniciando búsqueda...')
    console.log('Parámetros:', { origin: searchForm.origin, destination: searchForm.destination })
    
    const results = await SimpleTripService.searchTrips(
      searchForm.origin,
      searchForm.destination,
      50
    )

    searchResults.value = results
    debugInfo.value = {
      searchParams: { origin: searchForm.origin, destination: searchForm.destination },
      resultsCount: results.length,
      timestamp: new Date().toISOString(),
      results: results.slice(0, 3) // Solo los primeros 3 para debug
    }

    console.log(`✅ SearchTripsFixed - Búsqueda completada: ${results.length} viajes encontrados`)
  } catch (error) {
    console.error('❌ SearchTripsFixed - Error en la búsqueda:', error)
    alert('Error al buscar viajes. Por favor, intenta de nuevo.')
    searchResults.value = []
  } finally {
    isSearching.value = false
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
