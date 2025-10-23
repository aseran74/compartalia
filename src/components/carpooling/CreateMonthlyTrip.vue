<template>
  <div class="max-w-4xl mx-auto">
          <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4">📝 Datos del Viaje</h2>
      
      <form @submit.prevent="createMonthlyTrip" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Origen -->
          <div class="form-group">
            <label class="block text-sm font-medium text-black dark:text-white mb-2">📍 Origen</label>
            
            <!-- Opciones predefinidas -->
            <div class="mb-3">
              <p class="text-sm text-body-color mb-2">Ciudades del extrarradio de Madrid:</p>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  v-for="city in madridCities.slice(0, 12)"
                  :key="city.name"
                  @click="selectPredefinedOrigin(city)"
                  type="button"
                  class="px-3 py-2 text-sm bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-900/20 dark:border-blue-700 dark:hover:bg-blue-900/30"
                >
                  {{ city.name.split(',')[0] }}
                </button>
              </div>
            </div>
            
            <!-- Búsqueda personalizada -->
            <div class="relative">
              <input
                v-model="tripForm.origin_name"
                @input="buscarOrigen"
                @focus="showOriginSuggestions = true"
                @blur="hideOriginSuggestions"
                type="text"
                placeholder="O busca otra ciudad..."
                class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                required
              />
              <div v-if="showOriginSuggestions && originSuggestions.length > 0" class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto dark:bg-gray-800 dark:border-gray-600">
                <div
                  v-for="(suggestion, index) in originSuggestions"
                  :key="index"
                  @click="seleccionarOrigen(suggestion)"
                  class="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 dark:hover:bg-gray-700 dark:border-gray-600"
                >
                  <div class="font-medium text-gray-900 dark:text-white">{{ suggestion.name }}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-300">{{ suggestion.address }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Destino -->
          <div class="form-group">
            <label class="block text-sm font-medium text-black dark:text-white mb-2">🎯 Destino</label>
            
            <!-- Opciones predefinidas -->
            <div class="mb-3">
              <p class="text-sm text-body-color mb-2">Destinos populares en Madrid:</p>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                <button
                  v-for="destination in popularDestinations"
                  :key="destination.name"
                  @click="selectPredefinedDestination(destination)"
                  type="button"
                  class="px-3 py-2 text-sm bg-green-50 border border-green-200 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-green-900/20 dark:border-green-700 dark:hover:bg-green-900/30"
                >
                  {{ destination.name }}
                </button>
              </div>
            </div>
            
            <!-- Búsqueda personalizada -->
            <div class="relative">
              <input
                v-model="tripForm.destination_name"
                @input="buscarDestino"
                @focus="showDestinationSuggestions = true"
                @blur="hideDestinationSuggestions"
                type="text"
                placeholder="O busca otro destino específico..."
                class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                required
              />
              <div v-if="showDestinationSuggestions && destinationSuggestions.length > 0" class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto dark:bg-gray-800 dark:border-gray-600">
                <div
                  v-for="(suggestion, index) in destinationSuggestions"
                  :key="index"
                  @click="seleccionarDestino(suggestion)"
                  class="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 dark:hover:bg-gray-700 dark:border-gray-600"
                >
                  <div class="font-medium text-gray-900 dark:text-white">{{ suggestion.name }}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-300">{{ suggestion.address }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Horario de salida -->
          <div class="form-group">
            <label class="block text-sm font-medium text-black dark:text-white mb-2">🕐 Hora de salida (ida)</label>
            <input v-model="tripForm.departure_time" type="time" class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" required />
          </div>

          <!-- Horario de llegada -->
          <div class="form-group">
            <label class="block text-sm font-medium text-black dark:text-white mb-2">🕐 Hora de llegada (vuelta)</label>
            <input v-model="tripForm.return_time" type="time" class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" required />
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

          <!-- Tipo de viaje -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">🚗 Tipo de viaje</label>
            <select 
              v-model="tripType" 
              @change="onTripTypeChange"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
              required
            >
              <option value="recurrent">📅 Fechas Seleccionadas (período específico)</option>
              <option value="weekly">📅 Semanal (lunes a viernes)</option>
              <option value="monthly">📅 Mensual (mismo día cada mes)</option>
            </select>
            <p class="text-xs text-gray-500 mt-1">{{ getTripDescription() }}</p>
          </div>

          <!-- Precio según frecuencia -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              💰 Precio {{ getTripTypeLabel() }} (€)
            </label>
            <input 
              v-model.number="tripPrice" 
              type="number" 
              :min="getMinPrice()" 
              :max="getMaxPrice()" 
              :step="getPriceStep()" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
              required 
            />
            <p class="text-xs text-gray-500 mt-1">{{ getPriceDescription() }}</p>
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

          <!-- Horarios especiales por día -->
          <div class="form-group md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">⏰ Horarios especiales</label>
            <div class="flex items-center mb-3">
              <input 
                v-model="hasSpecialSchedules" 
                type="checkbox" 
                class="mr-2"
              />
              <span class="text-sm">Algunos días tienen horarios diferentes (ej: viernes salir a las 14:00)</span>
            </div>
            
            <div v-if="hasSpecialSchedules" class="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div v-for="day in daysOfWeek" :key="day.value" class="flex items-center space-x-4">
                <div class="w-20">
                  <label class="flex items-center">
                    <input 
                      v-model="tripForm.days_of_week" 
                      :value="day.value" 
                      type="checkbox" 
                      class="mr-2"
                    />
                    <span class="text-sm font-medium">{{ day.label }}</span>
                  </label>
                </div>
                
                <div v-if="tripForm.days_of_week.includes(day.value)" class="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Hora salida</label>
                    <input 
                      :value="specialSchedules[day.value]?.departure_time || tripForm.departure_time"
                      @input="updateSpecialSchedule(day.value, 'departure_time', ($event.target as HTMLInputElement).value)"
                      type="time" 
                      class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Hora llegada</label>
                    <input 
                      :value="specialSchedules[day.value]?.return_time || tripForm.return_time"
                      @input="updateSpecialSchedule(day.value, 'return_time', ($event.target as HTMLInputElement).value)"
                      type="time" 
                      class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Fecha de inicio -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">📅 Fecha de inicio</label>
            <input 
              v-model="startDate" 
              type="date" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
              required 
            />
            <p class="text-xs text-gray-500 mt-1">Fecha en la que comenzará el viaje</p>
          </div>

          <!-- Fecha de fin -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">📅 Fecha de fin</label>
            <input v-model="endDate" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            <p class="text-xs text-gray-500 mt-1">{{ getEndDateDescription() }}</p>
          </div>

          <!-- Día del mes (solo para mensuales) -->
          <div v-if="tripType === 'monthly'" class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">📅 Día del mes</label>
            <select v-model="monthlyDay" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              <option v-for="day in 31" :key="day" :value="day">{{ day }}</option>
            </select>
            <p class="text-xs text-gray-500 mt-1">El viaje se repetirá el día {{ monthlyDay }} de cada mes</p>
          </div>
          

          <!-- Descripción -->
          <div class="form-group md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">📝 Descripción</label>
            <textarea v-model="tripForm.description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Describe tu viaje..."></textarea>
          </div>
        </div>

        <!-- Resumen del viaje -->
        <div v-if="tripForm.origin_name && tripForm.destination_name" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 class="text-lg font-semibold text-blue-900 mb-3">📋 Resumen del Viaje</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>📍 Origen:</strong> {{ tripForm.origin_name }}</p>
              <p><strong>🎯 Destino:</strong> {{ tripForm.destination_name }}</p>
              <p><strong>🕐 Salida:</strong> {{ tripForm.departure_time }}</p>
              <p><strong>🕐 Llegada:</strong> {{ tripForm.return_time }}</p>
              <p><strong>👥 Plazas:</strong> {{ tripForm.available_seats }}</p>
            </div>
            <div>
              <p><strong>🚗 Tipo:</strong> {{ getTripTypeLabel() }}</p>
              <p><strong>💰 Precio:</strong> €{{ tripPrice }} {{ getTripTypeLabel() }}</p>
              <p><strong>📅 Inicio:</strong> {{ formatDate(startDate) }}</p>
              <p><strong>📅 Fin:</strong> {{ formatDate(endDate) }}</p>
              <p v-if="tripType === 'monthly'"><strong>📅 Día del mes:</strong> {{ monthlyDay }}</p>
              <p><strong>📆 Días:</strong> {{ tripForm.days_of_week.map(d => daysOfWeek.find(day => day.value === d)?.label).join(', ') }}</p>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-4">
          <button type="button" @click="resetForm" class="rounded-md border border-stroke px-6 py-2.5 text-center font-medium text-body-color hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-800">
            🔄 Limpiar
          </button>
          <button 
            type="submit" 
            :disabled="loading" 
            class="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-center font-semibold text-white shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <svg v-if="loading" class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
            <span class="text-white font-semibold">{{ loading ? 'Creando viaje...' : 'Crear Viaje' }}</span>
          </button>
        </div>
      </form>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import MonthlyTripsService from '@/services/monthlyTripsService'

const loading = ref(false)

// Declaraciones de tipos para Google Maps
interface GooglePlace {
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
  place_id: string;
}

interface GooglePlacesService {
  textSearch: (request: GooglePlacesRequest, callback: (results: GooglePlace[], status: string) => void) => void;
}

interface GooglePlacesRequest {
  query: string;
  fields: string[];
  locationBias: { lat: number; lng: number };
  radius: number;
}

interface GoogleMaps {
  maps: {
    places: {
      PlacesService: new (element: HTMLElement) => GooglePlacesService;
      PlacesServiceStatus: {
        OK: string;
      };
    };
  };
}

declare global {
  interface Window {
    google: any;
  }
}

// Google Places Service
const googlePlacesService = ref<GooglePlacesService | null>(null)

// Estados para autocompletado
const showOriginSuggestions = ref(false)
const showDestinationSuggestions = ref(false)
const originSuggestions = ref<any[]>([])
const destinationSuggestions = ref<any[]>([])

const tripForm = reactive({
  driver_id: '13f661f6-89d3-417a-a7d6-a2c725581369', // ID de conductor de ejemplo
  origin_name: '',
  destination_name: '',
  departure_time: '08:00',
  return_time: '18:00',
  available_seats: 4,
  price_per_seat: 4.00,
  description: '',
  days_of_week: [1, 2, 3, 4, 5], // Lunes a Viernes por defecto
  status: 'active' as const,
  // Coordenadas que se llenarán automáticamente
  origin_lat: 0,
  origin_lng: 0,
  destination_lat: 0,
  destination_lng: 0
})

const tripType = ref('recurrent')
const tripPrice = ref(320)
const startDate = ref('2024-11-01')
const endDate = ref('2024-11-30')
const monthlyDay = ref(1)
const monthlyDuration = ref('12')
const showCalendar = ref(false)
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())

// Variables para horarios especiales
const hasSpecialSchedules = ref(false)
const specialSchedules = ref<{[key: number]: {departure_time: string, return_time: string}}>({})

const daysOfWeek = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' }
]

// Ciudades del extrarradio de Madrid con población
const madridCities = [
  { name: 'Móstoles, Madrid', population: '210,000', lat: 40.3222, lng: -3.8647 },
  { name: 'Alcalá de Henares, Madrid', population: '195,000', lat: 40.4817, lng: -3.3643 },
  { name: 'Fuenlabrada, Madrid', population: '193,000', lat: 40.2842, lng: -3.7942 },
  { name: 'Leganés, Madrid', population: '190,000', lat: 40.3277, lng: -3.7656 },
  { name: 'Getafe, Madrid', population: '185,000', lat: 40.3071, lng: -3.7332 },
  { name: 'Alcorcón, Madrid', population: '170,000', lat: 40.3478, lng: -3.8244 },
  { name: 'Torrejón de Ardoz, Madrid', population: '132,000', lat: 40.4594, lng: -3.4697 },
  { name: 'Parla, Madrid', population: '130,000', lat: 40.2361, lng: -3.7675 },
  { name: 'Alcobendas, Madrid', population: '118,000', lat: 40.5474, lng: -3.6420 },
  { name: 'Las Rozas de Madrid, Madrid', population: '96,000', lat: 40.4929, lng: -3.8739 },
  { name: 'San Sebastián de los Reyes, Madrid', population: '90,000', lat: 40.5474, lng: -3.6256 },
  { name: 'Pozuelo de Alarcón, Madrid', population: '88,000', lat: 40.4329, lng: -3.8146 },
  { name: 'Coslada, Madrid', population: '83,000', lat: 40.4238, lng: -3.5613 },
  { name: 'Valdemoro, Madrid', population: '77,000', lat: 40.1908, lng: -3.6758 },
  { name: 'Rivas-Vaciamadrid, Madrid', population: '88,000', lat: 40.3333, lng: -3.5333 },
  { name: 'Majadahonda, Madrid', population: '72,000', lat: 40.4738, lng: -3.8725 }
]

// Destinos populares en Madrid
const popularDestinations = [
  { name: 'Puerta del Sol', lat: 40.4168, lng: -3.7038 },
  { name: 'Gran Vía', lat: 40.4192, lng: -3.7075 },
  { name: 'Chamartín', lat: 40.4740, lng: -3.6827 },
  { name: 'Atocha', lat: 40.4078, lng: -3.6893 },
  { name: 'Nuevos Ministerios', lat: 40.4460, lng: -3.6910 },
  { name: 'Plaza de Castilla', lat: 40.4663, lng: -3.6896 },
  { name: 'Moncloa', lat: 40.4350, lng: -3.7200 },
  { name: 'Plaza de España', lat: 40.4239, lng: -3.7146 },
  { name: 'AZCA', lat: 40.4460, lng: -3.6910 },
  { name: 'Cuatro Torres', lat: 40.4770, lng: -3.6900 },
  { name: 'Universidad Complutense', lat: 40.4495, lng: -3.7292 },
  { name: 'Hospital La Paz', lat: 40.4790, lng: -3.6900 }
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


function onTripTypeChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const newType = target.value
  console.log('🔄 Cambio manual detectado:', newType)
  
  // Forzar actualización
  tripType.value = newType
}

// Funciones para manejar los tipos de viaje
function getTripTypeLabel() {
  switch (tripType.value) {
    case 'recurrent': return 'recurrente'
    case 'weekly': return 'semanal'
    case 'monthly': return 'mensual'
    default: return 'recurrente'
  }
}

function getTripDescription() {
  switch (tripType.value) {
    case 'recurrent': return 'Viaje todos los días laborables (lunes a viernes)'
    case 'weekly': return 'Viaje de lunes a viernes de la semana seleccionada'
    case 'monthly': return 'Viaje el mismo día de cada mes'
    default: return 'Viaje todos los días laborables'
  }
}

function getEndDateDescription() {
  switch (tripType.value) {
    case 'recurrent': return 'El viaje se realizará todos los días laborables en este período'
    case 'weekly': return 'El viaje terminará el viernes de la semana seleccionada'
    case 'monthly': return `El viaje se repetirá durante ${monthlyDuration.value} meses (mismo día cada mes)`
    default: return 'Fecha de finalización del viaje'
  }
}

function getMinPrice() {
  switch (tripType.value) {
    case 'recurrent': return 50
    case 'weekly': return 25
    case 'monthly': return 100
    default: return 50
  }
}

function getMaxPrice() {
  switch (tripType.value) {
    case 'recurrent': return 500
    case 'weekly': return 200
    case 'monthly': return 1000
    default: return 500
  }
}

function getPriceStep() {
  switch (tripType.value) {
    case 'recurrent': return 10
    case 'weekly': return 5
    case 'monthly': return 25
    default: return 10
  }
}

function getPriceDescription() {
  switch (tripType.value) {
    case 'recurrent': return 'Precio por período completo (€50-500)'
    case 'weekly': return 'Precio por semana (€25-200)'
    case 'monthly': return 'Precio por mes (€100-1000)'
    default: return 'Precio por período completo (€50-500)'
  }
}

// Funciones para manejar la recurrencia
function getRecurrenceDescription() {
  switch (tripType.value) {
    case 'recurrent': return `Desde ${startDate.value} hasta ${endDate.value} (todos los días laborables)`
    case 'weekly': return `Semana del ${startDate.value} (lunes a viernes)`
    case 'monthly': return `Día ${monthlyDay.value} de cada mes desde ${startDate.value}`
    default: return 'No especificado'
  }
}

function calculateEndDate() {
  if (tripType.value === 'recurrent') {
    return endDate.value
  } else if (tripType.value === 'weekly') {
    // Calcular fin de semana (viernes)
    const start = new Date(startDate.value)
    const dayOfWeek = start.getDay() // 0 = domingo, 1 = lunes, etc.
    const daysToFriday = (5 - dayOfWeek + 7) % 7 // Días hasta el viernes
    const end = new Date(start)
    end.setDate(start.getDate() + daysToFriday)
    return end.toISOString().split('T')[0]
  } else if (tripType.value === 'monthly') {
    return null // Indefinido para mensuales
  }
  return null
}

function getStartDate() {
  return startDate.value
}

// Funciones para el calendario visual
function getCurrentMonthYear() {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  return `${months[currentMonth.value]} ${currentYear.value}`
}

function getCalendarDays() {
  const days = []
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const calendarStartDate = new Date(firstDay)
  calendarStartDate.setDate(calendarStartDate.getDate() - firstDay.getDay() + 1) // Lunes
  
  const today = new Date()
  const selectedDate = new Date(startDate.value)
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(calendarStartDate)
    date.setDate(calendarStartDate.getDate() + i)
    
    const isCurrentMonth = date.getMonth() === currentMonth.value
    const isToday = date.toDateString() === today.toDateString()
    const isSelected = date.toDateString() === selectedDate.toDateString()
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    
    days.push({
      day: date.getDate(),
      date: date.toISOString().split('T')[0],
      isCurrentMonth,
      isToday,
      isSelected,
      isWeekend
    })
  }
  
  return days
}

function selectDate(date: string) {
  startDate.value = date
  showCalendar.value = false
  // // addLog(`📅 Fecha seleccionada: ${formatSelectedDate()}`)
}

function previousMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function formatSelectedDate() {
  if (!startDate.value) return 'No seleccionado'
  
  const date = new Date(startDate.value)
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
  return date.toLocaleDateString('es-ES', options)
}

function formatDate(dateString: string) {
  if (!dateString) return 'No especificado'
  
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
  return date.toLocaleDateString('es-ES', options)
}

// Funciones para autocompletado con Google Places
function initializeGooglePlaces() {
  if (window.google && window.google.maps && window.google.maps.places) {
    googlePlacesService.value = new window.google.maps.places.PlacesService(document.createElement('div'))
    // // addLog('🗺️ Google Places API inicializada')
  } else {
    // // addLog('⚠️ Google Places API no disponible')
  }
}

function buscarOrigen() {
  console.log('🔍 buscarOrigen llamado con:', tripForm.origin_name)
  // // addLog(`🔍 Buscando origen: "${tripForm.origin_name}"`)
  
  if (tripForm.origin_name.length < 3) {
    originSuggestions.value = []
    // // addLog('⚠️ Texto muy corto, limpiando sugerencias')
    return
  }

  // Intentar usar Google Places API primero
  if (window.google && window.google.maps && window.google.maps.places) {
    const autocompleteService = new window.google.maps.places.AutocompleteService()
    const sessionToken = new window.google.maps.places.AutocompleteSessionToken()
    
    autocompleteService.getPlacePredictions({
      input: tripForm.origin_name,
      sessionToken: sessionToken,
      componentRestrictions: { country: 'es' }, // Limitar a España
      types: ['geocode', 'establishment'] // Incluir direcciones y establecimientos
    }, (predictions: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
        const suggestions = predictions.map((prediction: any) => ({
          name: prediction.description,
          address: prediction.description,
          place_id: prediction.place_id,
          lat: 0, // Se llenará cuando se seleccione
          lng: 0  // Se llenará cuando se seleccione
        }))
        
        originSuggestions.value = suggestions
        console.log('📍 Sugerencias de Google Places:', suggestions)
        // // addLog(`📍 Origen: ${suggestions.length} sugerencias encontradas (Google Places)`)
      } else {
        // // addLog(`⚠️ Error Google Places: ${status}`)
        // Fallback a datos locales
        buscarOrigenLocal()
      }
    })
  } else {
    // // addLog('⚠️ Google Places no disponible, usando datos locales')
    // Fallback a datos locales
    buscarOrigenLocal()
  }
}

function buscarOrigenLocal() {
  const localSuggestions = [
    { name: 'Móstoles, Madrid', address: 'Comunidad de Madrid, España', place_id: 'mostoles', lat: 40.3222, lng: -3.8647 },
    { name: 'Alcalá de Henares, Madrid', address: 'Comunidad de Madrid, España', place_id: 'alcala', lat: 40.4817, lng: -3.3643 },
    { name: 'Fuenlabrada, Madrid', address: 'Comunidad de Madrid, España', place_id: 'fuenlabrada', lat: 40.2842, lng: -3.7942 },
    { name: 'Leganés, Madrid', address: 'Comunidad de Madrid, España', place_id: 'leganes', lat: 40.3277, lng: -3.7656 },
    { name: 'Getafe, Madrid', address: 'Comunidad de Madrid, España', place_id: 'getafe', lat: 40.3071, lng: -3.7332 },
    { name: 'Alcorcón, Madrid', address: 'Comunidad de Madrid, España', place_id: 'alcorcon', lat: 40.3478, lng: -3.8244 },
    { name: 'Torrejón de Ardoz, Madrid', address: 'Comunidad de Madrid, España', place_id: 'torrejon', lat: 40.4594, lng: -3.4697 },
    { name: 'Parla, Madrid', address: 'Comunidad de Madrid, España', place_id: 'parla', lat: 40.2361, lng: -3.7675 },
    { name: 'Alcobendas, Madrid', address: 'Comunidad de Madrid, España', place_id: 'alcobendas', lat: 40.5474, lng: -3.6420 },
    { name: 'Las Rozas de Madrid, Madrid', address: 'Comunidad de Madrid, España', place_id: 'lasrozas', lat: 40.4929, lng: -3.8739 }
  ]

  const filteredSuggestions = localSuggestions.filter(suggestion => 
    suggestion.name.toLowerCase().includes(tripForm.origin_name.toLowerCase())
  )

  originSuggestions.value = filteredSuggestions
  console.log('📍 Sugerencias locales:', filteredSuggestions)
  // // addLog(`📍 Origen: ${filteredSuggestions.length} sugerencias encontradas (modo local)`)
}

function buscarDestino() {
  console.log('🔍 buscarDestino llamado con:', tripForm.destination_name)
  // // addLog(`🔍 Buscando destino: "${tripForm.destination_name}"`)
  
  if (tripForm.destination_name.length < 3) {
    destinationSuggestions.value = []
    // // addLog('⚠️ Texto muy corto, limpiando sugerencias')
    return
  }

  // Intentar usar Google Places API primero
  if (window.google && window.google.maps && window.google.maps.places) {
    const autocompleteService = new window.google.maps.places.AutocompleteService()
    const sessionToken = new window.google.maps.places.AutocompleteSessionToken()
    
    autocompleteService.getPlacePredictions({
      input: tripForm.destination_name,
      sessionToken: sessionToken,
      componentRestrictions: { country: 'es' }, // Limitar a España
      types: ['geocode', 'establishment'] // Incluir direcciones y establecimientos
    }, (predictions: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
        const suggestions = predictions.map((prediction: any) => ({
          name: prediction.description,
          address: prediction.description,
          place_id: prediction.place_id,
          lat: 0, // Se llenará cuando se seleccione
          lng: 0  // Se llenará cuando se seleccione
        }))
        
        destinationSuggestions.value = suggestions
        console.log('🎯 Sugerencias de Google Places:', suggestions)
        // // addLog(`🎯 Destino: ${suggestions.length} sugerencias encontradas (Google Places)`)
      } else {
        // // addLog(`⚠️ Error Google Places: ${status}`)
        // Fallback a datos locales
        buscarDestinoLocal()
      }
    })
  } else {
    // // addLog('⚠️ Google Places no disponible, usando datos locales')
    // Fallback a datos locales
    buscarDestinoLocal()
  }
}

function buscarDestinoLocal() {
  const localDestinations = [
    { name: 'Puerta del Sol, Madrid', address: 'Madrid, España', place_id: 'sol', lat: 40.4168, lng: -3.7038 },
    { name: 'Gran Vía, Madrid', address: 'Madrid, España', place_id: 'granvia', lat: 40.4192, lng: -3.7075 },
    { name: 'Chamartín, Madrid', address: 'Madrid, España', place_id: 'chamartin', lat: 40.4740, lng: -3.6827 },
    { name: 'Atocha, Madrid', address: 'Madrid, España', place_id: 'atocha', lat: 40.4078, lng: -3.6893 },
    { name: 'Nuevos Ministerios, Madrid', address: 'Madrid, España', place_id: 'nuevosministerios', lat: 40.4460, lng: -3.6910 },
    { name: 'Plaza de Castilla, Madrid', address: 'Madrid, España', place_id: 'plazacastilla', lat: 40.4663, lng: -3.6896 },
    { name: 'Moncloa, Madrid', address: 'Madrid, España', place_id: 'moncloa', lat: 40.4350, lng: -3.7200 },
    { name: 'Plaza de España, Madrid', address: 'Madrid, España', place_id: 'plazaespana', lat: 40.4239, lng: -3.7146 },
    { name: 'AZCA, Madrid', address: 'Madrid, España', place_id: 'azca', lat: 40.4460, lng: -3.6910 },
    { name: 'Cuatro Torres, Madrid', address: 'Madrid, España', place_id: 'cuatrotorres', lat: 40.4770, lng: -3.6900 },
    { name: 'Universidad Complutense, Madrid', address: 'Madrid, España', place_id: 'complutense', lat: 40.4495, lng: -3.7292 },
    { name: 'Hospital La Paz, Madrid', address: 'Madrid, España', place_id: 'hospitalpaz', lat: 40.4790, lng: -3.6900 }
  ]

  const filteredSuggestions = localDestinations.filter(suggestion => 
    suggestion.name.toLowerCase().includes(tripForm.destination_name.toLowerCase())
  )

  destinationSuggestions.value = filteredSuggestions
  console.log('🎯 Sugerencias locales:', filteredSuggestions)
  // // addLog(`🎯 Destino: ${filteredSuggestions.length} sugerencias encontradas (modo local)`)
}

function seleccionarOrigen(suggestion: any) {
  tripForm.origin_name = suggestion.name
  showOriginSuggestions.value = false
  originSuggestions.value = []
  
  // Si tiene coordenadas ya (datos locales), usarlas directamente
  if (suggestion.lat && suggestion.lng) {
    tripForm.origin_lat = suggestion.lat
    tripForm.origin_lng = suggestion.lng
    // // addLog(`📍 Origen seleccionado: ${suggestion.name} (${suggestion.lat}, ${suggestion.lng})`)
  } else {
    // Si es de Google Places, obtener coordenadas reales
    obtenerCoordenadasOrigen(suggestion.place_id, suggestion.name)
  }
}

function obtenerCoordenadasOrigen(placeId: string, placeName: string) {
  if (window.google && window.google.maps && window.google.maps.places) {
    const placesService = new window.google.maps.places.PlacesService(document.createElement('div'))
    
    placesService.getDetails({
      placeId: placeId,
      fields: ['geometry', 'name', 'formatted_address']
    }, (place: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place && place.geometry) {
        const location = place.geometry.location
        tripForm.origin_lat = location.lat()
        tripForm.origin_lng = location.lng()
        // // addLog(`📍 Origen geolocalizado: ${placeName} (${location.lat()}, ${location.lng()})`)
      } else {
        // // addLog(`⚠️ Error obteniendo coordenadas de origen: ${status}`)
        // Usar coordenadas de fallback
        tripForm.origin_lat = 40.4168
        tripForm.origin_lng = -3.7038
      }
    })
  } else {
    // // addLog('⚠️ Google Places no disponible para geolocalización')
    // Usar coordenadas de fallback
    tripForm.origin_lat = 40.4168
    tripForm.origin_lng = -3.7038
  }
}

function seleccionarDestino(suggestion: any) {
  tripForm.destination_name = suggestion.name
  showDestinationSuggestions.value = false
  destinationSuggestions.value = []
  
  // Si tiene coordenadas ya (datos locales), usarlas directamente
  if (suggestion.lat && suggestion.lng) {
    tripForm.destination_lat = suggestion.lat
    tripForm.destination_lng = suggestion.lng
    // // addLog(`🎯 Destino seleccionado: ${suggestion.name} (${suggestion.lat}, ${suggestion.lng})`)
  } else {
    // Si es de Google Places, obtener coordenadas reales
    obtenerCoordenadasDestino(suggestion.place_id, suggestion.name)
  }
}

function obtenerCoordenadasDestino(placeId: string, placeName: string) {
  if (window.google && window.google.maps && window.google.maps.places) {
    const placesService = new window.google.maps.places.PlacesService(document.createElement('div'))
    
    placesService.getDetails({
      placeId: placeId,
      fields: ['geometry', 'name', 'formatted_address']
    }, (place: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place && place.geometry) {
        const location = place.geometry.location
        tripForm.destination_lat = location.lat()
        tripForm.destination_lng = location.lng()
        // // addLog(`🎯 Destino geolocalizado: ${placeName} (${location.lat()}, ${location.lng()})`)
      } else {
        // // addLog(`⚠️ Error obteniendo coordenadas de destino: ${status}`)
        // Usar coordenadas de fallback
        tripForm.destination_lat = 40.4168
        tripForm.destination_lng = -3.7038
      }
    })
  } else {
    // // addLog('⚠️ Google Places no disponible para geolocalización')
    // Usar coordenadas de fallback
    tripForm.destination_lat = 40.4168
    tripForm.destination_lng = -3.7038
  }
}

// Funciones para seleccionar opciones predefinidas
function selectPredefinedOrigin(city: any) {
  tripForm.origin_name = city.name
  tripForm.origin_lat = city.lat
  tripForm.origin_lng = city.lng
  // // addLog(`📍 Origen predefinido seleccionado: ${city.name} (${city.population} hab.)`)
}

function selectPredefinedDestination(destination: any) {
  tripForm.destination_name = destination.name
  tripForm.destination_lat = destination.lat
  tripForm.destination_lng = destination.lng
  // // addLog(`🎯 Destino predefinido seleccionado: ${destination.name}`)
}


// Funciones para horarios especiales
function initializeSpecialSchedules() {
  daysOfWeek.forEach(day => {
    if (!specialSchedules.value[day.value]) {
      specialSchedules.value[day.value] = {
        departure_time: tripForm.departure_time,
        return_time: tripForm.return_time
      }
    }
  })
}

function updateSpecialSchedule(dayValue: number, field: 'departure_time' | 'return_time', value: string) {
  if (!specialSchedules.value[dayValue]) {
    specialSchedules.value[dayValue] = {
      departure_time: tripForm.departure_time,
      return_time: tripForm.return_time
    }
  }
  specialSchedules.value[dayValue][field] = value
  // // addLog(`⏰ Horario especial actualizado para ${daysOfWeek.find(d => d.value === dayValue)?.label}: ${field} = ${value}`)
}

function hideOriginSuggestions() {
  setTimeout(() => {
    showOriginSuggestions.value = false;
  }, 200);
}

function hideDestinationSuggestions() {
  setTimeout(() => {
    showDestinationSuggestions.value = false;
  }, 200);
}

async function createMonthlyTrip() {
  if (!tripForm.origin_name || !tripForm.destination_name) {
    // // addLog('❌ Por favor, completa origen y destino')
    return
  }

  loading.value = true
  // // addLog('🚗 Iniciando creación de viaje...')

  try {
    // Verificar si tenemos coordenadas de Google Places
    if (tripForm.origin_lat === 0 || tripForm.origin_lng === 0 || 
        tripForm.destination_lat === 0 || tripForm.destination_lng === 0) {
      // // addLog('⚠️ No se encontraron coordenadas precisas, usando fallback...')
      
      // Fallback a coordenadas predefinidas
      const originCoords = coordinates[tripForm.origin_name as keyof typeof coordinates]
      const destinationCoords = coordinates[tripForm.destination_name as keyof typeof coordinates]
      
      if (originCoords && destinationCoords) {
        tripForm.origin_lat = originCoords.lat
        tripForm.origin_lng = originCoords.lng
        tripForm.destination_lat = destinationCoords.lat
        tripForm.destination_lng = destinationCoords.lng
        // // addLog('📍 Usando coordenadas de fallback')
      } else {
        // // addLog('❌ No se encontraron coordenadas para la ubicación')
        return
      }
    } else {
      // // addLog('📍 Usando coordenadas de Google Places')
    }

    await processTripCreation(tripForm)

  } catch (error) {
    // // addLog(`❌ Error: ${error}`)
  } finally {
    loading.value = false
  }
}

async function processTripCreation(tripData: any) {
  try {
    // // addLog(`📍 Origen: ${tripForm.origin_name}`)
    // // addLog(`🎯 Destino: ${tripForm.destination_name}`)
    // // addLog(`🕐 Salida: ${tripForm.departure_time}`)
    // // addLog(`🕐 Llegada: ${tripForm.return_time}`)
    // // addLog(`👥 Plazas: ${tripForm.available_seats}`)
    // // addLog(`💰 Precio por plaza: €${tripForm.price_per_seat}`)
    // // addLog(`📅 Precio ${getTripTypeLabel()}: €${tripPrice.value}`)
    // // addLog(`🚗 Tipo de viaje: ${getTripTypeLabel()}`)
    // // addLog(`📅 Período: ${getRecurrenceDescription()}`)

    const result = await MonthlyTripsService.createMonthlyTrip(tripData)

    if (result) {
      // // addLog(`✅ Viaje creado exitosamente con ID: ${result.id}`)
      // // addLog('🎉 ¡Viaje configurado correctamente!')
    } else {
      // // addLog('❌ Error al crear el viaje')
    }

  } catch (error) {
    // // addLog(`❌ Error: ${error}`)
  }
}

function resetForm() {
  tripForm.origin_name = ''
  tripForm.destination_name = ''
  tripForm.departure_time = '08:00'
  tripForm.return_time = '18:00'
  tripForm.available_seats = 4
  tripForm.price_per_seat = 4.00
  tripForm.description = ''
  tripForm.days_of_week = [1, 2, 3, 4, 5]
  tripForm.origin_lat = 0
  tripForm.origin_lng = 0
  tripForm.destination_lat = 0
  tripForm.destination_lng = 0
  tripType.value = 'recurrent'
  tripPrice.value = 320
  startDate.value = '2024-11-01'
  endDate.value = '2024-11-30'
  monthlyDay.value = 1
  monthlyDuration.value = '12'
  showCalendar.value = false
  currentMonth.value = new Date().getMonth()
  currentYear.value = new Date().getFullYear()
  // // addLog('🔄 Formulario limpiado')
}

// Watcher para actualizar el precio cuando cambie el tipo de viaje
watch(tripType, (newType) => {
  console.log('🔄 Cambio de tipo de viaje:', newType)
  // // addLog(`🔄 Cambio detectado: ${newType}`)
  
  switch (newType) {
    case 'recurrent':
      tripPrice.value = 320
      // // addLog('✅ Configurado como Recurrente')
      break
    case 'weekly':
      tripPrice.value = 80
      // // addLog('✅ Configurado como Semanal')
      break
    case 'monthly':
      tripPrice.value = 150
      // // addLog('✅ Configurado como Mensual')
      break
    default:
      // // addLog(`❌ Tipo desconocido: ${newType}`)
  }
  // // addLog(`🚗 Tipo de viaje cambiado a: ${getTripTypeLabel()}`)
})

// Watcher para actualizar las fechas cuando cambie el tipo de viaje
watch(tripType, (newType) => {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  
  switch (newType) {
    case 'recurrent':
      startDate.value = todayStr
      endDate.value = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // +30 días
      // // addLog('📅 Fechas configuradas para viaje recurrente (30 días)')
      break
    case 'weekly':
      startDate.value = todayStr
      // Calcular fin de semana automáticamente
      const dayOfWeek = today.getDay()
      const daysToFriday = (5 - dayOfWeek + 7) % 7
      const end = new Date(today)
      end.setDate(today.getDate() + daysToFriday)
      endDate.value = end.toISOString().split('T')[0]
      // // addLog('📅 Fechas configuradas para viaje semanal (lunes a viernes)')
      break
    case 'monthly':
      startDate.value = todayStr
      monthlyDay.value = today.getDate()
      monthlyDuration.value = '12'
      // Para mensual, calcular fin según duración
      const startDateObj = new Date(todayStr)
      const endDateObj = new Date(startDateObj)
      endDateObj.setMonth(endDateObj.getMonth() + parseInt(monthlyDuration.value))
      endDate.value = endDateObj.toISOString().split('T')[0]
      // // addLog(`📅 Fechas configuradas para viaje mensual (${monthlyDuration.value} meses)`)
      break
  }
  // // addLog(`📅 Fechas actualizadas para: ${getTripTypeLabel()}`)
})

// Watcher para sincronizar el calendario con la fecha seleccionada
watch(startDate, (newDate) => {
  if (newDate) {
    const date = new Date(newDate)
    currentMonth.value = date.getMonth()
    currentYear.value = date.getFullYear()
  }
})

// Watcher para actualizar fecha de fin cuando cambie la duración mensual
watch(monthlyDuration, (newDuration) => {
  if (tripType.value === 'monthly' && startDate.value) {
    const startDateObj = new Date(startDate.value)
    const endDateObj = new Date(startDateObj)
    endDateObj.setMonth(endDateObj.getMonth() + parseInt(newDuration))
    endDate.value = endDateObj.toISOString().split('T')[0]
    // // addLog(`📅 Duración mensual actualizada: ${newDuration} meses`)
  }
})

// Inicializar Google Places al montar el componente
onMounted(() => {
  console.log('🔧 CreateMonthlyTrip montado, inicializando Google Places...')
  console.log('📋 Tipo de viaje inicial:', tripType.value)
  console.log('📍 showOriginSuggestions inicial:', showOriginSuggestions.value)
  console.log('📍 originSuggestions inicial:', originSuggestions.value)
  // // addLog('🚀 Componente inicializado')
  // // addLog(`📋 Tipo inicial: ${tripType.value}`)
  // // addLog(`📍 Variables de autocompletado inicializadas`)
  
  // Inicializar horarios especiales
  initializeSpecialSchedules()
  
  // Esperar a que Google Maps esté cargado
  const checkGoogleMaps = () => {
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log('✅ Google Maps cargado, inicializando Places...')
      initializeGooglePlaces()
    } else {
      console.log('⏳ Esperando Google Maps...')
      setTimeout(checkGoogleMaps, 100)
    }
  }
  
  checkGoogleMaps()
})
</script>
