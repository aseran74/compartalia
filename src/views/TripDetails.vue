<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header con navegación -->
      <div class="mb-8">
        <button 
          @click="$router.go(-1)"
          class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          <span>Volver</span>
        </button>
        
        <h1 class="text-3xl font-bold text-gray-900">Detalles del Viaje</h1>
      </div>

      <!-- Card principal del viaje -->
      <div v-if="trip" class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <!-- Header con conductor y precio -->
        <div class="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <img 
                :src="trip.driver_avatar || '/images/user/default-avatar.jpg'" 
                :alt="trip.driver_name || 'Conductor'"
                class="w-16 h-16 rounded-full border-4 border-white object-cover"
                @error="$event.target.src='/images/user/default-avatar.jpg'"
              />
              <div>
                <h2 class="text-2xl font-bold">{{ trip.driver_name || 'Conductor' }}</h2>
                <div class="flex items-center space-x-2 text-green-100">
                  <span>⭐ {{ trip.driver_rating || '4.8' }}</span>
                  <span>•</span>
                  <span>{{ trip.trips_completed || '50+' }} viajes</span>
                </div>
              </div>
            </div>
            
            <div class="text-right">
              <div class="text-4xl font-bold">{{ trip.price_per_seat }}€</div>
              <div class="text-green-100">por asiento</div>
            </div>
          </div>
        </div>

        <!-- Información de la ruta -->
        <div class="p-6">
          <div class="mb-8">
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Ruta del Viaje</h3>
            
            <!-- Origen -->
            <div class="flex items-center space-x-4 mb-4">
              <div class="flex-shrink-0 w-4 h-4 bg-green-500 rounded-full"></div>
              <div class="flex-1">
                <div class="font-semibold text-gray-900">{{ trip.origin_name }}</div>
                <div class="text-sm text-gray-500">Punto de origen</div>
              </div>
            </div>
            
            <!-- Línea conectora -->
            <div class="flex items-center space-x-4 ml-2 mb-4">
              <div class="w-px h-8 bg-gray-300"></div>
              <div class="flex-1 h-px bg-gray-300"></div>
              <span class="text-gray-400 text-sm">→</span>
              <div class="flex-1 h-px bg-gray-300"></div>
            </div>
            
            <!-- Destino -->
            <div class="flex items-center space-x-4">
              <div class="flex-shrink-0 w-4 h-4 bg-red-500 rounded-full"></div>
              <div class="flex-1">
                <div class="font-semibold text-gray-900">{{ trip.destination_name }}</div>
                <div class="text-sm text-gray-500">Punto de destino</div>
              </div>
            </div>
          </div>

          <!-- Información detallada -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <!-- Fecha y hora -->
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center space-x-3 mb-2">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div>
                  <div class="font-semibold text-gray-900">Fecha y Hora</div>
                  <div class="text-sm text-gray-600">{{ formatDateTime(trip.departure_time) }}</div>
                </div>
              </div>
            </div>

            <!-- Asientos disponibles -->
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center space-x-3 mb-2">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
                <div>
                  <div class="font-semibold text-gray-900">Asientos</div>
                  <div class="text-sm text-gray-600">
                    <span v-if="bookingInfo">{{ bookingInfo.remaining_seats }} de {{ bookingInfo.total_seats }} disponibles</span>
                    <span v-else>{{ trip.available_seats }} disponibles</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tipo de viaje -->
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center space-x-3 mb-2">
                <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <div class="font-semibold text-gray-900">Tipo</div>
                  <div class="text-sm text-gray-600">
                    <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {{ getTripTypeLabel(trip) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Distancia -->
            <div v-if="distance" class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center space-x-3 mb-2">
                <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <div>
                  <div class="font-semibold text-gray-900">Distancia</div>
                  <div class="text-sm text-gray-600">{{ distance.toFixed(1) }} km</div>
                </div>
              </div>
            </div>

            <!-- Vehículo -->
            <div v-if="trip.vehicle" class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center space-x-3 mb-2">
                <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                  </svg>
                </div>
                <div>
                  <div class="font-semibold text-gray-900">Vehículo</div>
                  <div class="text-sm text-gray-600">{{ trip.vehicle.brand }} {{ trip.vehicle.model }}</div>
                </div>
              </div>
            </div>

            <!-- Estado -->
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center space-x-3 mb-2">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <div class="font-semibold text-gray-900">Estado</div>
                  <div class="text-sm text-gray-600">Verificado</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Descripción -->
          <div v-if="trip.description" class="mb-8">
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Descripción</h3>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-gray-700">{{ trip.description }}</p>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="flex flex-col sm:flex-row gap-4">
            <button
              v-if="!bookingInfo || bookingInfo.remaining_seats > 0"
              @click="openBookingModal"
              class="flex-1 bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 text-lg font-medium transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Reservar Ahora
            </button>
            <div
              v-else
              class="flex-1 bg-gray-300 text-gray-600 px-6 py-4 rounded-lg text-lg cursor-not-allowed text-center"
            >
              Sin asientos disponibles
            </div>
            
            <button
              @click="contactDriver"
              class="flex-1 bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 text-lg font-medium transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Contactar Conductor
            </button>
          </div>
        </div>
      </div>

      <!-- Estado de carga -->
      <div v-else-if="isLoading" class="text-center py-12">
        <div class="animate-spin mx-auto w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
        <p class="mt-4 text-gray-600">Cargando detalles del viaje...</p>
      </div>

      <!-- Error -->
      <div v-else class="text-center py-12">
        <div class="text-6xl mb-4">😔</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Viaje no encontrado</h3>
        <p class="text-gray-600 mb-4">El viaje que buscas no existe o ha sido eliminado.</p>
        <button
          @click="$router.go(-1)"
          class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Volver
        </button>
      </div>
    </div>

    <!-- Modal de Reserva -->
    <BookingModal
      :is-open="showBookingModal"
      :trip="trip"
      :booking-info="bookingInfo"
      @close="closeBookingModal"
      @booking-confirmed="onBookingConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BookingModal from '@/components/carpooling/BookingModal.vue'

const route = useRoute()
const router = useRouter()

// Estado del viaje
const trip = ref<any>(null)
const bookingInfo = ref<any>(null)
const distance = ref<number | null>(null)
const isLoading = ref(true)

// Modal de reserva
const showBookingModal = ref(false)

// Cargar detalles del viaje
onMounted(async () => {
  const tripId = route.params.id as string
  
  try {
    // Aquí iría la llamada al servicio para obtener los detalles del viaje
    // Por ahora simulamos la carga
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Datos simulados - en producción vendrían del servicio
    trip.value = {
      id: tripId,
      driver_name: 'Miguel Torres',
      driver_avatar: '/images/user/user-01.jpg',
      driver_rating: '4.7',
      trips_completed: '50+',
      origin_name: 'Getafe',
      destination_name: 'Chamartín',
      departure_time: '2025-10-25T07:30:00Z',
      price_per_seat: 8.00,
      available_seats: 4,
      description: 'Viaje cómodo y puntual desde Getafe hasta Chamartín. Parada en Nuevos Ministerios disponible.',
      vehicle: {
        brand: 'Peugeot',
        model: '308'
      }
    }
    
    bookingInfo.value = {
      remaining_seats: 4,
      total_seats: 4,
      is_fully_booked: false
    }
    
    distance.value = 15.2
    
  } catch (error) {
    console.error('Error cargando detalles del viaje:', error)
  } finally {
    isLoading.value = false
  }
})

// Funciones para el tipo de viaje
const getTripTypeLabel = (trip: any) => {
  const tripType = trip.trip_type || trip.trip_frequency || 'diario'
  
  switch (tripType.toLowerCase()) {
    case 'daily':
    case 'diario':
      return 'Diario'
    case 'weekly':
    case 'semanal':
      return 'Semanal'
    case 'monthly':
    case 'mensual':
      return 'Mensual'
    default:
      return 'Diario'
  }
}

// Formatear fecha y hora
const formatDateTime = (dateTime: string) => {
  const date = new Date(dateTime)
  return date.toLocaleString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Modal de reserva
const openBookingModal = () => {
  showBookingModal.value = true
}

const closeBookingModal = () => {
  showBookingModal.value = false
}

const onBookingConfirmed = (booking: any) => {
  console.log('Reserva confirmada:', booking)
  closeBookingModal()
}

// Contactar conductor
const contactDriver = () => {
  // Aquí iría la lógica para contactar al conductor
  console.log('Contactando conductor:', trip.value?.driver_name)
}
</script>
