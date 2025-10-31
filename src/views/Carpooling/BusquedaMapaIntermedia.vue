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
                🗺️ Búsqueda por Mapa
              </h1>
              <p class="text-sm font-medium text-body-color">
                Encuentra viajes usando el mapa interactivo
              </p>
            </div>
            <button
              @click="$router.go(-1)"
              class="flex items-center space-x-2 rounded-md border border-stroke px-4 py-2 text-sm font-medium text-body-color hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-800"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              <span>Volver</span>
            </button>
          </div>
        </div>

        <!-- Layout responsivo -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <!-- En móvil: Mapa de pantalla completa -->
          <div class="lg:hidden">
            <!-- Header del mapa móvil -->
            <div class="mb-4 bg-white dark:bg-boxdark shadow-sm p-4 rounded-lg">
              <div class="flex items-center justify-between">
                <h1 class="text-lg font-bold text-black dark:text-white">
                  🗺️ Búsqueda por Mapa
                </h1>
                <button
                  @click="$router.go(-1)"
                  class="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Mapa móvil -->
            <div class="bg-white dark:bg-boxdark rounded-lg shadow-lg overflow-hidden">
              <div 
                id="map-mobile" 
                class="w-full"
                style="height: 70vh; min-height: 400px;"
              ></div>
            </div>
            
            <!-- Botón flotante para filtros en móvil -->
            <div class="fixed top-4 right-4 z-30">
              <button
                @click="showFiltersMobile = !showFiltersMobile"
                class="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                </svg>
              </button>
            </div>
            
            <!-- Panel de filtros móvil -->
            <div v-if="showFiltersMobile" class="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
              <div class="absolute bottom-0 left-0 right-0 bg-white dark:bg-boxdark rounded-t-lg shadow-lg max-h-[80vh] overflow-y-auto">
                <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div class="flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-black dark:text-white">
                      🔍 Filtros de Búsqueda
                    </h3>
                    <button
                      @click="showFiltersMobile = false"
                      class="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div class="p-4">
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-black dark:text-white mb-2">
                        🚗 Origen
                      </label>
                      <input
                        v-model="searchForm.origin"
                        type="text"
                        placeholder="Escribe tu origen..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-black dark:text-white mb-2">
                        🎯 Destino
                      </label>
                      <input
                        v-model="searchForm.destination"
                        type="text"
                        placeholder="Escribe tu destino..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-black dark:text-white mb-2">
                        📅 Fecha
                      </label>
                      <input
                        v-model="searchForm.date"
                        type="date"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    
                    <button
                      @click="searchTrips"
                      class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      🔍 Buscar Viajes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Panel de Búsqueda - Solo visible en escritorio -->
          <div class="hidden lg:block lg:col-span-1">
            <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
                🔍 Filtros de Búsqueda
              </h3>
              
              <form @submit.prevent="searchTrips" class="space-y-4">
                <div>
                  <label class="mb-2 block text-sm font-medium text-black dark:text-white">
                    🚗 Origen
                  </label>
                  <input
                    v-model="searchForm.origin"
                    type="text"
                    placeholder="📍 Ej: Getafe"
                    class="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  />
                </div>
                
                <div>
                  <label class="mb-2 block text-sm font-medium text-black dark:text-white">
                    🎯 Destino
                  </label>
                  <input
                    v-model="searchForm.destination"
                    type="text"
                    placeholder="📍 Ej: Chamartín"
                    class="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  />
                </div>
                
                <div>
                  <label class="mb-2 block text-sm font-medium text-black dark:text-white">
                    📅 Fecha
                  </label>
                  <input
                    v-model="searchForm.date"
                    type="date"
                    :min="today"
                    class="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  />
                </div>
                
                <button
                  type="submit"
                  class="w-full rounded bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
                >
                  🔍 Buscar Viajes
                </button>
              </form>
            </div>
          </div>

          <!-- Mapa y Resultados - Escritorio -->
          <div class="hidden lg:block lg:col-span-3">
            <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <!-- Mapa -->
              <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div class="p-6">
                  <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
                    🗺️ Mapa de Viajes
                  </h3>
                  <div 
                    id="map-desktop" 
                    class="w-full"
                    style="height: 500px;"
                  ></div>
                </div>
              </div>

              <!-- Resultados -->
              <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div class="p-6">
                  <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
                    📋 Resultados
                  </h3>
                  
                  <div v-if="!hasSearched" class="text-center py-8">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <p class="mt-2">Realiza una búsqueda para ver resultados en el mapa</p>
                  </div>
                  
                  <div v-else-if="searchResults.length === 0" class="text-center py-8">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709"/>
                    </svg>
                    <p class="mt-2">No se encontraron viajes para tu búsqueda</p>
                  </div>
                  
                  <div v-else class="space-y-4">
                    <div 
                      v-for="result in searchResults" 
                      :key="result.trip.id"
                      class="rounded-lg border border-stroke p-4 hover:shadow-md transition-shadow dark:border-strokedark"
                    >
                      <div class="flex items-center justify-between mb-2">
                        <h4 class="font-semibold text-black dark:text-white">
                          {{ result.trip.origin_name }} → {{ result.trip.destination_name }}
                        </h4>
                        <span class="text-sm font-medium text-primary">
                          {{ result.trip.price_per_seat }}€
                        </span>
                      </div>
                      <p class="text-sm text-body-color mb-2">
                        {{ new Date(result.trip.departure_time).toLocaleString() }}
                      </p>
                      <div class="flex items-center justify-between">
                        <span class="text-sm text-body-color">
                          🪑 {{ result.trip.available_seats }} asientos disponibles
                        </span>
                        <button class="text-primary hover:text-primary/80 text-sm font-medium">
                          Ver en mapa
                        </button>
                      </div>
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSidebar } from '@/composables/useSidebar'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'

// Router y sidebar
const router = useRouter()
const { isExpanded, isMobileOpen } = useSidebar()

// Estado del formulario
const searchForm = reactive({
  origin: '',
  destination: '',
  date: '',
  time: '',
  tripType: '',
  maxPrice: '',
  seats: 1
})

// Estado de la búsqueda
const searchResults = ref([])
const hasSearched = ref(false)
const isSearching = ref(false)

// Estado para panel de filtros en móvil
const showFiltersMobile = ref(false)

// Fecha actual
const today = new Date().toISOString().split('T')[0]

// Función de búsqueda
const searchTrips = async () => {
  if (!searchForm.origin || !searchForm.destination) {
    return
  }
  
  isSearching.value = true
  hasSearched.value = true
  
  try {
    // Simular búsqueda
    await new Promise(resolve => setTimeout(resolve, 1000))
    searchResults.value = []
    console.log('Búsqueda simulada:', searchForm)
  } catch (error) {
    console.error('Error en búsqueda:', error)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

// Inicialización
onMounted(() => {
  searchForm.date = today
})
</script>
