<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">🚗 Crear Viaje Mensual</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">📝 Información del Viaje</h2>
      
      <form @submit.prevent="createTrip" class="space-y-6">
        <!-- Información básica -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Origen -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">📍 Origen</label>
            <select v-model="tripForm.origin_name" @change="updateOriginCoords" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
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
            <select v-model="tripForm.destination_name" @change="updateDestinationCoords" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              <option value="">Selecciona destino</option>
              <option value="Madrid Centro">Madrid Centro</option>
              <option value="Chamartín, Madrid">Chamartín</option>
              <option value="Atocha, Madrid">Atocha</option>
              <option value="Nuevos Ministerios, Madrid">Nuevos Ministerios</option>
            </select>
          </div>

          <!-- Plazas disponibles -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">👥 Número de plazas</label>
            <input v-model.number="tripForm.available_seats" type="number" min="1" max="8" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>

          <!-- Precio mensual -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">💰 Precio mensual (€)</label>
            <input v-model.number="tripForm.monthly_price" type="number" min="0" step="10" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>

          <!-- Fecha de inicio -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">📅 Fecha de inicio</label>
            <input v-model="tripForm.start_date" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>

          <!-- Fecha de fin -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">📅 Fecha de fin (opcional)</label>
            <input v-model="tripForm.end_date" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <!-- Horarios normales -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Horario de ida -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">🕐 Horario de ida (normal)</label>
            <input v-model="tripForm.departure_time" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>

          <!-- Horario de regreso -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">🕐 Horario de regreso (normal)</label>
            <input v-model="tripForm.return_time" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
        </div>

        <!-- Días de la semana -->
        <div class="form-group mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-4">📅 Días de la semana activos</label>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <!-- Lunes -->
            <div class="flex items-center space-x-2">
              <input v-model="tripForm.days_enabled.monday" type="checkbox" class="rounded" />
              <label class="text-sm font-medium">Lunes</label>
            </div>

            <!-- Martes -->
            <div class="flex items-center space-x-2">
              <input v-model="tripForm.days_enabled.tuesday" type="checkbox" class="rounded" />
              <label class="text-sm font-medium">Martes</label>
            </div>

            <!-- Miércoles -->
            <div class="flex items-center space-x-2">
              <input v-model="tripForm.days_enabled.wednesday" type="checkbox" class="rounded" />
              <label class="text-sm font-medium">Miércoles</label>
            </div>

            <!-- Jueves -->
            <div class="flex items-center space-x-2">
              <input v-model="tripForm.days_enabled.thursday" type="checkbox" class="rounded" />
              <label class="text-sm font-medium">Jueves</label>
            </div>

            <!-- Viernes -->
            <div class="flex items-center space-x-2">
              <input v-model="tripForm.days_enabled.friday" type="checkbox" class="rounded" />
              <label class="text-sm font-medium">Viernes</label>
            </div>

            <!-- Sábado -->
            <div class="flex items-center space-x-2">
              <input v-model="tripForm.days_enabled.saturday" type="checkbox" class="rounded" />
              <label class="text-sm font-medium">Sábado</label>
            </div>

            <!-- Domingo -->
            <div class="flex items-center space-x-2">
              <input v-model="tripForm.days_enabled.sunday" type="checkbox" class="rounded" />
              <label class="text-sm font-medium">Domingo</label>
            </div>
          </div>
        </div>

        <!-- Horarios especiales -->
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-4">⭐ Horarios especiales por día</label>
          <p class="text-sm text-gray-600 mb-4">Marca los días que tienen horarios diferentes al normal</p>
          
          <!-- Debug: Mostrar estado actual -->
          <div class="mb-4 p-2 bg-yellow-100 rounded text-sm">
            <strong>Debug:</strong> Días habilitados: {{ Object.keys(tripForm.days_enabled).filter(day => tripForm.days_enabled[day as keyof typeof tripForm.days_enabled]).join(', ') }}
          </div>
          
          <div class="space-y-4">
            <!-- Lunes -->
            <div v-if="tripForm.days_enabled.monday" class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-gray-800">Lunes</h4>
                <label class="flex items-center">
                  <input v-model="tripForm.special_days.monday" type="checkbox" class="mr-2" />
                  <span class="text-sm text-orange-600">Horario especial</span>
                </label>
              </div>
              <div v-if="tripForm.special_days.monday" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Ida especial</label>
                  <input v-model="tripForm.special_departure_times.monday" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Regreso especial</label>
                  <input v-model="tripForm.special_return_times.monday" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
            </div>

            <!-- Martes -->
            <div v-if="tripForm.days_enabled.tuesday" class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-gray-800">Martes</h4>
                <label class="flex items-center">
                  <input v-model="tripForm.special_days.tuesday" type="checkbox" class="mr-2" />
                  <span class="text-sm text-orange-600">Horario especial</span>
                </label>
              </div>
              <div v-if="tripForm.special_days.tuesday" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Ida especial</label>
                  <input v-model="tripForm.special_departure_times.tuesday" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Regreso especial</label>
                  <input v-model="tripForm.special_return_times.tuesday" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
            </div>

            <!-- Miércoles -->
            <div v-if="tripForm.days_enabled.wednesday" class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-gray-800">Miércoles</h4>
                <label class="flex items-center">
                  <input v-model="tripForm.special_days.wednesday" type="checkbox" class="mr-2" />
                  <span class="text-sm text-orange-600">Horario especial</span>
                </label>
              </div>
              <div v-if="tripForm.special_days.wednesday" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Ida especial</label>
                  <input v-model="tripForm.special_departure_times.wednesday" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Regreso especial</label>
                  <input v-model="tripForm.special_return_times.wednesday" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
            </div>

            <!-- Jueves -->
            <div v-if="tripForm.days_enabled.thursday" class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-gray-800">Jueves</h4>
                <label class="flex items-center">
                  <input v-model="tripForm.special_days.thursday" type="checkbox" class="mr-2" />
                  <span class="text-sm text-orange-600">Horario especial</span>
                </label>
              </div>
              <div v-if="tripForm.special_days.thursday" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Ida especial</label>
                  <input v-model="tripForm.special_departure_times.thursday" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Regreso especial</label>
                  <input v-model="tripForm.special_return_times.thursday" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
            </div>

            <!-- Viernes (especial para la gente) -->
            <div v-if="tripForm.days_enabled.friday" class="border border-orange-200 rounded-lg p-4 bg-orange-50">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-gray-800">Viernes 🎉</h4>
                <label class="flex items-center">
                  <input v-model="tripForm.special_days.friday" type="checkbox" class="mr-2" />
                  <span class="text-sm text-orange-600 font-medium">Horario especial para salir temprano</span>
                </label>
              </div>
              <div v-if="tripForm.special_days.friday" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Ida especial</label>
                  <input v-model="tripForm.special_departure_times.friday" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Regreso especial</label>
                  <input v-model="tripForm.special_return_times.friday" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
            </div>

            <!-- Sábado -->
            <div v-if="tripForm.days_enabled.saturday" class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-gray-800">Sábado</h4>
                <label class="flex items-center">
                  <input v-model="tripForm.special_days.saturday" type="checkbox" class="mr-2" />
                  <span class="text-sm text-orange-600">Horario especial</span>
                </label>
              </div>
              <div v-if="tripForm.special_days.saturday" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Ida especial</label>
                  <input v-model="tripForm.special_departure_times.saturday" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Regreso especial</label>
                  <input v-model="tripForm.special_return_times.saturday" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
            </div>

            <!-- Domingo -->
            <div v-if="tripForm.days_enabled.sunday" class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-gray-800">Domingo</h4>
                <label class="flex items-center">
                  <input v-model="tripForm.special_days.sunday" type="checkbox" class="mr-2" />
                  <span class="text-sm text-orange-600">Horario especial</span>
                </label>
              </div>
              <div v-if="tripForm.special_days.sunday" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Ida especial</label>
                  <input v-model="tripForm.special_departure_times.sunday" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Regreso especial</label>
                  <input v-model="tripForm.special_return_times.sunday" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de acción rápida -->
        <div class="flex space-x-4">
          <button type="button" @click="setWeekdays" class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
            📅 Solo Lunes-Viernes
          </button>
          <button type="button" @click="setAllDays" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            📅 Todos los días
          </button>
          <button type="button" @click="setWeekends" class="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600">
            📅 Solo Fines de semana
          </button>
        </div>

        <!-- Descripción -->
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-2">📝 Descripción del viaje</label>
          <textarea v-model="tripForm.description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Describe tu viaje, rutas preferidas, características del vehículo, etc..."></textarea>
        </div>

        <!-- Botones de acción -->
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
import { supabase } from '@/config/supabase'

const loading = ref(false)
const logs = ref<string[]>([])

const tripForm = reactive({
  driver_id: 'driver-1', // ID temporal del conductor
  origin_name: '',
  origin_lat: 0,
  origin_lng: 0,
  destination_name: '',
  destination_lat: 0,
  destination_lng: 0,
  available_seats: 4,
  monthly_price: 320,
  start_date: '',
  end_date: '',
  description: '',
  
  // Horarios normales
  departure_time: '08:00',
  return_time: '18:00',
  
  // Días habilitados
  days_enabled: {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false
  },
  
  // Días con horarios especiales
  special_days: {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: true, // Viernes por defecto tiene horario especial
    saturday: false,
    sunday: false
  },
  
  // Horarios especiales de ida
  special_departure_times: {
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '17:30', // Viernes salir temprano
    saturday: '',
    sunday: ''
  },
  
  // Horarios especiales de regreso
  special_return_times: {
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '19:30', // Viernes regreso temprano
    saturday: '',
    sunday: ''
  }
})

// Coordenadas predefinidas
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
  'Nuevos Ministerios, Madrid': { lat: 40.4464, lng: -3.6893 }
}

function addLog(message: string) {
  logs.value.push(`[${new Date().toLocaleTimeString()}] ${message}`)
}

function updateOriginCoords() {
  const coords = coordinates[tripForm.origin_name as keyof typeof coordinates]
  if (coords) {
    tripForm.origin_lat = coords.lat
    tripForm.origin_lng = coords.lng
    addLog(`📍 Origen actualizado: ${tripForm.origin_name}`)
  }
}

function updateDestinationCoords() {
  const coords = coordinates[tripForm.destination_name as keyof typeof coordinates]
  if (coords) {
    tripForm.destination_lat = coords.lat
    tripForm.destination_lng = coords.lng
    addLog(`🎯 Destino actualizado: ${tripForm.destination_name}`)
  }
}

function setWeekdays() {
  tripForm.days_enabled = {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false
  }
  addLog('📅 Configurado: Solo días laborables')
}

function setAllDays() {
  tripForm.days_enabled = {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true
  }
  addLog('📅 Configurado: Todos los días')
}

function setWeekends() {
  tripForm.days_enabled = {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: true,
    sunday: true
  }
  addLog('📅 Configurado: Solo fines de semana')
}

async function createTrip() {
  if (!tripForm.origin_name || !tripForm.destination_name || !tripForm.start_date) {
    addLog('❌ Por favor, completa todos los campos obligatorios')
    return
  }

  // Verificar que al menos un día esté habilitado
  const hasEnabledDay = Object.values(tripForm.days_enabled).some(enabled => enabled)
  if (!hasEnabledDay) {
    addLog('❌ Debes seleccionar al menos un día de la semana')
    return
  }

  loading.value = true
  addLog('🚗 Iniciando creación de viaje mensual...')

  try {
    // Primero crear el conductor si no existe
    const { data: existingDriver } = await supabase
      .from('drivers')
      .select('id')
      .eq('id', tripForm.driver_id)
      .single()

    let driverId = tripForm.driver_id

    if (!existingDriver) {
      const { data: newDriver, error: driverError } = await supabase
        .from('drivers')
        .insert({
          id: tripForm.driver_id,
          name: 'Conductor Ejemplo',
          email: 'conductor@ejemplo.com',
          phone: '+34 600 000 000',
          rating: 4.5
        })
        .select()
        .single()

      if (driverError) {
        addLog(`❌ Error creando conductor: ${driverError.message}`)
        return
      }

      driverId = newDriver.id
      addLog(`✅ Conductor creado: ${driverId}`)
    }

    // Preparar horarios especiales (solo días marcados como especiales)
    const specialDepartureTimes: any = {};
    const specialReturnTimes: any = {};
    
    Object.keys(tripForm.special_days).forEach(day => {
      if (tripForm.special_days[day as keyof typeof tripForm.special_days]) {
        specialDepartureTimes[day] = tripForm.special_departure_times[day as keyof typeof tripForm.special_departure_times];
        specialReturnTimes[day] = tripForm.special_return_times[day as keyof typeof tripForm.special_return_times];
      }
    });

    // Crear el viaje mensual
    const tripData = {
      driver_id: driverId,
      origin_name: tripForm.origin_name,
      origin_lat: tripForm.origin_lat,
      origin_lng: tripForm.origin_lng,
      destination_name: tripForm.destination_name,
      destination_lat: tripForm.destination_lat,
      destination_lng: tripForm.destination_lng,
      available_seats: tripForm.available_seats,
      monthly_price: tripForm.monthly_price,
      start_date: tripForm.start_date,
      end_date: tripForm.end_date || null,
      description: tripForm.description,
      is_active: true,
      
      // Horarios normales
      departure_time: tripForm.departure_time,
      return_time: tripForm.return_time,
      
      // Solo incluir horarios de días habilitados
      monday_time: tripForm.days_enabled.monday ? tripForm.departure_time : null,
      tuesday_time: tripForm.days_enabled.tuesday ? tripForm.departure_time : null,
      wednesday_time: tripForm.days_enabled.wednesday ? tripForm.departure_time : null,
      thursday_time: tripForm.days_enabled.thursday ? tripForm.departure_time : null,
      friday_time: tripForm.days_enabled.friday ? tripForm.departure_time : null,
      saturday_time: tripForm.days_enabled.saturday ? tripForm.departure_time : null,
      sunday_time: tripForm.days_enabled.sunday ? tripForm.departure_time : null,
      
      // Horarios especiales
      special_departure_times: specialDepartureTimes,
      special_return_times: specialReturnTimes
    }

    const { data: trip, error: tripError } = await supabase
      .from('monthly_trips')
      .insert(tripData)
      .select()
      .single()

    if (tripError) {
      addLog(`❌ Error creando viaje: ${tripError.message}`)
      return
    }

    addLog(`✅ Viaje mensual creado exitosamente con ID: ${trip.id}`)
    addLog(`📍 Ruta: ${tripForm.origin_name} → ${tripForm.destination_name}`)
    addLog(`👥 Plazas: ${tripForm.available_seats}`)
    addLog(`💰 Precio mensual: €${tripForm.monthly_price}`)
    addLog('🎉 ¡Viaje mensual configurado correctamente!')

  } catch (error) {
    addLog(`❌ Error: ${error}`)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  tripForm.origin_name = ''
  tripForm.destination_name = ''
  tripForm.available_seats = 4
  tripForm.monthly_price = 320
  tripForm.start_date = ''
  tripForm.end_date = ''
  tripForm.description = ''
  
  // Resetear horarios normales
  tripForm.departure_time = '08:00'
  tripForm.return_time = '18:00'
  
  // Resetear días habilitados
  tripForm.days_enabled = {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false
  }
  
  // Resetear días especiales
  tripForm.special_days = {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: true, // Viernes por defecto
    saturday: false,
    sunday: false
  }
  
  // Resetear horarios especiales
  tripForm.special_departure_times = {
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '17:30',
    saturday: '',
    sunday: ''
  }
  
  tripForm.special_return_times = {
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '19:30',
    saturday: '',
    sunday: ''
  }
  
  logs.value = []
  addLog('🔄 Formulario limpiado')
}

// Establecer fecha por defecto
const today = new Date()
tripForm.start_date = today.toISOString().split('T')[0]
</script>
