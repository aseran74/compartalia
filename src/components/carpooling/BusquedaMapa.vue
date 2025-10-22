<template>
  <div class="p-6 max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">🗺️ Búsqueda de Viajes por Mapa</h1>
    
    <!-- Panel de filtros -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">📍 Configuración de Búsqueda</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Origen -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">🚗 Origen</label>
          <div class="relative">
            <input
              v-model="origen"
              @input="buscarOrigen"
              @focus="showOrigenSuggestions = true"
              @blur="hideOrigenSuggestions"
              type="text"
              placeholder="Selecciona o busca un origen..."
              class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              @click="abrirModalOrigen"
              type="button"
              class="absolute right-2 top-2 p-1 text-gray-400 hover:text-blue-500 transition-colors"
              title="Seleccionar de orígenes comunes"
            >
              📍
            </button>
            <div v-if="showOrigenSuggestions && origenSuggestions.length > 0" class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              <div
                v-for="(suggestion, index) in origenSuggestions"
                :key="index"
                @click="seleccionarOrigen(suggestion)"
                class="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div class="font-medium text-gray-900">{{ suggestion.main_text }}</div>
                <div class="text-sm text-gray-600">{{ suggestion.secondary_text }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Rango de horarios -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">🕐 Rango de horarios</label>
          <select
            v-model="rangoHorarios"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="mañana">🌅 Mañana (6:00 - 12:00)</option>
            <option value="tarde">🌞 Tarde (12:00 - 18:00)</option>
            <option value="noche">🌙 Noche (18:00 - 24:00)</option>
            <option value="personalizado">⚙️ Personalizado</option>
          </select>
        </div>
        
        <!-- Intervalo de tiempo -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">⏱️ Intervalo</label>
          <select
            v-model="intervalo"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="15">Cada 15 minutos</option>
            <option value="30">Cada 30 minutos</option>
            <option value="60">Cada 1 hora</option>
            <option value="120">Cada 2 horas</option>
          </select>
        </div>
        
        <!-- Botón de búsqueda -->
        <div class="flex items-end">
          <button
            @click="buscarViajes"
            :disabled="!origen || loading"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Buscando...' : '🔍 Buscar Viajes' }}
          </button>
        </div>
      </div>
      
      <!-- Horarios personalizados -->
      <div v-if="rangoHorarios === 'personalizado'" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">🕐 Hora inicio</label>
          <input
            v-model="horaInicio"
            type="time"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">🕐 Hora fin</label>
          <input
            v-model="horaFin"
            type="time"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <!-- Orígenes predefinidos -->
      <div class="mt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-3">📍 Orígenes más comunes</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
          <button
            v-for="origenComun in origenesComunes"
            :key="origenComun.nombre"
            @click="seleccionarOrigenComun(origenComun)"
            :class="[
              'px-3 py-2 text-sm rounded-md border transition-colors',
              origen === origenComun.nombre
                ? 'bg-blue-100 border-blue-300 text-blue-800'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            ]"
          >
            <div class="font-medium">{{ origenComun.nombre.split(',')[0] }}</div>
            <div class="text-xs text-gray-500">{{ origenComun.poblacion }} hab.</div>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Estadísticas -->
    <div v-if="estadisticas.totalViajes > 0" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-blue-50 rounded-lg p-4">
        <div class="text-2xl font-bold text-blue-600">{{ estadisticas.totalViajes }}</div>
        <div class="text-sm text-blue-600">Total Viajes</div>
      </div>
      <div class="bg-green-50 rounded-lg p-4">
        <div class="text-2xl font-bold text-green-600">{{ estadisticas.destinosUnicos }}</div>
        <div class="text-sm text-green-600">Destinos Únicos</div>
      </div>
      <div class="bg-purple-50 rounded-lg p-4">
        <div class="text-2xl font-bold text-purple-600">{{ estadisticas.conductoresActivos }}</div>
        <div class="text-sm text-purple-600">Conductores</div>
      </div>
      <div class="bg-orange-50 rounded-lg p-4">
        <div class="text-2xl font-bold text-orange-600">{{ estadisticas.plazasDisponibles }}</div>
        <div class="text-sm text-orange-600">Plazas Disponibles</div>
      </div>
    </div>
    
    <!-- Mapa y lista de viajes -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Mapa -->
      <div class="bg-white rounded-lg shadow-md">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold">🗺️ Mapa de Destinos</h3>
        </div>
        <div class="p-4">
          <div id="mapa" ref="mapContainer" class="w-full h-[600px] bg-gray-100 rounded-lg">
            <div v-if="!mapaCargado" class="h-full flex items-center justify-center">
              <div class="text-center">
                <div class="text-4xl mb-2">🗺️</div>
                <p class="text-gray-600">Cargando mapa...</p>
              </div>
            </div>
            <div v-else-if="viajes.length === 0" class="h-full flex items-center justify-center">
              <div class="text-center">
                <div class="text-4xl mb-2">📍</div>
                <p class="text-gray-600">Selecciona un origen para ver los destinos</p>
              </div>
            </div>
          </div>
          
          <!-- Leyenda del mapa -->
          <div v-if="viajes.length > 0" class="mt-4 flex flex-wrap gap-2">
            <div class="flex items-center space-x-2">
              <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span class="text-sm text-gray-600">Origen</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-4 h-4 bg-green-500 rounded-full"></div>
              <span class="text-sm text-gray-600">Destinos</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-4 h-4 bg-red-500 rounded-full"></div>
              <span class="text-sm text-gray-600">Viajes seleccionados</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Lista de viajes -->
      <div class="bg-white rounded-lg shadow-md">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">🚗 Viajes Disponibles</h3>
            <div class="flex items-center space-x-2">
              <button
                @click="ordenarPor = 'hora'"
                :class="[
                  'px-3 py-1 rounded-md text-sm',
                  ordenarPor === 'hora' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                ]"
              >
                🕐 Hora
              </button>
              <button
                @click="ordenarPor = 'destino'"
                :class="[
                  'px-3 py-1 rounded-md text-sm',
                  ordenarPor === 'destino' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                ]"
              >
                📍 Destino
              </button>
              <button
                @click="ordenarPor = 'precio'"
                :class="[
                  'px-3 py-1 rounded-md text-sm',
                  ordenarPor === 'precio' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                ]"
              >
                💰 Precio
              </button>
            </div>
          </div>
        </div>
        
        <div class="max-h-96 overflow-y-auto">
          <div v-if="viajesFiltrados.length === 0" class="p-6 text-center">
            <div class="text-4xl mb-2">🚗</div>
            <p class="text-gray-600">No se encontraron viajes</p>
          </div>
          
          <div
            v-for="viaje in viajesFiltrados"
            :key="viaje.id"
            @click="seleccionarViaje(viaje)"
            :class="[
              'p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50',
              viajeSeleccionado?.id === viaje.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
            ]"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-2">
                  <div class="flex items-center space-x-2">
                    <img
                      :src="viaje.conductor.avatar || '/images/user/default-avatar.png'"
                      :alt="viaje.conductor.nombre"
                      class="h-8 w-8 rounded-full object-cover"
                    />
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ viaje.conductor.nombre }}</p>
                      <div class="flex items-center">
                        <span class="text-yellow-400">⭐</span>
                        <span class="text-sm text-gray-600 ml-1">{{ viaje.conductor.rating }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span class="font-medium text-gray-700">🕐 Hora:</span>
                    <span class="text-gray-600">{{ formatTime(viaje.horaSalida) }}</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700">📍 Destino:</span>
                    <span class="text-gray-600">{{ viaje.destino }}</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700">💰 Precio:</span>
                    <span class="text-gray-600">{{ viaje.precio }}€</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700">👥 Plazas:</span>
                    <span class="text-gray-600">{{ viaje.plazasDisponibles }}/{{ viaje.plazasTotales }}</span>
                  </div>
                </div>
              </div>
              
              <div class="flex flex-col items-end space-y-2">
                <button
                  @click.stop="verDetallesViaje(viaje)"
                  class="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  👁️ Ver
                </button>
                <button
                  @click.stop="contactarConductor(viaje)"
                  class="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                >
                  💬 Contactar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de detalles del viaje -->
    <div
      v-if="showDetallesModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              🚗 Detalles del Viaje
            </h3>
            <button
              @click="showDetallesModal = false"
              class="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div v-if="viajeSeleccionado" class="space-y-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-2">📍 Información del Viaje</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="font-medium">Origen:</span>
                  <span>{{ viajeSeleccionado.origen }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">Destino:</span>
                  <span>{{ viajeSeleccionado.destino }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">Hora de salida:</span>
                  <span>{{ formatTime(viajeSeleccionado.horaSalida) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">Precio:</span>
                  <span>{{ viajeSeleccionado.precio }}€</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">Plazas disponibles:</span>
                  <span>{{ viajeSeleccionado.plazasDisponibles }}/{{ viajeSeleccionado.plazasTotales }}</span>
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-2">👤 Conductor</h4>
              <div class="flex items-center space-x-3">
                <img
                  :src="viajeSeleccionado.conductor.avatar || '/images/user/default-avatar.png'"
                  :alt="viajeSeleccionado.conductor.nombre"
                  class="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p class="font-medium text-gray-900">{{ viajeSeleccionado.conductor.nombre }}</p>
                  <div class="flex items-center">
                    <span class="text-yellow-400">⭐</span>
                    <span class="text-sm text-gray-600 ml-1">{{ viajeSeleccionado.conductor.rating }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button
                @click="showDetallesModal = false"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cerrar
              </button>
              <button
                @click="contactarConductor(viajeSeleccionado)"
                class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                💬 Contactar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de selección de origen -->
    <div v-if="showOrigenModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-xl font-semibold text-gray-900">📍 Seleccionar Origen</h3>
          <button
            @click="showOrigenModal = false"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto max-h-[60vh]">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              v-for="origenComun in origenesComunes"
              :key="origenComun.nombre"
              @click="seleccionarOrigenComun(origenComun)"
              :class="[
                'p-4 rounded-lg border transition-all duration-200 text-left',
                origen === origenComun.nombre
                  ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                  : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              ]"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-900 mb-1">{{ origenComun.nombre }}</h4>
                  <p class="text-sm text-gray-600 mb-2">{{ origenComun.poblacion }} habitantes</p>
                  <div class="flex items-center text-xs text-gray-500">
                    <span class="mr-2">📍</span>
                    <span>{{ origenComun.lat.toFixed(4) }}, {{ origenComun.lng.toFixed(4) }}</span>
                  </div>
                </div>
                <div v-if="origen === origenComun.nombre" class="ml-2">
                  <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
        
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            @click="showOrigenModal = false"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { supabase } from '@/config/supabase';

// Interfaces
interface Viaje {
  id: string;
  origen: string;
  destino: string;
  horaSalida: Date;
  precio: number;
  plazasDisponibles: number;
  plazasTotales: number;
  conductor: {
    id: string;
    nombre: string;
    avatar?: string;
    rating: number;
  };
  coordenadas: {
    origen: { lat: number; lng: number };
    destino: { lat: number; lng: number };
  };
}

interface Estadisticas {
  totalViajes: number;
  destinosUnicos: number;
  conductoresActivos: number;
  plazasDisponibles: number;
}

// Estado reactivo
const origen = ref('');
const rangoHorarios = ref('mañana');
const intervalo = ref('30');
const horaInicio = ref('06:00');
const horaFin = ref('12:00');
const loading = ref(false);
const showOrigenSuggestions = ref(false);
const origenSuggestions = ref<any[]>([]);
const showOrigenModal = ref(false);

// Orígenes más comunes del extrarradio de Madrid
const origenesComunes = [
  { nombre: 'Torrejón de Ardoz', lat: 40.4594, lng: -3.4697, poblacion: '132,000' },
  { nombre: 'Getafe', lat: 40.3071, lng: -3.7332, poblacion: '185,000' },
  { nombre: 'Móstoles', lat: 40.3222, lng: -3.8647, poblacion: '210,000' },
  { nombre: 'Alcalá de Henares', lat: 40.4817, lng: -3.3643, poblacion: '195,000' },
  { nombre: 'Fuenlabrada', lat: 40.2842, lng: -3.7942, poblacion: '193,000' },
  { nombre: 'Leganés', lat: 40.3277, lng: -3.7656, poblacion: '190,000' },
  { nombre: 'Alcorcón', lat: 40.3478, lng: -3.8244, poblacion: '170,000' },
  { nombre: 'Parla', lat: 40.2361, lng: -3.7675, poblacion: '130,000' },
  { nombre: 'Alcobendas', lat: 40.5474, lng: -3.6420, poblacion: '118,000' },
  { nombre: 'Las Rozas de Madrid', lat: 40.4929, lng: -3.8739, poblacion: '96,000' },
  { nombre: 'San Sebastián de los Reyes', lat: 40.5474, lng: -3.6256, poblacion: '90,000' },
  { nombre: 'Pozuelo de Alarcón', lat: 40.4329, lng: -3.8146, poblacion: '88,000' },
  { nombre: 'Coslada', lat: 40.4238, lng: -3.5613, poblacion: '83,000' },
  { nombre: 'Valdemoro', lat: 40.1908, lng: -3.6758, poblacion: '77,000' },
  { nombre: 'Rivas-Vaciamadrid', lat: 40.3333, lng: -3.5333, poblacion: '88,000' },
  { nombre: 'Majadahonda', lat: 40.4738, lng: -3.8725, poblacion: '72,000' },
  { nombre: 'Collado Villalba', lat: 40.6447, lng: -4.0075, poblacion: '64,000' },
  { nombre: 'Arganda del Rey', lat: 40.3000, lng: -3.4333, poblacion: '57,000' },
  { nombre: 'Pinto', lat: 40.2417, lng: -3.7000, poblacion: '52,000' },
  { nombre: 'Villaviciosa de Odón', lat: 40.3578, lng: -3.9000, poblacion: '48,000' }
];
const viajes = ref<Viaje[]>([]);
const viajeSeleccionado = ref<Viaje | null>(null);
const showDetallesModal = ref(false);
const ordenarPor = ref('hora');
const mapaCargado = ref(false);
const mapContainer = ref<HTMLElement | null>(null);
const map = ref<any>(null);
const markers = ref<any[]>([]);

// Datos de ejemplo
const viajesEjemplo: Viaje[] = [
  {
    id: '1',
    origen: 'Torrejón de Ardoz',
    destino: 'Madrid Centro',
    horaSalida: new Date('2024-01-15T07:00:00'),
    precio: 8,
    plazasDisponibles: 2,
    plazasTotales: 4,
    conductor: {
      id: 'c1',
      nombre: 'María García',
      avatar: '/images/user/user-01.jpg',
      rating: 4.8
    },
    coordenadas: {
      origen: { lat: 40.4594, lng: -3.4697 },
      destino: { lat: 40.4168, lng: -3.7038 }
    }
  },
  {
    id: '2',
    origen: 'Torrejón de Ardoz',
    destino: 'Aeropuerto Madrid',
    horaSalida: new Date('2024-01-15T07:30:00'),
    precio: 12,
    plazasDisponibles: 1,
    plazasTotales: 3,
    conductor: {
      id: 'c2',
      nombre: 'Carlos López',
      avatar: '/images/user/user-02.jpg',
      rating: 4.6
    },
    coordenadas: {
      origen: { lat: 40.4594, lng: -3.4697 },
      destino: { lat: 40.4839, lng: -3.5680 }
    }
  },
  {
    id: '3',
    origen: 'Torrejón de Ardoz',
    destino: 'Chamartín',
    horaSalida: new Date('2024-01-15T08:00:00'),
    precio: 7,
    plazasDisponibles: 3,
    plazasTotales: 4,
    conductor: {
      id: 'c3',
      nombre: 'Ana Martínez',
      avatar: '/images/user/user-03.jpg',
      rating: 4.9
    },
    coordenadas: {
      origen: { lat: 40.4594, lng: -3.4697 },
      destino: { lat: 40.4740, lng: -3.6827 }
    }
  },
  {
    id: '4',
    origen: 'Torrejón de Ardoz',
    destino: 'Nuevos Ministerios',
    horaSalida: new Date('2024-01-15T08:30:00'),
    precio: 9,
    plazasDisponibles: 2,
    plazasTotales: 4,
    conductor: {
      id: 'c4',
      nombre: 'David Rodríguez',
      avatar: '/images/user/user-04.jpg',
      rating: 4.7
    },
    coordenadas: {
      origen: { lat: 40.4594, lng: -3.4697 },
      destino: { lat: 40.4460, lng: -3.6910 }
    }
  },
  {
    id: '5',
    origen: 'Torrejón de Ardoz',
    destino: 'Plaza de Castilla',
    horaSalida: new Date('2024-01-15T09:00:00'),
    precio: 8,
    plazasDisponibles: 4,
    plazasTotales: 4,
    conductor: {
      id: 'c5',
      nombre: 'Laura Sánchez',
      avatar: '/images/user/user-05.jpg',
      rating: 4.5
    },
    coordenadas: {
      origen: { lat: 40.4594, lng: -3.4697 },
      destino: { lat: 40.4663, lng: -3.6896 }
    }
  }
];

// Computed properties
const viajesFiltrados = computed(() => {
  let filtrados = viajes.value;
  
  // Filtrar por rango de horarios
  if (rangoHorarios.value !== 'personalizado') {
    const horaActual = new Date();
    const horaInicioNum = rangoHorarios.value === 'mañana' ? 6 : 
                         rangoHorarios.value === 'tarde' ? 12 : 18;
    const horaFinNum = rangoHorarios.value === 'mañana' ? 12 : 
                       rangoHorarios.value === 'tarde' ? 18 : 24;
    
    filtrados = filtrados.filter(viaje => {
      const horaViaje = viaje.horaSalida.getHours();
      return horaViaje >= horaInicioNum && horaViaje < horaFinNum;
    });
  }
  
  // Ordenar
  filtrados.sort((a, b) => {
    switch (ordenarPor.value) {
      case 'hora':
        return a.horaSalida.getTime() - b.horaSalida.getTime();
      case 'destino':
        return a.destino.localeCompare(b.destino);
      case 'precio':
        return a.precio - b.precio;
      default:
        return 0;
    }
  });
  
  return filtrados;
});

const estadisticas = computed(() => {
  const totalViajes = viajes.value.length;
  const destinosUnicos = new Set(viajes.value.map(v => v.destino)).size;
  const conductoresActivos = new Set(viajes.value.map(v => v.conductor.id)).size;
  const plazasDisponibles = viajes.value.reduce((sum, v) => sum + v.plazasDisponibles, 0);
  
  return { totalViajes, destinosUnicos, conductoresActivos, plazasDisponibles };
});

// Métodos
function buscarOrigen() {
  // Simular búsqueda de lugares
  const lugares = [
    { main_text: 'Torrejón de Ardoz', secondary_text: 'Madrid, España' },
    { main_text: 'Torrejón de Ardoz, Madrid', secondary_text: 'Comunidad de Madrid, España' },
    { main_text: 'Torrejón de Ardoz Centro', secondary_text: 'Torrejón de Ardoz, Madrid' }
  ];
  
  origenSuggestions.value = lugares.filter(lugar =>
    lugar.main_text.toLowerCase().includes(origen.value.toLowerCase())
  );
}

function seleccionarOrigen(suggestion: any) {
  origen.value = suggestion.main_text;
  showOrigenSuggestions.value = false;
  origenSuggestions.value = [];
}

function hideOrigenSuggestions() {
  setTimeout(() => {
    showOrigenSuggestions.value = false;
  }, 200);
}

function seleccionarOrigenComun(origenComun: any) {
  origen.value = origenComun.nombre;
  showOrigenModal.value = false;
  buscarViajes();
}

function abrirModalOrigen() {
  showOrigenModal.value = true;
}

async function buscarViajes() {
  if (!origen.value) return;
  
  loading.value = true;
  
  try {
    console.log('🔍 Buscando viajes reales desde Supabase...');
    
    // Buscar viajes reales de Supabase
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .ilike('origin_name', `%${origen.value}%`)
      .eq('status', 'active')
      .gte('departure_time', new Date().toISOString())
      .limit(20);

    if (error) {
      console.error('❌ Error buscando viajes:', error);
      // Fallback a datos de ejemplo si hay error
      viajes.value = viajesEjemplo;
    } else {
      console.log(`✅ Encontrados ${data?.length || 0} viajes reales`);
      
      // Convertir datos de Supabase al formato esperado
      viajes.value = data?.map(trip => ({
        id: trip.id,
        origen: trip.origin_name,
        destino: trip.destination_name,
        horaSalida: new Date(trip.departure_time),
        precio: parseFloat(trip.price_per_seat),
        plazasDisponibles: trip.available_seats,
        plazasTotales: 4,
        conductor: {
          id: trip.driver_id,
          nombre: 'Conductor',
          avatar: '/images/user/user-01.jpg',
          rating: 4.5
        },
        coordenadas: {
          origen: { lat: parseFloat(trip.origin_lat), lng: parseFloat(trip.origin_lng) },
          destino: { lat: parseFloat(trip.destination_lat), lng: parseFloat(trip.destination_lng) }
        }
      })) || [];
    }
    
    mapaCargado.value = true;
    loading.value = false;
    
    // Inicializar mapa después de cargar los viajes
    nextTick(() => {
      inicializarMapa();
    });
  } catch (error) {
    console.error('❌ Error en buscarViajes:', error);
    // Fallback a datos de ejemplo
    viajes.value = viajesEjemplo;
    mapaCargado.value = true;
    loading.value = false;
    
    nextTick(() => {
      inicializarMapa();
    });
  }
}

function inicializarMapa() {
  if (!mapContainer.value || !window.google) {
    console.log('Google Maps no está disponible');
    return;
  }

  // Verificar que el elemento del mapa existe y es válido
  if (!mapContainer.value || !(mapContainer.value instanceof HTMLElement)) {
    console.error('El contenedor del mapa no es válido');
    return;
  }

  // Buscar coordenadas del origen seleccionado
  const origenSeleccionado = origenesComunes.find(o => o.nombre === origen.value);
  const centro = origenSeleccionado 
    ? { lat: origenSeleccionado.lat, lng: origenSeleccionado.lng }
    : { lat: 40.4594, lng: -3.4697 }; // Torrejón como fallback
  
  // Crear el mapa
  map.value = new window.google.maps.Map(mapContainer.value, {
    zoom: 10,
    center: centro,
    mapTypeId: 'roadmap',
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  });

  // Limpiar marcadores anteriores
  limpiarMarcadores();

  // Agregar marcador del origen
  agregarMarcadorOrigen(centro);

  // Agregar marcadores de destinos
  viajes.value.forEach(viaje => {
    agregarMarcadorDestino(viaje);
  });
}

function limpiarMarcadores() {
  markers.value.forEach(marker => {
    marker.setMap(null);
  });
  markers.value = [];
}

function agregarMarcadorOrigen(coordenadas: { lat: number; lng: number }) {
  const marker = new window.google.maps.Marker({
    position: coordenadas,
    map: map.value,
    title: 'Origen: ' + origen.value,
    icon: {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="#1E40AF" stroke-width="2"/>
          <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">🚗</text>
        </svg>
      `),
      scaledSize: new window.google.maps.Size(32, 32),
      anchor: new window.google.maps.Point(16, 16)
    }
  });

  const infoWindow = new window.google.maps.InfoWindow({
    content: `
      <div class="p-2">
        <h3 class="font-semibold text-blue-600">🚗 ${origen.value}</h3>
        <p class="text-sm text-gray-600">Punto de origen</p>
      </div>
    `
  });

  marker.addListener('click', () => {
    infoWindow.open(map.value, marker);
  });

  markers.value.push(marker);
}

function agregarMarcadorDestino(viaje: Viaje) {
  const marker = new window.google.maps.Marker({
    position: viaje.coordenadas.destino,
    map: map.value,
    title: viaje.destino,
    icon: {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#10B981" stroke="#059669" stroke-width="2"/>
          <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">📍</text>
        </svg>
      `),
      scaledSize: new window.google.maps.Size(28, 28),
      anchor: new window.google.maps.Point(14, 14)
    }
  });

  const infoWindow = new window.google.maps.InfoWindow({
    content: `
      <div class="p-3 min-w-[200px]">
        <h3 class="font-semibold text-green-600 mb-2">📍 ${viaje.destino}</h3>
        <div class="space-y-1 text-sm">
          <p><span class="font-medium">🕐 Hora:</span> ${formatTime(viaje.horaSalida)}</p>
          <p><span class="font-medium">💰 Precio:</span> ${viaje.precio}€</p>
          <p><span class="font-medium">👥 Plazas:</span> ${viaje.plazasDisponibles}/${viaje.plazasTotales}</p>
          <p><span class="font-medium">👤 Conductor:</span> ${viaje.conductor.nombre}</p>
        </div>
        <button onclick="verViaje('${viaje.id}')" class="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
          Ver Detalles
        </button>
      </div>
    `
  });

  marker.addListener('click', () => {
    infoWindow.open(map.value, marker);
    seleccionarViaje(viaje);
  });

  markers.value.push(marker);
}

function seleccionarViaje(viaje: Viaje) {
  viajeSeleccionado.value = viaje;
}

function verDetallesViaje(viaje: Viaje) {
  viajeSeleccionado.value = viaje;
  showDetallesModal.value = true;
}

function contactarConductor(viaje: Viaje) {
  // Navegar a mensajería con el conductor
  window.location.href = `/carpooling/mensajeria?user=${viaje.conductor.id}`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Función global para el botón del mapa
(window as any).verViaje = (viajeId: string) => {
  const viaje = viajes.value.find(v => v.id === viajeId);
  if (viaje) {
    verDetallesViaje(viaje);
  }
};

// Función de callback para Google Maps
(window as any).initGoogleMaps = () => {
  console.log('Google Maps inicializado correctamente');
};

// Inicialización
onMounted(() => {
  console.log('Componente BusquedaMapa montado');
  
  // Esperar a que Google Maps esté cargado
  const checkGoogleMaps = () => {
    if (window.google && window.google.maps) {
      console.log('Google Maps cargado correctamente');
      // Cargar viajes por defecto
      buscarViajes();
    } else {
      console.log('Esperando Google Maps...');
      setTimeout(checkGoogleMaps, 100);
    }
  };
  
  checkGoogleMaps();
});
</script>

<style scoped>
/* Estilos adicionales si es necesario */
</style>
