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
                    <AutocompleteInput
                      v-model="searchForm.origin"
                      placeholder="📍 Ej: Calle Gran Vía, 1, Madrid"
                      :suggestions="originSuggestions"
                      :is-loading="isLoadingOrigin"
                      @input="handleOriginInput"
                      @select="handleOriginSelect"
                      input-class="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
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
                    <AutocompleteInput
                      v-model="searchForm.destination"
                      placeholder="📍 Ej: Plaza Mayor, Madrid"
                      :suggestions="destinationSuggestions"
                      :is-loading="isLoadingDestination"
                      @input="handleDestinationInput"
                      @select="handleDestinationSelect"
                      input-class="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
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
              
              <!-- Mapa de Google Maps -->
              <div class="h-96 rounded-lg overflow-hidden border border-stroke dark:border-strokedark">
                <div 
                  id="map" 
                  class="w-full h-full"
                  style="min-height: 384px;"
                ></div>
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
                    v-for="result in searchResults"
                    :key="result.trip.id"
                    class="rounded-lg border border-stroke p-3 hover:shadow-md transition-shadow dark:border-strokedark"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-xs font-medium text-primary">Diario</span>
                      <span class="text-sm font-bold text-black dark:text-white">{{ result.trip.price_per_seat }}€</span>
                    </div>
                    
                    <div class="space-y-1">
                      <div class="flex items-center text-xs text-body-color">
                        <svg class="h-3 w-3 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        {{ result.trip.origin_name }}
                      </div>
                      <div class="flex items-center text-xs text-body-color">
                        <svg class="h-3 w-3 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        {{ result.trip.destination_name }}
                      </div>
                    </div>
                    
                    <div class="mt-2 flex items-center justify-between">
                      <span class="text-xs text-body-color">{{ result.trip.departure_time }}</span>
                      <button class="text-xs text-primary hover:underline">
                        Ver en mapa
                      </button>
                    </div>
                    
                    <div v-if="result.trip.driver_id" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Conductor: {{ result.trip.driver_id }}
                    </div>
                    
                    <div v-if="result.trip.available_seats" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {{ result.trip.available_seats }} asientos disponibles
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
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { SimpleHybridService, type SearchResult } from '@/services/simpleHybridService'
import AutocompleteInput from '@/components/AutocompleteInput.vue'
import { SimpleAutocompleteService, type AutocompleteSuggestion } from '@/services/simpleAutocompleteService'
import { GeolocationService } from '@/services/geolocation'
import { useSidebar } from '@/composables/useSidebar'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'

// Declaraciones de tipos para Google Maps
declare global {
  interface Window {
    google: any;
  }
}

// Router y sidebar
const router = useRouter()
const { isExpanded } = useSidebar()

// Servicios
const hybridService = new SimpleHybridService()
const autocompleteService = new SimpleAutocompleteService()
const geolocationService = new GeolocationService()

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

// Mapa
const map = ref<any>(null)
const markers = ref<any[]>([])
const directionsService = ref<any>(null)
const directionsRenderer = ref<any>(null)

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

// Inicializar mapa
const initMap = () => {
  if (typeof window.google === 'undefined' || !window.google.maps) {
    console.error('Google Maps no está cargado')
    return
  }

  const mapElement = document.getElementById('map')
  if (!mapElement) {
    console.error('Elemento del mapa no encontrado')
    return
  }

  // Centro en Madrid
  const madrid = { lat: 40.4168, lng: -3.7038 }
  
  map.value = new window.google.maps.Map(mapElement, {
    zoom: 10,
    center: madrid,
    mapTypeId: window.google.maps.MapTypeId.ROADMAP,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  })

  directionsService.value = new window.google.maps.DirectionsService()
  directionsRenderer.value = new window.google.maps.DirectionsRenderer({
    draggable: false,
    suppressMarkers: true
  })
  
  directionsRenderer.value.setMap(map.value)
  
  console.log('✅ Mapa inicializado correctamente')
}

// Limpiar marcadores
const clearMarkers = () => {
  markers.value.forEach((marker: any) => marker.setMap(null))
  markers.value = []
}

// Añadir marcador (usando AdvancedMarkerElement si está disponible)
const addMarker = (position: { lat: number; lng: number }, title: string, color: string = '#3B82F6') => {
  if (!map.value) return

  // Intentar usar AdvancedMarkerElement si está disponible
  if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
    const marker = new window.google.maps.marker.AdvancedMarkerElement({
      position,
      map: map.value,
      title,
      content: createMarkerContent(color)
    })
    
    markers.value.push(marker)
    return marker
  } else {
    // Fallback a Marker tradicional
    const marker = new window.google.maps.Marker({
      position,
      map: map.value,
      title,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2
      }
    })

    markers.value.push(marker)
    return marker
  }
}

// Crear contenido HTML para AdvancedMarkerElement
const createMarkerContent = (color: string) => {
  const div = document.createElement('div')
  div.style.width = '16px'
  div.style.height = '16px'
  div.style.borderRadius = '50%'
  div.style.backgroundColor = color
  div.style.border = '2px solid #ffffff'
  div.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'
  return div
}

// Mostrar ruta en el mapa
const showRoute = (origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) => {
  if (!directionsService.value || !directionsRenderer.value) return

  directionsService.value.route({
    origin,
    destination,
    travelMode: window.google.maps.TravelMode.DRIVING
  }, (result: any, status: any) => {
    if (status === 'OK' && result) {
      directionsRenderer.value?.setDirections(result)
    } else {
      console.error('Error al calcular la ruta:', status)
    }
  })
}

// Actualizar mapa con resultados
const updateMapWithResults = () => {
  if (!map.value || searchResults.value.length === 0) return

  clearMarkers()
  
  // Añadir marcador de origen
  if (searchForm.origin) {
    // Usar coordenadas del primer resultado como ejemplo
    const firstResult = searchResults.value[0]
    if (firstResult) {
      addMarker(
        { lat: firstResult.trip.origin_lat, lng: firstResult.trip.origin_lng },
        `Origen: ${firstResult.trip.origin_name}`,
        '#10B981'
      )
    }
  }

  // Añadir marcador de destino
  if (searchForm.destination) {
    const firstResult = searchResults.value[0]
    if (firstResult) {
      addMarker(
        { lat: firstResult.trip.destination_lat, lng: firstResult.trip.destination_lng },
        `Destino: ${firstResult.trip.destination_name}`,
        '#EF4444'
      )
    }
  }

  // Añadir marcadores para todos los viajes
  searchResults.value.forEach((result, index) => {
    const color = index === 0 ? '#3B82F6' : '#6B7280'
    addMarker(
      { lat: result.trip.origin_lat, lng: result.trip.origin_lng },
      `${result.trip.origin_name} → ${result.trip.destination_name} (${result.trip.price_per_seat}€)`,
      color
    )
  })

  // Mostrar ruta si hay origen y destino
  if (searchForm.origin && searchForm.destination && searchResults.value.length > 0) {
    const firstResult = searchResults.value[0]
    showRoute(
      { lat: firstResult.trip.origin_lat, lng: firstResult.trip.origin_lng },
      { lat: firstResult.trip.destination_lat, lng: firstResult.trip.destination_lng }
    )
  }
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
    console.log('🔍 Iniciando búsqueda híbrida en mapa...', searchForm)
    
    const results = await hybridService.searchTrips(
      searchForm.origin,
      searchForm.destination,
      {
        useGeolocation: true,
        maxDistanceKm: 50,
        limit: 20
      }
    )

    console.log('✅ Búsqueda completada:', results)
    searchResults.value = results
    
    // Actualizar mapa con los resultados
    updateMapWithResults()
  } catch (error) {
    console.error('❌ Error en la búsqueda:', error)
    alert('Error al buscar viajes. Inténtalo de nuevo.')
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

// Inicializar mapa cuando el componente se monte
onMounted(async () => {
  // Esperar a que Google Maps esté disponible
  const checkGoogleMaps = () => {
    if (typeof window.google !== 'undefined' && window.google.maps) {
      nextTick(() => {
        initMap()
      })
    } else {
      setTimeout(checkGoogleMaps, 100)
    }
  }
  
  checkGoogleMaps()
})
</script>
