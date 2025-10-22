<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <img src="/images/logo/Compartalia2.png" alt="Compartalia Logo" class="h-8 w-auto object-contain" />
            <h1 class="ml-4 text-2xl font-bold text-gray-900">Test Google Places API</h1>
          </div>
          <router-link to="/" class="text-gray-600 hover:text-green-600 font-medium">
            ← Volver al Inicio
          </router-link>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Status Section -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4">🔍 Estado de Google Places API</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-blue-50 p-4 rounded-lg">
            <h3 class="font-medium text-blue-900">API Key</h3>
            <p class="text-sm text-blue-700">
              {{ googlePlacesApiKey ? '✅ Configurada' : '❌ No configurada' }}
            </p>
          </div>
          <div class="bg-green-50 p-4 rounded-lg">
            <h3 class="font-medium text-green-900">Google Maps</h3>
            <p class="text-sm text-green-700">
              {{ isGoogleMapsLoaded ? '✅ Cargado' : '⏳ Cargando...' }}
            </p>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg">
            <h3 class="font-medium text-purple-900">Places Service</h3>
            <p class="text-sm text-purple-700">
              {{ isPlacesServiceReady ? '✅ Listo' : '⏳ Inicializando...' }}
            </p>
          </div>
        </div>

        <!-- Debug Info -->
        <div v-if="debugInfo" class="bg-gray-50 p-4 rounded-lg">
          <h4 class="font-medium text-gray-900 mb-2">Debug Info:</h4>
          <pre class="text-xs text-gray-600 overflow-auto">{{ JSON.stringify(debugInfo, null, 2) }}</pre>
        </div>
      </div>

      <!-- Autocomplete Test -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4">🔍 Test de Autocompletado</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Buscar ubicación en Madrid:
            </label>
            <input
              v-model="autocompleteInput"
              @input="handleAutocompleteInput"
              type="text"
              placeholder="Ej: Puerta del Sol, Madrid"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <!-- Autocomplete Results -->
          <div v-if="autocompleteResults.length > 0" class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-medium text-gray-900 mb-2">Resultados de Autocompletado:</h4>
            <div class="space-y-2">
              <div
                v-for="(result, index) in autocompleteResults"
                :key="index"
                @click="selectAutocompleteResult(result)"
                class="p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <div class="font-medium text-gray-900">{{ result.name }}</div>
                <div class="text-sm text-gray-600">{{ result.address }}</div>
                <div class="text-xs text-gray-500">ID: {{ result.id }}</div>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="isLoadingAutocomplete" class="text-center py-4">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
            <p class="text-sm text-gray-600 mt-2">Buscando sugerencias...</p>
          </div>
        </div>
      </div>

      <!-- Geocoding Test -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4">📍 Test de Geocodificación</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Dirección para geocodificar:
            </label>
            <input
              v-model="geocodingInput"
              type="text"
              placeholder="Ej: Calle Gran Vía, 1, Madrid, España"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              @click="testGeocoding"
              :disabled="!geocodingInput || isLoadingGeocoding"
              class="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoadingGeocoding ? 'Geocodificando...' : 'Geocodificar' }}
            </button>
          </div>

          <!-- Geocoding Results -->
          <div v-if="geocodingResult" class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-medium text-gray-900 mb-2">Resultado de Geocodificación:</h4>
            <div class="space-y-2">
              <div><strong>Nombre:</strong> {{ geocodingResult.name }}</div>
              <div><strong>Dirección:</strong> {{ geocodingResult.address }}</div>
              <div v-if="geocodingResult.coordinates">
                <strong>Coordenadas:</strong> 
                {{ geocodingResult.coordinates.lat }}, {{ geocodingResult.coordinates.lng }}
              </div>
              <div><strong>ID:</strong> {{ geocodingResult.id }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Test Results -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-xl font-semibold mb-4">📊 Resultados de Pruebas</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="font-medium text-gray-900 mb-2">Autocompletado</h3>
            <div class="space-y-1 text-sm">
              <div>Total resultados: {{ autocompleteResults.length }}</div>
              <div>Última búsqueda: {{ lastAutocompleteQuery }}</div>
              <div>Tiempo de respuesta: {{ autocompleteResponseTime }}ms</div>
            </div>
          </div>
          
          <div>
            <h3 class="font-medium text-gray-900 mb-2">Geocodificación</h3>
            <div class="space-y-1 text-sm">
              <div>Estado: {{ geocodingResult ? '✅ Exitoso' : '⏳ Pendiente' }}</div>
              <div>Última dirección: {{ geocodingInput }}</div>
              <div>Tiempo de respuesta: {{ geocodingResponseTime }}ms</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { GooglePlacesService } from '@/services/googlePlacesService'

// Estado de la aplicación
const googlePlacesApiKey = ref(import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '')
const isGoogleMapsLoaded = ref(false)
const isPlacesServiceReady = ref(false)
const debugInfo = ref<any>(null)

// Autocompletado
const autocompleteInput = ref('')
const autocompleteResults = ref<any[]>([])
const isLoadingAutocomplete = ref(false)
const lastAutocompleteQuery = ref('')
const autocompleteResponseTime = ref(0)

// Geocodificación
const geocodingInput = ref('')
const geocodingResult = ref<any>(null)
const isLoadingGeocoding = ref(false)
const geocodingResponseTime = ref(0)

// Servicio de Google Places
const googlePlacesService = new GooglePlacesService()

// Verificar estado de Google Maps
const checkGoogleMapsStatus = () => {
  isGoogleMapsLoaded.value = typeof google !== 'undefined' && !!google.maps
  isPlacesServiceReady.value = isGoogleMapsLoaded.value && !!google.maps.places
  
  debugInfo.value = {
    googleMapsLoaded: isGoogleMapsLoaded.value,
    placesServiceReady: isPlacesServiceReady.value,
    apiKey: googlePlacesApiKey.value ? 'Configurada' : 'No configurada',
    timestamp: new Date().toISOString()
  }
}

// Manejar input de autocompletado
const handleAutocompleteInput = async () => {
  if (autocompleteInput.value.length < 3) {
    autocompleteResults.value = []
    return
  }

  if (!isPlacesServiceReady.value) {
    console.warn('Google Places Service no está listo')
    return
  }

  isLoadingAutocomplete.value = true
  const startTime = Date.now()
  lastAutocompleteQuery.value = autocompleteInput.value

  try {
    console.log('🔍 Iniciando autocompletado con Google Places...')
    const results = await googlePlacesService.autocompleteAddress(autocompleteInput.value)
    autocompleteResults.value = results
    autocompleteResponseTime.value = Date.now() - startTime
    console.log('✅ Autocompletado exitoso:', results)
  } catch (error) {
    console.error('❌ Error en autocompletado:', error)
    autocompleteResults.value = []
  } finally {
    isLoadingAutocomplete.value = false
  }
}

// Seleccionar resultado de autocompletado
const selectAutocompleteResult = (result: any) => {
  autocompleteInput.value = result.name
  autocompleteResults.value = []
  console.log('📍 Ubicación seleccionada:', result)
}

// Probar geocodificación
const testGeocoding = async () => {
  if (!geocodingInput.value || !isPlacesServiceReady.value) {
    return
  }

  isLoadingGeocoding.value = true
  const startTime = Date.now()

  try {
    console.log('📍 Iniciando geocodificación con Google Places...')
    const result = await googlePlacesService.geocodeAddress(geocodingInput.value)
    geocodingResult.value = result
    geocodingResponseTime.value = Date.now() - startTime
    console.log('✅ Geocodificación exitosa:', result)
  } catch (error) {
    console.error('❌ Error en geocodificación:', error)
    geocodingResult.value = null
  } finally {
    isLoadingGeocoding.value = false
  }
}

// Inicializar
onMounted(async () => {
  console.log('🚀 Inicializando Test Google Places...')
  
  // Verificar estado inicial
  checkGoogleMapsStatus()
  
  // Esperar a que Google Maps se cargue
  const checkInterval = setInterval(() => {
    checkGoogleMapsStatus()
    if (isGoogleMapsLoaded.value) {
      clearInterval(checkInterval)
      console.log('✅ Google Maps cargado correctamente')
    }
  }, 1000)

  // Limpiar intervalo después de 30 segundos
  setTimeout(() => {
    clearInterval(checkInterval)
  }, 30000)
})
</script>
