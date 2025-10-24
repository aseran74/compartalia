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
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-black dark:text-white">
                🗺️ Búsqueda por Mapa
              </h1>
              <p class="text-sm font-medium text-body-color">
                Encuentra viajes usando el mapa interactivo
              </p>
            </div>
            <button
              @click="$router.go(-1)"
              class="flex items-center space-x-2 rounded-md border border-stroke px-4 py-2 text-sm font-medium text-body-color hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-800"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              <span>Volver</span>
            </button>
          </div>
        </div>

        <!-- Layout responsivo -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <!-- En móvil: Mapa de pantalla completa -->
          <div class="lg:hidden">
            <!-- Header del mapa móvil -->
            <div class="mb-4 bg-white dark:bg-boxdark shadow-sm p-4 rounded-lg">
              <div class="flex items-center justify-between">
                <h1 class="text-lg font-bold text-black dark:text-white">
                  🗺️ Búsqueda por Mapa
                </h1>
                <button
                  @click="$router.go(-1)"
                  class="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Mapa móvil -->
            <div class="bg-white dark:bg-boxdark rounded-lg shadow-lg overflow-hidden">
              <div 
                id="map-mobile" 
                class="w-full"
                style="height: 70vh; min-height: 400px;"
              ></div>
            </div>
            
            <!-- Botón flotante para filtros en móvil -->
            <div class="fixed bottom-4 right-4 z-30">
              <button
                @click="showFiltersMobile = !showFiltersMobile"
                class="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                </svg>
              </button>
            </div>
            
            <!-- Panel de filtros móvil -->
            <div v-if="showFiltersMobile" class="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
              <div class="absolute bottom-0 left-0 right-0 bg-white dark:bg-boxdark rounded-t-lg shadow-lg max-h-[80vh] overflow-y-auto">
                <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div class="flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-black dark:text-white">
                      🔍 Filtros de Búsqueda
                    </h3>
                    <button
                      @click="showFiltersMobile = false"
                      class="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div class="p-4">
                  <!-- Aquí va el contenido de los filtros -->
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-black dark:text-white mb-2">
                        🚗 Origen
                      </label>
                      <input
                        v-model="searchForm.origin"
                        type="text"
                        placeholder="Escribe tu origen..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-black dark:text-white mb-2">
                        🎯 Destino
                      </label>
                      <input
                        v-model="searchForm.destination"
                        type="text"
                        placeholder="Escribe tu destino..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-black dark:text-white mb-2">
                        📅 Fecha
                      </label>
                      <input
                        v-model="searchForm.date"
                        type="date"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    
                    <button
                      @click="searchTrips"
                      class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      🔍 Buscar Viajes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Panel de Búsqueda - Solo visible en escritorio -->
          <div class="hidden lg:block lg:col-span-1">
            <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
                🔍 Filtros de Búsqueda
              </h3>
              
              <form @submit.prevent="searchTrips" class="space-y-4">
                <!-- Sección de Origen -->
                <div class="rounded-sm border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-gray-800">
                  <h4 class="mb-3 text-md font-semibold text-black dark:text-white">
                    🚗 ¿Desde dónde viajas?
                  </h4>
                  
                  <!-- Búsqueda por dirección exacta -->
                  <div class="mb-3">
                    <label class="mb-2 block text-sm font-medium text-black dark:text-white">
                      Escribe una dirección exacta:
                    </label>
                    <input
                      v-model="searchForm.origin"
                      type="text"
                      placeholder="📍 Ej: Calle Gran Vía, 1, Madrid"
                      class="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>

                  <!-- Orígenes predefinidos -->
                  <div>
                    <label class="mb-2 block text-sm font-medium text-black dark:text-white">
                      O selecciona una ciudad del extrarradio:
                    </label>
                    <div class="grid grid-cols-2 gap-2">
                      <button
                        v-for="city in predefinedOrigins"
                        :key="city.name"
                        @click="selectPredefinedOrigin(city)"
                        :class="[
                          'p-2 text-sm rounded border transition-colors',
                          searchForm.origin === city.name
                            ? 'border-primary bg-primary text-white'
                            : 'border-stroke hover:border-primary hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-800'
                        ]"
                      >
                        {{ city.name }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Sección de Destino -->
                <div class="rounded-sm border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-gray-800">
                  <h4 class="mb-3 text-md font-semibold text-black dark:text-white">
                    🎯 ¿A dónde vas?
                  </h4>
                  
                  <!-- Búsqueda por dirección exacta -->
                  <div class="mb-3">
                    <label class="mb-2 block text-sm font-medium text-black dark:text-white">
                      Escribe una dirección exacta:
                    </label>
                    <input
                      v-model="searchForm.destination"
                      type="text"
                      placeholder="📍 Ej: Paseo de la Castellana, 1, Madrid"
                      class="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>

                  <!-- Destinos predefinidos -->
                  <div>
                    <label class="mb-2 block text-sm font-medium text-black dark:text-white">
                      O selecciona un destino popular:
                    </label>
                    <div class="grid grid-cols-2 gap-2">
                      <button
                        v-for="destination in predefinedDestinations"
                        :key="destination.name"
                        @click="selectPredefinedDestination(destination)"
                        :class="[
                          'p-2 text-sm rounded border transition-colors',
                          searchForm.destination === destination.name
                            ? 'border-primary bg-primary text-white'
                            : 'border-stroke hover:border-primary hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-800'
                        ]"
                      >
                        {{ destination.name }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Sección de Fecha y Hora -->
                <div class="rounded-sm border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-gray-800">
                  <h4 class="mb-3 text-md font-semibold text-black dark:text-white">
                    📅 ¿Cuándo viajas?
                  </h4>
                  
                  <div class="grid grid-cols-1 gap-3">
                    <div>
                      <label class="mb-2 block text-sm font-medium text-black dark:text-white">
                        Fecha *
                      </label>
                      <input
                        v-model="searchForm.date"
                        type="date"
                        :min="today"
                        class="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        required
                      />
                    </div>
                    
                    <div>
                      <label class="mb-2 block text-sm font-medium text-black dark:text-white">
                        Hora aproximada
                      </label>
                      <input
                        v-model="searchForm.time"
                        type="time"
                        class="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <!-- Sección de Filtros -->
                <div class="rounded-sm border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-gray-800">
                  <h4 class="mb-3 text-md font-semibold text-black dark:text-white">
                    🔍 Filtros
                  </h4>
                  
                  <div class="space-y-3">
                    <div>
                      <label class="mb-2 block text-sm font-medium text-black dark:text-white">
                        Tipo de viaje
                      </label>
                      <select
                        v-model="searchForm.tripType"
                        class="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      >
                        <option value="">Todos los tipos</option>
                        <option value="daily">Diario</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensual</option>
                      </select>
                    </div>
                    
                    <div>
                      <label class="mb-2 block text-sm font-medium text-black dark:text-white">
                        Precio máximo
                      </label>
                      <input
                        v-model="searchForm.maxPrice"
                        type="number"
                        placeholder="€"
                        min="0"
                        step="0.50"
                        class="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      />
                    </div>
                    
                    <div>
                      <label class="mb-2 block text-sm font-medium text-black dark:text-white">
                        Asientos
                      </label>
                      <input
                        v-model="searchForm.seats"
                        type="number"
                        placeholder="1"
                        min="1"
                        max="8"
                        class="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <!-- Botones de acción -->
                <div class="flex gap-3">
                  <button
                    type="button"
                    @click="resetForm"
                    class="flex-1 rounded border border-stroke bg-gray-50 px-4 py-2 text-sm font-medium text-black transition hover:bg-gray-100 dark:border-strokedark dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                  >
                    Limpiar
                  </button>
                  <button
                    type="submit"
                    class="flex-1 rounded bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
                  >
                    🔍 Buscar Viajes
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Mapa y Resultados - Escritorio -->
          <div class="hidden lg:block lg:col-span-3">
            <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <!-- Mapa -->
              <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div class="p-6">
                  <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
                    🗺️ Mapa de Viajes
                  </h3>
                  <div 
                    id="map-desktop" 
                    class="w-full"
                    style="height: 500px;"
                  ></div>
                </div>
              </div>

              <!-- Resultados -->
              <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div class="p-6">
                  <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
                    📋 Resultados
                  </h3>
                  
                  <div v-if="!hasSearched" class="text-center py-8">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <p class="mt-2">Realiza una búsqueda para ver resultados en el mapa</p>
                  </div>
                  
                  <div v-else-if="searchResults.length === 0" class="text-center py-8">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709"/>
                    </svg>
                    <p class="mt-2">No se encontraron viajes para tu búsqueda</p>
                  </div>
                  
                  <div v-else class="space-y-4">
                    <div 
                      v-for="result in searchResults" 
                      :key="result.trip.id"
                      class="rounded-lg border border-stroke p-4 hover:shadow-md transition-shadow dark:border-strokedark"
                    >
                      <div class="flex items-center justify-between mb-2">
                        <h4 class="font-semibold text-black dark:text-white">
                          {{ result.trip.origin_name }} → {{ result.trip.destination_name }}
                        </h4>
                        <span class="text-sm font-medium text-primary">
                          {{ result.trip.price_per_seat }}€
                        </span>
                      </div>
                      <p class="text-sm text-body-color mb-2">
                        {{ new Date(result.trip.departure_time).toLocaleString() }}
                      </p>
                      <div class="flex items-center justify-between">
                        <span class="text-sm text-body-color">
                          🪑 {{ result.trip.available_seats }} asientos disponibles
                        </span>
                        <button class="text-primary hover:text-primary/80 text-sm font-medium">
                          Ver en mapa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { SimpleHybridService, type SearchResult } from '@/services/simpleHybridService'
import { useSidebar } from '@/composables/useSidebar'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'

// Router y sidebar
const router = useRouter()
const { isExpanded, isMobileOpen } = useSidebar()

// Estado del formulario
const searchForm = reactive({
  origin: '',
  destination: '',
  date: '',
  time: '',
  tripType: '',
  maxPrice: '',
  seats: 1
})

// Estado de la búsqueda
const searchResults = ref<SearchResult[]>([])
const hasSearched = ref(false)
const isSearching = ref(false)

// Estado para panel de filtros en móvil
const showFiltersMobile = ref(false)

// Servicios
const hybridService = new SimpleHybridService()

// Fecha actual
const today = new Date().toISOString().split('T')[0]

// Orígenes y destinos predefinidos
const predefinedOrigins = [
  { name: 'Getafe', lat: 40.3082504, lng: -3.7323934 },
  { name: 'Móstoles', lat: 40.3223, lng: -3.8646 },
  { name: 'Alcorcón', lat: 40.3458, lng: -3.8247 },
  { name: 'Leganés', lat: 40.3272, lng: -3.7635 },
  { name: 'Fuenlabrada', lat: 40.2842, lng: -3.7941 },
  { name: 'Alcalá de Henares', lat: 40.4817, lng: -3.3643 },
  { name: 'Torrejón de Ardoz', lat: 40.4564, lng: -3.4819 }
]

const predefinedDestinations = [
  { name: 'Chamartín', lat: 40.4615174, lng: -3.6865844 },
  { name: 'Atocha', lat: 40.4075, lng: -3.6993 },
  { name: 'Nuevos Ministerios', lat: 40.4461, lng: -3.6903 },
  { name: 'Gran Vía', lat: 40.4192, lng: -3.7036 },
  { name: 'Plaza de España', lat: 40.4236, lng: -3.7123 },
  { name: 'Plaza de Castilla', lat: 40.4669, lng: -3.6886 },
  { name: 'Moncloa', lat: 40.4355, lng: -3.7195 }
]

// Funciones de selección predefinida
const selectPredefinedOrigin = (city: any) => {
  searchForm.origin = city.name
}

const selectPredefinedDestination = (destination: any) => {
  searchForm.destination = destination.name
}

// Función de búsqueda
const searchTrips = async () => {
  if (!searchForm.origin || !searchForm.destination) {
    return
  }
  
  isSearching.value = true
  hasSearched.value = true
  
  try {
    const results = await hybridService.searchTrips(
      searchForm.origin,
      searchForm.destination,
      {
        useGeolocation: true,
        maxDistanceKm: 50,
        limit: 50,
        date: searchForm.date
      }
    )
    
    searchResults.value = results
    console.log('Resultados de búsqueda:', results)
  } catch (error) {
    console.error('Error en búsqueda:', error)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

// Función para limpiar formulario
const resetForm = () => {
  searchForm.origin = ''
  searchForm.destination = ''
  searchForm.date = today
  searchForm.time = ''
  searchForm.tripType = ''
  searchForm.maxPrice = ''
  searchForm.seats = 1
  searchResults.value = []
  hasSearched.value = false
}

// Inicialización
onMounted(() => {
  searchForm.date = today
})
</script>