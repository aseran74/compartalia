<template>
  <div class="unified-trip-search">
    <!-- Formulario de búsqueda -->
    <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4">🔍 Buscar Viajes</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Fecha -->
        <div>
          <label class="block text-sm font-medium text-black dark:text-white mb-2">📅 Fecha</label>
          <input
            v-model="searchParams.date"
            type="date"
            class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            required
          />
        </div>

        <!-- Origen -->
        <div>
          <label class="block text-sm font-medium text-black dark:text-white mb-2">📍 Origen</label>
          <input
            v-model="searchParams.origin"
            type="text"
            placeholder="Ej: Getafe"
            class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
          />
        </div>

        <!-- Destino -->
        <div>
          <label class="block text-sm font-medium text-black dark:text-white mb-2">🎯 Destino</label>
          <input
            v-model="searchParams.destination"
            type="text"
            placeholder="Ej: Madrid Centro"
            class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
          />
        </div>

        <!-- Botón de búsqueda -->
        <div class="flex items-end">
          <button
            @click="searchTrips"
            :disabled="loading"
            class="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-center font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="loading" class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ loading ? 'Buscando...' : 'Buscar' }}</span>
          </button>
        </div>
      </div>

      <!-- Filtros adicionales -->
      <div class="mt-4 flex items-center gap-4">
        <label class="flex items-center gap-2">
          <input v-model="filters.showSingle" type="checkbox" class="rounded" />
          <span class="text-sm">🚗 Viajes únicos</span>
        </label>
        <label class="flex items-center gap-2">
          <input v-model="filters.showWeekly" type="checkbox" class="rounded" />
          <span class="text-sm">📅 Viajes semanales</span>
        </label>
        <label class="flex items-center gap-2">
          <input v-model="filters.showMonthly" type="checkbox" class="rounded" />
          <span class="text-sm">📅 Viajes mensuales</span>
        </label>
      </div>
    </div>

    <!-- Resultados -->
    <div v-if="searchPerformed">
      <!-- Sin resultados -->
      <div v-if="filteredTrips.length === 0" class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark text-center">
        <p class="text-gray-500 dark:text-gray-400">😔 No se encontraron viajes para esta búsqueda</p>
      </div>

      <!-- Lista de resultados -->
      <div v-else class="space-y-4">
        <div class="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h3 class="text-lg font-semibold mb-2">
            ✅ {{ filteredTrips.length }} viaje{{ filteredTrips.length !== 1 ? 's' : '' }} encontrado{{ filteredTrips.length !== 1 ? 's' : '' }}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Mostrando todos los tipos de viajes disponibles para {{ formatDate(searchParams.date) }}
          </p>
        </div>

        <!-- Tarjetas de viajes -->
        <div
          v-for="trip in filteredTrips"
          :key="trip.id"
          class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark hover:shadow-lg transition-shadow"
        >
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium" :class="getTripTypeClass(trip.trip_type)">
                  {{ getTripTypeLabel(trip.trip_type) }}
                </span>
                <span class="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  {{ trip.status === 'active' ? 'Activo' : trip.status }}
                </span>
              </div>
              
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="text-2xl">📍</span>
                  <div>
                    <p class="font-semibold text-black dark:text-white">{{ trip.origin_name }}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Origen</p>
                  </div>
                </div>
                
                <div class="flex items-center gap-2 pl-8">
                  <span class="text-gray-400">→</span>
                </div>
                
                <div class="flex items-center gap-2">
                  <span class="text-2xl">🎯</span>
                  <div>
                    <p class="font-semibold text-black dark:text-white">{{ trip.destination_name }}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Destino</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="text-right">
              <div class="text-3xl font-bold text-primary mb-1">
                {{ formatPrice(trip) }}€
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ getPriceLabel(trip) }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-stroke dark:border-strokedark">
            <div>
              <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">🕐 Horario</p>
              <p class="font-medium text-black dark:text-white">{{ getTripTime(trip) }}</p>
            </div>
            
            <div>
              <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">👥 Plazas</p>
              <p class="font-medium text-black dark:text-white">{{ trip.available_seats }} disponibles</p>
            </div>
            
            <div v-if="trip.trip_type !== 'single'">
              <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">📅 Período</p>
              <p class="font-medium text-black dark:text-white">
                {{ formatDateRange(trip.start_date, trip.end_date) }}
              </p>
            </div>
            
            <div v-if="trip.trip_type !== 'single'">
              <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">📆 Días</p>
              <p class="font-medium text-black dark:text-white">{{ getOperatingDays(trip) }}</p>
            </div>
          </div>

          <div v-if="trip.description" class="mt-4 pt-4 border-t border-stroke dark:border-strokedark">
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ trip.description }}</p>
          </div>

          <div class="mt-4 flex gap-3">
            <button
              @click="viewTripDetails(trip)"
              class="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-primary px-4 py-2 text-center font-medium text-primary hover:bg-primary hover:text-white transition-colors"
            >
              Ver detalles
            </button>
            <button
              @click="bookTrip(trip)"
              class="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-center font-medium text-white hover:bg-opacity-90"
            >
              Reservar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TripsService, { type Trip, type TripType } from '@/services/tripsService'

const loading = ref(false)
const searchPerformed = ref(false)
const trips = ref<Trip[]>([])

const searchParams = ref({
  date: new Date().toISOString().split('T')[0],
  origin: '',
  destination: ''
})

const filters = ref({
  showSingle: true,
  showWeekly: true,
  showMonthly: true
})

// Viajes filtrados según los checkboxes
const filteredTrips = computed(() => {
  return trips.value.filter(trip => {
    if (trip.trip_type === 'single' && !filters.value.showSingle) return false
    if (trip.trip_type === 'weekly' && !filters.value.showWeekly) return false
    if (trip.trip_type === 'monthly' && !filters.value.showMonthly) return false
    return true
  })
})

async function searchTrips() {
  if (!searchParams.value.date) {
    alert('Por favor, selecciona una fecha')
    return
  }

  loading.value = true
  searchPerformed.value = true

  try {
    console.log('🔍 Buscando viajes para:', searchParams.value)

    // TODO: Obtener coordenadas del origen y destino
    // Por ahora, buscar sin filtro de ubicación
    const results = await TripsService.searchTripsByDate({
      search_date: searchParams.value.date,
      radius_km: 50
    })

    trips.value = results
    console.log(`✅ Encontrados ${results.length} viajes`)

  } catch (error) {
    console.error('❌ Error buscando viajes:', error)
    alert('Error al buscar viajes. Por favor, inténtalo de nuevo.')
  } finally {
    loading.value = false
  }
}

function getTripTypeLabel(type: TripType): string {
  switch (type) {
    case 'single': return '🚗 Viaje Único'
    case 'weekly': return '📅 Viaje Semanal'
    case 'monthly': return '📅 Viaje Mensual'
    default: return type
  }
}

function getTripTypeClass(type: TripType): string {
  switch (type) {
    case 'single': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'weekly': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    case 'monthly': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function formatPrice(trip: Trip): string {
  if (trip.trip_type === 'single') {
    return trip.price_per_seat?.toFixed(2) || '0.00'
  }
  return trip.price_per_period?.toFixed(2) || trip.price_per_day?.toFixed(2) || '0.00'
}

function getPriceLabel(trip: Trip): string {
  if (trip.trip_type === 'single') {
    return 'por plaza'
  } else if (trip.trip_type === 'weekly') {
    return 'por semana'
  } else {
    return 'por mes'
  }
}

function getTripTime(trip: Trip): string {
  if (trip.trip_type === 'single') {
    const date = new Date(trip.departure_time)
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }
  
  // Para recurrentes, mostrar el primer horario disponible
  const times = [
    trip.monday_time,
    trip.tuesday_time,
    trip.wednesday_time,
    trip.thursday_time,
    trip.friday_time,
    trip.saturday_time,
    trip.sunday_time
  ].filter(Boolean)
  
  return times[0] || 'No especificado'
}

function getOperatingDays(trip: Trip): string {
  const days: string[] = []
  if (trip.monday_time) days.push('L')
  if (trip.tuesday_time) days.push('M')
  if (trip.wednesday_time) days.push('X')
  if (trip.thursday_time) days.push('J')
  if (trip.friday_time) days.push('V')
  if (trip.saturday_time) days.push('S')
  if (trip.sunday_time) days.push('D')
  
  return days.join(', ') || 'No especificado'
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate) return 'No especificado'
  
  const start = new Date(startDate)
  const startStr = start.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  
  if (!endDate) return `Desde ${startStr}`
  
  const end = new Date(endDate)
  const endStr = end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  
  return `${startStr} - ${endStr}`
}

function viewTripDetails(trip: Trip) {
  console.log('Ver detalles del viaje:', trip)
  // TODO: Implementar modal o navegación a detalles
  alert(`Detalles del viaje:\n\nOrigen: ${trip.origin_name}\nDestino: ${trip.destination_name}\nTipo: ${getTripTypeLabel(trip.trip_type)}`)
}

function bookTrip(trip: Trip) {
  console.log('Reservar viaje:', trip)
  // TODO: Implementar lógica de reserva
  alert(`Reservar viaje de ${trip.origin_name} a ${trip.destination_name}`)
}
</script>

<style scoped>
.unified-trip-search {
  @apply space-y-6;
}
</style>


