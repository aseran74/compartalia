<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <AppSidebar />
    
    <!-- Main Content -->
    <div class="flex flex-1 flex-col overflow-hidden" :class="{ 'ml-[90px] lg:ml-[90px]': !isExpanded, 'ml-[280px] lg:ml-[280px]': isExpanded }">
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

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <!-- Panel de Búsqueda -->
          <div class="lg:col-span-1">
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
                    <div class="grid grid-cols-2 gap-2 sm:gap-3">
                      <button
                        v-for="city in madridCities"
                        :key="city"
                        @click="selectOriginFromList(city)"
                        :class="[
                          'rounded-lg border px-2 py-1.5 text-center text-xs font-medium transition-all duration-200',
                          searchForm.origin === city
                            ? 'border-primary bg-primary text-white'
                            : 'border-stroke bg-white text-body-color hover:border-primary hover:bg-primary/5 dark:border-strokedark dark:bg-boxdark dark:text-white'
                        ]"
                      >
                        {{ city }}
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
                      placeholder="📍 Ej: Plaza Mayor, Madrid"
                      class="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>

                  <!-- Destinos predefinidos -->
                  <div>
                    <label class="mb-2 block text-sm font-medium text-black dark:text-white">
                      O selecciona un destino popular:
                    </label>
                    <div class="grid grid-cols-2 gap-2 sm:gap-3">
                      <button
                        v-for="destination in madridDestinations"
                        :key="destination"
                        @click="selectDestinationFromList(destination)"
                        :class="[
                          'rounded-lg border px-2 py-1.5 text-center text-xs font-medium transition-all duration-200',
                          searchForm.destination === destination
                            ? 'border-primary bg-primary text-white'
                            : 'border-stroke bg-white text-body-color hover:border-primary hover:bg-primary/5 dark:border-strokedark dark:bg-boxdark dark:text-white'
                        ]"
                      >
                        {{ destination }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Fecha y Hora -->
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

                <!-- Filtros -->
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
                        <option value="diario">Diario</option>
                        <option value="semanal">Semanal</option>
                        <option value="mensual">Mensual</option>
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
                        min="1"
                        max="8"
                        placeholder="1"
                        class="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <!-- Botón de búsqueda -->
                <div class="flex justify-end">
                  <button
                    type="submit"
                    :disabled="isSearching"
                    class="flex items-center justify-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                  >
                    <svg v-if="isSearching" class="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    {{ isSearching ? 'Buscando...' : 'Buscar en Mapa' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Mapa y Resultados -->
          <div class="lg:col-span-3">
            <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
                🗺️ Mapa Interactivo
              </h3>
              
              <!-- Mapa placeholder -->
              <div class="h-96 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:bg-gray-800 dark:border-gray-600">
                <div class="text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"/>
                  </svg>
                  <p class="mt-2 text-sm text-gray-500">Mapa interactivo</p>
                  <p class="text-xs text-gray-400">Se mostrará aquí cuando se implemente</p>
                </div>
              </div>
              
              <!-- Resultados de búsqueda -->
              <div v-if="hasSearched" class="mt-6">
                <h4 class="mb-4 text-md font-semibold text-black dark:text-white">
                  📍 Resultados de Búsqueda
                </h4>
                
                <div v-if="isSearching" class="text-center text-body-color">
                  <svg class="mx-auto h-8 w-8 animate-spin text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  <p class="mt-2">Buscando viajes...</p>
                </div>
                
                <div v-else-if="searchResults.length === 0" class="text-center text-body-color">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0012 4c-2.34 0-4.29 1.009-5.824 2.709"/>
                  </svg>
                  <p class="mt-2">No se encontraron viajes</p>
                  <p class="text-sm">Intenta ajustar tus filtros</p>
                </div>
                
                <div v-else class="space-y-3">
                  <div
                    v-for="trip in searchResults"
                    :key="trip.id"
                    class="rounded-lg border border-stroke p-3 hover:shadow-md transition-shadow dark:border-strokedark"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-xs font-medium text-primary">{{ trip.tripType || 'Diario' }}</span>
                      <span class="text-sm font-bold text-black dark:text-white">{{ trip.price }}€</span>
                    </div>
                    
                    <div class="space-y-1">
                      <div class="flex items-center text-xs text-body-color">
                        <svg class="h-3 w-3 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        {{ trip.origin }}
                      </div>
                      <div class="flex items-center text-xs text-body-color">
                        <svg class="h-3 w-3 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        {{ trip.destination }}
                      </div>
                    </div>
                    
                    <div class="mt-2 flex items-center justify-between">
                      <span class="text-xs text-body-color">{{ trip.date }}</span>
                      <button class="text-xs text-primary hover:underline">
                        Ver en mapa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-else class="text-center text-body-color">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <p class="mt-2">Realiza una búsqueda para ver resultados en el mapa</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useSidebar } from '@/composables/useSidebar'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'

// Router y sidebar
const router = useRouter()
const { isExpanded } = useSidebar()

// Formulario de búsqueda
const searchForm = reactive({
  origin: '',
  destination: '',
  date: '',
  time: '',
  tripType: '',
  maxPrice: '',
  seats: '1'
})

// Estados de la búsqueda
const searchResults = ref<any[]>([])
const isSearching = ref(false)
const hasSearched = ref(false)

// Fecha actual
const today = new Date().toISOString().split('T')[0]

// Ciudades del extrarradio de Madrid
const madridCities = [
  'Móstoles',
  'Alcalá de Henares',
  'Fuenlabrada',
  'Leganés',
  'Getafe',
  'Alcorcón',
  'Torrejón de Ardoz',
  'Parla',
  'Alcobendas',
  'San Sebastián de los Reyes',
  'Coslada',
  'Rivas-Vaciamadrid',
  'Valdemoro',
  'Pozuelo de Alarcón',
  'Majadahonda',
  'Las Rozas de Madrid',
  'Boadilla del Monte',
  'Villaviciosa de Odón',
  'Moralzarzal',
  'Colmenar Viejo'
]

// Destinos populares de Madrid
const madridDestinations = [
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
]

// Selección desde listas predefinidas
const selectOriginFromList = (city: string) => {
  searchForm.origin = city
}

const selectDestinationFromList = (destination: string) => {
  searchForm.destination = destination
}

// Búsqueda de viajes
const searchTrips = async () => {
  if (!searchForm.origin || !searchForm.destination) {
    alert('Por favor, completa el origen y destino')
    return
  }

  isSearching.value = true
  hasSearched.value = true

  try {
    console.log('🔍 Iniciando búsqueda en mapa...', searchForm)
    
    // Simular búsqueda
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Resultados de ejemplo
    searchResults.value = [
      {
        id: 1,
        origin: searchForm.origin,
        destination: searchForm.destination,
        date: searchForm.date,
        price: '15',
        tripType: 'Diario'
      },
      {
        id: 2,
        origin: searchForm.origin,
        destination: searchForm.destination,
        date: searchForm.date,
        price: '12',
        tripType: 'Semanal'
      }
    ]
    
    console.log('✅ Búsqueda completada:', searchResults.value)
  } catch (error) {
    console.error('❌ Error en la búsqueda:', error)
    alert('Error al buscar viajes. Inténtalo de nuevo.')
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}
</script>
