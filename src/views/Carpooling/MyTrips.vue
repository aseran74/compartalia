<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <AppSidebar />
    
    <!-- Main Content -->
    <div class="flex flex-1 flex-col overflow-hidden" :class="{ 'ml-0 lg:ml-[90px]': !isExpanded, 'ml-0 lg:ml-[280px]': isExpanded }">
      <!-- Header -->
      <AppHeader />
      
      <!-- Page Content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6 xl:p-7.5 dark:bg-boxdark">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-black dark:text-white">
            Mis Viajes
          </h1>
          <p class="text-sm font-medium text-body-color">
            Gestiona tus viajes como conductor y pasajero
          </p>
        </div>
        <button
          @click="$router.push('/carpooling/create-trip')"
          class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-center font-medium text-white hover:bg-opacity-90"
        >
          <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Crear Viaje
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="mb-6 rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center space-x-2">
          <button
            @click="activeTab = 'all'"
            :class="[
              'rounded-md px-3 py-1 text-sm font-medium transition-colors',
              activeTab === 'all'
                ? 'bg-primary text-white'
                : 'text-body-color hover:bg-gray-50 dark:hover:bg-gray-700'
            ]"
          >
            Todos
          </button>
          <button
            @click="activeTab = 'asDriver'"
            :class="[
              'rounded-md px-3 py-1 text-sm font-medium transition-colors',
              activeTab === 'asDriver'
                ? 'bg-primary text-white'
                : 'text-body-color hover:bg-gray-50 dark:hover:bg-gray-700'
            ]"
          >
            Como Conductor
          </button>
          <button
            @click="activeTab = 'asPassenger'"
            :class="[
              'rounded-md px-3 py-1 text-sm font-medium transition-colors',
              activeTab === 'asPassenger'
                ? 'bg-primary text-white'
                : 'text-body-color hover:bg-gray-50 dark:hover:bg-gray-700'
            ]"
          >
            Como Pasajero
          </button>
        </div>
      </div>
    </div>

    <!-- Lista de Viajes -->
    <div class="space-y-4">
      <!-- Viajes como Pasajero -->
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="mb-4">
          <h2 class="text-xl font-semibold text-black dark:text-white">🎫 Mis Reservas</h2>
          <p class="text-sm text-body-color">Tus viajes como pasajero</p>
        </div>

        <!-- Estado de carga -->
        <div v-if="isLoading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p class="mt-2 text-body-color">Cargando reservas...</p>
        </div>

        <!-- Sin reservas -->
        <div v-else-if="userBookings.length === 0" class="text-center py-8">
          <div class="text-6xl mb-4">🚗</div>
          <h3 class="text-lg font-semibold text-black dark:text-white mb-2">No tienes reservas</h3>
          <p class="text-body-color mb-4">¡Busca y reserva tu próximo viaje!</p>
          <button
            @click="$router.push('/carpooling/buscar-viajes-hibrido')"
            class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-center font-medium text-white hover:bg-opacity-90"
          >
            <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            Buscar Viajes
          </button>
        </div>

        <!-- Lista de reservas -->
        <div v-else class="space-y-4">
          <div 
            v-for="booking in userBookings" 
            :key="booking.id"
            class="border border-stroke rounded-lg p-4 hover:shadow-md transition-shadow dark:border-strokedark"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <!-- Header de la Reserva -->
                <div class="mb-3 flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="rounded-full bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary">
                      Pasajero
                    </div>
                    <div :class="`rounded-full px-3 py-1 text-sm font-medium ${getStatusInfo(booking.status).class}`">
                      {{ getStatusInfo(booking.status).label }}
                    </div>
                    <div class="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                      {{ getPaymentMethodInfo(booking.payment_method || '').icon }} {{ getPaymentMethodInfo(booking.payment_method || '').label }}
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button 
                      @click="viewTripDetails(booking.trip_id)"
                      class="rounded-md border border-stroke px-3 py-1 text-sm text-body-color hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-700"
                    >
                      Ver Detalles
                    </button>
                    <button 
                      v-if="booking.status === 'pending' || booking.status === 'confirmed'"
                      @click="cancelBooking(booking.id!)"
                      class="rounded-md bg-warning px-3 py-1 text-sm font-medium text-white hover:bg-opacity-90"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>

                <!-- Información de la Ruta -->
                <div class="flex items-center space-x-3 mb-3">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-black dark:text-white">
                      {{ booking.trip_info?.origin_name || 'Origen no disponible' }} → {{ booking.trip_info?.destination_name || 'Destino no disponible' }}
                    </h3>
                    <p class="text-sm text-body-color">
                      {{ formatDate(booking.trip_info?.departure_time || booking.created_at || '') }} • 
                      Conductor: {{ booking.trip_info?.driver_name || 'No disponible' }}
                    </p>
                  </div>
                </div>

                <!-- Detalles del Viaje -->
                <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <p class="text-sm text-body-color">Precio Total</p>
                    <p class="font-medium text-black dark:text-white">€{{ booking.total_price || 0 }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-body-color">Asientos</p>
                    <p class="font-medium text-black dark:text-white">{{ booking.seats_requested }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-body-color">Precio por Asiento</p>
                    <p class="font-medium text-black dark:text-white">€{{ booking.trip_info?.price_per_seat || 0 }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-body-color">Punto de Recogida</p>
                    <p class="font-medium text-black dark:text-white">{{ booking.pickup_location || 'No especificado' }}</p>
                  </div>
                </div>

                <!-- Notas -->
                <div v-if="booking.notes" class="mt-3 p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
                  <p class="text-sm text-body-color">
                    <strong>Notas:</strong> {{ booking.notes }}
                  </p>
                </div>

                <!-- Información de Pago -->
                <div v-if="booking.transaction_id" class="mt-3 text-xs text-body-color">
                  <p><strong>ID de Transacción:</strong> {{ booking.transaction_id }}</p>
                  <p><strong>Estado del Pago:</strong> {{ booking.payment_status || 'No especificado' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import { useSidebar } from '@/composables/useSidebar'
import { useAuth } from '@/composables/useAuth'
import { bookingService, type Booking } from '@/services/bookingService'
import { useToast } from '@/composables/useToast'

const activeTab = ref('all')
const { isExpanded } = useSidebar()
const { user, userProfile } = useAuth()
const { success, error: showErrorToast } = useToast()

// Estado de las reservas
const userBookings = ref<Booking[]>([])
const isLoading = ref(false)

// Cargar reservas del usuario
const loadUserBookings = async () => {
  const userId = userProfile.value?.id || user.value?.uid
  if (!userId) return
  
  isLoading.value = true
  try {
    const bookings = await bookingService.getUserBookings(userId)
    userBookings.value = bookings
    console.log('📋 Reservas cargadas:', bookings)
  } catch (error: any) {
    console.error('Error cargando reservas:', error)
    showErrorToast('Error', 'No se pudieron cargar tus reservas')
  } finally {
    isLoading.value = false
  }
}

// Formatear fecha
const formatDate = (dateString: string) => {
  if (!dateString) return 'Fecha no disponible'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return 'Fecha inválida'
  }
}

// Formatear hora
const formatTime = (timeString: string) => {
  if (!timeString) return 'Hora no disponible'
  try {
    const time = new Date(`2000-01-01T${timeString}`)
    return time.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'Hora inválida'
  }
}

// Obtener estado de la reserva
const getStatusInfo = (status: string) => {
  switch (status) {
    case 'confirmed':
      return { label: 'Confirmado', class: 'bg-success/10 text-success' }
    case 'pending':
      return { label: 'Pendiente', class: 'bg-warning/10 text-warning' }
    case 'cancelled':
      return { label: 'Cancelado', class: 'bg-danger/10 text-danger' }
    case 'completed':
      return { label: 'Completado', class: 'bg-primary/10 text-primary' }
    default:
      return { label: 'Desconocido', class: 'bg-gray/10 text-gray' }
  }
}

// Obtener método de pago
const getPaymentMethodInfo = (method: string) => {
  switch (method) {
    case 'cash':
      return { label: 'Efectivo', icon: '💵' }
    case 'bizum':
      return { label: 'Bizum', icon: '📱' }
    case 'stripe':
      return { label: 'Tarjeta', icon: '💳' }
    default:
      return { label: 'No especificado', icon: '❓' }
  }
}

// Cancelar reserva
const cancelBooking = async (bookingId: string) => {
  try {
    await bookingService.cancelBooking(bookingId)
    success('Reserva cancelada', 'Tu reserva ha sido cancelada exitosamente')
    await loadUserBookings() // Recargar la lista
  } catch (error: any) {
    showErrorToast('Error', 'No se pudo cancelar la reserva')
  }
}

// Ver detalles del viaje
const viewTripDetails = (tripId: string) => {
  // Navegar a los detalles del viaje
  window.location.href = `/viaje/${tripId}`
}

onMounted(() => {
  loadUserBookings()
})
</script>
