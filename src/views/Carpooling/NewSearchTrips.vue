<template>
  <div class="flex h-screen overflow-hidden new-search-page">
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
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-black dark:text-white">
                Buscar Viajes
              </h1>
              <p class="text-sm font-medium text-body-color">
                Encuentra viajes compatibles con tu ruta
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

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <!-- Formulario de Búsqueda -->
          <div class="lg:col-span-2">
            <form @submit.prevent="searchTrips" class="space-y-6">
              <!-- Sección de Origen -->
              <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
                  🚗 ¿Desde dónde viajas?
                </h3>
                
                <!-- Búsqueda por dirección exacta -->
                <div class="mb-4">
                  <label class="mb-2.5 block text-black dark:text-white">
                    Escribe una dirección exacta:
                  </label>
                  <AutocompleteInput
                    v-model="searchForm.origin"
                    placeholder="📍 Ej: Calle Gran Vía, 1, Madrid"
                    :suggestions="originSuggestions"
                    :is-loading="isLoadingOrigin"
                    @input="handleOriginInput"
                    @select="handleOriginSelect"
                    input-class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  />
                </div>

                <!-- Orígenes predefinidos -->
                <div>
                  <label class="mb-2.5 block text-black dark:text-white">
                    O selecciona una ciudad del extrarradio:
                  </label>
                  <div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                    <button
                      v-for="city in madridCities"
                      :key="city"
                      @click="selectOriginFromList(city)"
                      :class="[
                        'rounded-lg border px-3 py-2 text-center text-sm font-medium transition-all duration-200',
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
              <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
                  🎯 ¿A dónde vas?
                </h3>
                
                <!-- Búsqueda por dirección exacta -->
                <div class="mb-4">
                  <label class="mb-2.5 block text-black dark:text-white">
                    Escribe una dirección exacta:
                  </label>
                  <AutocompleteInput
                    v-model="searchForm.destination"
                    placeholder="📍 Ej: Plaza Mayor, Madrid"
                    :suggestions="destinationSuggestions"
                    :is-loading="isLoadingDestination"
                    @input="handleDestinationInput"
                    @select="handleDestinationSelect"
                    input-class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  />
                </div>

                <!-- Destinos predefinidos -->
                <div>
                  <label class="mb-2.5 block text-black dark:text-white">
                    O selecciona un destino popular:
                  </label>
                  <div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                    <button
                      v-for="destination in madridDestinations"
                      :key="destination"
                      @click="selectDestinationFromList(destination)"
                      :class="[
                        'rounded-lg border px-3 py-2 text-center text-sm font-medium transition-all duration-200',
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
              <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
                  📅 ¿Cuándo viajas?
                </h3>
                
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label class="mb-2.5 block text-black dark:text-white">
                      Fecha *
                    </label>
                    <DatePicker
                      v-model="searchForm.date"
                      :min-date="today"
                      placeholder="Selecciona una fecha"
                      class="w-full"
                    />
                  </div>
                  
                  <div>
                    <label class="mb-2.5 block text-black dark:text-white">
                      Hora aproximada
                    </label>
                    <input
                      v-model="searchForm.time"
                      type="time"
                      class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <!-- Filtros -->
              <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
                  🔍 Filtros
                </h3>
                
                <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label class="mb-2.5 block text-black dark:text-white">
                      Tipo de viaje
                    </label>
                    <select
                      v-model="searchForm.tripType"
                      class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    >
                      <option value="">Todos los tipos</option>
                      <option value="diario">Diario</option>
                      <option value="semanal">Semanal</option>
                      <option value="mensual">Mensual</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="mb-2.5 block text-black dark:text-white">
                      Precio máximo
                    </label>
                    <input
                      v-model="searchForm.maxPrice"
                      type="number"
                      placeholder="€"
                      class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label class="mb-2.5 block text-black dark:text-white">
                      Asientos
                    </label>
                    <input
                      v-model="searchForm.seats"
                      type="number"
                      min="1"
                      max="8"
                      placeholder="1"
                      class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <!-- Botón de búsqueda -->
              <div class="flex justify-end">
                <button
                  type="submit"
                  :disabled="isSearching"
                  class="flex items-center justify-center gap-2 rounded bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                >
                  <svg v-if="isSearching" class="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  {{ isSearching ? 'Buscando...' : 'Buscar Viajes' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Panel de Resultados -->
          <div class="lg:col-span-1">
            <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
                Resultados
              </h3>
              
              <div v-if="!hasSearched" class="text-center text-body-color">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <p class="mt-2">Realiza una búsqueda para ver resultados</p>
              </div>
              
              <div v-else-if="isSearching" class="text-center text-body-color">
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
              
              <div v-else class="space-y-4">
                <div
                  v-for="trip in searchResults"
                  :key="trip.id"
                  class="rounded-lg border border-stroke p-4 hover:shadow-md transition-shadow dark:border-strokedark"
                >
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-primary">{{ trip.tripType || 'Diario' }}</span>
                    <span class="text-sm font-bold text-black dark:text-white">{{ trip.price }}€</span>
                  </div>
                  
                  <div class="space-y-1">
                    <div class="flex items-center text-sm text-body-color">
                      <svg class="h-4 w-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      {{ trip.origin }}
                    </div>
                    <div class="flex items-center text-sm text-body-color">
                      <svg class="h-4 w-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      {{ trip.destination }}
                    </div>
                  </div>
                  
                  <div class="mt-3 flex items-center justify-between">
                    <span class="text-xs text-body-color">{{ trip.date }}</span>
                    <button class="text-xs text-primary hover:underline">
                      Ver detalles
                    </button>
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
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { SimpleHybridService, type SearchResult } from '@/services/simpleHybridService'
import DatePicker from '@/components/DatePicker.vue'
import AutocompleteInput from '@/components/AutocompleteInput.vue'
import { SimpleAutocompleteService, type AutocompleteSuggestion } from '@/services/simpleAutocompleteService'
import { GeolocationService } from '@/services/geolocation'
import { useSidebar } from '@/composables/useSidebar'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'

// Servicio híbrido simplificado
const hybridService = new SimpleHybridService()

// Servicio de autocompletado
const autocompleteService = new SimpleAutocompleteService()
const geolocationService = new GeolocationService()

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
const searchResults = ref<SearchResult[]>([])
const isSearching = ref(false)
const hasSearched = ref(false)

// Autocompletado
const originSuggestions = ref<AutocompleteSuggestion[]>([])
const destinationSuggestions = ref<AutocompleteSuggestion[]>([])
const isLoadingOrigin = ref(false)
const isLoadingDestination = ref(false)

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

// Funciones de autocompletado
const handleOriginInput = async (value: string) => {
  if (value.length >= 2) {
    try {
      // Intentar usar Google Places API primero
      const googleResults = await geolocationService.autocompleteAddress(value)
      if (googleResults.length > 0) {
        originSuggestions.value = googleResults
        return
      }
    } catch (error) {
      console.warn('Google Places API falló, usando fallback:', error)
    }
    
    // Fallback a servicio simple
    originSuggestions.value = autocompleteService.searchSuggestions(value, 8)
  } else {
    originSuggestions.value = []
  }
}

const handleDestinationInput = async (value: string) => {
  if (value.length >= 2) {
    try {
      // Intentar usar Google Places API primero
      const googleResults = await geolocationService.autocompleteAddress(value)
      if (googleResults.length > 0) {
        destinationSuggestions.value = googleResults
        return
      }
    } catch (error) {
      console.warn('Google Places API falló, usando fallback:', error)
    }
    
    // Fallback a servicio simple
    destinationSuggestions.value = autocompleteService.searchSuggestions(value, 8)
  } else {
    destinationSuggestions.value = []
  }
}

const handleOriginSelect = (suggestion: AutocompleteSuggestion) => {
  searchForm.origin = suggestion.name
  originSuggestions.value = []
  console.log('Origen seleccionado:', suggestion)
}

const handleDestinationSelect = (suggestion: AutocompleteSuggestion) => {
  searchForm.destination = suggestion.name
  destinationSuggestions.value = []
  console.log('Destino seleccionado:', suggestion)
}

// Selección desde listas predefinidas
const selectOriginFromList = (city: string) => {
  searchForm.origin = city
  originSuggestions.value = []
}

const selectDestinationFromList = (destination: string) => {
  searchForm.destination = destination
  destinationSuggestions.value = []
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
    console.log('🔍 Iniciando búsqueda híbrida...', searchForm)
    
    const results = await hybridService.searchTrips({
      origin: searchForm.origin,
      destination: searchForm.destination,
      date: searchForm.date,
      time: searchForm.time,
      tripType: searchForm.tripType,
      maxPrice: searchForm.maxPrice ? parseFloat(searchForm.maxPrice) : undefined,
      seats: searchForm.seats ? parseInt(searchForm.seats) : 1
    })

    console.log('✅ Búsqueda completada:', results)
    searchResults.value = results
  } catch (error) {
    console.error('❌ Error en la búsqueda:', error)
    alert('Error al buscar viajes. Inténtalo de nuevo.')
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}
</script>

<style scoped>
/* Estilos específicos para la nueva página de búsqueda */
.new-search-page {
  /* Asegurar que no hay interferencia de CSS global */
}

.new-search-page .grid {
  /* Forzar el comportamiento del grid */
  display: grid !important;
}

.new-search-page .grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
}

.new-search-page .grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
}

.new-search-page .grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
}

.new-search-page .grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
}

.new-search-page .gap-3 {
  gap: 0.75rem !important;
}

.new-search-page .gap-4 {
  gap: 1rem !important;
}

.new-search-page .gap-6 {
  gap: 1.5rem !important;
}

.new-search-page .p-4 {
  padding: 1rem !important;
}

.new-search-page .p-6 {
  padding: 1.5rem !important;
}

.new-search-page .px-3 {
  padding-left: 0.75rem !important;
  padding-right: 0.75rem !important;
}

.new-search-page .px-5 {
  padding-left: 1.25rem !important;
  padding-right: 1.25rem !important;
}

.new-search-page .py-2 {
  padding-top: 0.5rem !important;
  padding-bottom: 0.5rem !important;
}

.new-search-page .py-3 {
  padding-top: 0.75rem !important;
  padding-bottom: 0.75rem !important;
}

.new-search-page .mb-4 {
  margin-bottom: 1rem !important;
}

.new-search-page .mb-6 {
  margin-bottom: 1.5rem !important;
}

/* Responsive overrides */
@media (min-width: 640px) {
  .new-search-page .sm\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
  
  .new-search-page .sm\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  }
  
  .new-search-page .sm\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  }
  
  .new-search-page .sm\:gap-3 {
    gap: 0.75rem !important;
  }
  
  .new-search-page .sm\:px-3 {
    padding-left: 0.75rem !important;
    padding-right: 0.75rem !important;
  }
  
  .new-search-page .sm\:px-5 {
    padding-left: 1.25rem !important;
    padding-right: 1.25rem !important;
  }
  
  .new-search-page .sm\:py-2 {
    padding-top: 0.5rem !important;
    padding-bottom: 0.5rem !important;
  }
  
  .new-search-page .sm\:py-3 {
    padding-top: 0.75rem !important;
    padding-bottom: 0.75rem !important;
  }
  
  .new-search-page .sm\:mb-4 {
    margin-bottom: 1rem !important;
  }
  
  .new-search-page .sm\:mb-6 {
    margin-bottom: 1.5rem !important;
  }
}

@media (min-width: 768px) {
  .new-search-page .md\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  }
  
  .new-search-page .md\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  }
}

@media (min-width: 1024px) {
  .new-search-page .lg\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  }
  
  .new-search-page .lg\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  }
  
  .new-search-page .lg\:col-span-1 {
    grid-column: span 1 / span 1 !important;
  }
  
  .new-search-page .lg\:col-span-2 {
    grid-column: span 2 / span 2 !important;
  }
}
</style>
