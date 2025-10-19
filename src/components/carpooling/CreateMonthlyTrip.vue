<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">🚗 Crear Viaje Mensual</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">📝 Datos del Viaje</h2>
      
      <form @submit.prevent="createMonthlyTrip" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Origen -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">📍 Origen</label>
            <select v-model="tripForm.origin_name" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              <option value="">Selecciona origen</option>
              <option value="Torrejón de Ardoz, Madrid">Torrejón de Ardoz</option>
              <option value="Getafe, Madrid">Getafe</option>
              <option value="Alcorcón, Madrid">Alcorcón</option>
              <option value="Fuenlabrada, Madrid">Fuenlabrada</option>
              <option value="Rivas-Vaciamadrid, Madrid">Rivas-Vaciamadrid</option>
              <option value="Majadahonda, Madrid">Majadahonda</option>
              <option value="Pozuelo de Alarcón, Madrid">Pozuelo de Alarcón</option>
              <option value="Leganés, Madrid">Leganés</option>
              <option value="Móstoles, Madrid">Móstoles</option>
              <option value="Boadilla del Monte, Madrid">Boadilla del Monte</option>
              <option value="Las Rozas, Madrid">Las Rozas</option>
            </select>
          </div>

          <!-- Destino -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">🎯 Destino</label>
            <select v-model="tripForm.destination_name" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              <option value="">Selecciona destino</option>
              <option value="Madrid Centro">Madrid Centro</option>
              <option value="Chamartín, Madrid">Chamartín</option>
              <option value="Atocha, Madrid">Atocha</option>
              <option value="Nuevosaleza, Madrid">Nuevos Ministerios</option>
            </select>
          </div>

          <!-- Horario de salida -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">🕐 Hora de salida</label>
            <input v-model="tripForm.departure_time" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>

          <!-- Plazas disponibles -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">👥 Plazas disponibles</label>
            <input v-model.number="tripForm.available_seats" type="number" min="1" max="8" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>

          <!-- Precio por plaza -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">💰 Precio por plaza (€)</label>
            <input v-model.number="tripForm.price_per_seat" type="number" min="0" step="0.25" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>

          <!-- Precio mensual -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">📅 Precio mensual (€)</label>
            <input v-model.number="monthlyPrice" type="number" min="0" step="10" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>

          <!-- Días de la semana -->
          <div class="form-group md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">📆 Días de la semana</label>
            <div class="flex flex-wrap gap-2">
              <label v-for="day in daysOfWeek" :key="day.value" class="flex items-center">
                <input v-model="tripForm.days_of_week" :value="day.value" type="checkbox" class="mr-2" />
                <span class="text-sm">{{ day.label }}</span>
              </label>
            </div>
          </div>

          <!-- Fecha de inicio -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">📅 Fecha de inicio</label>
            <input v-model="startDate" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>

          <!-- Fecha de fin -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">📅 Fecha de fin</label>
            <input v-model="endDate" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>

          <!-- Descripción -->
          <div class="form-group md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">📝 Descripción</label>
            <textarea v-model="tripForm.description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Describe tu viaje..."></textarea>
          </div>
        </div>

        <div class="flex justify-end space-x-4">
          <button type="button" @click="resetForm" class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
            🔄 Limpiar
          </button>
          <button type="submit" :disabled="loading" class="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400">
            {{ loading ? '⏳ Creando...' : '🚗 Crear Viaje Mensual' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Logs -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">📝 Logs</h2>
      <div class="bg-gray-100 p-4 rounded max-h-96 overflow-auto">
        <div v-for="(log, index) in logs" :key="index" class="text-sm font-mono mb-1">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import MonthlyTripsService from '@/services/monthlyTripsService'

const loading = ref(false)
const logs = ref<string[]>([])

const tripForm = reactive({
  driver_id: '13f661f6-89d3-417a-a7d6-a2c725581369', // ID de conductor de ejemplo
  origin_name: '',
  destination_name: '',
  departure_time: '08:00',
  available_seats: 4,
  price_per_seat: 4.00,
  description: '',
  days_of_week: [1, 2, 3, 4, 5], // Lunes a Viernes por defecto
  status: 'active' as const
})

const monthlyPrice = ref(320)
const startDate = ref('2024-11-01')
const endDate = ref('2024-11-30')

const daysOfWeek = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' }
]

// Coordenadas predefinidas para cada ubicación
const coordinates = {
  'Torrejón de Ardoz, Madrid': { lat: 40.4594, lng: -3.4697 },
  'Getafe, Madrid': { lat: 40.3071, lng: -3.7332 },
  'Alcorcón, Madrid': { lat: 40.3478, lng: -3.8244 },
  'Fuenlabrada, Madrid': { lat: 40.2842, lng: -3.7942 },
  'Rivas-Vaciamadrid, Madrid': { lat: 40.3333, lng: -3.5333 },
  'Majadahonda, Madrid': { lat: 40.4738, lng: -3.8725 },
  'Pozuelo de Alarcón, Madrid': { lat: 40.4329, lng: -3.8146 },
  'Leganés, Madrid': { lat: 40.3277, lng: -3.7656 },
  'Móstoles, Madrid': { lat: 40.3222, lng: -3.8647 },
  'Boadilla del Monte, Madrid': { lat: 40.4069, lng: -3.8781 },
  'Las Rozas, Madrid': { lat: 40.4929, lng: -3.8739 },
  'Madrid Centro': { lat: 40.4168, lng: -3.7038 },
  'Chamartín, Madrid': { lat: 40.4740, lng: -3.6827 },
  'Atocha, Madrid': { lat: 40.4076, lng: -3.6900 },
  'Nuevosaleza, Madrid': { lat: 40.4464, lng: -3.6893 }
}

function addLog(message: string) {
  logs.value.push(`[${new Date().toLocaleTimeString()}] ${message}`)
}

async function createMonthlyTrip() {
  if (!tripForm.origin_name || !tripForm.destination_name) {
    addLog('❌ Por favor, completa origen y destino')
    return
  }

  loading.value = true
  addLog('🚗 Iniciando creación de viaje mensual...')

  try {
    // Obtener coordenadas
    const originCoords = coordinates[tripForm.origin_name as keyof typeof coordinates]
    const destinationCoords = coordinates[tripForm.destination_name as keyof typeof coordinates]

    if (!originCoords || !destinationCoords) {
      addLog('❌ No se encontraron coordenadas para la ubicación')
      return
    }

    const tripData = {
      ...tripForm,
      origin_lat: originCoords.lat,
      origin_lng: originCoords.lng,
      destination_lat: destinationCoords.lat,
      destination_lng: destinationCoords.lng
    }

    addLog(`📍 Origen: ${tripForm.origin_name}`)
    addLog(`🎯 Destino: ${tripForm.destination_name}`)
    addLog(`🕐 Hora: ${tripForm.departure_time}`)
    addLog(`👥 Plazas: ${tripForm.available_seats}`)
    addLog(`💰 Precio: €${tripForm.price_per_seat}`)
    addLog(`📅 Precio mensual: €${monthlyPrice.value}`)

    const result = await MonthlyTripsService.createMonthlyTrip(
      tripData,
      monthlyPrice.value,
      startDate.value,
      endDate.value
    )

    if (result) {
      addLog(`✅ Viaje mensual creado exitosamente con ID: ${result.id}`)
      addLog('🎉 ¡Viaje mensual configurado correctamente!')
    } else {
      addLog('❌ Error al crear el viaje mensual')
    }

  } catch (error) {
    addLog(`❌ Error: ${error}`)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  tripForm.origin_name = ''
  tripForm.destination_name = ''
  tripForm.departure_time = '08:00'
  tripForm.available_seats = 4
  tripForm.price_per_seat = 4.00
  tripForm.description = ''
  tripForm.days_of_week = [1, 2, 3, 4, 5]
  monthlyPrice.value = 320
  startDate.value = '2024-11-01'
  endDate.value = '2024-11-30'
  logs.value = []
  addLog('🔄 Formulario limpiado')
}
</script>
