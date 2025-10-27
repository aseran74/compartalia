<template>
  <div class="trip-renewal-notifications">
    <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-semibold text-black dark:text-white">🔔 Renovación de Viajes</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Viajes recurrentes que necesitan renovación
          </p>
        </div>
        
        <button
          @click="loadTripsNeedingRenewal"
          :disabled="loading"
          class="inline-flex items-center gap-2 rounded-lg border border-stroke px-4 py-2 text-center font-medium hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-800"
        >
          <svg v-if="loading" class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ loading ? 'Actualizando...' : 'Actualizar' }}</span>
        </button>
      </div>

      <!-- Sin viajes para renovar -->
      <div v-if="!loading && tripsNeedingRenewal.length === 0" class="text-center py-8">
        <div class="text-6xl mb-4">✅</div>
        <p class="text-lg font-medium text-black dark:text-white mb-2">
          ¡Todo al día!
        </p>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          No hay viajes que necesiten renovación en este momento
        </p>
      </div>

      <!-- Lista de viajes para renovar -->
      <div v-else class="space-y-4">
        <div
          v-for="trip in tripsNeedingRenewal"
          :key="trip.id"
          class="rounded-lg border border-warning bg-warning/10 p-4 dark:border-warning/50"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium" :class="getTripTypeClass(trip.trip_type)">
                  {{ getTripTypeLabel(trip.trip_type) }}
                </span>
                <span class="inline-flex items-center rounded-full bg-warning/20 px-3 py-1 text-xs font-medium text-warning">
                  ⚠️ Expira pronto
                </span>
              </div>

              <div class="space-y-1">
                <p class="font-semibold text-black dark:text-white">
                  {{ trip.origin_name }} → {{ trip.destination_name }}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  📅 Finaliza: {{ formatDate(trip.end_date!) }}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  ⏰ Días restantes: {{ getDaysRemaining(trip.end_date!) }}
                </p>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <button
                @click="openRenewalModal(trip)"
                class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 whitespace-nowrap"
              >
                🔄 Renovar
              </button>
              <button
                @click="viewTripDetails(trip)"
                class="inline-flex items-center justify-center gap-2 rounded-lg border border-stroke px-4 py-2 text-center font-medium hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-800 whitespace-nowrap"
              >
                Ver detalles
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de renovación -->
    <div
      v-if="showRenewalModal"
      class="fixed inset-0 z-999 flex items-center justify-center bg-black/50 p-4"
      @click.self="closeRenewalModal"
    >
      <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark">
        <h3 class="text-lg font-semibold text-black dark:text-white mb-4">
          🔄 Renovar Viaje
        </h3>

        <div v-if="selectedTrip" class="space-y-4">
          <div>
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Viaje:</p>
            <p class="text-black dark:text-white">
              {{ selectedTrip.origin_name }} → {{ selectedTrip.destination_name }}
            </p>
          </div>

          <div>
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha actual de fin:</p>
            <p class="text-black dark:text-white">{{ formatDate(selectedTrip.end_date!) }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nueva fecha de fin:
            </label>
            <input
              v-model="newEndDate"
              type="date"
              :min="getMinRenewalDate()"
              :disabled="enableAutoRenew"
              class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              :required="!enableAutoRenew"
            />
          </div>

          <div class="rounded-lg border border-stroke p-4 dark:border-strokedark">
            <label class="flex items-start gap-3 cursor-pointer">
              <input
                v-model="enableAutoRenew"
                type="checkbox"
                class="mt-1 rounded"
              />
              <div>
                <p class="font-medium text-black dark:text-white mb-1">
                  🔄 Renovación automática
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  El viaje se renovará automáticamente cada vez que esté próximo a expirar. 
                  No necesitarás renovarlo manualmente.
                </p>
              </div>
            </label>
          </div>

          <div v-if="newEndDate && !enableAutoRenew" class="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <p class="text-sm text-blue-800 dark:text-blue-400">
              ℹ️ El viaje se extenderá hasta el {{ formatDate(newEndDate) }}
            </p>
          </div>

          <div v-if="enableAutoRenew" class="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
            <p class="text-sm text-green-800 dark:text-green-400">
              ✅ El viaje se renovará automáticamente sin fecha de fin
            </p>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              @click="closeRenewalModal"
              class="flex-1 rounded-lg border border-stroke px-4 py-2 text-center font-medium hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              @click="confirmRenewal"
              :disabled="!newEndDate || renewalLoading"
              class="flex-1 rounded-lg bg-primary px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ renewalLoading ? 'Renovando...' : 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TripsService, { type Trip, type TripType } from '@/services/tripsService'

const loading = ref(false)
const renewalLoading = ref(false)
const tripsNeedingRenewal = ref<Trip[]>([])
const showRenewalModal = ref(false)
const selectedTrip = ref<Trip | null>(null)
const newEndDate = ref('')
const enableAutoRenew = ref(false)

onMounted(() => {
  loadTripsNeedingRenewal()
})

async function loadTripsNeedingRenewal() {
  loading.value = true
  try {
    console.log('🔍 Cargando viajes que necesitan renovación...')
    
    // TODO: Obtener driver_id del usuario actual
    const trips = await TripsService.getTripsNeedingRenewal()
    tripsNeedingRenewal.value = trips
    
    console.log(`✅ Encontrados ${trips.length} viajes para renovar`)
  } catch (error) {
    console.error('❌ Error cargando viajes:', error)
  } finally {
    loading.value = false
  }
}

function getTripTypeLabel(type: TripType): string {
  switch (type) {
    case 'single': return '🚗 Único'
    case 'weekly': return '📅 Semanal'
    case 'monthly': return '📅 Mensual'
    default: return type
  }
}

function getTripTypeClass(type: TripType): string {
  switch (type) {
    case 'single': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'weekly': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    case 'monthly': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate)
  const today = new Date()
  const diffTime = end.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

function getMinRenewalDate(): string {
  if (!selectedTrip.value?.end_date) return new Date().toISOString().split('T')[0]
  
  // La nueva fecha debe ser al menos 1 día después de la fecha actual de fin
  const currentEnd = new Date(selectedTrip.value.end_date)
  currentEnd.setDate(currentEnd.getDate() + 1)
  return currentEnd.toISOString().split('T')[0]
}

function openRenewalModal(trip: Trip) {
  selectedTrip.value = trip
  enableAutoRenew.value = trip.auto_renew || false
  
  // Sugerir renovación por el mismo período
  if (trip.end_date && trip.start_date) {
    const start = new Date(trip.start_date)
    const end = new Date(trip.end_date)
    const duration = end.getTime() - start.getTime()
    
    const newEnd = new Date(end)
    newEnd.setTime(newEnd.getTime() + duration)
    newEndDate.value = newEnd.toISOString().split('T')[0]
  } else {
    // Por defecto, renovar por 1 mes
    const oneMonthLater = new Date()
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1)
    newEndDate.value = oneMonthLater.toISOString().split('T')[0]
  }
  
  showRenewalModal.value = true
}

function closeRenewalModal() {
  showRenewalModal.value = false
  selectedTrip.value = null
  newEndDate.value = ''
  enableAutoRenew.value = false
}

async function confirmRenewal() {
  if (!selectedTrip.value) return
  if (!enableAutoRenew.value && !newEndDate.value) {
    alert('Por favor, selecciona una fecha de fin o activa la renovación automática')
    return
  }
  
  renewalLoading.value = true
  try {
    if (enableAutoRenew.value) {
      // Activar renovación automática (sin fecha de fin)
      console.log(`🔄 Activando renovación automática para viaje ${selectedTrip.value.id}...`)
      
      const result = await TripsService.updateTrip(selectedTrip.value.id!, {
        auto_renew: true,
        end_date: null, // Sin fecha de fin
        renewal_notification_sent: false,
        renewal_notification_date: null
      })
      
      if (result) {
        console.log('✅ Renovación automática activada')
        alert('🎉 ¡Renovación automática activada! El viaje continuará indefinidamente.')
        
        // Recargar lista
        await loadTripsNeedingRenewal()
        closeRenewalModal()
      } else {
        console.error('❌ Error activando renovación automática')
        alert('❌ Error al activar la renovación automática. Por favor, inténtalo de nuevo.')
      }
    } else {
      // Renovación manual con nueva fecha
      console.log(`🔄 Renovando viaje ${selectedTrip.value.id} hasta ${newEndDate.value}...`)
      
      const result = await TripsService.renewTrip(selectedTrip.value.id!, newEndDate.value)
      
      if (result) {
        console.log('✅ Viaje renovado exitosamente')
        alert(`🎉 ¡Viaje renovado hasta el ${formatDate(newEndDate.value)}!`)
        
        // Recargar lista
        await loadTripsNeedingRenewal()
        closeRenewalModal()
      } else {
        console.error('❌ Error renovando viaje')
        alert('❌ Error al renovar el viaje. Por favor, inténtalo de nuevo.')
      }
    }
  } catch (error) {
    console.error('❌ Error en confirmRenewal:', error)
    alert('❌ Error al renovar el viaje. Por favor, inténtalo de nuevo.')
  } finally {
    renewalLoading.value = false
  }
}

function viewTripDetails(trip: Trip) {
  console.log('Ver detalles del viaje:', trip)
  // TODO: Implementar navegación o modal de detalles
  alert(`Detalles del viaje:\n\nOrigen: ${trip.origin_name}\nDestino: ${trip.destination_name}\nTipo: ${getTripTypeLabel(trip.trip_type)}\nFin: ${formatDate(trip.end_date!)}`)
}
</script>

<style scoped>
.trip-renewal-notifications {
  @apply space-y-6;
}
</style>

