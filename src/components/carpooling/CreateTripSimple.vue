<template>
  <div class="max-w-5xl mx-auto">
    <form @submit.prevent="createTrip" class="space-y-6 bg-white rounded-sm border border-stroke shadow-default dark:border-strokedark dark:bg-boxdark p-6 sm:p-8">
      <!-- Tipo de Viaje -->
      <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <label class="block text-xs font-medium mb-3 text-black dark:text-white">🚗 Tipo de Viaje</label>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label 
            v-for="tipo in tiposViaje" 
            :key="tipo.value"
            class="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition"
            :class="form.tipo_viaje === tipo.value ? 'border-blue-500 bg-blue-100' : 'border-gray-300 bg-white hover:border-blue-300'"
          >
            <input 
              type="radio" 
              :value="tipo.value"
              v-model="form.tipo_viaje"
              class="w-4 h-4"
            />
            <div>
              <div class="font-medium">{{ tipo.icon }} {{ tipo.label }}</div>
              <div class="text-xs text-gray-600">{{ tipo.descripcion }}</div>
            </div>
          </label>
        </div>
      </div>

      <!-- Origen y Destino -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Origen -->
        <div>
          <label class="block text-xs font-medium mb-2 text-black dark:text-white">📍 Origen</label>
          
          <!-- Vista Rápida -->
          <div class="mb-3">
            <div class="text-xs text-gray-600 mb-2">Vista rápida:</div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="lugar in lugaresOrigenPopulares"
                :key="lugar"
                type="button"
                @click="form.origin_name = lugar; form.origin_custom = false"
                class="px-3 py-1 text-sm rounded-full border transition"
                :class="form.origin_name === lugar && !form.origin_custom ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'"
              >
                {{ lugar }}
              </button>
              <button
                type="button"
                @click="showModalOrigen = true"
                class="px-3 py-1 text-sm rounded-full border border-gray-300 bg-white text-gray-700 hover:border-blue-400 transition"
              >
                + Más lugares
              </button>
            </div>
          </div>

          <!-- Dirección Personalizada -->
          <div>
            <label class="flex items-center gap-2 mb-2 cursor-pointer">
              <input 
                type="checkbox" 
                v-model="form.origin_custom"
                class="rounded"
              />
              <span class="text-sm text-gray-600">📝 Dirección personalizada (Google Places)</span>
            </label>
            <GooglePlacesAutocomplete
              v-if="form.origin_custom"
              v-model="form.origin_name"
              placeholder="Ej: Calle Mayor 123, Getafe"
              :required="true"
              @place-selected="handleOriginPlaceSelected"
            />
          </div>
        </div>
        
        <!-- Destino -->
        <div>
          <label class="block text-xs font-medium mb-2 text-black dark:text-white">🎯 Destino</label>
          
          <!-- Vista Rápida -->
          <div class="mb-3">
            <div class="text-xs text-gray-600 mb-2">Vista rápida:</div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="lugar in lugaresDestinoPopulares"
                :key="lugar"
                type="button"
                @click="form.destination_name = lugar; form.destination_custom = false"
                class="px-3 py-1 text-sm rounded-full border transition"
                :class="form.destination_name === lugar && !form.destination_custom ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'"
              >
                {{ lugar }}
              </button>
              <button
                type="button"
                @click="showModalDestino = true"
                class="px-3 py-1 text-sm rounded-full border border-gray-300 bg-white text-gray-700 hover:border-blue-400 transition"
              >
                + Más lugares
              </button>
            </div>
          </div>

          <!-- Dirección Personalizada -->
          <div>
            <label class="flex items-center gap-2 mb-2 cursor-pointer">
              <input 
                type="checkbox" 
                v-model="form.destination_custom"
                class="rounded"
              />
              <span class="text-sm text-gray-600">📝 Dirección personalizada (Google Places)</span>
            </label>
            <GooglePlacesAutocomplete
              v-if="form.destination_custom"
              v-model="form.destination_name"
              placeholder="Ej: Calle Alcalá 456, Madrid"
              :required="true"
              @place-selected="handleDestinationPlaceSelected"
            />
          </div>
        </div>
      </div>

      <!-- Modal Origen -->
      <div 
        v-if="showModalOrigen"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="showModalOrigen = false"
      >
        <div class="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold">📍 Selecciona Origen</h3>
            <button 
              @click="showModalOrigen = false"
              class="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          
          <input 
            v-model="searchOrigen"
            type="text"
            placeholder="Buscar lugar..."
            class="w-full px-4 py-2 border rounded-lg mb-4"
          />

          <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
            <button
              v-for="lugar in lugaresOrigenFiltrados"
              :key="lugar"
              type="button"
              @click="form.origin_name = lugar; form.origin_custom = false; showModalOrigen = false"
              class="px-4 py-3 text-left border rounded-lg hover:bg-blue-50 hover:border-blue-400 transition"
              :class="form.origin_name === lugar ? 'bg-blue-100 border-blue-500' : 'bg-white border-gray-300'"
            >
              {{ lugar }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Destino -->
      <div 
        v-if="showModalDestino"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="showModalDestino = false"
      >
        <div class="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold">🎯 Selecciona Destino</h3>
            <button 
              @click="showModalDestino = false"
              class="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          
          <input 
            v-model="searchDestino"
            type="text"
            placeholder="Buscar lugar..."
            class="w-full px-4 py-2 border rounded-lg mb-4"
          />

          <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
            <button
              v-for="lugar in lugaresDestinoFiltrados"
              :key="lugar"
              type="button"
              @click="form.destination_name = lugar; form.destination_custom = false; showModalDestino = false"
              class="px-4 py-3 text-left border rounded-lg hover:bg-blue-50 hover:border-blue-400 transition"
              :class="form.destination_name === lugar ? 'bg-blue-100 border-blue-500' : 'bg-white border-gray-300'"
            >
              {{ lugar }}
            </button>
          </div>
        </div>
      </div>

      <!-- Fechas -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-medium mb-2 text-black dark:text-white">📅 Fecha Inicio</label>
          <input 
            v-model="form.start_date" 
            type="date" 
            class="w-full px-4 py-2 border rounded-lg"
            required
          />
          <p class="text-xs text-gray-500 mt-1">
            {{ form.tipo_viaje === 'unico' ? 'Fecha del viaje único' : 'Inicio del período recurrente' }}
          </p>
        </div>
        
        <div v-if="form.tipo_viaje !== 'unico'">
          <label class="block text-xs font-medium mb-2 text-black dark:text-white">📅 Fecha Fin</label>
          <input 
            v-model="form.end_date" 
            type="date" 
            class="w-full px-4 py-2 border rounded-lg"
            :required="form.tipo_viaje !== 'unico'"
          />
          <p class="text-xs text-gray-500 mt-1">
            {{ form.tipo_viaje === 'semanal' ? 'Fin del viaje semanal' : 'Fin del viaje mensual' }}
          </p>
        </div>
      </div>

      <!-- Días de la semana (solo para recurrentes) -->
      <div v-if="form.tipo_viaje !== 'unico'">
        <label class="block text-xs font-medium mb-3 text-black dark:text-white">📆 Días que opera</label>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <label 
            v-for="day in days" 
            :key="day.value" 
            class="flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition"
            :class="form.days.includes(day.value) ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'"
          >
            <input 
              type="checkbox" 
              :value="day.value"
              v-model="form.days"
              class="rounded"
            />
            <span class="font-medium">{{ day.label }}</span>
          </label>
        </div>
      </div>

      <!-- Horarios -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <label class="block text-xs font-medium text-black dark:text-white">🕐 Horarios</label>
          <button 
            v-if="form.tipo_viaje !== 'unico'"
            type="button"
            @click="form.horarios_especiales = !form.horarios_especiales"
            class="text-sm text-blue-600 hover:text-blue-700"
          >
            {{ form.horarios_especiales ? '✓ Horarios especiales activados' : '+ Horarios especiales por día' }}
          </button>
        </div>

        <!-- Horario general -->
        <div v-if="!form.horarios_especiales" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs text-gray-600 mb-1">Hora de salida</label>
            <input 
              v-model="form.departure_time" 
              type="time" 
              class="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">Hora de regreso (opcional)</label>
            <input 
              v-model="form.return_time" 
              type="time" 
              class="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        <!-- Horarios especiales por día -->
        <div v-else class="space-y-3">
          <div 
            v-for="day in days.filter(d => form.days.includes(d.value))" 
            :key="day.value"
            class="p-3 border rounded-lg bg-gray-50"
          >
            <div class="font-medium mb-2">{{ day.label }}</div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-600 mb-1">Salida</label>
                <input 
                  v-model="form.horarios_por_dia[day.value].salida" 
                  type="time" 
                  class="w-full px-3 py-2 border rounded"
                  :placeholder="form.departure_time"
                />
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1">Regreso</label>
                <input 
                  v-model="form.horarios_por_dia[day.value].regreso" 
                  type="time" 
                  class="w-full px-3 py-2 border rounded"
                  :placeholder="form.return_time"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Plazas y Precio -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-medium mb-2 text-black dark:text-white">👥 Plazas disponibles</label>
          <input 
            v-model.number="form.available_seats" 
            type="number" 
            min="1"
            max="8"
            class="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>
        
        <div>
          <label class="block text-xs font-medium mb-2 text-black dark:text-white">
            💰 Precio por plaza (€)
            <span class="text-xs text-gray-500 block mt-1">
              {{ form.tipo_viaje === 'semanal' ? 'Por trayecto (semanal recurrente)' : form.tipo_viaje === 'mensual' ? 'Por trayecto (mensual recurrente)' : 'Por trayecto' }}
            </span>
          </label>
          <input 
            v-model.number="form.price_per_seat" 
            type="number" 
            min="1"
            step="0.5"
            class="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>
      </div>

      <!-- Descripción -->
      <div>
        <label class="block text-xs font-medium mb-2 text-black dark:text-white">📝 Descripción (opcional)</label>
        <textarea 
          v-model="form.description" 
          rows="3"
          placeholder="Ej: Viaje tranquilo, salida puntual..."
          class="w-full px-4 py-2 border rounded-lg dark:bg-boxdark-2 dark:border-strokedark dark:text-white"
        ></textarea>
      </div>

      <!-- Mensajes de resultado -->
      <div v-if="result" :class="result.success ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'" class="p-4 rounded-lg border" :style="result.success ? 'border-color: rgb(34 197 94);' : 'border-color: rgb(239 68 68);'">
        {{ result.message }}
      </div>

      <!-- Botón de Crear Viaje -->
      <button 
        type="submit" 
        :disabled="loading"
        class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <svg v-if="loading" class="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span v-if="loading" class="text-lg">Creando viaje...</span>
        <span v-else class="flex items-center gap-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          Crear Viaje
        </span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import TripsService from '@/services/tripsServiceSimple'
import GooglePlacesAutocomplete from '@/components/shared/GooglePlacesAutocomplete.vue'

const loading = ref(false)
const result = ref<{success: boolean, message: string} | null>(null)
const showModalOrigen = ref(false)
const showModalDestino = ref(false)
const searchOrigen = ref('')
const searchDestino = ref('')

const tiposViaje = [
  { 
    value: 'unico', 
    label: 'Único', 
    icon: '🚗',
    descripcion: 'Viaje puntual' 
  },
  { 
    value: 'semanal', 
    label: 'Semanal', 
    icon: '📅',
    descripcion: 'Recurrente semanal' 
  },
  { 
    value: 'mensual', 
    label: 'Mensual', 
    icon: '📆',
    descripcion: 'Recurrente mensual' 
  }
]

// Lugares populares para vista rápida (máximo 5)
const lugaresOrigenPopulares = [
  'Getafe',
  'Leganés',
  'Móstoles',
  'Las Rozas',
  'Alcobendas'
]

const lugaresDestinoPopulares = [
  'Sol',
  'Atocha',
  'Chamartín',
  'Nuevos Ministerios',
  'Moncloa'
]

// Lista completa de lugares
const lugaresOrigen = [
  'Getafe',
  'Leganés',
  'Fuenlabrada',
  'Móstoles',
  'Alcorcón',
  'Parla',
  'Pinto',
  'Valdemoro',
  'Las Rozas',
  'Majadahonda',
  'Pozuelo de Alarcón',
  'Boadilla del Monte',
  'Alcobendas',
  'San Sebastián de los Reyes',
  'Tres Cantos',
  'Torrejón de Ardoz',
  'Alcalá de Henares',
  'Coslada',
  'San Fernando de Henares',
  'Rivas-Vaciamadrid',
  'Arganda del Rey',
  'Collado Villalba',
  'Galapagar',
  'El Escorial',
  'Aranjuez'
]

const lugaresDestino = [
  'Madrid Centro',
  'Sol',
  'Gran Vía',
  'Atocha',
  'Chamartín',
  'Nuevos Ministerios',
  'Plaza de Castilla',
  'Moncloa',
  'Plaza de España',
  'Puerta del Sol',
  'Cibeles',
  'Retiro',
  'Salamanca',
  'Chamberí',
  'Malasaña',
  'Chueca',
  'La Latina',
  'Lavapiés',
  'Argüelles',
  'Cuatro Caminos',
  'Tetuán',
  'Ciudad Universitaria',
  'Méndez Álvaro',
  'Pacífico',
  'Ventas',
  'Arturo Soria',
  'Aeropuerto T1',
  'Aeropuerto T4',
  'IFEMA',
  'Barajas'
]

// Computed para filtrar lugares
const lugaresOrigenFiltrados = computed(() => {
  if (!searchOrigen.value) return lugaresOrigen
  return lugaresOrigen.filter(lugar => 
    lugar.toLowerCase().includes(searchOrigen.value.toLowerCase())
  )
})

const lugaresDestinoFiltrados = computed(() => {
  if (!searchDestino.value) return lugaresDestino
  return lugaresDestino.filter(lugar => 
    lugar.toLowerCase().includes(searchDestino.value.toLowerCase())
  )
})

// Coordenadas predefinidas para lugares populares
const coordenadasPredefinidas: {[key: string]: {lat: number, lng: number}} = {
  'Getafe': { lat: 40.3057, lng: -3.7327 },
  'Leganés': { lat: 40.3275, lng: -3.7639 },
  'Fuenlabrada': { lat: 40.2839, lng: -3.7942 },
  'Móstoles': { lat: 40.3228, lng: -3.8647 },
  'Alcorcón': { lat: 40.3458, lng: -3.8242 },
  'Parla': { lat: 40.2375, lng: -3.7683 },
  'Pinto': { lat: 40.2447, lng: -3.6994 },
  'Valdemoro': { lat: 40.1917, lng: -3.6742 },
  'Las Rozas': { lat: 40.4928, lng: -3.8736 },
  'Majadahonda': { lat: 40.4736, lng: -3.8706 },
  'Pozuelo de Alarcón': { lat: 40.4350, lng: -3.8119 },
  'Boadilla del Monte': { lat: 40.4053, lng: -3.8772 },
  'Alcobendas': { lat: 40.5475, lng: -3.6420 },
  'San Sebastián de los Reyes': { lat: 40.5475, lng: -3.6258 },
  'Tres Cantos': { lat: 40.5978, lng: -3.7094 },
  'Torrejón de Ardoz': { lat: 40.4594, lng: -3.4697 },
  'Alcalá de Henares': { lat: 40.4817, lng: -3.3641 },
  'Coslada': { lat: 40.4208, lng: -3.5606 },
  'San Fernando de Henares': { lat: 40.4236, lng: -3.5356 },
  'Rivas-Vaciamadrid': { lat: 40.3569, lng: -3.5306 },
  'Arganda del Rey': { lat: 40.3000, lng: -3.4500 },
  'Collado Villalba': { lat: 40.6333, lng: -4.0083 },
  'Galapagar': { lat: 40.5783, lng: -4.0000 },
  'El Escorial': { lat: 40.5819, lng: -4.1478 },
  'Aranjuez': { lat: 40.0333, lng: -3.6000 },
  'Madrid Centro': { lat: 40.4168, lng: -3.7038 },
  'Sol': { lat: 40.4168, lng: -3.7038 },
  'Gran Vía': { lat: 40.4194, lng: -3.7108 },
  'Atocha': { lat: 40.4075, lng: -3.6917 },
  'Chamartín': { lat: 40.4720, lng: -3.6806 },
  'Nuevos Ministerios': { lat: 40.4459, lng: -3.6900 },
  'Plaza de Castilla': { lat: 40.4669, lng: -3.6889 },
  'Moncloa': { lat: 40.4350, lng: -3.7200 },
  'Plaza de España': { lat: 40.4236, lng: -3.7122 },
  'Puerta del Sol': { lat: 40.4168, lng: -3.7038 },
  'Cibeles': { lat: 40.4189, lng: -3.6936 },
  'Retiro': { lat: 40.4153, lng: -3.6844 },
  'Salamanca': { lat: 40.4306, lng: -3.6778 },
  'Chamberí': { lat: 40.4350, lng: -3.7028 },
  'Malasaña': { lat: 40.4264, lng: -3.7050 },
  'Chueca': { lat: 40.4222, lng: -3.6958 },
  'La Latina': { lat: 40.4111, lng: -3.7117 },
  'Lavapiés': { lat: 40.4083, lng: -3.7011 },
  'Argüelles': { lat: 40.4292, lng: -3.7178 },
  'Cuatro Caminos': { lat: 40.4458, lng: -3.7050 },
  'Tetuán': { lat: 40.4583, lng: -3.6972 },
  'Ciudad Universitaria': { lat: 40.4459, lng: -3.7297 },
  'Méndez Álvaro': { lat: 40.3986, lng: -3.6764 },
  'Pacífico': { lat: 40.4028, lng: -3.6708 },
  'Ventas': { lat: 40.4306, lng: -3.6639 },
  'Arturo Soria': { lat: 40.4403, lng: -3.6372 },
  'Aeropuerto T1': { lat: 40.4983, lng: -3.5678 },
  'Aeropuerto T4': { lat: 40.4936, lng: -3.5989 },
  'IFEMA': { lat: 40.4644, lng: -3.6194 },
  'Barajas': { lat: 40.4719, lng: -3.5778 }
}

// Manejar selección de lugar desde Google Places
const handleOriginPlaceSelected = async (place: google.maps.places.AutocompletePrediction) => {
  console.log('📍 Origen seleccionado desde Google Places:', place.description)
  form.origin_place_id = place.place_id
  
  // Obtener coordenadas usando Geocoder
  await getPlaceCoordinates(place.place_id, 'origin')
}

const handleDestinationPlaceSelected = async (place: google.maps.places.AutocompletePrediction) => {
  console.log('🎯 Destino seleccionado desde Google Places:', place.description)
  form.destination_place_id = place.place_id
  
  // Obtener coordenadas usando Geocoder
  await getPlaceCoordinates(place.place_id, 'destination')
}

// Obtener coordenadas de un place_id
const getPlaceCoordinates = async (placeId: string, type: 'origin' | 'destination') => {
  if (!window.google || !window.google.maps) {
    console.warn('⚠️ Google Maps no disponible')
    return
  }

  const geocoder = new google.maps.Geocoder()
  
  try {
    const result = await new Promise<google.maps.GeocoderResult>((resolve, reject) => {
      geocoder.geocode({ placeId }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          resolve(results[0])
        } else {
          reject(new Error(`Geocoding failed: ${status}`))
        }
      })
    })

    const location = result.geometry.location
    const lat = location.lat()
    const lng = location.lng()

    if (type === 'origin') {
      form.origin_lat = lat
      form.origin_lng = lng
      console.log(`✅ Coordenadas origen: ${lat}, ${lng}`)
    } else {
      form.destination_lat = lat
      form.destination_lng = lng
      console.log(`✅ Coordenadas destino: ${lat}, ${lng}`)
    }
  } catch (error) {
    console.error('❌ Error obteniendo coordenadas:', error)
  }
}

const days = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' }
]

const form = reactive({
  tipo_viaje: 'semanal' as 'unico' | 'semanal' | 'mensual',
  origin_name: '',
  origin_custom: false,
  origin_place_id: '',
  origin_lat: 0,
  origin_lng: 0,
  destination_name: '',
  destination_custom: false,
  destination_place_id: '',
  destination_lat: 0,
  destination_lng: 0,
  start_date: new Date().toISOString().split('T')[0],
  end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  days: [1, 2, 3, 4, 5], // L-V por defecto
  departure_time: '07:30',
  return_time: '',
  available_seats: 3,
  price_per_seat: 5,
  description: '',
  horarios_especiales: false,
  horarios_por_dia: {
    1: { salida: '', regreso: '' },
    2: { salida: '', regreso: '' },
    3: { salida: '', regreso: '' },
    4: { salida: '', regreso: '' },
    5: { salida: '', regreso: '' },
    6: { salida: '', regreso: '' },
    7: { salida: '', regreso: '' }
  }
})

async function createTrip() {
  loading.value = true
  result.value = null
  
  try {
    console.log('🚗 Creando viaje...')
    console.log('📋 Tipo:', form.tipo_viaje)
    
    // Mapear días a horarios
    const timeFields: any = {}
    const dayMap: {[key: number]: string} = {
      1: 'monday_time',
      2: 'tuesday_time',
      3: 'wednesday_time',
      4: 'thursday_time',
      5: 'friday_time',
      6: 'saturday_time',
      7: 'sunday_time'
    }
    
    // Si hay horarios especiales, usar esos; si no, usar el horario general
    if (form.tipo_viaje !== 'unico') {
      form.days.forEach(day => {
        const field = dayMap[day]
        if (field) {
          if (form.horarios_especiales && form.horarios_por_dia[day].salida) {
            timeFields[field] = form.horarios_por_dia[day].salida
          } else {
            timeFields[field] = form.departure_time
          }
        }
      })
    }
    
      // Obtener coordenadas (de Google Places o predefinidas)
      let originLat = form.origin_lat
      let originLng = form.origin_lng
      let destLat = form.destination_lat
      let destLng = form.destination_lng
      
      // Si no hay coordenadas de Google Places, usar predefinidas
      if (!form.origin_custom && coordenadasPredefinidas[form.origin_name]) {
        originLat = coordenadasPredefinidas[form.origin_name].lat
        originLng = coordenadasPredefinidas[form.origin_name].lng
      }
      
      if (!form.destination_custom && coordenadasPredefinidas[form.destination_name]) {
        destLat = coordenadasPredefinidas[form.destination_name].lat
        destLng = coordenadasPredefinidas[form.destination_name].lng
      }
      
      // Fallback a coordenadas por defecto si no hay ninguna
      if (!originLat || !originLng) {
        originLat = 40.3057 // Getafe
        originLng = -3.7327
      }
      
      if (!destLat || !destLng) {
        destLat = 40.4168 // Madrid Centro
        destLng = -3.7038
      }
      
      // Normalizar fechas para evitar problemas de zona horaria
      const startDateNormalized = form.start_date.split('T')[0]
      const endDateNormalized = form.tipo_viaje === 'unico' ? form.start_date.split('T')[0] : form.end_date.split('T')[0]
      
      console.log('📅 Fecha original start_date:', form.start_date)
      console.log('📅 Fecha normalizada start_date:', startDateNormalized)
      
      const tripData = {
        driver_id: '550e8400-e29b-41d4-a716-446655440001', // Driver de prueba
        origin_name: form.origin_name,
        origin_lat: originLat,
        origin_lng: originLng,
        destination_name: form.destination_name,
        destination_lat: destLat,
        destination_lng: destLng,
      fecha_inicio: startDateNormalized,
      fecha_fin: endDateNormalized,
      dias_operacion: form.tipo_viaje === 'unico' ? [] : form.days,
      ...timeFields,
      available_seats: form.available_seats,
      price_per_seat: form.price_per_seat,
      description: form.description || `Viaje ${form.tipo_viaje} de ${form.origin_name} a ${form.destination_name}`,
      status: 'active' as const
    }
    
    console.log('📊 Datos del viaje:', tripData)
    
    const trip = await TripsService.createTrip(tripData)
    
    if (trip) {
      console.log('✅ Viaje creado:', trip)
      const tipoLabel = form.tipo_viaje === 'unico' ? 'único' : form.tipo_viaje
      result.value = {
        success: true,
        message: `🎉 ¡Viaje ${tipoLabel} creado exitosamente!\n${form.origin_name} → ${form.destination_name}`
      }
      
      // Esperar 2 segundos antes de limpiar el formulario
      setTimeout(() => {
        resetForm()
        result.value = null
      }, 3000)
    } else {
      result.value = {
        success: false,
        message: '❌ Error al crear el viaje. Revisa la consola para más detalles.'
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
    result.value = {
      success: false,
      message: `❌ Error: ${error}`
    }
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.tipo_viaje = 'semanal'
  form.origin_name = ''
  form.origin_custom = false
  form.origin_place_id = ''
  form.origin_lat = 0
  form.origin_lng = 0
  form.destination_name = ''
  form.destination_custom = false
  form.destination_place_id = ''
  form.destination_lat = 0
  form.destination_lng = 0
  form.start_date = new Date().toISOString().split('T')[0]
  form.end_date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  form.days = [1, 2, 3, 4, 5]
  form.departure_time = '07:30'
  form.return_time = ''
  form.available_seats = 3
  form.price_per_seat = 5
  form.description = ''
  form.horarios_especiales = false
  form.horarios_por_dia = {
    1: { salida: '', regreso: '' },
    2: { salida: '', regreso: '' },
    3: { salida: '', regreso: '' },
    4: { salida: '', regreso: '' },
    5: { salida: '', regreso: '' },
    6: { salida: '', regreso: '' },
    7: { salida: '', regreso: '' }
  }
  searchOrigen.value = ''
  searchDestino.value = ''
}
</script>

