<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">🎫 Sistema de Reservas</h3>
    
    <!-- Información del viaje -->
    <div v-if="selectedTrip" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h4 class="font-semibold text-blue-900 mb-2">{{ selectedTrip.origin_name }} → {{ selectedTrip.destination_name }}</h4>
      <p class="text-sm text-blue-800">
        🕐 {{ selectedTrip.departure_time }} | 
        👥 {{ selectedTrip.available_seats }} plazas totales | 
        💰 €{{ selectedTrip.price_per_seat }}/plaza
      </p>
    </div>

    <!-- Calendario de reservas -->
    <div v-if="selectedTrip" class="mb-6">
      <h4 class="text-md font-semibold text-gray-800 mb-3">📅 Disponibilidad por fechas</h4>
      
      <div class="grid grid-cols-7 gap-2 mb-4">
        <div v-for="day in ['L', 'M', 'X', 'J', 'V', 'S', 'D']" :key="day" class="text-center text-sm font-medium text-gray-500 py-2">
          {{ day }}
        </div>
      </div>
      
      <div class="grid grid-cols-7 gap-2">
        <div 
          v-for="date in getCalendarDates()" 
          :key="date.date"
          @click="selectDate(date.date)"
          :class="[
            'p-3 text-sm rounded-lg border-2 cursor-pointer transition-all',
            date.isCurrentMonth 
              ? (date.isSelected ? 'bg-blue-500 text-white border-blue-500' : 'hover:bg-blue-100 border-gray-200')
              : 'text-gray-300 border-gray-100',
            date.isToday ? 'ring-2 ring-blue-300' : '',
            date.isWeekend ? 'bg-red-50 text-red-600' : '',
            getAvailabilityClass(date.date)
          ]"
        >
          <div class="font-semibold">{{ date.day }}</div>
          <div class="text-xs mt-1">
            <div v-if="getReservationsForDate(date.date).length > 0" class="space-y-1">
              <div v-for="reservation in getReservationsForDate(date.date)" :key="reservation.id" class="bg-green-100 text-green-800 rounded px-1">
                {{ reservation.seats }} plazas
              </div>
            </div>
            <div v-else-if="date.isCurrentMonth" class="text-gray-400">
              {{ getAvailableSeats(date.date) }} libres
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Formulario de reserva -->
    <div v-if="selectedDate && selectedTrip" class="bg-green-50 border border-green-200 rounded-lg p-4">
      <h4 class="font-semibold text-green-900 mb-3">🎫 Nueva Reserva</h4>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">📅 Fecha seleccionada</label>
          <p class="text-lg font-semibold text-green-800">{{ formatSelectedDate() }}</p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">👥 Plazas disponibles</label>
          <p class="text-lg font-semibold text-green-800">{{ getAvailableSeats(selectedDate) }} plazas</p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">🎫 Plazas a reservar</label>
          <select v-model="reservationForm.seats" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
            <option v-for="n in getAvailableSeats(selectedDate)" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">💰 Precio total</label>
          <p class="text-lg font-semibold text-green-800">€{{ (reservationForm.seats * selectedTrip.price_per_seat).toFixed(2) }}</p>
        </div>
      </div>
      
      <div class="mt-4 flex justify-end space-x-3">
        <button @click="cancelReservation" class="px-4 py-2 text-gray-600 hover:text-gray-800">
          ❌ Cancelar
        </button>
        <button @click="confirmReservation" class="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
          ✅ Confirmar Reserva
        </button>
      </div>
    </div>

    <!-- Lista de reservas existentes -->
    <div v-if="reservations.length > 0" class="mt-6">
      <h4 class="text-md font-semibold text-gray-800 mb-3">📋 Reservas existentes</h4>
      
      <div class="space-y-2">
        <div 
          v-for="reservation in reservations" 
          :key="reservation.id"
          class="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
        >
          <div>
            <span class="font-semibold">{{ formatDate(reservation.date) }}</span>
            <span class="text-sm text-gray-600 ml-2">{{ reservation.seats }} plazas</span>
          </div>
          <div class="flex space-x-2">
            <button @click="editReservation(reservation)" class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
              ✏️ Editar
            </button>
            <button @click="cancelReservationById(reservation.id)" class="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200">
              🗑️ Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

// Props
const props = defineProps<{
  trip: any
}>()

// Emits
const emit = defineEmits<{
  reservationCreated: [reservation: any]
  reservationUpdated: [reservation: any]
  reservationCancelled: [reservationId: string]
}>()

// Estado reactivo
const selectedDate = ref('')
const reservations = ref<any[]>([])
const reservationForm = reactive({
  seats: 1
})

// Computed
const selectedTrip = computed(() => props.trip)

// Métodos
function getCalendarDates() {
  const dates = []
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  
  const firstDay = new Date(currentYear, currentMonth, 1)
  const lastDay = new Date(currentYear, currentMonth + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay() + 1) // Lunes
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    const isCurrentMonth = date.getMonth() === currentMonth
    const isToday = date.toDateString() === today.toDateString()
    const isSelected = date.toISOString().split('T')[0] === selectedDate.value
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    
    dates.push({
      day: date.getDate(),
      date: date.toISOString().split('T')[0],
      isCurrentMonth,
      isToday,
      isSelected,
      isWeekend
    })
  }
  
  return dates
}

function selectDate(date: string) {
  selectedDate.value = date
  reservationForm.seats = 1
}

function getReservationsForDate(date: string) {
  return reservations.value.filter(r => r.date === date)
}

function getAvailableSeats(date: string) {
  const reservedSeats = getReservationsForDate(date).reduce((total, r) => total + r.seats, 0)
  return Math.max(0, selectedTrip.value.available_seats - reservedSeats)
}

function getAvailabilityClass(date: string) {
  const available = getAvailableSeats(date)
  if (available === 0) return 'bg-red-100 text-red-600'
  if (available < selectedTrip.value.available_seats / 2) return 'bg-yellow-100 text-yellow-600'
  return 'bg-green-100 text-green-600'
}

function formatSelectedDate() {
  if (!selectedDate.value) return 'No seleccionado'
  
  const date = new Date(selectedDate.value)
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
    month: 'short', 
    day: 'numeric' 
  }
  return date.toLocaleDateString('es-ES', options)
}

function confirmReservation() {
  if (!selectedDate.value || !selectedTrip.value) return
  
  const reservation = {
    id: Date.now().toString(),
    tripId: selectedTrip.value.id,
    date: selectedDate.value,
    seats: reservationForm.seats,
    price: reservationForm.seats * selectedTrip.value.price_per_seat,
    createdAt: new Date().toISOString()
  }
  
  reservations.value.push(reservation)
  emit('reservationCreated', reservation)
  
  // Limpiar formulario
  selectedDate.value = ''
  reservationForm.seats = 1
}

function cancelReservation() {
  selectedDate.value = ''
  reservationForm.seats = 1
}

function editReservation(reservation: any) {
  selectedDate.value = reservation.date
  reservationForm.seats = reservation.seats
}

function cancelReservationById(reservationId: string) {
  const index = reservations.value.findIndex(r => r.id === reservationId)
  if (index > -1) {
    reservations.value.splice(index, 1)
    emit('reservationCancelled', reservationId)
  }
}
</script>
