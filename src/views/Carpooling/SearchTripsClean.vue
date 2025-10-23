<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <AppSidebar />
    
    <!-- Main Content -->
    <div class="flex flex-1 flex-col overflow-hidden" :class="{ 'ml-0 lg:ml-[90px]': !isExpanded, 'ml-0 lg:ml-[280px]': isExpanded }">
      <!-- Header -->
      <AppHeader />
      
      <!-- Page Content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 px-3 py-4 sm:px-4 sm:py-6 md:px-6 lg:px-8 xl:px-10 dark:bg-boxdark">
        <!-- Header -->
        <div class="mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-black dark:text-white">
                Buscar Viajes
              </h1>
              <p class="text-sm font-medium text-body-color">
                Encuentra viajes compatibles con tu ruta
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

        <div class="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-5">
          <!-- Formulario de Búsqueda -->
          <div class="lg:col-span-3">
            <form @submit.prevent="searchTrips" class="space-y-6">
              <!-- Sección de Origen -->
              <div class="rounded-sm border border-stroke bg-white p-4 sm:p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
                  🚗 ¿Desde dónde viajas?
                </h3>
                
                <!-- Búsqueda por dirección exacta -->
                <div class="mb-4">
                  <label class="mb-2.5 block text-black dark:text-white">
                    Escribe una dirección exacta:
                  </label>
                  <AutocompleteInput
                    v-model="searchForm.origin"
                    placeholder="📍 Ej: Calle Gran Vía, 1, Madrid"
                    :suggestions="originSuggestions"
                    :is-loading="isLoadingOrigin"
                    @input="handleOriginInput"
                    @select="handleOriginSelect"
                    input-class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  />
                </div>

                <!-- Orígenes predefinidos -->
                <div>
                  <label class="mb-2.5 block text-black dark:text-white">
                    O selecciona una ciudad del extrarradio:
                  </label>
                  <button
                    @click="showOriginModal = true"
                    type="button"
                    class="w-full px-4 py-3 bg-green-50 border-2 border-dashed border-green-300 rounded-lg text-green-700 hover:bg-green-100 hover:border-green-400 transition-colors text-center mb-3"
                  >
                    🏙️ Seleccionar ciudad del extrarradio de Madrid
                  </button>
                  
                  <!-- Mostrar ciudad seleccionada -->
                  <div v-if="searchForm.origin" class="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                    <span class="text-green-700 font-medium">{{ searchForm.origin }}</span>
                    <button
                      @click="searchForm.origin = ''"
                      type="button"
                      class="text-green-500 hover:text-green-700 transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Sección de Destino -->
              <div class="rounded-sm border border-stroke bg-white p-4 sm:p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
                  🎯 ¿A dónde vas?
                </h3>
                
                <!-- Búsqueda por dirección exacta -->
                <div class="mb-4">
                  <label class="mb-2.5 block text-black dark:text-white">
                    Escribe una dirección exacta:
                  </label>
                  <AutocompleteInput
                    v-model="searchForm.destination"
                    placeholder="📍 Ej: Plaza Mayor, Madrid"
                    :suggestions="destinationSuggestions"
                    :is-loading="isLoadingDestination"
                    @input="handleDestinationInput"
                    @select="handleDestinationSelect"
                    input-class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  />
                </div>

                <!-- Destinos predefinidos -->
                <div>
                  <label class="mb-2.5 block text-black dark:text-white">
                    O selecciona un destino popular:
                  </label>
                  <button
                    @click="showDestinationModal = true"
                    type="button"
                    class="w-full px-4 py-3 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg text-blue-700 hover:bg-blue-100 hover:border-blue-400 transition-colors text-center mb-3"
                  >
                    🏢 Seleccionar destino en Madrid
                  </button>
                  
                  <!-- Mostrar destino seleccionado -->
                  <div v-if="searchForm.destination" class="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <span class="text-blue-700 font-medium">{{ searchForm.destination }}</span>
                    <button
                      @click="searchForm.destination = ''"
                      type="button"
                      class="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Fecha y Hora -->
              <div class="rounded-sm border border-stroke bg-white p-4 sm:p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
                  📅 ¿Cuándo viajas?
                </h3>
                
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label class="mb-2.5 block text-black dark:text-white">
                      Fecha *
                    </label>
                    <DatePicker
                      v-model="searchForm.date"
                      :min-date="today"
                      placeholder="Selecciona una fecha"
                      class="w-full"
                    />
                  </div>
                  
                  <div>
                    <label class="mb-2.5 block text-black dark:text-white">
                      Hora aproximada
                    </label>
                    <input
                      v-model="searchForm.time"
                      type="time"
                      class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <!-- Filtros -->
              <div class="rounded-sm border border-stroke bg-white p-4 sm:p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
                  🔍 Filtros
                </h3>
                
                <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label class="mb-2.5 block text-black dark:text-white">
                      Tipo de viaje
                    </label>
                    <select
                      v-model="searchForm.tripType"
                      class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    >
                      <option value="">Todos los tipos</option>
                      <option value="diario">Diario</option>
                      <option value="semanal">Semanal</option>
                      <option value="mensual">Mensual</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="mb-2.5 block text-black dark:text-white">
                      Precio máximo
                    </label>
                    <input
                      v-model="searchForm.maxPrice"
                      type="number"
                      placeholder="€"
                      class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label class="mb-2.5 block text-black dark:text-white">
                      Asientos
                    </label>
                    <input
                      v-model="searchForm.seats"
                      type="number"
                      min="1"
                      max="8"
                      placeholder="1"
                      class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <!-- Botón de búsqueda -->
              <div class="flex justify-end">
                <button
                  type="submit"
                  :disabled="isSearching"
                  class="flex items-center justify-center gap-2 rounded bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                >
                  <svg v-if="isSearching" class="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  {{ isSearching ? 'Buscando...' : 'Buscar Viajes' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Panel de Resultados -->
          <div class="lg:col-span-2">
            <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
                Resultados
              </h3>
              
              <div v-if="!hasSearched" class="text-center text-body-color">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <p class="mt-2">Realiza una búsqueda para ver resultados</p>
              </div>
              
              <div v-else-if="isSearching" class="text-center text-body-color">
                <svg class="mx-auto h-8 w-8 animate-spin text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                <p class="mt-2">Buscando viajes...</p>
              </div>
              
              <div v-else-if="searchResults.length === 0" class="text-center text-body-color">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0012 4c-2.34 0-4.29 1.009-5.824 2.709"/>
                </svg>
                <p class="mt-2">No se encontraron viajes</p>
                <p class="text-sm">Intenta ajustar tus filtros</p>
              </div>
              
              <div v-else class="space-y-4">
                <div
                  v-for="result in searchResults"
                  :key="result.trip.id"
                  class="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:border-green-300 dark:border-strokedark dark:bg-boxdark"
                >
                  <!-- Header con conductor y precio -->
                  <div class="flex items-start justify-between mb-4">
                    <!-- Información del conductor -->
                    <div class="flex items-center space-x-3">
                      <div class="relative">
                        <img 
                          :src="result.trip.profiles?.avatar_url || '/images/user/user-01.jpg'" 
                          :alt="result.trip.profiles?.name || 'Conductor'"
                          class="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-green-200"
                          @error="(event: any) => event.target.src = '/images/user/user-01.jpg'"
                        />
                        <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div class="flex-1 min-w-0">
                        <h4 class="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                          {{ result.trip.profiles?.name || 'Conductor' }}
                        </h4>
                        <div class="flex items-center space-x-1 text-xs text-gray-500 dark:text-body-color mb-1">
                          <span>⭐</span>
                          <span>{{ (result.trip as any).driver_rating || '4.8' }}</span>
                          <span>•</span>
                          <span>{{ (result.trip as any).trips_completed || '50+' }} viajes</span>
                        </div>
                        <div class="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                          </svg>
                          <span>{{ searchForm.date ? new Date(searchForm.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Hoy' }}</span>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Precio y tipo de viaje -->
                    <div class="text-right">
                      <div class="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                        {{ result.trip.price_per_seat }}€
                      </div>
                      <div class="text-xs text-gray-500 dark:text-body-color mb-2">por asiento</div>
                      <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                        :class="getTripTypeClass(result.trip)">
                        {{ getTripTypeLabel(result.trip) }}
                      </span>
                    </div>
                  </div>

                  <!-- Ruta -->
                  <div class="mb-4">
                    <div class="flex items-center space-x-2 mb-2">
                      <div class="flex-shrink-0 w-3 h-3 bg-green-500 rounded-full"></div>
                      <span class="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{{ result.trip.origin_name }}</span>
                    </div>
                    <div class="flex items-center space-x-2 ml-1.5">
                      <div class="w-px h-4 bg-gray-300 ml-1"></div>
                      <div class="flex-1 h-px bg-gray-300"></div>
                      <span class="text-gray-400 text-xs">→</span>
                      <div class="flex-1 h-px bg-gray-300"></div>
                    </div>
                    <div class="flex items-center space-x-2 mt-2">
                      <div class="flex-shrink-0 w-3 h-3 bg-red-500 rounded-full"></div>
                      <span class="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{{ result.trip.destination_name }}</span>
                    </div>
                  </div>

                  <!-- Información del viaje -->
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div class="text-center sm:text-left">
                      <div class="text-xs text-gray-500 dark:text-body-color mb-1">🕐 Salida</div>
                      <div class="font-medium text-sm">{{ formatDateTime(result.trip.departure_time) }}</div>
                    </div>
                    <div class="text-center sm:text-left">
                      <div class="text-xs text-gray-500 dark:text-body-color mb-1">🪑 Asientos</div>
                      <div class="font-medium text-sm">{{ result.trip.available_seats }}</div>
                    </div>
                    <div class="text-center sm:text-left">
                      <div class="text-xs text-gray-500 dark:text-body-color mb-1">📏 Distancia</div>
                      <div class="font-medium text-sm">
                        <span v-if="result.distance">{{ result.distance.toFixed(1) }} km</span>
                        <span v-else>N/A</span>
                      </div>
                    </div>
                    <div class="text-center sm:text-left">
                      <div class="text-xs text-gray-500 dark:text-body-color mb-1">Tipo</div>
                      <div class="font-medium text-sm">
                        <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {{ getTripTypeLabel(result.trip) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Información adicional -->
                  <div class="mb-4 flex items-center justify-between text-sm">
                    <div class="flex items-center space-x-2">
                      <span class="text-body-color">{{ result.matchType === 'exact_text' ? 'Coincidencia exacta' : 'Cerca de tu búsqueda' }}</span>
                    </div>
                    <div class="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
                      <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                      </svg>
                      <span>Verificado</span>
                    </div>
                  </div>
                  
                  <!-- Botones de acción -->
                  <div class="flex flex-col sm:flex-row gap-2">
                    <button 
                      @click="viewTripDetails(result.trip.id)"
                      class="flex items-center justify-center space-x-2 rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-body-color hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:border-strokedark dark:hover:bg-blue-900/20 dark:hover:border-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                      <span>Ver Detalles</span>
                    </button>
                    
                    <button class="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
                      Reservar
                    </button>
                    
                    <div class="flex space-x-1">
                      <button class="rounded-lg border border-stroke px-3 py-2 text-sm font-medium text-body-color hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-800 transition-colors">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
                        </svg>
                      </button>
                      <button class="rounded-lg border border-stroke px-3 py-2 text-sm font-medium text-body-color hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-800 transition-colors">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal de Ciudades de Origen -->
    <div v-if="showOriginModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h3 class="text-2xl font-bold text-gray-900">🏙️ Ciudades del Extrarradio de Madrid</h3>
            <button
              @click="showOriginModal = false"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <p class="text-gray-600 mt-2">Selecciona tu ciudad de origen</p>
        </div>
        
        <div class="p-6 overflow-y-auto max-h-[60vh]">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <button
              v-for="city in madridCities"
              :key="city"
              @click="selectOriginFromList(city)"
              class="px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 text-gray-700 hover:text-green-700 transition-all duration-200 text-center font-medium"
            >
              {{ city }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Destinos en Madrid -->
    <div v-if="showDestinationModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h3 class="text-2xl font-bold text-gray-900">🏢 Destinos en Madrid</h3>
            <button
              @click="showDestinationModal = false"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <p class="text-gray-600 mt-2">Selecciona tu destino en Madrid</p>
        </div>
        
        <div class="p-6 overflow-y-auto max-h-[60vh]">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <button
              v-for="destination in madridDestinations"
              :key="destination"
              @click="selectDestinationFromList(destination)"
              class="px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-all duration-200 text-center font-medium"
            >
              {{ destination }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { HybridTripService, type SearchResult } from '@/services/hybridTripService'
import AutocompleteInput from '@/components/AutocompleteInput.vue'
import { SimpleAutocompleteService, type AutocompleteSuggestion } from '@/services/simpleAutocompleteService'
import { GeolocationService } from '@/services/geolocation'
import { useSidebar } from '@/composables/useSidebar'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import DatePicker from '@/components/common/DatePicker.vue'

// Router y sidebar
const router = useRouter()
const { isExpanded } = useSidebar()

// Servicios
const hybridService = new HybridTripService()
const autocompleteService = new SimpleAutocompleteService()
const geolocationService = new GeolocationService()

// Formulario de búsqueda
const searchForm = reactive({
  origin: '',
  destination: '',
  date: '',
  time: '',
  tripType: '',
  maxPrice: '',
  seats: '1'
})

// Estados de la búsqueda
const searchResults = ref<SearchResult[]>([])
const isSearching = ref(false)
const hasSearched = ref(false)

// Estados para modales
const showOriginModal = ref(false)
const showDestinationModal = ref(false)

// Autocompletado
const originSuggestions = ref<AutocompleteSuggestion[]>([])
const destinationSuggestions = ref<AutocompleteSuggestion[]>([])
const isLoadingOrigin = ref(false)
const isLoadingDestination = ref(false)

// Fecha actual
const today = new Date().toISOString().split('T')[0]

// Ciudades del extrarradio de Madrid
const madridCities = [
  'Móstoles',
  'Alcalá de Henares',
  'Fuenlabrada',
  'Leganés',
  'Getafe',
  'Alcorcón',
  'Torrejón de Ardoz',
  'Parla',
  'Alcobendas',
  'San Sebastián de los Reyes',
  'Coslada',
  'Rivas-Vaciamadrid',
  'Valdemoro',
  'Pozuelo de Alarcón',
  'Majadahonda',
  'Las Rozas de Madrid',
  'Boadilla del Monte',
  'Villaviciosa de Odón',
  'Moralzarzal',
  'Colmenar Viejo'
]

// Destinos populares de Madrid
const madridDestinations = [
  'Puerta del Sol',
  'Gran Vía',
  'Chamartín',
  'Atocha',
  'Nuevos Ministerios',
  'Plaza de Castilla',
  'Moncloa',
  'Plaza de España',
  'AZCA',
  'Cuatro Torres',
  'Universidad Complutense',
  'Hospital La Paz',
  'Madrid Centro',
  'Ciudad financiera Santander (Boadilla)',
  'Ciudad financiera BBVA (Las Tablas)'
]

// Selección desde listas predefinidas
const selectOriginFromList = (city: string) => {
  searchForm.origin = city
  showOriginModal.value = false
}

const selectDestinationFromList = (destination: string) => {
  searchForm.destination = destination
  showDestinationModal.value = false
}

// Funciones de autocompletado
const handleOriginInput = async (value: string) => {
  if (value.length >= 2) {
    try {
      // Intentar usar Google Places API primero
      const googleResults = await geolocationService.autocompleteAddress(value)
      if (googleResults.length > 0) {
        originSuggestions.value = googleResults
        return
      }
    } catch (error) {
      console.warn('Google Places API falló, usando fallback:', error)
    }
    
    // Fallback a servicio simple
    originSuggestions.value = autocompleteService.searchSuggestions(value, 8)
  } else {
    originSuggestions.value = []
  }
}

const handleDestinationInput = async (value: string) => {
  if (value.length >= 2) {
    try {
      // Intentar usar Google Places API primero
      const googleResults = await geolocationService.autocompleteAddress(value)
      if (googleResults.length > 0) {
        destinationSuggestions.value = googleResults
        return
      }
    } catch (error) {
      console.warn('Google Places API falló, usando fallback:', error)
    }
    
    // Fallback a servicio simple
    destinationSuggestions.value = autocompleteService.searchSuggestions(value, 8)
  } else {
    destinationSuggestions.value = []
  }
}

const handleOriginSelect = (suggestion: AutocompleteSuggestion) => {
  searchForm.origin = suggestion.name
  originSuggestions.value = []
  console.log('Origen seleccionado:', suggestion)
}

const handleDestinationSelect = (suggestion: AutocompleteSuggestion) => {
  searchForm.destination = suggestion.name
  destinationSuggestions.value = []
  console.log('Destino seleccionado:', suggestion)
}

// Búsqueda de viajes
const searchTrips = async () => {
  if (!searchForm.origin || !searchForm.destination) {
    return
  }

  isSearching.value = true
  hasSearched.value = true

  try {
    console.log('🔍 Iniciando búsqueda híbrida...', searchForm)
    
    const results = await hybridService.searchTrips(
      searchForm.origin,
      searchForm.destination,
      {
        useGeolocation: true,
        maxDistanceKm: 50,
        limit: 20
      }
    )

    console.log('✅ Búsqueda completada:', results)
    searchResults.value = results
  } catch (error) {
    console.error('❌ Error en la búsqueda:', error)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

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

// Función para ver detalles del viaje
const viewTripDetails = (tripId: string) => {
  router.push(`/viaje/${tripId}`)
}

// Función para formatear fecha y hora
const formatDateTime = (dateTime: string) => {
  try {
    const date = new Date(dateTime)
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Error formateando fecha:', error)
    return dateTime
  }
}

// Función para formatear la fecha de búsqueda
const formatSearchDate = (dateString: string) => {
  if (!dateString) return 'Hoy'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  } catch (error) {
    console.error('Error formateando fecha de búsqueda:', error)
    return dateString
  }
}

const getTripTypeClass = (trip: any) => {
  const tripType = trip.trip_type || trip.trip_frequency || 'diario'
  
  switch (tripType.toLowerCase()) {
    case 'daily':
    case 'diario':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'weekly':
    case 'semanal':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'monthly':
    case 'mensual':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    default:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  }
}
</script>
