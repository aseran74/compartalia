<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <img src="/images/logo/Compartalia2.png" alt="Compartalia Logo" class="h-8 w-auto object-contain" />
          </div>
          
          <!-- Navbar dinámica basada en el estado de autenticación -->
          <div class="flex items-center space-x-4">
            <router-link to="/" class="text-gray-600 hover:text-green-600 font-medium">
              Inicio
            </router-link>
            
            <!-- Debug info (temporal) -->
            <div v-if="user" class="text-xs text-gray-500 mr-4">
              Debug: {{ user.email }} | {{ userProfile?.name || 'Sin perfil' }}
            </div>
            
            <!-- Si el usuario está logueado -->
            <div v-if="user" class="flex items-center space-x-4">
              <router-link to="/dashboard" class="text-gray-600 hover:text-green-600 font-medium">
                Dashboard
              </router-link>
              <router-link to="/carpooling/buscar-viajes-hibrido" class="text-gray-600 hover:text-green-600 font-medium">
                Búsqueda Avanzada
              </router-link>
              
              <!-- Dropdown del perfil -->
              <div class="relative">
                <button
                  @click="toggleProfileDropdown"
                  class="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors"
                >
                  <img
                    :src="userProfile?.avatar_url || '/images/user/user-01.jpg'"
                    :alt="userProfile?.name || 'Usuario'"
                    class="h-8 w-8 rounded-full object-cover"
                  />
                  <span class="font-medium">{{ userProfile?.name || 'Usuario' }}</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                <!-- Dropdown menu -->
                <div
                  v-if="showProfileDropdown"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                >
                  <div class="py-2">
                    <div class="px-4 py-2 border-b border-gray-100">
                      <p class="text-sm font-medium text-gray-900">{{ userProfile?.name || 'Usuario' }}</p>
                      <p class="text-xs text-gray-500">{{ userProfile?.email || user?.email }}</p>
                    </div>
                    <router-link
                      to="/profile"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      @click="closeProfileDropdown"
                    >
                      👤 Mi Perfil
                    </router-link>
                    <router-link
                      to="/dashboard"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      @click="closeProfileDropdown"
                    >
                      📊 Dashboard
                    </router-link>
                    <router-link
                      to="/carpooling/my-trips"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      @click="closeProfileDropdown"
                    >
                      🚗 Mis Viajes
                    </router-link>
                    <div class="border-t border-gray-100"></div>
                    <button
                      @click="handleLogout"
                      class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      🚪 Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Si el usuario NO está logueado -->
            <div v-else class="flex items-center space-x-4">
              <router-link to="/login" class="text-gray-600 hover:text-green-600 font-medium">
                Iniciar Sesión
              </router-link>
              <router-link to="/register" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                Registrarse
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
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
      <div class="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 class="text-xl font-semibold mb-4">📝 Información del Viaje</h2>
        
        <form @submit.prevent="searchTrips" class="space-y-4 sm:space-y-6">
          <!-- Origen -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">📍 Origen</label>
            
            <!-- Opciones predefinidas -->
            <div class="mb-3">
              <p class="text-sm text-gray-600 mb-2">Ciudades del extrarradio de Madrid:</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                <button
                  v-for="city in madridCities.slice(0, 16)"
                  :key="city.name"
                  @click="selectPredefinedOrigin(city)"
                  type="button"
                  class="text-xs px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 hover:bg-green-100 text-gray-700 rounded-lg transition-colors"
                >
                  {{ city.name.split(',')[0] }}
                </button>
              </div>
            </div>
            
            <!-- Input de origen -->
            <AutocompleteInput
              v-model="searchForm.origin"
              placeholder="Escribe tu ciudad de origen..."
              :suggestions="originSuggestions"
              :is-loading="isLoadingOrigin"
              @input="handleOriginInput"
              @select="handleOriginSelect"
              input-class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <!-- Destino -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">🎯 Destino</label>
            
            <!-- Opciones predefinidas -->
            <div class="mb-3">
              <p class="text-sm text-gray-600 mb-2">Destinos populares en Madrid:</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                <button
                  v-for="destination in madridDestinations"
                  :key="destination.name"
                  @click="selectPredefinedDestination(destination)"
                  type="button"
                  class="text-xs px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 hover:bg-green-100 text-gray-700 rounded-lg transition-colors"
                >
                  {{ destination.name }}
                </button>
              </div>
            </div>
            
            <!-- Input de destino -->
            <AutocompleteInput
              v-model="searchForm.destination"
              placeholder="Escribe tu destino en Madrid..."
              :suggestions="destinationSuggestions"
              :is-loading="isLoadingDestination"
              @input="handleDestinationInput"
              @select="handleDestinationSelect"
              input-class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <!-- Fecha y Hora -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700 mb-2">📅 Fecha</label>
              <DatePicker
                v-model="searchForm.date"
                :min-date="today"
                placeholder="Selecciona la fecha del viaje"
              />
            </div>
            
            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700 mb-2">🕐 Hora</label>
              <input
                v-model="searchForm.time"
                type="time"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Botón de búsqueda -->
          <div class="text-center">
            <button
              type="submit"
              :disabled="isSearching"
              class="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium transition-colors"
            >
              <span v-if="isSearching">🔍 Buscando...</span>
              <span v-else>🚗 Buscar Viajes</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Resultados -->
      <div v-if="hasSearched" class="bg-white rounded-lg shadow-lg p-6">
        <h3 class="text-xl font-semibold mb-4">
          {{ searchResults.length > 0 ? `Encontrados ${searchResults.length} viajes` : 'No se encontraron viajes' }}
        </h3>
        
        <div v-if="searchResults.length > 0" class="space-y-4">
          <div
            v-for="result in searchResults"
            :key="result.trip.id"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-2">
                  <span class="text-sm font-medium text-gray-500">📍</span>
                  <span class="font-medium">{{ result.trip.origin_name }}</span>
                  <span class="text-gray-400">→</span>
                  <span class="font-medium">{{ result.trip.destination_name }}</span>
                </div>
                
                <div class="flex items-center space-x-4 text-sm text-gray-600">
                  <span>🕐 {{ formatTime(result.trip.departure_time) }}</span>
                  <span>💰 {{ result.trip.price_per_seat }}€/asiento</span>
                  <span>🪑 {{ result.trip.available_seats }} asientos</span>
                  <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {{ getTripTypeLabel(result.trip) }}
                  </span>
                </div>
                
                <div v-if="result.distance" class="text-xs text-gray-500 mt-1">
                  📏 Distancia: {{ result.distance.toFixed(1) }} km
                </div>
              </div>
              
              <div class="ml-4">
                <button
                  @click="contactDriver(result.trip)"
                  class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm transition-colors"
                >
                  Contactar
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8">
          <p class="text-gray-500 mb-4">No se encontraron viajes para tu búsqueda</p>
          <button
            @click="resetSearch"
            class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Nueva Búsqueda
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { HybridTripService, type SearchResult } from '@/services/hybridTripService'
import { supabase } from '@/config/supabase'
import type { User } from '@supabase/supabase-js'
import DatePicker from '@/components/DatePicker.vue'
import AutocompleteInput from '@/components/AutocompleteInput.vue'
import { SimpleAutocompleteService, type AutocompleteSuggestion } from '@/services/simpleAutocompleteService'
import { GeolocationService } from '@/services/geolocation'

// Formulario de búsqueda
const searchForm = reactive({
  origin: '',
  destination: '',
  date: '',
  time: ''
})

// Estados de la búsqueda
const searchResults = ref<SearchResult[]>([])
const isSearching = ref(false)
const hasSearched = ref(false)

// Estados de autenticación
const user = ref<User | null>(null)
const userProfile = ref<any>(null)
const showProfileDropdown = ref(false)

// Autocompletado
const originSuggestions = ref<AutocompleteSuggestion[]>([])
const destinationSuggestions = ref<AutocompleteSuggestion[]>([])
const isLoadingOrigin = ref(false)
const isLoadingDestination = ref(false)

// Fecha actual
const today = new Date().toISOString().split('T')[0]

// Servicio de búsqueda híbrida
const hybridService = new HybridTripService()

// Servicios de autocompletado
const autocompleteService = new SimpleAutocompleteService()
const geolocationService = new GeolocationService()

// Ciudades del extrarradio de Madrid
const madridCities = ref([
  { name: 'Alcalá de Henares, Madrid, España', lat: 40.4818, lng: -3.3641 },
  { name: 'Alcobendas, Madrid, España', lat: 40.5475, lng: -3.6420 },
  { name: 'Alcorcón, Madrid, España', lat: 40.3458, lng: -3.8249 },
  { name: 'Arganda del Rey, Madrid, España', lat: 40.3012, lng: -3.4373 },
  { name: 'Boadilla del Monte, Madrid, España', lat: 40.4057, lng: -3.8753 },
  { name: 'Collado Villalba, Madrid, España', lat: 40.6419, lng: -4.0089 },
  { name: 'Colmenar Viejo, Madrid, España', lat: 40.6592, lng: -3.7678 },
  { name: 'Coslada, Madrid, España', lat: 40.4238, lng: -3.5613 },
  { name: 'Fuenlabrada, Madrid, España', lat: 40.2839, lng: -3.7942 },
  { name: 'Getafe, Madrid, España', lat: 40.3047, lng: -3.7312 },
  { name: 'Leganés, Madrid, España', lat: 40.3275, lng: -3.7639 },
  { name: 'Móstoles, Madrid, España', lat: 40.3228, lng: -3.8647 },
  { name: 'Parla, Madrid, España', lat: 40.2375, lng: -3.7731 },
  { name: 'Rivas-Vaciamadrid, Madrid, España', lat: 40.3319, lng: -3.5206 },
  { name: 'San Sebastián de los Reyes, Madrid, España', lat: 40.5475, lng: -3.6250 },
  { name: 'Torrejón de Ardoz, Madrid, España', lat: 40.4594, lng: -3.4697 },
  { name: 'Valdemoro, Madrid, España', lat: 40.1908, lng: -3.6778 },
  { name: 'Villaviciosa de Odón, Madrid, España', lat: 40.3569, lng: -3.9006 }
])

// Destinos populares en Madrid
const madridDestinations = ref([
  { name: 'Puerta del Sol', lat: 40.4168, lng: -3.7038 },
  { name: 'Gran Vía', lat: 40.4194, lng: -3.7108 },
  { name: 'Chamartín', lat: 40.4720, lng: -3.6806 },
  { name: 'Atocha', lat: 40.4075, lng: -3.6917 },
  { name: 'Nuevos Ministerios', lat: 40.4459, lng: -3.6900 },
  { name: 'Plaza de Castilla', lat: 40.4669, lng: -3.6889 },
  { name: 'Moncloa', lat: 40.4350, lng: -3.7200 },
  { name: 'Plaza de España', lat: 40.4236, lng: -3.7122 },
  { name: 'AZCA', lat: 40.4459, lng: -3.6900 },
  { name: 'Cuatro Torres', lat: 40.4720, lng: -3.6806 },
  { name: 'Universidad Complutense', lat: 40.4459, lng: -3.7297 },
  { name: 'Hospital La Paz', lat: 40.4720, lng: -3.6806 },
  { name: 'Madrid Centro', lat: 40.4168, lng: -3.7038 },
  { name: 'Ciudad financiera Santander (Boadilla)', lat: 40.4057, lng: -3.8753 },
  { name: 'Ciudad financiera BBVA (Las Tablas)', lat: 40.5475, lng: -3.6420 }
])

// Funciones de selección
const selectPredefinedOrigin = (city: any) => {
  searchForm.origin = city.name
}

const selectPredefinedDestination = (destination: any) => {
  searchForm.destination = destination.name
}

// Función de búsqueda
const searchTrips = async () => {
  if (!searchForm.origin || !searchForm.destination) {
    alert('Por favor, completa todos los campos')
    return
  }

  isSearching.value = true
  hasSearched.value = true

  try {
    console.log('🔍 Iniciando búsqueda híbrida...')
    const results = await hybridService.searchTrips(
      searchForm.origin,
      searchForm.destination,
      true, // Usar geolocalización
      10   // Radio de 10km
    )
    
    searchResults.value = results
    console.log(`✅ Encontrados ${results.length} viajes`)
  } catch (error) {
    console.error('❌ Error al buscar viajes:', error)
    alert('Error al buscar viajes. Por favor, intenta de nuevo.')
  } finally {
    isSearching.value = false
  }
}

// Función para contactar conductor
const contactDriver = (trip: any) => {
  alert(
    `Para contactar con el conductor de este viaje, necesitas registrarte primero.\n\n` +
    `Viaje: ${trip.origin_name} → ${trip.destination_name}\n` +
    `Precio: ${trip.price_per_seat}€ por asiento\n` +
    `Asientos disponibles: ${trip.available_seats}`
  )
}

// Función para formatear tiempo
const formatTime = (time: string) => {
  return new Date(time).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Función para obtener etiqueta del tipo de viaje
const getTripTypeLabel = (trip: any) => {
  const routeData = trip.route_data || {}
  const pricingType = routeData.pricing_type || 'single'
  
  switch (pricingType) {
    case 'daily': return 'Diario'
    case 'weekly': return 'Semanal'
    case 'monthly': return 'Mensual'
    default: return 'Único'
  }
}

// Función para resetear búsqueda
const resetSearch = () => {
  searchForm.origin = ''
  searchForm.destination = ''
  searchForm.date = ''
  searchForm.time = ''
  searchResults.value = []
  hasSearched.value = false
}

// Funciones de autenticación
const checkAuth = async () => {
  try {
    console.log('🔍 Verificando autenticación...')
    const { data: { user: currentUser }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('❌ Error obteniendo usuario:', error)
      return
    }
    
    console.log('👤 Usuario actual:', currentUser)
    user.value = currentUser
    
    if (currentUser) {
      console.log('📋 Obteniendo perfil del usuario...')
      await fetchUserProfile(currentUser.id)
    } else {
      console.log('❌ No hay usuario logueado')
    }
  } catch (error) {
    console.error('❌ Error checking auth:', error)
  }
}

const fetchUserProfile = async (userId: string) => {
  try {
    console.log('📋 Buscando perfil para usuario:', userId)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('❌ Error obteniendo perfil:', error)
      // Si no existe el perfil, crear uno básico
      userProfile.value = {
        id: userId,
        name: user.value?.user_metadata?.name || user.value?.email?.split('@')[0] || 'Usuario',
        email: user.value?.email || '',
        avatar_url: user.value?.user_metadata?.avatar_url || null
      }
      return
    }
    
    console.log('✅ Perfil obtenido:', data)
    userProfile.value = data
  } catch (error) {
    console.error('❌ Error fetching profile:', error)
    // Fallback a datos básicos del usuario
    userProfile.value = {
      id: userId,
      name: user.value?.user_metadata?.name || user.value?.email?.split('@')[0] || 'Usuario',
      email: user.value?.email || '',
      avatar_url: user.value?.user_metadata?.avatar_url || null
    }
  }
}

// Funciones del dropdown del perfil
const toggleProfileDropdown = () => {
  showProfileDropdown.value = !showProfileDropdown.value
}

const closeProfileDropdown = () => {
  showProfileDropdown.value = false
}

const handleLogout = async () => {
  try {
    await supabase.auth.signOut()
    user.value = null
    userProfile.value = null
    showProfileDropdown.value = false
    console.log('Usuario deslogueado exitosamente')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}

// Cerrar dropdown al hacer click fuera
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showProfileDropdown.value = false
  }
}

// Variables para cleanup
let authSubscription: any = null

// Inicializar fecha actual y autenticación
onMounted(async () => {
  searchForm.date = today
  await checkAuth()
  
  // Escuchar cambios de autenticación
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔄 Cambio de autenticación:', event, session?.user?.email)
    
    if (event === 'SIGNED_IN' && session?.user) {
      console.log('✅ Usuario logueado:', session.user.email)
      user.value = session.user
      await fetchUserProfile(session.user.id)
    } else if (event === 'SIGNED_OUT') {
      console.log('❌ Usuario deslogueado')
      user.value = null
      userProfile.value = null
    } else if (event === 'TOKEN_REFRESHED' && session?.user) {
      console.log('🔄 Token refrescado para:', session.user.email)
      user.value = session.user
      if (!userProfile.value) {
        await fetchUserProfile(session.user.id)
      }
    }
  })
  
  authSubscription = subscription
  
  // Agregar listener para cerrar dropdown
  document.addEventListener('click', handleClickOutside)
})

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

// Cleanup
onUnmounted(() => {
  if (authSubscription) {
    authSubscription.unsubscribe()
  }
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Custom styles if needed */
</style>
