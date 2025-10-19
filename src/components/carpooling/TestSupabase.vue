<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">🧪 Test Supabase Directo</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-lg font-semibold mb-4">Prueba de función RPC</h2>
      
      <button 
        @click="testSupabaseFunction"
        :disabled="loading"
        class="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md"
      >
        {{ loading ? 'Probando...' : 'Probar find_nearby_trips' }}
      </button>
      
      <div v-if="result" class="mt-4">
        <h3 class="font-semibold mb-2">Resultado:</h3>
        <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto">{{ JSON.stringify(result, null, 2) }}</pre>
      </div>
      
      <div v-if="error" class="mt-4">
        <h3 class="font-semibold text-red-600 mb-2">Error:</h3>
        <pre class="bg-red-100 p-4 rounded text-sm overflow-auto">{{ error }}</pre>
      </div>
    </div>
    
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-lg font-semibold mb-4">Logs</h2>
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
import { supabase } from '../config/supabase'

const loading = ref(false)
const result = ref(null)
const error = ref(null)
const logs = ref<string[]>([])

function addLog(message: string) {
  logs.value.push(`[${new Date().toLocaleTimeString()}] ${message}`)
}

async function testSupabaseFunction() {
  loading.value = true
  result.value = null
  error.value = null
  logs.value = []
  
  try {
    addLog('🔍 Probando función find_nearby_trips...')
    
    const { data, error: supabaseError } = await supabase.rpc('find_nearby_trips', {
      user_lat: 40.4250,
      user_lng: -3.7300,
      radius_km: 1.0
    })
    
    if (supabaseError) {
      error.value = supabaseError
      addLog(`❌ Error de Supabase: ${JSON.stringify(supabaseError)}`)
    } else {
      result.value = data
      addLog(`✅ Función ejecutada correctamente`)
      addLog(`📋 Encontrados ${data?.length || 0} resultados`)
      
      if (data && data.length > 0) {
        data.forEach((item: any, index: number) => {
          addLog(`🚗 Resultado ${index + 1}: ${item.match_type} - ${item.match_distance} km`)
        })
      }
    }
    
  } catch (err) {
    error.value = err
    addLog(`❌ Error general: ${err}`)
  } finally {
    loading.value = false
  }
}
</script>
