<template>
  <div class="bg-white rounded-lg shadow-md p-6 mb-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">🔍 Filtros de Viajes</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Filtro por tipo de viaje -->
      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-2">🚗 Tipo de viaje</label>
        <select v-model="filters.tripType" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Todos los tipos</option>
          <option value="recurrent">🔄 Recurrente</option>
          <option value="weekly">📅 Semanal</option>
          <option value="monthly">📅 Mensual</option>
        </select>
      </div>

      <!-- Filtro por fecha de inicio -->
      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-2">📅 Fecha de inicio</label>
        <input v-model="filters.startDate" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <!-- Filtro por fecha de fin -->
      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-2">📅 Fecha de fin</label>
        <input v-model="filters.endDate" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
    </div>

    <!-- Botones de acción -->
    <div class="flex justify-between items-center mt-4">
      <button @click="clearFilters" class="px-4 py-2 text-gray-600 hover:text-gray-800">
        🗑️ Limpiar filtros
      </button>
      <button @click="applyFilters" class="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
        🔍 Aplicar filtros
      </button>
    </div>

    <!-- Resultados -->
    <div v-if="filteredTrips.length > 0" class="mt-6">
      <h4 class="text-md font-semibold text-gray-800 mb-3">
        📋 Viajes encontrados ({{ filteredTrips.length }})
      </h4>
      
      <div class="space-y-3">
        <div 
          v-for="trip in filteredTrips" 
          :key="trip.id"
          class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h5 class="font-semibold text-gray-900">{{ trip.origin_name }} → {{ trip.destination_name }}</h5>
              <p class="text-sm text-gray-600">
                🕐 {{ trip.departure_time }} | 
                👥 {{ trip.available_seats }} plazas | 
                💰 €{{ trip.price_per_seat }}/plaza
              </p>
              <p class="text-xs text-gray-500">
                📅 {{ formatDate(trip.start_date) }} - {{ formatDate(trip.end_date) }}
                <span v-if="trip.trip_type === 'monthly'"> | ⏱️ {{ trip.duration }} meses</span>
              </p>
            </div>
            <div class="flex space-x-2">
              <button @click="viewTrip(trip)" class="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                👁️ Ver
              </button>
              <button @click="reserveTrip(trip)" class="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200">
                🎫 Reservar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sin resultados -->
    <div v-else-if="hasSearched" class="mt-6 text-center py-8">
      <p class="text-gray-500">🔍 No se encontraron viajes con los filtros aplicados</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'

// Props
const props = defineProps<{
  trips: any[]
}>()

// Emits
const emit = defineEmits<{
  viewTrip: [trip: any]
  reserveTrip: [trip: any]
  filtersChanged: [filters: any]
}>()

// Estado reactivo
const filters = reactive({
  tripType: '',
  startDate: '',
  endDate: ''
})

const hasSearched = ref(false)

// Computed
const filteredTrips = computed(() => {
  if (!hasSearched.value) return []
  
  return props.trips.filter(trip => {
    // Filtro por tipo
    if (filters.tripType && trip.trip_type !== filters.tripType) {
      return false
    }
    
    // Filtro por fecha de inicio
    if (filters.startDate && trip.start_date < filters.startDate) {
      return false
    }
    
    // Filtro por fecha de fin
    if (filters.endDate && trip.end_date > filters.endDate) {
      return false
    }
    
    return true
  })
})

// Métodos
function clearFilters() {
  filters.tripType = ''
  filters.startDate = ''
  filters.endDate = ''
  hasSearched.value = false
  emit('filtersChanged', {})
}

function applyFilters() {
  hasSearched.value = true
  emit('filtersChanged', { ...filters })
}

function viewTrip(trip: any) {
  emit('viewTrip', trip)
}

function reserveTrip(trip: any) {
  emit('reserveTrip', trip)
}

function formatDate(dateString: string) {
  if (!dateString) return 'No especificado'
  
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }
  return date.toLocaleDateString('es-ES', options)
}

// Watchers
watch(filters, () => {
  if (hasSearched.value) {
    applyFilters()
  }
}, { deep: true })
</script>
