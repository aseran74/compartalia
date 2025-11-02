<template>
  <div class="min-h-screen bg-gray-50 antialiased">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-8 pb-8 sm:pb-12">
      
      <!-- Botón para ir al inicio -->
      <div class="mb-6 sm:mb-8">
        <router-link 
          to="/"
          class="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors font-medium text-sm sm:text-base"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          <span>Volver al Inicio</span>
        </router-link>
      </div>

      <header class="text-center mb-10 sm:mb-14">
        <div class="max-w-3xl mx-auto">
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 sm:mb-4 leading-tight">
            🚀 <span class="text-green-600">Búsqueda Express</span><br class="sm:hidden" />
          </h1>
          <p class="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Solo elige tu destino. Nosotros detectamos tu ubicación automáticamente.
          </p>
        </div>
      </header>

      <div class="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 sm:p-8 mb-8 sm:mb-12 transition-all duration-300">
        
        <div class="flex items-center gap-3 mb-6">
          <div class="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900">Búsqueda Rápida</h2>
        </div>

        <!-- Estado de geolocalización -->
        <div v-if="isGettingLocation" class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div class="flex items-center gap-3">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span class="text-blue-800 font-medium">Detectando tu ubicación...</span>
          </div>
        </div>

        <div v-if="currentLocation" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <div class="flex-1">
              <span class="text-green-800 font-medium">Ubicación detectada:</span>
              <span class="text-green-700 ml-2">{{ currentLocationName }}</span>
            </div>
            <button
              @click="detectLocation"
              class="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
            >
              Actualizar
            </button>
          </div>
        </div>

        <div v-if="locationError" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-red-800 font-medium">{{ locationError }}</span>
            <button
              @click="detectLocation"
              class="ml-auto text-blue-600 hover:text-blue-800 text-sm font-medium underline"
            >
              Reintentar
            </button>
          </div>
        </div>

        <form @submit.prevent="searchTrips" class="space-y-6 sm:space-y-8">
          
          <div class="form-group">
            <label class="block text-sm sm:text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span class="text-xl">🎯</span>
              <span>Destino en Madrid</span>
            </label>
            
            <!-- Botones de destino predefinidos -->
            <div class="mb-4">
              <div class="text-xs text-gray-500 mb-2">Destinos populares:</div>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="dest in lugaresDestinoPopulares"
                  :key="dest"
                  type="button"
                  @click="searchForm.destination = dest"
                  class="px-4 py-2 rounded-full border transition-all text-sm font-medium"
                  :class="searchForm.destination === dest 
                    ? 'bg-green-500 text-white border-green-500 shadow-md' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:text-green-600'"
                >
                  {{ dest }}
                </button>
              </div>
            </div>

            <!-- Búsqueda por dirección exacta -->
            <AutocompleteInput
              v-model="searchForm.destination"
              placeholder="📍 Ej: Paseo de la Castellana, 1, Madrid"
              :suggestions="destinationSuggestions"
              :is-loading="isLoadingDestination"
              @input="handleDestinationInput"
              @select="handleDestinationSelect"
              input-class="w-full px-4 sm:px-4 py-4 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-base sm:text-sm min-h-[52px] sm:min-h-[44px]"
            />
          </div>

          <!-- Botón de búsqueda -->
          <div class="flex gap-4">
            <button
              type="submit"
              :disabled="!searchForm.destination || isSearching || !currentLocation"
              class="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 sm:py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] disabled:hover:scale-100 text-base sm:text-sm"
            >
              <span v-if="isSearching" class="flex items-center justify-center gap-2">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Buscando...
              </span>
              <span v-else>🔍 Buscar Viajes (15 km)</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Resultados -->
      <div v-if="hasSearched && searchResults.length > 0" class="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
        <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
          📋 Resultados ({{ searchResults.length }})
        </h3>
        
        <div class="space-y-4">
          <div 
            v-for="result in searchResults" 
            :key="result.trip.id"
            @click="goToTripDetails(result.trip.id)"
            class="bg-gray-50 hover:bg-gray-100 rounded-xl p-5 border border-gray-200 hover:border-green-400 transition-all cursor-pointer"
          >
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-green-600 font-bold">●</span>
                  <span class="font-semibold text-gray-900">{{ result.trip.origin_name }}</span>
                </div>
                <div class="flex items-center gap-3 mb-3">
                  <span class="text-red-600 font-bold">●</span>
                  <span class="font-semibold text-gray-900">{{ result.trip.destination_name }}</span>
                </div>
                <div class="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span v-if="result.distance" class="flex items-center gap-1">
                    📏 {{ result.distance.toFixed(1) }} km
                  </span>
                  <span class="flex items-center gap-1">
                    🪑 {{ getTotalSeats(result) }} asientos
                  </span>
                  <span class="flex items-center gap-1">
                    💰 {{ result.trip.price_per_seat?.toFixed(2) || '0.00' }}€
                  </span>
                </div>
              </div>
              <div class="flex-shrink-0">
                <span class="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold text-sm">
                  Ver Detalles →
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="hasSearched && searchResults.length === 0" class="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709"/>
        </svg>
        <p class="text-gray-600 font-medium">No se encontraron viajes en un radio de 15 km</p>
        <p class="text-gray-500 text-sm mt-2">Intenta ajustar tu ubicación o el destino</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { HybridTripService, type SearchResult } from '@/services/hybridTripService'
import { GeolocationService } from '@/services/geolocation'
import AutocompleteInput from '@/components/AutocompleteInput.vue'
import { SimpleAutocompleteService, type AutocompleteSuggestion } from '@/services/simpleAutocompleteService'

const router = useRouter()

// Estado del formulario
const searchForm = reactive({
  destination: ''
})

// Estado de la búsqueda
const searchResults = ref([])
const hasSearched = ref(false)
const isSearching = ref(false)

// Geolocalización
const currentLocation = ref(null)
const currentLocationName = ref('')
const isGettingLocation = ref(false)
const locationError = ref('')

// Autocompletado
const destinationSuggestions = ref([])
const isLoadingDestination = ref(false)

// Servicios
const hybridService = new HybridTripService()
const geolocationService = new GeolocationService()
const autocompleteService = new SimpleAutocompleteService()

// Destinos predefinidos
const lugaresDestinoPopulares = [
  'Sol', 
  'Atocha', 
  'Chamartín', 
  'Nuevos Ministerios', 
  'Moncloa',
  'Plaza de España',
  'Gran Vía',
  'Plaza de Castilla'
]

// Función para detectar ubicación (GPS primero, IP como fallback)
const detectLocation = async () => {
  isGettingLocation.value = true
  locationError.value = ''
  currentLocation.value = null
  
  try {
    // Intentar GPS primero
    const gpsLocation = await geolocationService.getCurrentLocation()
    
    if (gpsLocation && gpsLocation.coordinates) {
      console.log('✅ Ubicación GPS obtenida:', gpsLocation)
      currentLocation.value = gpsLocation
      currentLocationName.value = 'Mi ubicación actual (GPS)'
      return
    }
    
    // Si GPS falla, intentar por IP
    console.log('⚠️ GPS no disponible, intentando geolocalización por IP...')
    const ipLocation = await getLocationByIP()
    
    if (ipLocation) {
      currentLocation.value = ipLocation
      currentLocationName.value = `${ipLocation.name} (IP)`
      return
    }
    
    // Si ambos fallan
    locationError.value = 'No se pudo detectar tu ubicación. Por favor, permite el acceso a la ubicación o intenta más tarde.'
  } catch (error) {
    console.error('❌ Error detectando ubicación:', error)
    locationError.value = 'Error al detectar tu ubicación. Por favor, intenta de nuevo.'
  } finally {
    isGettingLocation.value = false
  }
}

// Función para obtener ubicación por IP
const getLocationByIP = async () => {
  try {
    // Usar un servicio gratuito de geolocalización por IP
    const response = await fetch('https://ipapi.co/json/')
    
    if (!response.ok) {
      throw new Error('Error en geolocalización por IP')
    }
    
    const data = await response.json()
    
    if (data.latitude && data.longitude) {
      return {
        id: 'ip_location',
        name: data.city || 'Tu ubicación',
        address: `${data.city || ''}, ${data.region || ''}, ${data.country_name || ''}`,
        coordinates: {
          lat: parseFloat(data.latitude),
          lng: parseFloat(data.longitude)
        },
        type: 'origin'
      }
    }
    
    return null
  } catch (error) {
    console.error('❌ Error obteniendo ubicación por IP:', error)
    return null
  }
}

// Funciones de autocompletado
const handleDestinationInput = async (value) => {
  if (value.length < 3) {
    destinationSuggestions.value = []
    return
  }
  
  isLoadingDestination.value = true
  try {
    const googleResults = await geolocationService.autocompleteAddress(value)
    if (googleResults.length > 0) {
      destinationSuggestions.value = googleResults.map(loc => ({
        name: loc.name || loc.address,
        description: loc.address || loc.name
      }))
      return
    }
  } catch (error) {
    console.warn('Google Places API falló, usando fallback:', error)
  }
  
  try {
    const results = autocompleteService.searchSuggestions(value)
    destinationSuggestions.value = results
  } catch (error) {
    console.error('Error en autocompletado:', error)
    destinationSuggestions.value = []
  } finally {
    isLoadingDestination.value = false
  }
}

const handleDestinationSelect = (suggestion) => {
  searchForm.destination = suggestion.name || suggestion.description
  destinationSuggestions.value = []
}

// Función de búsqueda
const searchTrips = async () => {
  if (!searchForm.destination || !currentLocation.value) {
    return
  }
  
  console.log('🔍 Búsqueda Express iniciada...', {
    origin: currentLocation.value.coordinates,
    destination: searchForm.destination
  })
  
  isSearching.value = true
  hasSearched.value = true
  
  try {
    // Obtener coordenadas del destino
    const destinationLocation = await geolocationService.geocodeAddress(searchForm.destination)
    
    if (!destinationLocation || !destinationLocation.coordinates) {
      console.error('❌ No se pudo geocodificar el destino')
      searchResults.value = []
      return
    }
    
    // Buscar viajes por proximidad geográfica desde la ubicación actual
    const originLat = currentLocation.value.coordinates.lat
    const originLng = currentLocation.value.coordinates.lng
    
    // Buscar viajes cerca del origen (15 km)
    const proximityResults = await searchByProximityWithDestination(
      originLat,
      originLng,
      destinationLocation.coordinates.lat,
      destinationLocation.coordinates.lng,
      15, // Radio de 15 km
      50 // Límite de resultados
    )
    
    console.log('✅ Búsqueda completada. Resultados encontrados:', proximityResults.length)
    searchResults.value = proximityResults
  } catch (error) {
    console.error('❌ Error en búsqueda:', error)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

// Función para buscar por proximidad con filtro de destino
const searchByProximityWithDestination = async (
  originLat, 
  originLng, 
  destLat, 
  destLng, 
  radiusKm, 
  limit
) => {
  try {
    // Importar el servicio de Supabase trips
    const supabaseTripsService = (await import('@/services/supabaseTrips')).default
    
    // Buscar viajes cerca del origen
    const matches = await supabaseTripsService.searchTripsByLocation(
      originLat,
      originLng,
      radiusKm
    )
    
    console.log(`📍 Encontrados ${matches.length} viajes cerca del origen`)
    
    // Filtrar por proximidad al destino también
    const filteredMatches = matches.filter(match => {
      // El formato retornado tiene origin y destination como objetos
      const tripDest = match.destination
      if (!tripDest) return false
      
      // Calcular distancia al destino del viaje desde el destino deseado
      const destDistance = calculateDistance(destLat, destLng, tripDest.lat, tripDest.lng)
      
      // Aceptar si el destino del viaje está a menos de 5 km del destino deseado
      return destDistance <= 5
    })
    
    console.log(`🎯 ${filteredMatches.length} viajes coinciden también con el destino`)
    
    // Convertir a SearchResult - necesitamos obtener los viajes completos desde monthly_trips
    // Ya que searchTripsByLocation solo retorna datos básicos de trips
    const { supabaseClean } = await import('@/config/supabaseClean')
    
    const tripIds = filteredMatches.map(m => m.id).filter(Boolean)
    if (tripIds.length === 0) {
      return []
    }
    
    // Obtener los viajes completos desde monthly_trips
    const { data: fullTrips, error } = await supabaseClean
      .from('monthly_trips')
      .select('*')
      .in('id', tripIds)
    
    if (error || !fullTrips) {
      console.error('Error obteniendo viajes completos:', error)
      // Usar los datos básicos que tenemos
      return filteredMatches.map(match => ({
        trip: {
          id: match.id,
          driver_id: '',
          vehicle_id: null,
          origin_name: match.origin?.name || '',
          origin_lat: match.origin?.lat || 0,
          origin_lng: match.origin?.lng || 0,
          destination_name: match.destination?.name || '',
          destination_lat: match.destination?.lat || 0,
          destination_lng: match.destination?.lng || 0,
          departure_time: match.departureTime || new Date().toISOString(),
          available_seats: match.availableSeats || 0,
          price_per_seat: match.pricePerSeat || 0,
          description: match.description || '',
          status: match.status || 'active',
          route_data: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        matchType: 'proximity',
        distance: 0,
        score: 0.8
      }))
    }
    
    // Mapear los viajes completos con los matches
    return fullTrips.map(trip => {
      const match = filteredMatches.find(m => m.id === trip.id)
      // Calcular distancia desde el origen del usuario hasta el origen del viaje
      const originDistance = calculateDistance(
        originLat,
        originLng,
        parseFloat(trip.origin_lat),
        parseFloat(trip.origin_lng)
      )
      return {
        trip: {
          id: trip.id,
          driver_id: trip.driver_id,
          vehicle_id: trip.vehicle_id,
          origin_name: trip.origin_name,
          origin_lat: parseFloat(trip.origin_lat),
          origin_lng: parseFloat(trip.origin_lng),
          destination_name: trip.destination_name,
          destination_lat: parseFloat(trip.destination_lat),
          destination_lng: parseFloat(trip.destination_lng),
          departure_time: trip.monday_time || trip.start_date || new Date().toISOString(),
          available_seats: trip.available_seats || 0,
          price_per_seat: parseFloat(trip.price_per_seat || 0),
          description: trip.description || '',
          status: trip.is_active ? 'active' : 'inactive',
          route_data: trip.route_data || null,
          created_at: trip.created_at || new Date().toISOString(),
          updated_at: trip.updated_at || new Date().toISOString()
        },
        matchType: 'proximity',
        distance: originDistance,
        score: 0.8
      }
    })
  } catch (error) {
    console.error('❌ Error en búsqueda por proximidad:', error)
    return []
  }
}

// Función para calcular distancia entre dos puntos (fórmula Haversine)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371 // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Función para obtener total de asientos
const getTotalSeats = (result) => {
  return result.bookingInfo?.total_seats ?? result.trip.available_seats ?? 0
}

// Navegar a detalles del viaje
const goToTripDetails = (tripId) => {
  router.push(`/viaje/${tripId}`)
}

// Detectar ubicación al montar el componente
onMounted(async () => {
  await detectLocation()
})
</script>

