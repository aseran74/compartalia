<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">
        🧪 Prueba de Conexión con Supabase
      </h1>

      <!-- Test Buttons -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold mb-4">Prueba de Conexión</h2>
          <button 
            @click="testConnection"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {{ loading ? 'Probando...' : 'Probar Conexión' }}
          </button>
          <div v-if="connectionResult" class="mt-4 p-4 rounded-lg" :class="connectionResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
            {{ connectionResult.message }}
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold mb-4">Prueba de Consulta</h2>
          <button 
            @click="testQuery"
            :disabled="loading"
            class="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {{ loading ? 'Consultando...' : 'Probar Consulta' }}
          </button>
          <div v-if="queryResult" class="mt-4 p-4 rounded-lg" :class="queryResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
            {{ queryResult.message }}
          </div>
        </div>
      </div>

      <!-- Results -->
      <div v-if="trips.length > 0" class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">Viajes Encontrados ({{ trips.length }})</h2>
        <div class="space-y-4">
          <div 
            v-for="trip in trips" 
            :key="trip.id"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-semibold text-gray-900">
                  {{ trip.origin_name }} → {{ trip.destination_name }}
                </h3>
                <p class="text-sm text-gray-600">
                  ID: {{ trip.id }}
                </p>
                <p class="text-sm text-gray-600">
                  Precio: {{ trip.price_per_seat }}€ | Asientos: {{ trip.available_seats }}
                </p>
              </div>
              <div class="text-right">
                <span class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  {{ trip.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Debug Info -->
      <div v-if="debugInfo" class="mt-8 bg-gray-100 rounded-lg p-6">
        <h3 class="text-lg font-semibold mb-4">Información de Debug</h3>
        <pre class="text-sm text-gray-700 whitespace-pre-wrap">{{ JSON.stringify(debugInfo, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { supabaseClean, testConnection as testSupabaseConnection } from '@/config/supabaseClean'

const loading = ref(false)
const connectionResult = ref<any>(null)
const queryResult = ref<any>(null)
const trips = ref<any[]>([])
const debugInfo = ref<any>(null)

const testConnection = async () => {
  loading.value = true
  connectionResult.value = null
  
  try {
    console.log('🔍 Probando conexión...')
    const isConnected = await testSupabaseConnection()
    
    connectionResult.value = {
      success: isConnected,
      message: isConnected ? '✅ Conexión exitosa' : '❌ Error de conexión'
    }
    
    debugInfo.value = {
      ...debugInfo.value,
      connectionTest: {
        success: isConnected,
        timestamp: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('Error en prueba de conexión:', error)
    connectionResult.value = {
      success: false,
      message: `❌ Error: ${error}`
    }
  } finally {
    loading.value = false
  }
}

const testQuery = async () => {
  loading.value = true
  queryResult.value = null
  trips.value = []
  
  try {
    console.log('🔍 Probando consulta...')
    
    const { data, error } = await supabaseClean
      .from('trips')
      .select('*')
      .eq('status', 'active')
      .limit(5)

    if (error) {
      console.error('Error en consulta:', error)
      queryResult.value = {
        success: false,
        message: `❌ Error de consulta: ${error.message}`
      }
    } else {
      console.log('✅ Consulta exitosa:', data)
      trips.value = data || []
      queryResult.value = {
        success: true,
        message: `✅ Consulta exitosa: ${data?.length || 0} viajes encontrados`
      }
      
      debugInfo.value = {
        ...debugInfo.value,
        queryTest: {
          success: true,
          resultsCount: data?.length || 0,
          timestamp: new Date().toISOString(),
          error: null
        }
      }
    }
  } catch (error) {
    console.error('Error en prueba de consulta:', error)
    queryResult.value = {
      success: false,
      message: `❌ Error: ${error}`
    }
    
    debugInfo.value = {
      ...debugInfo.value,
      queryTest: {
        success: false,
        error: error,
        timestamp: new Date().toISOString()
      }
    }
  } finally {
    loading.value = false
  }
}
</script>
