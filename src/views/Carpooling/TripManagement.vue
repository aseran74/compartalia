<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
    <div class="p-6 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          🚗 Gestión de Viajes y Reservas
        </h1>
        <p class="text-gray-600 text-lg">Sistema completo de viajes mensuales, semanales y reservas dinámicas</p>
      </div>

      <!-- Navegación por pestañas -->
      <div class="bg-white rounded-xl shadow-lg border border-gray-100 mb-8">
        <div class="border-b border-gray-200">
          <nav class="flex space-x-8 px-6">
            <button 
              @click="activeTab = 'create'"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'create' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              🚗 Crear Viaje
            </button>
            <button 
              @click="activeTab = 'search'"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'search' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              🔍 Buscar Viajes
            </button>
            <button 
              @click="activeTab = 'reservations'"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'reservations' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              🎫 Mis Reservas
            </button>
          </nav>
        </div>

        <!-- Contenido de las pestañas -->
        <div class="p-6">
          <!-- Pestaña: Crear Viaje -->
          <div v-if="activeTab === 'create'">
            <CreateMonthlyTrip @tripCreated="handleTripCreated" />
          </div>

          <!-- Pestaña: Buscar Viajes -->
          <div v-if="activeTab === 'search'">
            <TripFilters 
              :trips="allTrips"
              @viewTrip="handleViewTrip"
              @reserveTrip="handleReserveTrip"
              @filtersChanged="handleFiltersChanged"
            />
          </div>

          <!-- Pestaña: Mis Reservas -->
          <div v-if="activeTab === 'reservations'">
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">🎫 Mis Reservas</h3>
              
              <div v-if="userReservations.length === 0" class="text-center py-8">
                <p class="text-gray-500">No tienes reservas activas</p>
              </div>
              
              <div v-else class="space-y-4">
                <div 
                  v-for="reservation in userReservations" 
                  :key="reservation.id"
                  class="border border-gray-200 rounded-lg p-4"
                >
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="font-semibold text-gray-900">{{ reservation.trip.origin_name }} → {{ reservation.trip.destination_name }}</h4>
                      <p class="text-sm text-gray-600">
                        📅 {{ formatDate(reservation.date) }} | 
                        🕐 {{ reservation.trip.departure_time }} | 
                        👥 {{ reservation.seats }} plazas | 
                        💰 €{{ reservation.price }}
                      </p>
                    </div>
                    <div class="flex space-x-2">
                      <button @click="viewReservation(reservation)" class="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                        👁️ Ver
                      </button>
                      <button @click="cancelReservation(reservation.id)" class="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200">
                        🗑️ Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de reserva -->
      <div v-if="showReservationModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-900">🎫 Sistema de Reservas</h3>
              <button @click="closeReservationModal" class="text-gray-400 hover:text-gray-600">
                ❌
              </button>
            </div>
            
            <ReservationSystem 
              v-if="selectedTripForReservation"
              :trip="selectedTripForReservation"
              @reservationCreated="handleReservationCreated"
              @reservationUpdated="handleReservationUpdated"
              @reservationCancelled="handleReservationCancelled"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import CreateMonthlyTrip from '@/components/carpooling/CreateMonthlyTrip.vue'
import TripFilters from '@/components/carpooling/TripFilters.vue'
import ReservationSystem from '@/components/carpooling/ReservationSystem.vue'

// Estado reactivo
const activeTab = ref('create')
const allTrips = ref<any[]>([])
const userReservations = ref<any[]>([])
const showReservationModal = ref(false)
const selectedTripForReservation = ref<any>(null)

// Métodos
function handleTripCreated(trip: any) {
  allTrips.value.push(trip)
  addLog(`✅ Viaje creado: ${trip.origin_name} → ${trip.destination_name}`)
}

function handleViewTrip(trip: any) {
  addLog(`👁️ Viendo viaje: ${trip.origin_name} → ${trip.destination_name}`)
}

function handleReserveTrip(trip: any) {
  selectedTripForReservation.value = trip
  showReservationModal.value = true
  addLog(`🎫 Abriendo reserva para: ${trip.origin_name} → ${trip.destination_name}`)
}

function handleFiltersChanged(filters: any) {
  addLog(`🔍 Filtros aplicados: ${JSON.stringify(filters)}`)
}

function handleReservationCreated(reservation: any) {
  userReservations.value.push(reservation)
  addLog(`✅ Reserva creada: ${reservation.seats} plazas para ${reservation.date}`)
  showReservationModal.value = false
}

function handleReservationUpdated(reservation: any) {
  const index = userReservations.value.findIndex(r => r.id === reservation.id)
  if (index > -1) {
    userReservations.value[index] = reservation
    addLog(`✏️ Reserva actualizada: ${reservation.seats} plazas para ${reservation.date}`)
  }
}

function handleReservationCancelled(reservationId: string) {
  const index = userReservations.value.findIndex(r => r.id === reservationId)
  if (index > -1) {
    userReservations.value.splice(index, 1)
    addLog(`🗑️ Reserva cancelada: ${reservationId}`)
  }
}

function closeReservationModal() {
  showReservationModal.value = false
  selectedTripForReservation.value = null
}

function viewReservation(reservation: any) {
  addLog(`👁️ Viendo reserva: ${reservation.trip.origin_name} → ${reservation.trip.destination_name}`)
}

function cancelReservation(reservationId: string) {
  const index = userReservations.value.findIndex(r => r.id === reservationId)
  if (index > -1) {
    userReservations.value.splice(index, 1)
    addLog(`🗑️ Reserva cancelada: ${reservationId}`)
  }
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

function addLog(message: string) {
  console.log(`[${new Date().toLocaleTimeString()}] ${message}`)
}

// Inicialización
onMounted(() => {
  addLog('🚀 Sistema de gestión de viajes inicializado')
  
  // Cargar datos de ejemplo
  allTrips.value = [
    {
      id: '1',
      origin_name: 'Móstoles',
      destination_name: 'Madrid Centro',
      departure_time: '08:00',
      available_seats: 4,
      price_per_seat: 4.50,
      start_date: '2024-11-01',
      end_date: '2024-11-30',
      trip_type: 'monthly',
      duration: 12
    },
    {
      id: '2',
      origin_name: 'Alcalá de Henares',
      destination_name: 'Madrid Centro',
      departure_time: '07:30',
      available_seats: 3,
      price_per_seat: 5.00,
      start_date: '2024-11-15',
      end_date: '2024-11-22',
      trip_type: 'weekly'
    }
  ]
})
</script>
