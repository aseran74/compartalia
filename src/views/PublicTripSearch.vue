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
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <!-- Origen -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Origen
            </label>
            <input
              v-model="searchForm.origin"
              type="text"
              placeholder="Ej: Torrejón de Ardoz"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <!-- Destino -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Destino
            </label>
            <input
              v-model="searchForm.destination"
              type="text"
              placeholder="Ej: Madrid Centro"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <!-- Radio -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Radio de búsqueda
            </label>
            <select
              v-model="searchForm.radius"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="1">1 km</option>
              <option value="3">3 km</option>
              <option value="5">5 km</option>
              <option value="10">10 km</option>
            </select>
          </div>
        </div>

        <button
          @click="searchTrips"
          :disabled="isSearching"
          class="w-full md:w-auto bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
        >
          {{ isSearching ? 'Buscando...' : 'Buscar Viajes' }}
        </button>
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
import { ref, reactive } from 'vue'
import { supabase } from '@/config/supabase'
import { useToast } from '@/composables/useToast'

// Reactive data
const searchForm = reactive({
  origin: '',
  destination: '',
  radius: '3'
})

const searchResults = ref([])
const isSearching = ref(false)
const hasSearched = ref(false)

// Toast system
const { warning } = useToast()

// Mock data for demonstration
const mockTrips = [
  {
    id: '1',
    origin_name: 'Torrejón de Ardoz',
    destination_name: 'Madrid Centro',
    departure_time: '08:00',
    available_seats: 2,
    price_per_seat: 15,
    radius: 3,
    driver_name: 'María García',
    driver_rating: 4.8,
    driver_id: 'driver1'
  },
  {
    id: '2',
    origin_name: 'Alcalá de Henares',
    destination_name: 'Madrid Centro',
    departure_time: '08:30',
    available_seats: 1,
    price_per_seat: 18,
    radius: 5,
    driver_name: 'Carlos López',
    driver_rating: 4.9,
    driver_id: 'driver2'
  },
  {
    id: '3',
    origin_name: 'Getafe',
    destination_name: 'Madrid Centro',
    departure_time: '07:45',
    available_seats: 3,
    price_per_seat: 12,
    radius: 2,
    driver_name: 'Ana Martín',
    driver_rating: 4.7,
    driver_id: 'driver3'
  }
]

// Functions
const searchTrips = async () => {
  isSearching.value = true
  hasSearched.value = true
  
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Filter mock trips based on search criteria
    let filteredTrips = mockTrips.filter(trip => {
      const originMatch = !searchForm.origin || 
        trip.origin_name.toLowerCase().includes(searchForm.origin.toLowerCase())
      const destinationMatch = !searchForm.destination || 
        trip.destination_name.toLowerCase().includes(searchForm.destination.toLowerCase())
      const radiusMatch = trip.radius <= parseInt(searchForm.radius)
      
      return originMatch && destinationMatch && radiusMatch
    })
    
    searchResults.value = filteredTrips
  } catch (error) {
    console.error('Error searching trips:', error)
    searchResults.value = []
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

const resetSearch = () => {
  searchForm.origin = ''
  searchForm.destination = ''
  searchForm.radius = '3'
  searchResults.value = []
  hasSearched.value = false
}
</script>

<style scoped>
/* Custom styles if needed */
</style>
