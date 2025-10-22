<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <AppSidebar />
    
    <!-- Main Content -->
    <div class="flex flex-1 flex-col overflow-hidden" :class="{ 'ml-[90px]': !isExpanded, 'ml-[280px]': isExpanded }">
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

        <!-- Formulario de Búsqueda -->
        <div class="mb-8 rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <form @submit.prevent="searchTrips" class="space-y-6">
            <!-- Sección de Origen -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-black dark:text-white mb-4">🚗 ¿Desde dónde viajas?</h3>
              
              <!-- Búsqueda por dirección exacta -->
              <div class="mb-4">
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Escribe una dirección exacta:
                </label>
                <input
                  v-model="searchForm.origin"
                  type="text"
                  placeholder="📍 Ej: Calle Gran Vía, 1, Madrid"
                  class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
              </div>

              <!-- Orígenes predefinidos -->
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  O selecciona una ciudad del extrarradio:
                </label>
                <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  <button
                    v-for="city in madridCities"
                    :key="city"
                    @click="selectOriginFromList(city)"
                    :class="[
                      'p-3 rounded-lg border text-center transition-all duration-200',
                      searchForm.origin === city
                        ? 'border-primary bg-primary text-white'
                        : 'border-stroke bg-white hover:border-primary hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:hover:bg-gray-700'
                    ]"
                  >
                    <div class="font-medium text-sm">{{ city }}</div>
                  </button>
                </div>
              </div>
            </div>

            <!-- Sección de Destino -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-black dark:text-white mb-4">🎯 ¿A dónde vas?</h3>
              
              <!-- Búsqueda por dirección exacta -->
              <div class="mb-4">
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Escribe una dirección exacta:
                </label>
                <input
                  v-model="searchForm.destination"
                  type="text"
                  placeholder="🎯 Ej: Plaza de Callao, Madrid"
                  class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
              </div>

              <!-- Destinos predefinidos -->
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  O selecciona un destino popular:
                </label>
                <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  <button
                    v-for="destination in madridDestinations"
                    :key="destination"
                    @click="selectDestinationFromList(destination)"
                    :class="[
                      'p-3 rounded-lg border text-center transition-all duration-200',
                      searchForm.destination === destination
                        ? 'border-primary bg-primary text-white'
                        : 'border-stroke bg-white hover:border-primary hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:hover:bg-gray-700'
                    ]"
                  >
                    <div class="font-medium text-sm">{{ destination }}</div>
                  </button>
                </div>
              </div>
            </div>

            <!-- Filtros adicionales -->
            <div class="grid grid-cols-1 gap-6 md:grid-cols-4">
              <!-- Tipo de Viaje -->
              <div>
                <label class="mb-2.5 block text-black dark:text-white">
                  Tipo de Viaje
                </label>
                <select
                  v-model="searchForm.tripType"
                  class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="daily">Viajes diarios</option>
                  <option value="weekly">Viajes semanales</option>
                  <option value="monthly">Viajes mensuales</option>
                </select>
              </div>

              <!-- Fecha -->
              <div>
                <label class="mb-2.5 block text-black dark:text-white">
                  Fecha
                </label>
                <DatePicker
                  v-model="searchForm.date"
                  placeholder="Selecciona fecha"
                  :min-date="getTomorrowDate()"
                />
              </div>

              <!-- Hora -->
              <div>
                <label class="mb-2.5 block text-black dark:text-white">
                  Hora (opcional)
                </label>
                <input
                  v-model="searchForm.time"
                  type="time"
                  placeholder="Hora aproximada"
                  class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
              </div>

              <!-- Pasajeros -->
              <div>
                <label class="mb-2.5 block text-black dark:text-white">
                  Pasajeros
                </label>
                <select
                  v-model="searchForm.passengers"
                  class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                >
                  <option value="1">1 pasajero</option>
                  <option value="2">2 pasajeros</option>
                  <option value="3">3 pasajeros</option>
                  <option value="4">4 pasajeros</option>
                </select>
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

            <!-- Botón de Búsqueda -->
            <div class="text-center">
              <button
                type="submit"
                :disabled="isLoading"
                class="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-center font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
              >
                <svg v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isLoading ? 'Buscando...' : 'Buscar Viajes' }}
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
              v-for="result in searchResults"
              :key="result.trip.id"
              class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <!-- Información del Viaje -->
                  <div class="mb-4">
                    <h3 class="text-lg font-semibold text-black dark:text-white mb-2">
                      {{ result.trip.origin_name }} → {{ result.trip.destination_name }}
                    </h3>
                    <p class="text-sm text-body-color">
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

                  <!-- Detalles del Viaje -->
                  <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p class="text-sm text-body-color">Precio</p>
                      <p class="font-medium text-black dark:text-white">
                        {{ result.trip.price_per_seat }}€
                      </p>
                    </div>
                    <div>
                      <p class="text-sm text-body-color">Asientos</p>
                      <p class="font-medium text-black dark:text-white">
                        {{ result.trip.available_seats }} disponibles
                      </p>
                    </div>
                    <div>
                      <p class="text-sm text-body-color">Estado</p>
                      <p class="font-medium text-black dark:text-white">
                        {{ result.trip.status }}
                      </p>
                    </div>
                    <div>
                      <p class="text-sm text-body-color">ID</p>
                      <p class="font-medium text-black dark:text-white text-xs">
                        {{ result.trip.id.substring(0, 8) }}...
                      </p>
                    </div>
                  </div>

                  <!-- Descripción -->
                  <div v-if="result.trip.description" class="mt-4">
                    <p class="text-sm text-body-color">{{ result.trip.description }}</p>
                  </div>
                </div>

                <!-- Botones de Acción -->
                <div class="ml-4 flex flex-col space-y-2">
                  <button
                    @click="viewTripDetails(result.trip)"
                    class="rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20"
                  >
                    Ver Detalles
                  </button>
                  <button
                    @click="openBookingModal(result.trip)"
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
        <div v-else-if="hasSearched && !isLoading" class="text-center py-12">
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

    <!-- Modal de Reserva -->
    <div v-if="showBookingModal" class="fixed inset-0 z-[9999] overflow-y-auto" @click="closeBookingModal">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity bg-black bg-opacity-50" @click="closeBookingModal"></div>
        
        <div class="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full dark:bg-boxdark" @click.stop>
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 dark:bg-boxdark">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                🚗 Reservar Viaje
              </h3>
              <button @click="closeBookingModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div v-if="selectedTrip" class="space-y-4">
              <!-- Información del Viaje -->
              <div class="bg-gray-50 rounded-lg p-4 dark:bg-gray-700">
                <h4 class="font-semibold text-black dark:text-white mb-2">
                  {{ selectedTrip.origin_name }} → {{ selectedTrip.destination_name }}
                </h4>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-gray-600 dark:text-gray-400">Salida:</span>
                    <span class="ml-2 text-black dark:text-white">{{ formatTime(selectedTrip.departure_time) }}</span>
                  </div>
                  <div>
                    <span class="text-gray-600 dark:text-gray-400">Precio:</span>
                    <span class="ml-2 text-black dark:text-white font-semibold">{{ selectedTrip.price_per_seat }}€</span>
                  </div>
                  <div>
                    <span class="text-gray-600 dark:text-gray-400">Asientos:</span>
                    <span class="ml-2 text-black dark:text-white">{{ selectedTrip.available_seats }} disponibles</span>
                  </div>
                  <div>
                    <span class="text-gray-600 dark:text-gray-400">Tipo:</span>
                    <span class="ml-2 text-black dark:text-white">{{ getTripTypeLabel(selectedTrip) }}</span>
                  </div>
                </div>
              </div>

              <!-- Formulario de Reserva -->
              <form @submit.prevent="confirmBooking" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Número de asientos
                  </label>
                  <select
                    v-model="bookingForm.seats"
                    class="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 font-medium outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                    required
                  >
                    <option v-for="n in Math.min(selectedTrip.available_seats, 4)" :key="n" :value="n">
                      {{ n }} asiento{{ n > 1 ? 's' : '' }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notas para el conductor (opcional)
                  </label>
                  <textarea
                    v-model="bookingForm.notes"
                    rows="3"
                    placeholder="Ej: Punto de encuentro específico, equipaje especial..."
                    class="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 font-medium outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                  ></textarea>
                </div>

                <!-- Resumen de Precio -->
                <div class="bg-primary/10 rounded-lg p-4">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Total a pagar:</span>
                    <span class="text-lg font-semibold text-primary">
                      {{ (selectedTrip.price_per_seat * bookingForm.seats).toFixed(2) }}€
                    </span>
                  </div>
                </div>

                <!-- Botones -->
                <div class="flex space-x-3 pt-4">
                  <button
                    type="button"
                    @click="closeBookingModal"
                    class="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    :disabled="isBooking"
                    class="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                  >
                    {{ isBooking ? 'Reservando...' : 'Confirmar Reserva' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { SimpleHybridService, type SearchResult } from '@/services/simpleHybridService'
import DatePicker from '@/components/common/DatePicker.vue'
import { useSidebar } from '@/composables/useSidebar'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'

// Servicio híbrido simplificado
const hybridService = new SimpleHybridService()

// Router y sidebar
const router = useRouter()
const { isExpanded } = useSidebar()

// Estado del formulario
// Función para obtener la fecha de mañana
const getTomorrowDate = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
}

const searchForm = reactive({
  origin: '',
  destination: '',
  tripType: 'all',
  date: getTomorrowDate(),
  time: '',
  passengers: 1
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

// Modal de reserva
const showBookingModal = ref(false)
const selectedTrip = ref<any>(null)
const isBooking = ref(false)
const bookingForm = reactive({
  seats: 1,
  notes: ''
})



// Ciudades del extrarradio de Madrid
const madridCities = ref([
  'Móstoles',
  'Alcalá de Henares',
  'Fuenlabrada',
  'Leganés',
  'Getafe',
  'Alcorcón',
  'Torrejón de Ardoz',
  'Parla',
  'Alcobendas',
  'Las Rozas de Madrid',
  'San Sebastián de los Reyes',
  'Pozuelo de Alarcón',
  'Coslada',
  'Valdemoro',
  'Rivas-Vaciamadrid',
  'Majadahonda'
])

// Destinos populares en Madrid
const madridDestinations = ref([
  'Puerta del Sol',
  'Gran Vía',
  'Chamartín',
  'Atocha',
  'Nuevos Ministerios',
  'Plaza de Castilla',
  'Moncloa',
  'Plaza de España',
  'AZCA',
  'Cuatro Torres',
  'Universidad Complutense',
  'Hospital La Paz',
  'Madrid Centro',
  'Ciudad financiera Santander (Boadilla)',
  'Ciudad financiera BBVA (Las Tablas)'
])

// Propiedades computadas para filtrar ciudades y destinos
const filteredMadridCities = computed(() => {
  if (!searchForm.origin) return madridCities.value
  return madridCities.value.filter(city => 
    city.toLowerCase().includes(searchForm.origin.toLowerCase())
  )
})

const filteredMadridDestinations = computed(() => {
  if (!searchForm.destination) return madridDestinations.value
  return madridDestinations.value.filter(destination => 
    destination.toLowerCase().includes(searchForm.destination.toLowerCase())
  )
})

// Función de búsqueda
const searchTrips = async () => {
  if (!searchForm.origin || !searchForm.destination) {
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


// Función para seleccionar origen desde la lista de ciudades
const selectOriginFromList = (city: string) => {
  searchForm.origin = city
  searchTrips()
}

// Función para seleccionar destino desde la lista de destinos
const selectDestinationFromList = (destination: string) => {
  searchForm.destination = destination
  searchTrips()
}

// Funciones del modal de reserva
const openBookingModal = (trip: any) => {
  selectedTrip.value = trip
  bookingForm.seats = 1
  bookingForm.notes = ''
  showBookingModal.value = true
}

const closeBookingModal = () => {
  showBookingModal.value = false
  selectedTrip.value = null
  bookingForm.seats = 1
  bookingForm.notes = ''
}

const confirmBooking = async () => {
  if (!selectedTrip.value) return
  
  isBooking.value = true
  
  try {
    // Aquí iría la lógica para crear la reserva en Supabase
    console.log('Reservando viaje:', {
      tripId: selectedTrip.value.id,
      seats: bookingForm.seats,
      notes: bookingForm.notes,
      totalPrice: selectedTrip.value.price_per_seat * bookingForm.seats
    })
    
    // Simular delay de reserva
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    alert(`¡Reserva confirmada! Has reservado ${bookingForm.seats} asiento${bookingForm.seats > 1 ? 's' : ''} por ${(selectedTrip.value.price_per_seat * bookingForm.seats).toFixed(2)}€`)
    
    closeBookingModal()
  } catch (error) {
    console.error('Error al confirmar reserva:', error)
    alert('Error al confirmar la reserva. Por favor, intenta de nuevo.')
  } finally {
    isBooking.value = false
  }
}

// Función para obtener el tipo de viaje
const getTripTypeLabel = (trip: any) => {
  if (trip.route_data?.pricing_type) {
    switch (trip.route_data.pricing_type) {
      case 'daily': return 'Viaje diario'
      case 'weekly': return 'Viaje semanal'
      case 'monthly': return 'Viaje mensual'
      default: return 'Viaje único'
    }
  }
  return 'Viaje único'
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
