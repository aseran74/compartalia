<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full">
      <div class="p-6 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h3 class="text-xl font-bold text-gray-900">🚗 Reservar Asiento</h3>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div v-if="trip" class="p-6">
        <!-- Información del viaje -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="flex items-center space-x-2 mb-2">
            <span class="text-sm font-medium text-gray-500">📍</span>
            <span class="font-medium">{{ trip.origin_name }}</span>
            <span class="text-gray-400">→</span>
            <span class="font-medium">{{ trip.destination_name }}</span>
          </div>
          <div class="flex items-center space-x-4 text-sm text-gray-600">
            <span>🕐 {{ formatTime(trip.departure_time) }}</span>
            <span>💰 {{ trip.price_per_seat }}€/asiento</span>
            <span v-if="bookingInfo">🪑 {{ bookingInfo.remaining_seats }} disponibles</span>
          </div>
        </div>

        <!-- Formulario de reserva -->
        <form @submit.prevent="confirmBooking" class="space-y-4">
          <!-- Número de asientos -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Número de asientos
            </label>
            <select
              v-model="bookingForm.seats"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              :max="bookingInfo?.remaining_seats || trip.available_seats"
            >
              <option
                v-for="seat in getAvailableSeats()"
                :key="seat"
                :value="seat"
              >
                {{ seat }} asiento{{ seat > 1 ? 's' : '' }}
              </option>
            </select>
          </div>

          <!-- Ubicación de recogida -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Ubicación de recogida (opcional)
            </label>
            <input
              v-model="bookingForm.pickupLocation"
              type="text"
              placeholder="Ej: Estación de metro más cercana"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <!-- Notas adicionales -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Notas adicionales (opcional)
            </label>
            <textarea
              v-model="bookingForm.notes"
              rows="3"
              placeholder="Cualquier información adicional..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            ></textarea>
          </div>

          <!-- Resumen del precio -->
          <div class="bg-green-50 rounded-lg p-4">
            <div class="flex justify-between items-center">
              <span class="font-medium text-gray-900">Total a pagar:</span>
              <span class="text-xl font-bold text-green-600">
                {{ (trip.price_per_seat * bookingForm.seats).toFixed(2) }}€
              </span>
            </div>
            <div class="text-sm text-gray-600 mt-1">
              {{ bookingForm.seats }} asiento{{ bookingForm.seats > 1 ? 's' : '' }} × {{ trip.price_per_seat }}€
            </div>
          </div>

          <!-- Botones -->
          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isBooking"
              class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="isBooking">Reservando...</span>
              <span v-else>Confirmar Reserva</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { bookingService, type Booking } from '@/services/bookingService'

interface Props {
  isOpen: boolean
  trip: any | null
  bookingInfo?: {
    total_seats: number
    confirmed_bookings: number
    remaining_seats: number
    is_fully_booked: boolean
  }
}

interface Emits {
  (e: 'close'): void
  (e: 'booking-confirmed', booking: Booking): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isBooking = ref(false)

const bookingForm = ref({
  seats: 1,
  pickupLocation: '',
  notes: ''
})

// Obtener asientos disponibles
const getAvailableSeats = () => {
  const maxSeats = props.bookingInfo?.remaining_seats || props.trip?.available_seats || 1
  return Array.from({ length: maxSeats }, (_, i) => i + 1)
}

// Formatear hora
const formatTime = (time: string) => {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Confirmar reserva
const confirmBooking = async () => {
  if (!props.trip) return
  
  isBooking.value = true
  
  try {
    // Aquí necesitarías obtener el ID del usuario actual
    const userId = 'current-user-id' // Esto debería venir del contexto de autenticación
    
    const bookingData = {
      trip_id: props.trip.id,
      passenger_id: userId,
      seats_requested: bookingForm.value.seats,
      status: 'pending' as const,
      pickup_location: bookingForm.value.pickupLocation || null,
      notes: bookingForm.value.notes || null
    }
    
    const booking = await bookingService.createBooking(bookingData)
    
    if (booking) {
      emit('booking-confirmed', booking)
      closeModal()
    }
  } catch (error: any) {
    console.error('Error al confirmar reserva:', error)
    alert(error.message || 'Error al confirmar la reserva')
  } finally {
    isBooking.value = false
  }
}

// Cerrar modal
const closeModal = () => {
  emit('close')
  // Resetear formulario
  bookingForm.value = {
    seats: 1,
    pickupLocation: '',
    notes: ''
  }
}
</script>
