<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">🚗 Crear Viajes de Ejemplo</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">📝 Crear Viajes Mensuales de Prueba</h2>
      
      <p class="text-gray-600 mb-4">
        Este componente creará viajes mensuales de ejemplo para diferentes zonas del extrarradio de Madrid.
        Incluye viajes desde Torrejón, Getafe, Alcorcón, Fuenlabrada y Rivas hacia Madrid Centro.
      </p>
      
      <button 
        @click="createSampleTrips"
        :disabled="loading"
        class="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-md font-medium"
      >
        {{ loading ? '⏳ Creando...' : '🚗 Crear Viajes de Ejemplo' }}
      </button>
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
import { ref } from 'vue'
import MonthlyTripsService from '@/services/monthlyTripsService'

const loading = ref(false)
const logs = ref<string[]>([])

function addLog(message: string) {
  logs.value.push(`[${new Date().toLocaleTimeString()}] ${message}`)
}

async function createSampleTrips() {
  loading.value = true
  logs.value = []
  
  try {
    addLog('🚗 Iniciando creación de viajes de ejemplo...')
    
    await MonthlyTripsService.createSampleMonthlyTrips()
    
    addLog('✅ Viajes de ejemplo creados exitosamente')
    addLog('🎉 ¡Ya puedes probar la búsqueda de viajes mensuales!')
    
  } catch (error) {
    addLog(`❌ Error: ${error}`)
  } finally {
    loading.value = false
  }
}
</script>
