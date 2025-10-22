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
            <router-link to="/" class="text-gray-600 hover:text-green-600 font-medium">
              Inicio
            </router-link>
            <router-link to="/login" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
              Iniciar Sesión
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Busca viajes compartidos
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Encuentra viajes mensuales desde tu localidad a Madrid sin necesidad de registrarte
        </p>
      </div>

      <!-- Search Form -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4">📝 Información del Viaje</h2>
        
        <form @submit.prevent="searchTrips" class="space-y-6">
          <!-- Origen -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">📍 Origen</label>
            
            <!-- Opciones predefinidas -->
            <div class="mb-3">
              <p class="text-sm text-gray-600 mb-2">Ciudades del extrarradio de Madrid:</p>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  v-for="city in madridCities.slice(0, 16)"
                  :key="city.name"
                  @click="selectPredefinedOrigin(city)"
                  type="button"
                  class="px-3 py-2 text-sm bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {{ city.name.split(',')[0] }}
                </button>
              </div>
            </div>
            
            <!-- Búsqueda personalizada -->
            <div class="relative">
              <input
                v-model="userAddress"
                @input="searchOriginPlaces"
                @focus="showOriginSuggestions = true"
                @blur="hideOriginSuggestions"
                type="text"
                placeholder="O busca otra ciudad..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <!-- Sugerencias de origen -->
              <div v-if="showOriginSuggestions && originSuggestions.length > 0" class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <div
                  v-for="(suggestion, index) in originSuggestions"
                  :key="index"
                  @click="selectOriginPlace(suggestion)"
                  class="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div class="font-medium text-gray-900">{{ suggestion.main_text }}</div>
                  <div class="text-sm text-gray-600">{{ suggestion.secondary_text }}</div>
                </div>
              </div>
            </div>
            
            <!-- Ubicación exacta del origen -->
            <div class="mt-3">
              <label class="block text-sm font-medium text-gray-700 mb-2">📍 Ubicación exacta del origen</label>
              <input
                v-model="originExactLocation"
                type="text"
                placeholder="Ej: Estación de tren, centro comercial, parada de autobús..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Destino -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">🎯 Destino</label>
            
            <!-- Opciones predefinidas -->
            <div class="mb-3">
              <p class="text-sm text-gray-600 mb-2">Destinos populares en Madrid:</p>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                <button
                  v-for="destination in popularDestinations"
                  :key="destination.name"
                  @click="selectPredefinedDestination(destination)"
                  type="button"
                  class="px-3 py-2 text-sm bg-green-50 border border-green-200 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {{ destination.name }}
                </button>
              </div>
            </div>
            
            <!-- Búsqueda personalizada -->
            <div class="relative">
              <input
                v-model="destinationAddress"
                @input="searchDestinationPlaces"
                @focus="showDestinationSuggestions = true"
                @blur="hideDestinationSuggestions"
                type="text"
                placeholder="O busca otro destino específico..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <!-- Sugerencias de destino -->
              <div v-if="showDestinationSuggestions && destinationSuggestions.length > 0" class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <div
                  v-for="(suggestion, index) in destinationSuggestions"
                  :key="index"
                  @click="selectDestinationPlace(suggestion)"
                  class="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div class="font-medium text-gray-900">{{ suggestion.main_text }}</div>
                  <div class="text-sm text-gray-600">{{ suggestion.secondary_text }}</div>
                </div>
              </div>
            </div>
            
            <!-- Ubicación exacta del destino -->
            <div class="mt-3">
              <label class="block text-sm font-medium text-gray-700 mb-2">🎯 Ubicación exacta del destino</label>
              <input
                v-model="destinationExactLocation"
                type="text"
                placeholder="Ej: Oficina, universidad, centro comercial..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Fecha -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">📅 Fecha del viaje</label>
            <input
              v-model="searchForm.date"
              type="date"
              :min="today"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Hora -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">⏰ Hora del viaje</label>
            <input
              v-model="searchForm.time"
              type="time"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Botón de búsqueda -->
          <div class="flex justify-center">
            <button
              type="submit"
              :disabled="isSearching"
              class="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
            >
              {{ isSearching ? 'Buscando...' : '🔍 Buscar Viajes' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Results -->
      <div v-if="searchResults.length > 0" class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          Viajes encontrados ({{ searchResults.length }})
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="trip in searchResults"
            :key="trip.id"
            class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
          >
            <!-- Trip Header -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span class="text-green-600 font-bold">{{ trip.available_seats }}</span>
                </div>
                <div>
                  <p class="font-semibold text-gray-900">{{ trip.origin_name }}</p>
                  <p class="text-sm text-gray-600">{{ trip.destination_name }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold text-green-600">{{ trip.price_per_seat }}€</p>
                <p class="text-xs text-gray-500">por asiento</p>
              </div>
            </div>

            <!-- Trip Details -->
            <div class="space-y-2 mb-4">
              <div class="flex items-center text-sm text-gray-600">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {{ formatTime(trip.departure_time) }}
              </div>
              
              <div class="flex items-center text-sm text-gray-600">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                {{ trip.radius }} km de radio
              </div>
            </div>

            <!-- Driver Info -->
            <div class="border-t pt-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ trip.driver_name }}</p>
                    <div class="flex items-center">
                      <span class="text-yellow-400">★</span>
                      <span class="text-sm text-gray-600 ml-1">{{ trip.driver_rating }}</span>
                    </div>
                  </div>
                </div>
                <button
                  @click="contactDriver(trip)"
                  class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition"
                >
                  Contactar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-else-if="hasSearched && !isSearching" class="text-center py-12">
        <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No se encontraron viajes</h3>
        <p class="text-gray-600 mb-6">
          No hay viajes disponibles con los criterios de búsqueda seleccionados.
        </p>
        <button
          @click="resetSearch"
          class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
        >
          Nueva Búsqueda
        </button>
      </div>

      <!-- CTA Section -->
      <div v-if="searchResults.length > 0" class="bg-green-50 rounded-lg p-8 mt-12 text-center">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          ¿Quieres crear tu propio viaje?
        </h2>
        <p class="text-gray-600 mb-6">
          Regístrate gratis y comienza a compartir viajes o encuentra compañeros de viaje.
        </p>
        <div class="space-x-4">
          <router-link
            to="/register"
            class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition inline-block"
          >
            Regístrate Gratis
          </router-link>
          <router-link
            to="/login"
            class="border border-green-600 text-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition inline-block"
          >
            Iniciar Sesión
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { supabase } from '@/config/supabase'
import { useToast } from '@/composables/useToast'

// Formulario de búsqueda
const searchForm = reactive({
  origin: '',
  destination: '',
  date: '',
  time: ''
})

// Estados de la búsqueda
const searchResults = ref([])
const isSearching = ref(false)
const hasSearched = ref(false)

// Estados para autocompletado
const userAddress = ref('')
const destinationAddress = ref('')
const originExactLocation = ref('')
const destinationExactLocation = ref('')
const showOriginSuggestions = ref(false)
const showDestinationSuggestions = ref(false)
const originSuggestions = ref([])
const destinationSuggestions = ref([])

// Fecha actual
const today = new Date().toISOString().split('T')[0]

// Toast system
const { warning } = useToast()

// Ciudades del extrarradio de Madrid
const madridCities = ref([
  { name: 'Alcalá de Henares, Madrid, España', lat: 40.4818, lng: -3.3641 },
  { name: 'Alcobendas, Madrid, España', lat: 40.5475, lng: -3.6420 },
  { name: 'Alcorcón, Madrid, España', lat: 40.3458, lng: -3.8249 },
  { name: 'Arganda del Rey, Madrid, España', lat: 40.3012, lng: -3.4373 },
  { name: 'Boadilla del Monte, Madrid, España', lat: 40.4057, lng: -3.8753 },
  { name: 'Collado Villalba, Madrid, España', lat: 40.6444, lng: -4.0089 },
  { name: 'Fuenlabrada, Madrid, España', lat: 40.2842, lng: -3.7942 },
  { name: 'Getafe, Madrid, España', lat: 40.3048, lng: -3.7313 },
  { name: 'Leganés, Madrid, España', lat: 40.3280, lng: -3.7645 },
  { name: 'Móstoles, Madrid, España', lat: 40.3228, lng: -3.8647 },
  { name: 'Parla, Madrid, España', lat: 40.2361, lng: -3.7675 },
  { name: 'Pozuelo de Alarcón, Madrid, España', lat: 40.4329, lng: -3.8134 },
  { name: 'Rivas-Vaciamadrid, Madrid, España', lat: 40.3358, lng: -3.5167 },
  { name: 'San Sebastián de los Reyes, Madrid, España', lat: 40.5475, lng: -3.6420 },
  { name: 'Torrejón de Ardoz, Madrid, España', lat: 40.4569, lng: -3.4787 },
  { name: 'Valdemoro, Madrid, España', lat: 40.1908, lng: -3.6753 }
])

// Destinos populares en Madrid
const popularDestinations = ref([
  { name: 'Madrid Centro', lat: 40.4168, lng: -3.7038 },
  { name: 'Aeropuerto Madrid-Barajas', lat: 40.4839, lng: -3.5680 },
  { name: 'Estación Atocha', lat: 40.4078, lng: -3.6896 },
  { name: 'Estación Chamartín', lat: 40.4721, lng: -3.6822 },
  { name: 'Universidad Complutense', lat: 40.4499, lng: -3.7269 },
  { name: 'Hospital La Paz', lat: 40.4821, lng: -3.6819 },
  { name: 'Hospital Ramón y Cajal', lat: 40.4721, lng: -3.6822 },
  { name: 'Hospital Gregorio Marañón', lat: 40.4168, lng: -3.7038 },
  { name: 'Hospital Clínico San Carlos', lat: 40.4499, lng: -3.7269 },
  { name: 'Hospital 12 de Octubre', lat: 40.3833, lng: -3.7167 }
])

// Función para buscar lugares
const searchOriginPlaces = async () => {
  if (userAddress.value.length < 3) {
    originSuggestions.value = []
    return
  }

  try {
    const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(userAddress.value)}&apiKey=YOUR_API_KEY&filter=countrycode:es&limit=5`)
    const data = await response.json()
    originSuggestions.value = data.features || []
  } catch (error) {
    console.error('Error searching places:', error)
  }
}

const searchDestinationPlaces = async () => {
  if (destinationAddress.value.length < 3) {
    destinationSuggestions.value = []
    return
  }

  try {
    const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(destinationAddress.value)}&apiKey=YOUR_API_KEY&filter=countrycode:es&limit=5`)
    const data = await response.json()
    destinationSuggestions.value = data.features || []
  } catch (error) {
    console.error('Error searching places:', error)
  }
}

// Función para seleccionar origen predefinido
const selectPredefinedOrigin = (city: any) => {
  userAddress.value = city.name
  searchForm.origin = city.name
  originSuggestions.value = []
}

// Función para seleccionar destino predefinido
const selectPredefinedDestination = (destination: any) => {
  destinationAddress.value = destination.name
  searchForm.destination = destination.name
  destinationSuggestions.value = []
}

// Función para seleccionar lugar de origen
const selectOriginPlace = (suggestion: any) => {
  userAddress.value = suggestion.properties.formatted
  searchForm.origin = suggestion.properties.formatted
  originSuggestions.value = []
  showOriginSuggestions.value = false
}

// Función para seleccionar lugar de destino
const selectDestinationPlace = (suggestion: any) => {
  destinationAddress.value = suggestion.properties.formatted
  searchForm.destination = suggestion.properties.formatted
  destinationSuggestions.value = []
  showDestinationSuggestions.value = false
}

// Función para ocultar sugerencias de origen
const hideOriginSuggestions = () => {
  setTimeout(() => {
    showOriginSuggestions.value = false
  }, 200)
}

// Función para ocultar sugerencias de destino
const hideDestinationSuggestions = () => {
  setTimeout(() => {
    showDestinationSuggestions.value = false
  }, 200)
}

// Función para buscar viajes
const searchTrips = async () => {
  if (!searchForm.origin || !searchForm.destination) {
    warning('Por favor, completa todos los campos')
    return
  }

  isSearching.value = true
  hasSearched.value = true

  try {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        profiles:driver_id (
          name,
          email,
          phone,
          avatar_url
        )
      `)
      .ilike('origin_name', `%${searchForm.origin}%`)
      .ilike('destination_name', `%${searchForm.destination}%`)
      .eq('status', 'active')
      .gte('departure_time', new Date().toISOString())

    if (error) {
      console.error('Error searching trips:', error)
      warning('Error al buscar viajes')
      return
    }

    searchResults.value = data || []
  } catch (error) {
    console.error('Error:', error)
    warning('Error al buscar viajes')
  } finally {
    isSearching.value = false
  }
}

const contactDriver = (trip: any) => {
  warning(
    'Registro requerido',
    `Para contactar con ${trip.driver_name}, necesitas registrarte primero.`,
    {
      actions: [
        {
          label: 'Registrarse',
          class: 'bg-green-600 text-white hover:bg-green-700',
          action: () => {
            // Aquí podrías redirigir al registro
            console.log('Redirigir al registro')
          }
        },
        {
          label: 'Iniciar Sesión',
          class: 'bg-blue-600 text-white hover:bg-blue-700',
          action: () => {
            // Aquí podrías redirigir al login
            console.log('Redirigir al login')
          }
        }
      ],
      duration: 8000 // Más tiempo para que el usuario pueda leer las opciones
    }
  )
}

const formatTime = (time: string) => {
  return time
}

// Función huésped para resetear búsqueda
const resetSearch = () => {
  searchForm.origin = ''
  searchForm.destination = ''
  searchForm.date = ''
  searchForm.time = ''
  userAddress.value = ''
  destinationAddress.value = ''
  originExactLocation.value = ''
  destinationExactLocation.value = ''
  searchResults.value = []
  hasSearched.value = false
}

// Inicializar fecha actual
onMounted(() => {
  searchForm.date = today
})
</script>

<style scoped>
/* Custom styles if needed */
</style>
