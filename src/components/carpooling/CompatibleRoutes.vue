<template>
  <div class="bg-white rounded-lg shadow-default dark:bg-boxdark p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-black dark:text-white">
        Rutas Compatibles
      </h3>
      <div class="flex items-center space-x-2">
        <span class="text-sm text-body-color">Desviación máxima:</span>
        <select 
          v-model="maxDeviation" 
          @change="searchCompatibleRoutes"
          class="text-sm border border-stroke rounded px-2 py-1 dark:bg-gray-700 dark:border-strokedark"
        >
          <option value="500">500m</option>
          <option value="1000">1km</option>
          <option value="2000">2km</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="compatibleRoutes.length === 0" class="text-center py-8">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      <p class="mt-2 text-sm text-body-color">
        No se encontraron rutas compatibles
      </p>
    </div>

    <div v-else class="space-y-4">
      <div 
        v-for="route in compatibleRoutes" 
        :key="route.id"
        class="border border-stroke rounded-lg p-4 hover:shadow-md transition-shadow dark:border-strokedark"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-2 mb-2">
              <span class="text-sm font-medium text-black dark:text-white">
                {{ route.driverName }}
              </span>
              <span 
                :class="getMatchTypeBadgeClass(route.matchType)"
                class="px-2 py-1 text-xs rounded-full"
              >
                {{ getMatchTypeLabel(route.matchType) }}
              </span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <div>
                <p class="text-sm text-body-color">Desde</p>
                <p class="font-medium text-black dark:text-white">
                  {{ route.originName }}
                </p>
              </div>
              <div>
                <p class="text-sm text-body-color">Hasta</p>
                <p class="font-medium text-black dark:text-white">
                  {{ route.destinationName }}
                </p>
              </div>
              <div>
                <p class="text-sm text-body-color">Salida</p>
                <p class="font-medium text-black dark:text-white">
                  {{ formatTime(route.departureTime) }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
              <div>
                <p class="text-sm text-body-color">Asientos</p>
                <p class="font-medium text-black dark:text-white">
                  {{ route.availableSeats }}
                </p>
              </div>
              <div>
                <p class="text-sm text-body-color">Precio</p>
                <p class="font-medium text-black dark:text-white">
                  {{ formatCurrency(route.pricePerSeat) }}
                </p>
              </div>
              <div>
                <p class="text-sm text-body-color">Compatibilidad</p>
                <div class="flex items-center space-x-2">
                  <div class="flex-1 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div 
                      class="bg-primary h-2 rounded-full transition-all duration-300"
                      :style="{ width: `${route.compatibilityScore * 100}%` }"
                    ></div>
                  </div>
                  <span class="text-xs text-body-color">
                    {{ Math.round(route.compatibilityScore * 100) }}%
                  </span>
                </div>
              </div>
              <div>
                <p class="text-sm text-body-color">Puntos compartidos</p>
                <p class="font-medium text-black dark:text-white">
                  {{ route.sharedWaypoints }}/10
                </p>
              </div>
            </div>

            <!-- Información del vehículo -->
            <div v-if="route.vehicleInfo" class="flex items-center space-x-4 mb-3 p-3 bg-gray-50 rounded dark:bg-gray-800">
              <div class="flex items-center space-x-2">
                <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM15 16.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path>
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z"></path>
                </svg>
                <span class="text-sm text-black dark:text-white">
                  {{ route.vehicleInfo.brand }} {{ route.vehicleInfo.model }}
                  <span v-if="route.vehicleInfo.year" class="text-body-color">
                    ({{ route.vehicleInfo.year }})
                  </span>
                </span>
              </div>
              <div v-if="route.vehicleInfo.color" class="text-sm text-body-color">
                {{ route.vehicleInfo.color }}
              </div>
            </div>

            <!-- Puntos de recogida disponibles -->
            <div v-if="route.pickupPoints && route.pickupPoints.length > 0" class="mb-3">
              <p class="text-sm text-body-color mb-2">Puntos de recogida disponibles:</p>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="point in route.pickupPoints.slice(0, 3)" 
                  :key="point.index"
                  class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded dark:bg-blue-900 dark:text-blue-200"
                >
                  {{ point.name || `Punto ${point.index + 1}` }}
                  <span class="text-blue-600 dark:text-blue-300">
                    ({{ Math.round(point.distance) }}m)
                  </span>
                </span>
                <span 
                  v-if="route.pickupPoints.length > 3"
                  class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded dark:bg-gray-700 dark:text-gray-300"
                >
                  +{{ route.pickupPoints.length - 3 }} más
                </span>
              </div>
            </div>
          </div>

          <div class="ml-4 flex flex-col space-y-2">
            <button
              @click="selectRoute(route)"
              class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Seleccionar
            </button>
            <button
              @click="viewRouteDetails(route)"
              class="px-4 py-2 border border-stroke text-body-color rounded-md hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-700 transition-colors text-sm"
            >
              Ver detalles
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCarpoolingData } from '@/composables/useCarpoolingData'

interface Props {
  tripId: string
  userLocation?: { lat: number; lng: number }
}

const props = defineProps<Props>()
const router = useRouter()
const { findCompatibleRoutes, findPickupDropoffPoints } = useCarpoolingData()

const loading = ref(false)
const compatibleRoutes = ref([])
const maxDeviation = ref(1000)

const searchCompatibleRoutes = async () => {
  if (!props.tripId) return
  
  loading.value = true
  try {
    const routes = await findCompatibleRoutes(
      props.tripId,
      maxDeviation.value,
      3 // mínimo 3 waypoints compartidos
    )
    
    // Enriquecer con puntos de pickup si hay ubicación del usuario
    if (props.userLocation) {
      for (const route of routes) {
        try {
          route.pickupPoints = await findPickupDropoffPoints(route.id, props.userLocation)
        } catch (error) {
          console.error('Error fetching pickup points:', error)
          route.pickupPoints = []
        }
      }
    }
    
    compatibleRoutes.value = routes
  } catch (error) {
    console.error('Error searching compatible routes:', error)
  } finally {
    loading.value = false
  }
}

const getMatchTypeBadgeClass = (matchType: string) => {
  switch (matchType) {
    case 'exact':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'partial':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'hub':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    case 'deviation':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}

const getMatchTypeLabel = (matchType: string) => {
  switch (matchType) {
    case 'exact':
      return 'Ruta exacta'
    case 'partial':
      return 'Ruta parcial'
    case 'hub':
      return 'Hub común'
    case 'deviation':
      return 'Desviación'
    default:
      return 'Compatible'
  }
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const selectRoute = (route: any) => {
  // Navegar a la página de reserva con la ruta seleccionada
  router.push({
    path: `/carpooling/trip/${route.id}`,
    query: { 
      selected: 'true',
      compatibility: route.compatibilityScore,
      matchType: route.matchType
    }
  })
}

const viewRouteDetails = (route: any) => {
  router.push(`/carpooling/trip/${route.id}`)
}

// Buscar rutas compatibles al montar el componente
onMounted(() => {
  searchCompatibleRoutes()
})

// Observar cambios en el tripId
watch(() => props.tripId, () => {
  searchCompatibleRoutes()
})
</script>
