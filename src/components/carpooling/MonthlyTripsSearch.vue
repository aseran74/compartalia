<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">🚗 Viajes Mensuales por Zona</h1>
    
    <!-- Búsqueda -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">🔍 Buscar Viajes</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-2">📍 Tu ubicación</label>
          <input v-model="userLocation" type="text" placeholder="Ej: Getafe, Madrid" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-2">📏 Radio de búsqueda (km)</label>
          <select v-model="searchRadius" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="10">10 km</option>
            <option value="15">15 km</option>
            <option value="20">20 km</option>
            <option value="30">30 km</option>
          </select>
        </div>
        
        <div class="form-group flex items-end">
          <button @click="searchTrips" :disabled="loading" class="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md">
            {{ loading ? '⏳ Buscando...' : '🔍 Buscar Viajes' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Resultados agrupados por zona -->
    <div v-if="tripGroups.length > 0" class="space-y-6">
      <h2 class="text-2xl font-semibold mb-4">📍 Viajes Agrupados por Zona</h2>
      
      <div v-for="group in tripGroups" :key="group.zone" class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-blue-600">🏘️ {{ group.zone }}</h3>
          <div class="flex space-x-4 text-sm text-gray-600">
            <span>👥 {{ group.total_available_seats }} plazas</span>
            <span>💰 €{{ group.average_price.toFixed(2) }} promedio</span>
            <span>🕐 {{ group.time_range }}</span>
          </div>
        </div>

        <!-- Viajes individuales -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="trip in group.trips" :key="trip.id" class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start mb-2">
              <div>
                <h4 class="font-semibold text-gray-800">{{ trip.origin_name }}</h4>
                <p class="text-sm text-gray-600">→ {{ trip.destination_name }}</p>
              </div>
              <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                {{ trip.available_seats }} plazas
              </span>
            </div>
            
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">🕐 Salida:</span>
                <span class="font-medium">{{ trip.departure_time }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">💰 Precio:</span>
                <span class="font-medium">€{{ trip.price_per_seat }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">👤 Conductor:</span>
                <span class="font-medium">{{ trip.driver_name || 'Anónimo' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">⭐ Rating:</span>
                <span class="font-medium">{{ trip.driver_rating || 'N/A' }}</span>
              </div>
            </div>

            <!-- Viajes mensuales asociados -->
            <div v-if="group.monthly_trips.length > 0" class="mt-3 pt-3 border-t border-gray-100">
              <h5 class="text-sm font-medium text-gray-700 mb-2">📅 Opciones Mensuales:</h5>
              <div v-for="monthlyTrip in group.monthly_trips" :key="monthlyTrip.id" class="text-xs text-gray-600">
                <div class="flex justify-between">
                  <span>Precio mensual:</span>
                  <span class="font-medium text-blue-600">€{{ monthlyTrip.monthly_price }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Período:</span>
                  <span>{{ monthlyTrip.start_date }} - {{ monthlyTrip.end_date || 'Sin límite' }}</span>
                </div>
              </div>
            </div>

            <button class="w-full mt-3 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm">
              📅 Reservar Mensual
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Sin resultados -->
    <div v-else-if="hasSearched && !loading" class="bg-white rounded-lg shadow-md p-6 text-center">
      <div class="text-gray-500">
        <div class="text-6xl mb-4">😔</div>
        <h3 class="text-xl font-semibold mb-2">No se encontraron viajes</h3>
        <p class="text-gray-600 mb-4">Intenta ampliar el radio de búsqueda o busca en una zona diferente.</p>
        <div class="text-sm text-gray-500">
          <p>💡 Sugerencias:</p>
          <ul class="list-disc list-inside mt-2 space-y-1">
            <li>Aumenta el radio de búsqueda</li>
            <li>Verifica que la ubicación esté bien escrita</li>
            <li>Busca en zonas con más tráfico</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Logs -->
    <div class="bg-white rounded-lg shadow-md p-6 mt-6">
      <h2 class="text-xl font-semibold mb-4">📝 Logs de Debug</h2>
      <div class="bg-gray-100 p-4 rounded max-h-96 overflow-auto">
        <div v-for="(log, index) in logs" :key="index" class="text-sm font-mono mb-1">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MonthlyTripsService, { type TripGroup } from '@/services/monthlyTripsService'

const loading = ref(false)
const hasSearched = ref(false)
const logs = ref<string[]>([])
const tripGroups = ref<TripGroup[]>([])

const userLocation = ref('Madrid Centro')
const searchRadius = ref(15)

// Coordenadas predefinidas
const coordinates = {
  'Madrid Centro': { lat: 40.4168, lng: -3.7038 },
  'Getafe, Madrid': { lat: 40.3071, lng: -3.7332 },
  'Torrejón de Ardoz, Madrid': { lat: 40.4594, lng: -3.4697 },
  'Alcorcón, Madrid': { lat: 40.3478, lng: -3.8244 },
  'Fuenlabrada, Madrid': { lat: 40.2842, lng: -3.7942 },
  'Rivas-Vaciamadrid, Madrid': { lat: 40.3333, lng: -3.5333 },
  'Chamartín, Madrid': { lat: 40.4740, lng: -3.6827 }
}

function addLog(message: string) {
  logs.value.push(`[${new Date().toLocaleTimeString()}] ${message}`)
}

async function searchTrips() {
  if (!userLocation.value.trim()) {
    addLog('❌ Por favor, introduce tu ubicación')
    return
  }

  loading.value = true
  hasSearched.value = true
  tripGroups.value = []
  logs.value = []
  
  try {
    addLog('🔍 Iniciando búsqueda de viajes mensuales...')
    addLog(`📍 Ubicación: ${userLocation.value}`)
    addLog(`📏 Radio: ${searchRadius.value} km`)

    // Obtener coordenadas del usuario
    const userCoords = coordinates[userLocation.value as keyof typeof coordinates]
    if (!userCoords) {
      addLog('❌ Ubicación no encontrada. Usando Madrid Centro como fallback.')
      userCoords.lat = 40.4168
      userCoords.lng = -3.7038
    }

    addLog(`✅ Coordenadas: ${userCoords.lat}, ${userCoords.lng}`)

    // Buscar viajes agrupados por zona
    const groups = await MonthlyTripsService.searchMonthlyTripsByZone(
      userCoords.lat,
      userCoords.lng,
      searchRadius.value
    )

    tripGroups.value = groups

    if (groups.length > 0) {
      addLog(`✅ Encontrados ${groups.length} grupos de viajes`)
      groups.forEach((group, index) => {
        addLog(`🏘️ ${group.zone}: ${group.trips.length} viajes, ${group.total_available_seats} plazas`)
      })
    } else {
      addLog('❌ No se encontraron viajes en el área especificada')
    }

  } catch (error) {
    addLog(`❌ Error en la búsqueda: ${error}`)
  } finally {
    loading.value = false
  }
}
</script>
