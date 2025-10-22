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
                  class="text-xs px-3 py-2 bg-gray-100 hover:bg-green-100 text-gray-700 rounded-lg transition-colors"
                >
                  {{ city.name.split(',')[0] }}
                </button>
              </div>
            </div>
            
            <!-- Input de origen -->
            <input
              v-model="searchForm.origin"
              type="text"
              placeholder="Escribe tu ciudad de origen..."
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <!-- Destino -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">🎯 Destino</label>
            
            <!-- Opciones predefinidas -->
            <div class="mb-3">
              <p class="text-sm text-gray-600 mb-2">Destinos populares en Madrid:</p>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  v-for="destination in madridDestinations.slice(0, 8)"
                  :key="destination.name"
                  @click="selectPredefinedDestination(destination)"
                  type="button"
                  class="text-xs px-3 py-2 bg-gray-100 hover:bg-green-100 text-gray-700 rounded-lg transition-colors"
                >
                  {{ destination.name }}
                </button>
              </div>
            </div>
            
            <!-- Input de destino -->
            <input
              v-model="searchForm.destination"
              type="text"
              placeholder="Escribe tu destino en Madrid..."
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <!-- Fecha y Hora -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700 mb-2">📅 Fecha</label>
              <input
                v-model="searchForm.date"
                type="date"
                :min="today"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
import { ref, reactive, onMounted } from 'vue'
import { HybridTripService, type SearchResult } from '@/services/hybridTripService'

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

// Fecha actual
const today = new Date().toISOString().split('T')[0]

// Servicio de búsqueda híbrida
const hybridService = new HybridTripService()

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
  { name: 'Madrid Centro', lat: 40.4168, lng: -3.7038 },
  { name: 'Ciudad financiera Santander (Boadilla)', lat: 40.4057, lng: -3.8753 },
  { name: 'Ciudad financiera BBVA (Las Tablas)', lat: 40.5475, lng: -3.6420 },
  { name: 'Aeropuerto Adolfo Suárez Madrid-Barajas', lat: 40.4983, lng: -3.5676 },
  { name: 'Estación de Atocha', lat: 40.4075, lng: -3.6917 },
  { name: 'Estación de Chamartín', lat: 40.4720, lng: -3.6806 },
  { name: 'Universidad Complutense', lat: 40.4459, lng: -3.7297 },
  { name: 'Hospital 12 de Octubre', lat: 40.3906, lng: -3.7000 }
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

// Inicializar fecha actual
onMounted(() => {
  searchForm.date = today
})
</script>

<style scoped>
/* Custom styles if needed */
</style>
