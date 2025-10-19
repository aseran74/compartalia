<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">🧪 Test Formulario</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">📝 Test de Horarios Especiales</h2>
      
      <!-- Horarios normales -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-2">🕐 Horario de ida (normal)</label>
          <input v-model="departureTime" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-2">🕐 Horario de regreso (normal)</label>
          <input v-model="returnTime" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <!-- Días de la semana -->
      <div class="form-group mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-4">📅 Días de la semana activos</label>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="flex items-center space-x-2">
            <input v-model="daysEnabled.monday" type="checkbox" class="rounded" />
            <label class="text-sm font-medium">Lunes</label>
          </div>
          <div class="flex items-center space-x-2">
            <input v-model="daysEnabled.tuesday" type="checkbox" class="rounded" />
            <label class="text-sm font-medium">Martes</label>
          </div>
          <div class="flex items-center space-x-2">
            <input v-model="daysEnabled.wednesday" type="checkbox" class="rounded" />
            <label class="text-sm font-medium">Miércoles</label>
          </div>
          <div class="flex items-center space-x-2">
            <input v-model="daysEnabled.thursday" type="checkbox" class="rounded" />
            <label class="text-sm font-medium">Jueves</label>
          </div>
          <div class="flex items-center space-x-2">
            <input v-model="daysEnabled.friday" type="checkbox" class="rounded" />
            <label class="text-sm font-medium">Viernes</label>
          </div>
          <div class="flex items-center space-x-2">
            <input v-model="daysEnabled.saturday" type="checkbox" class="rounded" />
            <label class="text-sm font-medium">Sábado</label>
          </div>
          <div class="flex items-center space-x-2">
            <input v-model="daysEnabled.sunday" type="checkbox" class="rounded" />
            <label class="text-sm font-medium">Domingo</label>
          </div>
        </div>
      </div>

      <!-- Horarios especiales -->
      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-4">⭐ Horarios especiales por día</label>
        <p class="text-sm text-gray-600 mb-4">Marca los días que tienen horarios diferentes al normal</p>
        
        <div class="space-y-4">
          <!-- Lunes -->
          <div v-if="daysEnabled.monday" class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-medium text-gray-800">Lunes</h4>
              <label class="flex items-center">
                <input v-model="specialDays.monday" type="checkbox" class="mr-2" />
                <span class="text-sm text-orange-600">Horario especial</span>
              </label>
            </div>
            <div v-if="specialDays.monday" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-gray-600 mb-1">Ida especial</label>
                <input v-model="specialDepartureTimes.monday" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1">Regreso especial</label>
                <input v-model="specialReturnTimes.monday" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>
          </div>

          <!-- Viernes (especial) -->
          <div v-if="daysEnabled.friday" class="border border-orange-200 rounded-lg p-4 bg-orange-50">
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-medium text-gray-800">Viernes 🎉</h4>
              <label class="flex items-center">
                <input v-model="specialDays.friday" type="checkbox" class="mr-2" />
                <span class="text-sm text-orange-600 font-medium">Horario especial para salir temprano</span>
              </label>
            </div>
            <div v-if="specialDays.friday" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-gray-600 mb-1">Ida especial</label>
                <input v-model="specialDepartureTimes.friday" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1">Regreso especial</label>
                <input v-model="specialReturnTimes.friday" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Debug Info -->
      <div class="mt-6 p-4 bg-gray-100 rounded-lg">
        <h3 class="font-medium mb-2">🔍 Debug Info:</h3>
        <pre class="text-sm">{{ JSON.stringify({
          departureTime,
          returnTime,
          daysEnabled,
          specialDays,
          specialDepartureTimes,
          specialReturnTimes
        }, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const departureTime = ref('08:00')
const returnTime = ref('18:00')

const daysEnabled = reactive({
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: false,
  sunday: false
})

const specialDays = reactive({
  monday: false,
  tuesday: false,
  wednesday: false,
  thursday: false,
  friday: true, // Viernes por defecto
  saturday: false,
  sunday: false
})

const specialDepartureTimes = reactive({
  monday: '',
  tuesday: '',
  wednesday: '',
  thursday: '',
  friday: '17:30',
  saturday: '',
  sunday: ''
})

const specialReturnTimes = reactive({
  monday: '',
  tuesday: '',
  wednesday: '',
  thursday: '',
  friday: '19:30',
  saturday: '',
  sunday: ''
})
</script>
