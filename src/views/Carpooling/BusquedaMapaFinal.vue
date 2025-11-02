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
                🗺️ Búsqueda por Mapa
              </h1>
              <p class="text-sm font-medium text-body-color">
                Encuentra viajes usando el mapa interactivo
              </p>
            </div>
            <div class="flex items-center gap-2">
              <!-- Enlaces rápidos -->
              <router-link
                to="/busqueda-express"
                class="hidden sm:flex items-center space-x-2 rounded-md border border-green-600 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100 dark:border-green-500 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                <span>Búsqueda Express</span>
              </router-link>
              <router-link
                to="/dashboard"
                class="hidden sm:flex items-center space-x-2 rounded-md border border-blue-600 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                <span>Dashboard</span>
              </router-link>
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
          <!-- Enlaces móviles -->
          <div class="sm:hidden mt-4 flex gap-2">
            <router-link
              to="/busqueda-express"
              class="flex-1 flex items-center justify-center space-x-2 rounded-md border border-green-600 bg-green-50 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-100"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              <span>Express</span>
            </router-link>
            <router-link
              to="/dashboard"
              class="flex-1 flex items-center justify-center space-x-2 rounded-md border border-blue-600 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              <span>Dashboard</span>
            </router-link>
          </div>
        </div>

        <!-- Botón flotante para filtros en móvil -->
        <div class="fixed top-20 sm:top-16 right-4 z-50 lg:hidden">
          <button
            @click="showFiltersMobile = !showFiltersMobile"
            class="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
            title="Mostrar filtros"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
            </svg>
          </button>
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
            
            <!-- Panel de filtros móvil -->
            <div v-if="showFiltersMobile" class="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
              <div class="absolute bottom-0 left-0 right-0 bg-white dark:bg-boxdark rounded-t-lg shadow-lg max-h-[85vh] overflow-y-auto pb-20">
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
                
                <div class="p-4 pb-6">
                  <!-- Usar el mismo formulario que funciona -->
                  <form @submit.prevent="searchTrips" class="space-y-4">
                    <!-- Sección de Origen -->
                    <div class="rounded-sm border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-gray-800">
                      <h4 class="mb-3 text-md font-semibold text-black dark:text-white">
                        🚗 ¿Desde dónde viajas?
                      </h4>
                      
                      <!-- Búsqueda por dirección exacta -->
                      <div class="mb-3">
                        <label class="mb-2 block text-sm font-medium text-black dark:text-white">
                          Escribe una dirección exacta:
                        </label>
                        <AutocompleteInput
                          v-model="searchForm.origin"
                          placeholder="📍 Ej: Calle Gran Vía, 1, Madrid"
                          :suggestions="originSuggestions"
                          :is-loading="isLoadingOrigin"
                          @input="handleOriginInput"
                          @select="handleOriginSelect"
                          input-class="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        />
                      </div>

                      <!-- Orígenes predefinidos -->
                      <div>
                        <label class="mb-2 block text-sm font-medium text-black dark:text-white">
                          O selecciona una ciudad del extrarradio:
                        </label>
                        <!-- Vista rápida -->
                        <div class="mb-3">
                          <div class="text-xs text-body-color mb-2">Vista rápida:</div>
                          <div class="flex flex-wrap gap-2">
                            <button
                              v-for="city in lugaresOrigenPopulares"
                              :key="city"
                              type="button"
                              @click="searchForm.origin = city"
                              class="px-3 py-1 text-sm rounded-full border transition"
                              :class="searchForm.origin === city ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'"
                            >
                              {{ city }}
                            </button>
                            <button
                              type="button"
                              @click="showModalOrigen = true"
                              class="px-3 py-1 text-sm rounded-full border border-gray-300 bg-white text-gray-700 hover:border-blue-400 transition"
                            >
                              + Más lugares
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Sección de Destino -->
                    <div class="rounded-sm border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-gray-800">
                      <h4 class="mb-3 text-md font-semibold text-black dark:text-white">
                        🎯 ¿A dónde vas?
                      </h4>
                      
                      <!-- Búsqueda por dirección exacta -->
                      <div class="mb-3">
                        <label class="mb-2 block text-sm font-medium text-black dark:text-white">
                          Escribe una dirección exacta:
                        </label>
                        <AutocompleteInput
                          v-model="searchForm.destination"
                          placeholder="📍 Ej: Paseo de la Castellana, 1, Madrid"
                          :suggestions="destinationSuggestions"
                          :is-loading="isLoadingDestination"
                          @input="handleDestinationInput"
                          @select="handleDestinationSelect"
                          input-class="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        />
                      </div>

                      <!-- Destinos predefinidos -->
                      <div>
                        <label class="mb-2 block text-sm font-medium text-black dark:text-white">
                          O selecciona un destino popular:
                        </label>
                        <!-- Vista rápida -->
                        <div class="mb-3">
                          <div class="text-xs text-body-color mb-2">Vista rápida:</div>
                          <div class="flex flex-wrap gap-2">
                            <button
                              v-for="dest in lugaresDestinoPopulares"
                              :key="dest"
                              type="button"
                              @click="searchForm.destination = dest"
                              class="px-3 py-1 text-sm rounded-full border transition"
                              :class="searchForm.destination === dest ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'"
                            >
                              {{ dest }}
                            </button>
                            <button
                              type="button"
                              @click="showModalDestino = true"
                              class="px-3 py-1 text-sm rounded-full border border-gray-300 bg-white text-gray-700 hover:border-blue-400 transition"
                            >
                              + Más lugares
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Sección de Fecha y Hora -->
                    <div class="rounded-sm border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-gray-800">
                      <h4 class="mb-3 text-md font-semibold text-black dark:text-white">
                        📅 ¿Cuándo viajas?
                      </h4>
                      
                      <div class="grid grid-cols-1 gap-3">
                        <div>
                          <label class="mb-2 block text-sm font-medium text-black dark:text-white">
                            Fecha *
                          </label>
                          <DatePicker
                            v-model="searchForm.date"
                            :min-date="today"
                            class="w-full"
                          />
                        </div>
                        
                        <div>
                          <label class="mb-2 block text-sm font-medium text-black dark:text-white">
                            Hora aproximada
                          </label>
                          <input
                            v-model="searchForm.time"
                            type="time"
                            class="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>

                    <!-- Botones de acción -->
                    <div class="flex gap-3">
                      <button
                        type="button"
                        @click="showFiltersMobile = false"
                        class="flex-1 rounded border border-stroke bg-gray-50 px-4 py-2 text-sm font-medium text-black transition hover:bg-gray-100 dark:border-strokedark dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        class="flex-1 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:bg-blue-700"
                      >
                        🔍 Buscar Viajes
                      </button>
                    </div>
                  </form>
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
                <!-- Sección de Origen -->
                <div class="rounded-sm border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-gray-800">
                  <h4 class="mb-3 text-md font-semibold text-black dark:text-white">
                    🚗 ¿Desde dónde viajas?
                  </h4>
                  
                  <!-- Búsqueda por dirección exacta -->
                  <div class="mb-3">
                    <label class="mb-2 block text-sm font-medium text-black dark:text-white">
                      Escribe una dirección exacta:
                    </label>
                    <AutocompleteInput
                      v-model="searchForm.origin"
                      placeholder="📍 Ej: Calle Gran Vía, 1, Madrid"
                      :suggestions="originSuggestions"
                      :is-loading="isLoadingOrigin"
                      @input="handleOriginInput"
                      @select="handleOriginSelect"
                      input-class="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>

                  <!-- Orígenes predefinidos -->
                  <div>
                    <label class="mb-2 block text-sm font-medium text-black dark:text-white">
                      O selecciona una ciudad del extrarradio:
                    </label>
                    <!-- Vista rápida -->
                    <div class="mb-3">
                      <div class="text-xs text-body-color mb-2">Vista rápida:</div>
                      <div class="flex flex-wrap gap-2">
                        <button
                          v-for="city in lugaresOrigenPopulares"
                          :key="city"
                          type="button"
                          @click="searchForm.origin = city"
                          class="px-3 py-1 text-sm rounded-full border transition"
                          :class="searchForm.origin === city ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'"
                        >
                          {{ city }}
                        </button>
                        <button
                          type="button"
                          @click="showModalOrigen = true"
                          class="px-3 py-1 text-sm rounded-full border border-gray-300 bg-white text-gray-700 hover:border-blue-400 transition"
                        >
                          + Más lugares
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Sección de Destino -->
                <div class="rounded-sm border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-gray-800">
                  <h4 class="mb-3 text-md font-semibold text-black dark:text-white">
                    🎯 ¿A dónde vas?
                  </h4>
                  
                  <!-- Búsqueda por dirección exacta -->
                  <div class="mb-3">
                    <label class="mb-2 block text-sm font-medium text-black dark:text-white">
                      Escribe una dirección exacta:
                    </label>
                    <AutocompleteInput
                      v-model="searchForm.destination"
                      placeholder="📍 Ej: Paseo de la Castellana, 1, Madrid"
                      :suggestions="destinationSuggestions"
                      :is-loading="isLoadingDestination"
                      @input="handleDestinationInput"
                      @select="handleDestinationSelect"
                      input-class="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>

                  <!-- Destinos predefinidos -->
                  <div>
                    <label class="mb-2 block text-sm font-medium text-black dark:text-white">
                      O selecciona un destino popular:
                    </label>
                    <!-- Vista rápida -->
                    <div class="mb-3">
                      <div class="text-xs text-body-color mb-2">Vista rápida:</div>
                      <div class="flex flex-wrap gap-2">
                        <button
                          v-for="dest in lugaresDestinoPopulares"
                          :key="dest"
                          type="button"
                          @click="searchForm.destination = dest"
                          class="px-3 py-1 text-sm rounded-full border transition"
                          :class="searchForm.destination === dest ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'"
                        >
                          {{ dest }}
                        </button>
                        <button
                          type="button"
                          @click="showModalDestino = true"
                          class="px-3 py-1 text-sm rounded-full border border-gray-300 bg-white text-gray-700 hover:border-blue-400 transition"
                        >
                          + Más lugares
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Sección de Fecha y Hora -->
                <div class="rounded-sm border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-gray-800">
                  <h4 class="mb-3 text-md font-semibold text-black dark:text-white">
                    📅 ¿Cuándo viajas?
                  </h4>
                  
                  <div class="grid grid-cols-1 gap-3">
                    <div>
                      <label class="mb-2 block text-sm font-medium text-black dark:text-white">
                        Fecha *
                      </label>
                      <DatePicker
                        v-model="searchForm.date"
                        :min-date="today"
                        class="w-full"
                      />
                    </div>
                    
                    <div>
                      <label class="mb-2 block text-sm font-medium text-black dark:text-white">
                        Hora aproximada
                      </label>
                      <input
                        v-model="searchForm.time"
                        type="time"
                        class="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <!-- Sección de Filtros -->
                <div class="rounded-sm border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-gray-800">
                  <h4 class="mb-3 text-md font-semibold text-black dark:text-white">
                    🔍 Filtros
                  </h4>
                  
                  <div class="space-y-3">
                    <div>
                      <label class="mb-2 block text-sm font-medium text-black dark:text-white">
                        Tipo de viaje
                      </label>
                      <select
                        v-model="searchForm.tripType"
                        class="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      >
                        <option value="">Todos los tipos</option>
                        <option value="daily">Diario</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensual</option>
                      </select>
                    </div>
                    
                    <div>
                      <label class="mb-2 block text-sm font-medium text-black dark:text-white">
                        Precio máximo
                      </label>
                      <input
                        v-model="searchForm.maxPrice"
                        type="number"
                        placeholder="€"
                        min="0"
                        step="0.50"
                        class="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      />
                    </div>
                    
                    <div>
                      <label class="mb-2 block text-sm font-medium text-black dark:text-white">
                        Asientos
                      </label>
                      <input
                        v-model="searchForm.seats"
                        type="number"
                        placeholder="1"
                        min="1"
                        max="8"
                        class="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <!-- Botones de acción -->
                <div class="flex gap-3">
                  <button
                    type="button"
                    @click="resetForm"
                    class="flex-1 rounded border border-stroke bg-gray-50 px-4 py-2 text-sm font-medium text-black transition hover:bg-gray-100 dark:border-strokedark dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                  >
                    Limpiar
                  </button>
                  <button
                    type="submit"
                    class="flex-1 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:bg-blue-700"
                  >
                    🔍 Buscar Viajes
                  </button>
                </div>
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
                    📋 Resultados ({{ searchResults.length }})
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
                  
                  <div v-else class="space-y-4 max-h-96 overflow-y-auto">
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
                        <button 
                          @click="showTripOnMap(result)"
                          class="text-primary hover:text-primary/80 text-sm font-medium"
                        >
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

  <!-- Modal Origen -->
  <div 
    v-if="showModalOrigen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="showModalOrigen = false"
  >
    <div class="bg-white dark:bg-boxdark rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold text-black dark:text-white">📍 Selecciona Origen</h3>
        <button 
          @click="showModalOrigen = false"
          class="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
      </div>
      
      <input 
        v-model="searchOrigen"
        type="text"
        placeholder="Buscar lugar..."
        class="w-full px-4 py-2 border rounded-lg mb-4 dark:bg-gray-800 dark:border-strokedark dark:text-white"
      />

      <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
        <button
          v-for="lugar in lugaresOrigenFiltrados"
          :key="lugar"
          type="button"
          @click="searchForm.origin = lugar; showModalOrigen = false"
          class="px-4 py-3 text-left border rounded-lg hover:bg-blue-50 hover:border-blue-400 transition dark:bg-gray-800 dark:border-strokedark dark:hover:bg-gray-700"
          :class="searchForm.origin === lugar ? 'bg-blue-100 border-blue-500' : 'bg-white border-gray-300'"
        >
          {{ lugar }}
        </button>
      </div>
    </div>
  </div>

  <!-- Modal Destino -->
  <div 
    v-if="showModalDestino"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="showModalDestino = false"
  >
    <div class="bg-white dark:bg-boxdark rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold text-black dark:text-white">🎯 Selecciona Destino</h3>
        <button 
          @click="showModalDestino = false"
          class="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
      </div>
      
      <input 
        v-model="searchDestino"
        type="text"
        placeholder="Buscar lugar..."
        class="w-full px-4 py-2 border rounded-lg mb-4 dark:bg-gray-800 dark:border-strokedark dark:text-white"
      />

      <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
        <button
          v-for="lugar in lugaresDestinoFiltrados"
          :key="lugar"
          type="button"
          @click="searchForm.destination = lugar; showModalDestino = false"
          class="px-4 py-3 text-left border rounded-lg hover:bg-blue-50 hover:border-blue-400 transition dark:bg-gray-800 dark:border-strokedark dark:hover:bg-gray-700"
          :class="searchForm.destination === lugar ? 'bg-blue-100 border-blue-500' : 'bg-white border-gray-300'"
        >
          {{ lugar }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { HybridTripService, type SearchResult } from '@/services/hybridTripService'
import { RoutesApiService, type Coords } from '@/services/routesApiService'
import AutocompleteInput from '@/components/AutocompleteInput.vue'
import { SimpleAutocompleteService, type AutocompleteSuggestion } from '@/services/simpleAutocompleteService'
import { GeolocationService } from '@/services/geolocation'
import { useSidebar } from '@/composables/useSidebar'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import DatePicker from '@/components/common/DatePicker.vue'
import { supabaseClean } from '@/config/supabaseClean'

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
const searchResults = ref<SearchResult[]>([])
const hasSearched = ref(false)
const isSearching = ref(false)

// Estado para panel de filtros en móvil
const showFiltersMobile = ref(false)

// Autocompletado
const originSuggestions = ref<AutocompleteSuggestion[]>([])
const destinationSuggestions = ref<AutocompleteSuggestion[]>([])
const isLoadingOrigin = ref(false)
const isLoadingDestination = ref(false)

// Servicios
const hybridService = new HybridTripService()
const routesApiService = new RoutesApiService()
const autocompleteService = new SimpleAutocompleteService()
const geolocationService = new GeolocationService()

// Fecha actual
const today = new Date().toISOString().split('T')[0]

// Orígenes y destinos predefinidos
const predefinedOrigins = [
  { name: 'Getafe', lat: 40.3082504, lng: -3.7323934 },
  { name: 'Móstoles', lat: 40.3223, lng: -3.8646 },
  { name: 'Alcorcón', lat: 40.3458, lng: -3.8247 },
  { name: 'Leganés', lat: 40.3272, lng: -3.7635 },
  { name: 'Fuenlabrada', lat: 40.2842, lng: -3.7941 },
  { name: 'Alcalá de Henares', lat: 40.4817, lng: -3.3643 },
  { name: 'Torrejón de Ardoz', lat: 40.4564, lng: -3.4819 }
]

const predefinedDestinations = [
  { name: 'Chamartín', lat: 40.4615174, lng: -3.6865844 },
  { name: 'Atocha', lat: 40.4075, lng: -3.6993 },
  { name: 'Nuevos Ministerios', lat: 40.4461, lng: -3.6903 },
  { name: 'Gran Vía', lat: 40.4192, lng: -3.7036 },
  { name: 'Plaza de España', lat: 40.4236, lng: -3.7123 },
  { name: 'Plaza de Castilla', lat: 40.4669, lng: -3.6886 },
  { name: 'Moncloa', lat: 40.4355, lng: -3.7195 }
]

// Lugares populares para vista rápida
const lugaresOrigenPopulares = ['Getafe', 'Leganés', 'Móstoles', 'Las Rozas', 'Alcobendas']
const lugaresDestinoPopulares = ['Sol', 'Atocha', 'Chamartín', 'Nuevos Ministerios', 'Moncloa']

// Lista completa de lugares
const lugaresOrigen = [
  'Getafe', 'Leganés', 'Fuenlabrada', 'Móstoles', 'Alcorcón', 'Parla', 'Pinto', 'Valdemoro',
  'Las Rozas', 'Majadahonda', 'Pozuelo de Alarcón', 'Boadilla del Monte', 'Alcobendas',
  'San Sebastián de los Reyes', 'Tres Cantos', 'Torrejón de Ardoz', 'Alcalá de Henares',
  'Coslada', 'San Fernando de Henares', 'Rivas-Vaciamadrid', 'Arganda del Rey',
  'Collado Villalba', 'Galapagar', 'El Escorial', 'Aranjuez'
]

const lugaresDestino = [
  'Madrid Centro', 'Sol', 'Gran Vía', 'Atocha', 'Chamartín', 'Nuevos Ministerios',
  'Plaza de Castilla', 'Moncloa', 'Plaza de España', 'Puerta del Sol', 'Cibeles',
  'Retiro', 'Salamanca', 'Chamberí', 'Malasaña', 'Chueca', 'La Latina', 'Lavapiés',
  'Argüelles', 'Cuatro Caminos', 'Tetuán', 'Ciudad Universitaria', 'Méndez Álvaro',
  'Pacífico', 'Ventas', 'Arturo Soria', 'Aeropuerto T1', 'Aeropuerto T4', 'IFEMA', 'Barajas'
]

// Estados para modales
const showModalOrigen = ref(false)
const showModalDestino = ref(false)
const searchOrigen = ref('')
const searchDestino = ref('')

// Computed para filtrar lugares
const lugaresOrigenFiltrados = computed(() => {
  if (!searchOrigen.value) return lugaresOrigen
  return lugaresOrigen.filter(lugar => 
    lugar.toLowerCase().includes(searchOrigen.value.toLowerCase())
  )
})

const lugaresDestinoFiltrados = computed(() => {
  if (!searchDestino.value) return lugaresDestino
  return lugaresDestino.filter(lugar => 
    lugar.toLowerCase().includes(searchDestino.value.toLowerCase())
  )
})

// Funciones de autocompletado
const handleOriginInput = async (value: string) => {
  if (value.length < 3) {
    originSuggestions.value = []
    return
  }
  
  isLoadingOrigin.value = true
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
  
  // Fallback a autocompletado local
  try {
    const results = autocompleteService.searchSuggestions(value)
    originSuggestions.value = results
  } catch (error) {
    console.error('Error en autocompletado:', error)
    originSuggestions.value = []
  } finally {
    isLoadingOrigin.value = false
  }
}

const handleDestinationInput = async (value: string) => {
  if (value.length < 3) {
    destinationSuggestions.value = []
    return
  }
  
  isLoadingDestination.value = true
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
  
  // Fallback a autocompletado local
  try {
    const results = autocompleteService.searchSuggestions(value)
    destinationSuggestions.value = results
  } catch (error) {
    console.error('Error en autocompletado:', error)
    destinationSuggestions.value = []
  } finally {
    isLoadingDestination.value = false
  }
}

const handleOriginSelect = (suggestion: AutocompleteSuggestion) => {
  searchForm.origin = suggestion.name
  originSuggestions.value = []
}

const handleDestinationSelect = (suggestion: AutocompleteSuggestion) => {
  searchForm.destination = suggestion.name
  destinationSuggestions.value = []
}

// Funciones de selección predefinida
const selectPredefinedOrigin = (city: any) => {
  searchForm.origin = city.name
}

const selectPredefinedDestination = (destination: any) => {
  searchForm.destination = destination.name
}

// Función de búsqueda
const searchTrips = async () => {
  if (!searchForm.origin || !searchForm.destination) {
    console.warn('⚠️ Faltan origen o destino para la búsqueda')
    return
  }
  
  console.log('🔍 Iniciando búsqueda de viajes...', {
    origin: searchForm.origin,
    destination: searchForm.destination,
    date: searchForm.date
  })
  
  isSearching.value = true
  hasSearched.value = true
  
  try {
    const results = await hybridService.searchTrips(
      searchForm.origin,
      searchForm.destination,
      {
        useGeolocation: true,
        maxDistanceKm: 50,
        limit: 50,
        date: searchForm.date
      }
    )
    
    console.log('✅ Búsqueda completada. Resultados encontrados:', results.length)
    searchResults.value = results
    
    // Mostrar resultados en el mapa
    if (results.length > 0) {
      console.log('🗺️ Mostrando resultados en el mapa...')
      await showResultsOnMap(results)
    } else {
      console.log('⚠️ No se encontraron resultados para mostrar en el mapa')
    }
  } catch (error) {
    console.error('❌ Error en búsqueda:', error)
    searchResults.value = []
    // Mostrar el error al usuario si es necesario
  } finally {
    isSearching.value = false
  }
}

// Función para limpiar formulario
const resetForm = () => {
  searchForm.origin = ''
  searchForm.destination = ''
  searchForm.date = today
  searchForm.time = ''
  searchForm.tripType = ''
  searchForm.maxPrice = ''
  searchForm.seats = 1
  searchResults.value = []
  hasSearched.value = false
}

// Inicialización del mapa
let mapMobile: google.maps.Map | null = null
let mapDesktop: google.maps.Map | null = null
let mapInitializationAttempts = 0
const MAX_INIT_ATTEMPTS = 20

const initializeMap = () => {
  mapInitializationAttempts++
  
  // Esperar a que Google Maps esté cargado
  if (typeof window.google === 'undefined' || !window.google.maps) {
    if (mapInitializationAttempts >= MAX_INIT_ATTEMPTS) {
      console.error('❌ No se pudo cargar Google Maps después de varios intentos')
      return
    }
    console.log(`⏳ Esperando a que Google Maps se cargue... (intento ${mapInitializationAttempts}/${MAX_INIT_ATTEMPTS})`)
    setTimeout(initializeMap, 500)
    return
  }

  console.log('🗺️ Inicializando mapas de Google Maps...')

  try {
    const currentIsMobile = window.innerWidth < 1024
    
    // Inicializar mapa móvil SOLO si estamos en vista móvil o el elemento existe
    if (currentIsMobile || !mapDesktop) {
      const mapMobileElement = document.getElementById('map-mobile')
      if (mapMobileElement && !mapMobile) {
        // Verificar que el elemento tenga dimensiones
        const rect = mapMobileElement.getBoundingClientRect()
        console.log('📱 Elemento mapa móvil encontrado. Dimensiones:', rect.width, 'x', rect.height)
        
        if (rect.width > 0 && rect.height > 0) {
          console.log('📱 Inicializando mapa móvil')
          mapMobile = new window.google.maps.Map(mapMobileElement, {
            center: { lat: 40.4168, lng: -3.7038 }, // Madrid
            zoom: 10,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          })
          console.log('✅ Mapa móvil inicializado:', mapMobile)
        } else {
          console.warn('⚠️ Elemento mapa móvil tiene dimensiones 0, esperando...')
          // Reintentar después de un delay
          setTimeout(() => {
            if (!mapMobile) {
              initializeMap()
            }
          }, 500)
        }
      }
    }

    // Inicializar mapa desktop SOLO si estamos en vista desktop o el elemento existe
    if (!currentIsMobile || !mapMobile) {
      const mapDesktopElement = document.getElementById('map-desktop')
      if (mapDesktopElement && !mapDesktop) {
        // Verificar que el elemento tenga dimensiones
        const rect = mapDesktopElement.getBoundingClientRect()
        console.log('🖥️ Elemento mapa desktop encontrado. Dimensiones:', rect.width, 'x', rect.height)
        
        if (rect.width > 0 && rect.height > 0) {
          console.log('🖥️ Inicializando mapa desktop')
          mapDesktop = new window.google.maps.Map(mapDesktopElement, {
            center: { lat: 40.4168, lng: -3.7038 }, // Madrid
            zoom: 10,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          })
          console.log('✅ Mapa desktop inicializado:', mapDesktop)
        }
      }
    }

    console.log('🎉 Mapas inicializados correctamente')
  } catch (error) {
    console.error('❌ Error inicializando mapas:', error)
  }
}

// Función para asegurar que el mapa esté inicializado
const ensureMapInitialized = async (): Promise<boolean> => {
  const currentIsMobile = window.innerWidth < 1024
  
  console.log('🔍 Verificando inicialización del mapa...')
  console.log('📏 Ancho de ventana:', window.innerWidth)
  console.log('📱 Es móvil:', currentIsMobile)
  console.log('📱 Mapa móvil existe:', !!mapMobile)
  console.log('🖥️ Mapa desktop existe:', !!mapDesktop)
  
  const map = currentIsMobile ? mapMobile : mapDesktop
  
  if (map) {
    console.log('✅ Mapa ya está inicializado')
    return true
  }
  
  // Si el mapa no está inicializado, intentar inicializarlo
  if (typeof window.google !== 'undefined' && window.google.maps) {
    console.log('🔄 El mapa no está inicializado, inicializando ahora...')
    
    // Verificar que el elemento del mapa exista
    const mapElementId = currentIsMobile ? 'map-mobile' : 'map-desktop'
    const mapElement = document.getElementById(mapElementId)
    
    console.log(`🔍 Buscando elemento: ${mapElementId}`)
    console.log(`📄 Elemento encontrado:`, !!mapElement)
    
    if (!mapElement) {
      console.error(`❌ El elemento ${mapElementId} no existe en el DOM`)
      // Intentar esperar un poco más por si el DOM no está listo
      await new Promise(resolve => setTimeout(resolve, 500))
      const retryElement = document.getElementById(mapElementId)
      if (!retryElement) {
        console.error(`❌ El elemento ${mapElementId} sigue sin existir después de esperar`)
        return false
      }
    }
    
    initializeMap()
    
    // Esperar un poco más para asegurar la inicialización
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const mapAfter = currentIsMobile ? mapMobile : mapDesktop
    console.log(`✅ Verificación final - Mapa ${currentIsMobile ? 'móvil' : 'desktop'} inicializado:`, !!mapAfter)
    return !!mapAfter
  }
  
  console.error('❌ Google Maps no está disponible')
  return false
}

// Variables para almacenar marcadores, líneas e info windows
let currentMarkers: any[] = []
let currentPolylines: any[] = []
let currentInfoWindows: google.maps.InfoWindow[] = []

// Función para limpiar marcadores anteriores
const clearMapMarkers = () => {
  currentMarkers.forEach(marker => marker.setMap(null))
  currentPolylines.forEach(polyline => polyline.setMap(null))
  currentInfoWindows.forEach(infoWindow => infoWindow.close())
  currentMarkers = []
  currentPolylines = []
  currentInfoWindows = []
}

// Función para mostrar un viaje específico en el mapa
const showTripOnMap = async (result: SearchResult) => {
  console.log('🗺️ Mostrando viaje en mapa:', result)
  
  // Asegurar que el mapa esté inicializado
  const mapInitialized = await ensureMapInitialized()
  if (!mapInitialized) {
    console.error('❌ No se pudo inicializar el mapa. Reintentando...')
    setTimeout(() => {
      showTripOnMap(result)
    }, 1000)
    return
  }
  
  // Determinar qué mapa usar basado en el tamaño de pantalla
  const isMobile = window.innerWidth < 1024
  const map = isMobile ? mapMobile : mapDesktop
  
  if (!map) {
    console.error('❌ Mapa no inicializado después de verificación. Móvil:', mapMobile, 'Desktop:', mapDesktop)
    return
  }
  
  console.log('✅ Usando mapa:', isMobile ? 'móvil' : 'desktop', map)

  // Limpiar marcadores anteriores
  clearMapMarkers()

  const trip = result.trip
  
  // Obtener información del conductor si no está disponible
  if (!trip.profiles && trip.driver_id) {
    try {
      const { data: profile } = await supabaseClean
        .from('profiles')
        .select('id, name, avatar_url')
        .eq('id', trip.driver_id)
        .single()
      
      if (profile) {
        trip.profiles = {
          name: profile.name,
          avatar_url: profile.avatar_url
        }
      } else {
        trip.profiles = { name: 'Conductor', avatar_url: null }
      }
    } catch (error) {
      console.warn('⚠️ No se pudo cargar el perfil del conductor:', error)
      trip.profiles = { name: 'Conductor', avatar_url: null }
    }
  }
  
  // Crear función global para abrir detalles (necesario para InfoWindow)
  ;(window as any).openTripDetails = (tripId: string) => {
    router.push(`/viaje/${tripId}`)
  }
  
  // Marcador de origen con icono personalizado más visible
  const originMarker = new google.maps.Marker({
    position: { lat: trip.origin_lat, lng: trip.origin_lng },
    map: map,
    title: `${trip.origin_name} → ${trip.destination_name}`,
    icon: {
      url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
      scaledSize: new google.maps.Size(32, 32)
    },
    animation: google.maps.Animation.DROP
  })
  currentMarkers.push(originMarker)

  // Crear InfoWindow con la card del viaje
  const cardContent = createTripCardContent(result)
  const infoWindow = new google.maps.InfoWindow({
    content: cardContent,
    maxWidth: 320
  })
  currentInfoWindows.push(infoWindow)

  // Mostrar InfoWindow automáticamente y al hacer click en el marcador
  infoWindow.open(map, originMarker)
  originMarker.addListener('click', () => {
    // Cerrar otros info windows
    currentInfoWindows.forEach(iw => iw.close())
    infoWindow.open(map, originMarker)
  })

  // Marcador de destino
  const destinationMarker = new google.maps.Marker({
    position: { lat: trip.destination_lat, lng: trip.destination_lng },
    map: map,
    title: `Destino: ${trip.destination_name}`,
    icon: {
      url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      scaledSize: new google.maps.Size(24, 24)
    }
  })
  currentMarkers.push(destinationMarker)

  // Usar Routes API (New) ahora que está habilitada
  console.log('🚀 INICIANDO CÁLCULO DE RUTA...')
  console.log('📍 Viaje:', trip.origin_name, '→', trip.destination_name)
  console.log('📍 Coordenadas origen:', trip.origin_lat, trip.origin_lng)
  console.log('📍 Coordenadas destino:', trip.destination_lat, trip.destination_lng)
  
  try {
    console.log('🛣️ Calculando ruta con Routes API (New)...')
    const originCoords: Coords = { lat: trip.origin_lat, lng: trip.origin_lng }
    const destinationCoords: Coords = { lat: trip.destination_lat, lng: trip.destination_lng }
    
    console.log('📍 Coordenadas preparadas:', { originCoords, destinationCoords })
    console.log('🔧 Llamando a routesApiService.calculateRoute...')
    
    const routeInfo = await routesApiService.calculateRoute(originCoords, destinationCoords)
    console.log('✅ Ruta calculada exitosamente:', routeInfo)
    
    // Dibujar la ruta en el mapa
    console.log('🎨 Dibujando ruta en el mapa...')
    const routePolyline = routesApiService.drawRouteOnMap(map, originCoords, destinationCoords, routeInfo.polyline)
    currentPolylines.push(routePolyline)
    
    console.log('✅ Ruta real dibujada en el mapa')
    
  } catch (error) {
    console.error('❌ Error calculando ruta con Routes API:', error)
    console.log('⚠️ Usando fallback a línea recta (Routes API falló)')
    
    // Fallback a línea recta
    const fallbackPolyline = new google.maps.Polyline({
      path: [
        { lat: trip.origin_lat, lng: trip.origin_lng },
        { lat: trip.destination_lat, lng: trip.destination_lng }
      ],
      map: map,
      strokeColor: '#3B82F6',
      strokeOpacity: 0.8,
      strokeWeight: 4,
      geodesic: true
    })
    currentPolylines.push(fallbackPolyline)
  }

  // Ajustar la vista para mostrar el viaje
  const bounds = new google.maps.LatLngBounds()
  bounds.extend({ lat: trip.origin_lat, lng: trip.origin_lng })
  bounds.extend({ lat: trip.destination_lat, lng: trip.destination_lng })
  map.fitBounds(bounds)

  console.log('✅ Viaje mostrado en el mapa:', trip.origin_name, '→', trip.destination_name)
}

// Función para crear el contenido HTML de la card del viaje
const createTripCardContent = (result: SearchResult): string => {
  const trip = result.trip
  const driverInfo = trip.profiles || { name: 'Conductor', avatar_url: null }
  const driverName = driverInfo.name || 'Conductor'
  const driverAvatar = driverInfo.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(driverName) + '&background=3B82F6&color=fff&size=64'
  
  // Formatear fecha y hora
  const departureDate = trip.departure_time ? new Date(trip.departure_time) : null
  const formattedDate = departureDate ? departureDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'Fecha no disponible'
  const formattedTime = departureDate ? departureDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : ''
  
  // Precio
  const price = trip.price_per_seat || 0
  
  // Asientos disponibles
  const availableSeats = result.bookingInfo?.remaining_seats ?? trip.available_seats ?? 0
  
  return `
    <div style="min-width: 280px; max-width: 320px; font-family: system-ui, -apple-system, sans-serif;">
      <!-- Header de la card -->
      <div style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); padding: 16px; border-radius: 8px 8px 0 0;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <img 
            src="${driverAvatar}" 
            alt="${driverName}"
            style="width: 48px; height: 48px; border-radius: 50%; border: 2px solid white; object-fit: cover;"
            onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(driverName)}&background=3B82F6&color=fff&size=64'"
          />
          <div style="flex: 1;">
            <div style="color: white; font-weight: 600; font-size: 16px; margin-bottom: 2px;">
              ${driverName}
            </div>
            <div style="color: rgba(255, 255, 255, 0.9); font-size: 12px;">
              🚗 Conductor
            </div>
          </div>
        </div>
      </div>
      
      <!-- Contenido de la card -->
      <div style="padding: 16px; background: white;">
        <!-- Ruta -->
        <div style="margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span style="color: #10B981; font-weight: 600;">●</span>
            <span style="font-size: 14px; color: #374151; font-weight: 500;">
              ${trip.origin_name}
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; padding-left: 4px;">
            <span style="color: #EF4444; font-weight: 600;">●</span>
            <span style="font-size: 14px; color: #374151; font-weight: 500;">
              ${trip.destination_name}
            </span>
          </div>
        </div>
        
        <!-- Información adicional -->
        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; padding: 12px; background: #F9FAFB; border-radius: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; color: #6B7280;">📅 Fecha</span>
            <span style="font-size: 13px; color: #111827; font-weight: 500;">${formattedDate}</span>
          </div>
          ${formattedTime ? `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; color: #6B7280;">🕐 Hora</span>
            <span style="font-size: 13px; color: #111827; font-weight: 500;">${formattedTime}</span>
          </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; color: #6B7280;">🪑 Asientos</span>
            <span style="font-size: 13px; color: #111827; font-weight: 500;">${availableSeats} disponibles</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; color: #6B7280;">💰 Precio</span>
            <span style="font-size: 16px; color: #10B981; font-weight: 600;">${price.toFixed(2)}€</span>
          </div>
        </div>
        
        <!-- Botón ver detalles -->
        <button 
          onclick="window.openTripDetails('${trip.id}')"
          style="
            width: 100%;
            padding: 12px;
            background: #3B82F6;
            color: white;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: background 0.2s;
          "
          onmouseover="this.style.background='#2563EB'"
          onmouseout="this.style.background='#3B82F6'"
        >
          Ver Detalles del Viaje →
        </button>
      </div>
    </div>
  `
}

// Función para mostrar resultados en el mapa
const showResultsOnMap = async (results: SearchResult[]) => {
  console.log('📊 Mostrando resultados en mapa:', results.length, 'resultados')
  
  // Verificar que haya resultados
  if (!results || results.length === 0) {
    console.warn('⚠️ No hay resultados para mostrar en el mapa')
    return
  }
  
  // Asegurar que el mapa esté inicializado
  const mapInitialized = await ensureMapInitialized()
  if (!mapInitialized) {
    console.error('❌ No se pudo inicializar el mapa. Reintentando...')
    
    // En móvil, intentar forzar la inicialización del mapa móvil
    const currentIsMobile = window.innerWidth < 1024
    if (currentIsMobile && !mapMobile) {
      console.log('🔄 Forzando inicialización del mapa móvil...')
      const mapMobileElement = document.getElementById('map-mobile')
      if (mapMobileElement) {
        const rect = mapMobileElement.getBoundingClientRect()
        console.log('📏 Dimensiones del elemento mapa móvil:', rect.width, 'x', rect.height)
        
        if (rect.width > 0 && rect.height > 0) {
          if (typeof window.google !== 'undefined' && window.google.maps) {
            mapMobile = new window.google.maps.Map(mapMobileElement, {
              center: { lat: 40.4168, lng: -3.7038 },
              zoom: 10,
              mapTypeId: google.maps.MapTypeId.ROADMAP,
              styles: [
                {
                  featureType: 'poi',
                  elementType: 'labels',
                  stylers: [{ visibility: 'off' }]
                }
              ]
            })
            console.log('✅ Mapa móvil inicializado forzadamente')
            
            // Reintentar mostrar resultados
            setTimeout(() => {
              showResultsOnMap(results)
            }, 500)
            return
          }
        } else {
          console.error('❌ El elemento mapa móvil no tiene dimensiones válidas')
        }
      } else {
        console.error('❌ El elemento map-mobile no existe en el DOM')
      }
    }
    
    // Reintentar después de un segundo
    setTimeout(() => {
      showResultsOnMap(results)
    }, 1000)
    return
  }
  
  // Determinar qué mapa usar basado en el tamaño de pantalla
  // Usar una función helper que siempre verifica el tamaño actual
  const getCurrentMap = () => {
    const currentIsMobile = window.innerWidth < 1024
    const map = currentIsMobile ? mapMobile : mapDesktop
    
    if (!map) {
      console.error('❌ Mapa no inicializado después de verificación.')
      console.error('📱 Mapa móvil:', mapMobile ? '✅ Inicializado' : '❌ No inicializado')
      console.error('🖥️ Mapa desktop:', mapDesktop ? '✅ Inicializado' : '❌ No inicializado')
      console.error('📏 Ancho actual:', window.innerWidth)
      return null
    }
    
    console.log('✅ Usando mapa:', currentIsMobile ? 'móvil' : 'desktop', map)
    return { map, isMobile: currentIsMobile }
  }
  
  const mapInfo = getCurrentMap()
  if (!mapInfo) {
    return
  }
  
  // Usar let para poder reasignar si es necesario
  let { map, isMobile } = mapInfo

  // Limpiar marcadores anteriores
  clearMapMarkers()

  // Obtener información del conductor para todos los viajes que no la tengan
  const tripsNeedingDriverInfo = results.filter(r => !r.trip.profiles || !r.trip.profiles.name)
  const driverIds = tripsNeedingDriverInfo.map(r => r.trip.driver_id).filter(Boolean)
  
  let driverProfilesMap = new Map()
  if (driverIds.length > 0) {
    try {
      const { data: profiles, error } = await supabaseClean
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', driverIds)
      
      if (!error && profiles) {
        profiles.forEach(profile => {
          driverProfilesMap.set(profile.id, {
            name: profile.name,
            avatar_url: profile.avatar_url
          })
        })
      }
    } catch (error) {
      console.warn('Error obteniendo perfiles de conductores:', error)
    }
  }

  // Crear función global para abrir detalles (necesario para InfoWindow)
  ;(window as any).openTripDetails = (tripId: string) => {
    router.push(`/viaje/${tripId}`)
  }

  // Colores diferentes para cada ruta (para diferenciarlas visualmente)
  const routeColors = [
    '#3B82F6', // Azul
    '#10B981', // Verde
    '#F59E0B', // Amarillo
    '#EF4444', // Rojo
    '#8B5CF6', // Morado
    '#EC4899', // Rosa
    '#06B6D4', // Cyan
    '#F97316'  // Naranja
  ]

  console.log(`🗺️ Creando marcadores para ${results.length} viajes...`)
  console.log(`📍 Mapa seleccionado inicialmente: ${isMobile ? 'MÓVIL' : 'DESKTOP'}`)
  console.log(`📍 Instancia mapa móvil:`, mapMobile)
  console.log(`📍 Instancia mapa desktop:`, mapDesktop)
  console.log(`📍 Mapa que se usará inicialmente:`, map)
  console.log(`📍 Mapa actual tiene getCenter:`, map?.getCenter ? 'Sí' : 'No')
  
  // Verificación crítica: asegurar que el mapa sea el correcto
  const currentIsMobile = window.innerWidth < 1024
  const correctMap = currentIsMobile ? mapMobile : mapDesktop
  
  if (map !== correctMap) {
    console.warn('⚠️ ADVERTENCIA: El mapa seleccionado NO coincide con el tamaño de pantalla actual!')
    console.warn(`   Tamaño inicial: ${isMobile ? 'móvil' : 'desktop'}`)
    console.warn(`   Tamaño actual: ${currentIsMobile ? 'móvil' : 'desktop'}`)
    console.warn(`   Corrigiendo para usar el mapa correcto...`)
    
    if (!correctMap) {
      console.error('❌ El mapa correcto tampoco está inicializado')
      console.error('   Intentando inicializar el mapa correcto...')
      
      // Forzar inicialización del mapa correcto
      const mapElementId = currentIsMobile ? 'map-mobile' : 'map-desktop'
      const mapElement = document.getElementById(mapElementId)
      
      if (mapElement && typeof window.google !== 'undefined' && window.google.maps) {
        // Verificar que el elemento tenga dimensiones antes de inicializar
        const rect = mapElement.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) {
          console.error(`❌ El elemento ${mapElementId} no tiene dimensiones válidas:`, rect.width, 'x', rect.height)
          console.error('   Esperando y reintentando...')
          await new Promise(resolve => setTimeout(resolve, 500))
          const retryRect = mapElement.getBoundingClientRect()
          if (retryRect.width === 0 || retryRect.height === 0) {
            console.error('   ❌ El elemento sigue sin dimensiones después de esperar')
            return false
          }
        }
        
        if (currentIsMobile && !mapMobile) {
          console.log('📱 Inicializando mapa móvil manualmente...')
          mapMobile = new window.google.maps.Map(mapElement, {
            center: { lat: 40.4168, lng: -3.7038 },
            zoom: 10,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          })
          map = mapMobile
          isMobile = true
          console.log('✅ Mapa móvil inicializado manualmente')
        } else if (!currentIsMobile && !mapDesktop) {
          console.log('🖥️ Inicializando mapa desktop manualmente...')
          mapDesktop = new window.google.maps.Map(mapElement, {
            center: { lat: 40.4168, lng: -3.7038 },
            zoom: 10,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          })
          map = mapDesktop
          isMobile = false
          console.log('✅ Mapa desktop inicializado manualmente')
        }
      }
      
      if (!map) {
        console.error('❌ No se pudo inicializar el mapa correcto')
        return
      }
    } else {
      // Usar el mapa correcto
      map = correctMap
      isMobile = currentIsMobile
      console.log(`✅ Corregido: Ahora usando mapa ${isMobile ? 'móvil' : 'desktop'}`)
    }
  }
  
  console.log(`📍 Mapa final que se usará: ${isMobile ? 'MÓVIL' : 'DESKTOP'}`, map)
  
  // Verificar que el mapa esté realmente disponible antes de procesar
  if (!map) {
    console.error('❌ ERROR FATAL: El mapa no está disponible después de todas las verificaciones')
    return
  }
  
  // Verificar que el mapa tenga el método setMap (es realmente una instancia de google.maps.Map)
  if (typeof map.setCenter !== 'function') {
    console.error('❌ ERROR: El mapa no es una instancia válida de google.maps.Map')
    return
  }
  
  console.log(`✅ Mapa verificado y listo. Procesando ${results.length} resultados...`)
  console.log(`📋 Lista completa de resultados a procesar:`)
  results.forEach((r, idx) => {
    if (r && r.trip) {
      console.log(`   ${idx + 1}. ${r.trip.origin_name} → ${r.trip.destination_name} (ID: ${r.trip.id})`)
    } else {
      console.warn(`   ${idx + 1}. ⚠️ Resultado inválido:`, r)
    }
  })
  
  // Crear marcadores para cada resultado
  let processedCount = 0
  let errorCount = 0
  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    if (!result || !result.trip) {
      console.warn(`⚠️ Resultado ${i + 1} es inválido, saltando...`)
      continue
    }
    
    const trip = result.trip
    const routeColor = routeColors[i % routeColors.length]
    
    console.log(`\n📍 [${i + 1}/${results.length}] Procesando viaje: ${trip.origin_name} → ${trip.destination_name}`)
    console.log(`   Coordenadas: origen (${trip.origin_lat}, ${trip.origin_lng}), destino (${trip.destination_lat}, ${trip.destination_lng})`)
    console.log(`   Mapa en uso: ${isMobile ? 'MÓVIL' : 'DESKTOP'}`, map)
    
    try {
      // Obtener información del conductor
      if (!trip.profiles) {
        const driverProfile = driverProfilesMap.get(trip.driver_id)
        if (driverProfile) {
          trip.profiles = driverProfile
        } else {
          trip.profiles = { name: 'Conductor', avatar_url: null }
        }
      }
      
      // Marcador de origen con icono personalizado más visible
      const originMarker = new google.maps.Marker({
        position: { lat: trip.origin_lat, lng: trip.origin_lng },
        map: map,
        title: `${trip.origin_name} → ${trip.destination_name}`,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
          scaledSize: new google.maps.Size(32, 32)
        },
        animation: google.maps.Animation.DROP,
        label: {
          text: String(i + 1),
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold'
        }
      })
      currentMarkers.push(originMarker)
      
      // Verificar inmediatamente que el marcador esté en el mapa
      const markerMap = originMarker.getMap()
      if (!markerMap) {
        console.error(`❌ ERROR CRÍTICO: Marcador origen ${i + 1} NO está en el mapa!`)
        console.error(`   Intentando agregar manualmente...`)
        originMarker.setMap(map)
        const retryMap = originMarker.getMap()
        if (!retryMap) {
          console.error(`   ❌ FALLO: Marcador origen ${i + 1} no se pudo agregar al mapa`)
        } else {
          console.log(`   ✅ ÉXITO: Marcador origen ${i + 1} agregado manualmente`)
        }
      } else {
        const isOnCorrectMap = markerMap === map
        console.log(`✅ Marcador origen ${i + 1} creado y ${isOnCorrectMap ? 'en el mapa correcto' : 'EN EL MAPA INCORRECTO!'}`)
        if (!isOnCorrectMap) {
          console.error(`   ❌ ADVERTENCIA: Marcador en mapa diferente al esperado`)
        }
      }

      // Crear InfoWindow con la card del viaje
      const cardContent = createTripCardContent(result)
      const infoWindow = new google.maps.InfoWindow({
        content: cardContent,
        maxWidth: 320
      })
      currentInfoWindows.push(infoWindow)

      // Mostrar InfoWindow al hacer click en el marcador
      originMarker.addListener('click', () => {
        // Cerrar otros info windows
        currentInfoWindows.forEach(iw => iw.close())
        infoWindow.open(map, originMarker)
      })

      // Marcador de destino
      const destinationMarker = new google.maps.Marker({
        position: { lat: trip.destination_lat, lng: trip.destination_lng },
        map: map,
        title: `Destino: ${trip.destination_name}`,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new google.maps.Size(24, 24)
        },
        label: {
          text: String(i + 1),
          color: 'white',
          fontSize: '10px',
          fontWeight: 'bold'
        }
      })
      currentMarkers.push(destinationMarker)
      
      // Verificar que el marcador de destino esté en el mapa
      const destMarkerMap = destinationMarker.getMap()
      if (!destMarkerMap) {
        console.error(`❌ ERROR: Marcador destino ${i + 1} NO está en el mapa!`)
        destinationMarker.setMap(map)
      } else {
        const isOnCorrectMap = destMarkerMap === map
        console.log(`✅ Marcador destino ${i + 1} creado y ${isOnCorrectMap ? 'en el mapa correcto' : 'EN EL MAPA INCORRECTO!'}`)
      }

      // Usar Routes API (New) ahora que está habilitada
      console.log(`🚀 Viaje ${i + 1}/${results.length}: Calculando ruta...`)
      
      // Procesar la ruta en paralelo sin bloquear el bucle principal
      // Usar Promise para que no bloquee otros resultados
      const processRoute = async () => {
        try {
          const originCoords: Coords = { lat: trip.origin_lat, lng: trip.origin_lng }
          const destinationCoords: Coords = { lat: trip.destination_lat, lng: trip.destination_lng }
          
          const routeInfo = await routesApiService.calculateRoute(originCoords, destinationCoords)
          console.log(`✅ Viaje ${i + 1}: Ruta calculada exitosamente`)
        
        // Dibujar la ruta en el mapa con color único
        let routePolyline
        
        if (routeInfo.polyline) {
          // Decodificar la polyline manualmente
          const decodePolyline = (encoded) => {
            const points = []
            let index = 0
            const len = encoded.length
            let lat = 0
            let lng = 0
            
            while (index < len) {
              let b, shift = 0, result = 0
              do {
                b = encoded.charCodeAt(index++) - 63
                result |= (b & 0x1f) << shift
                shift += 5
              } while (b >= 0x20)
              const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1))
              lat += dlat
              
              shift = 0
              result = 0
              do {
                b = encoded.charCodeAt(index++) - 63
                result |= (b & 0x1f) << shift
                shift += 5
              } while (b >= 0x20)
              const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1))
              lng += dlng
              
              points.push({ lat: lat * 1e-5, lng: lng * 1e-5 })
            }
            return points
          }
          
          const decodedPath = decodePolyline(routeInfo.polyline)
          routePolyline = new google.maps.Polyline({
            path: decodedPath,
            map: map,
            strokeColor: routeColor,
            strokeOpacity: 0.7,
            strokeWeight: 4,
            geodesic: true
          })
        } else {
          // Fallback a línea recta
          routePolyline = new google.maps.Polyline({
            path: [
              { lat: trip.origin_lat, lng: trip.origin_lng },
              { lat: trip.destination_lat, lng: trip.destination_lng }
            ],
            map: map,
            strokeColor: routeColor,
            strokeOpacity: 0.7,
            strokeWeight: 4,
            geodesic: true
          })
        }
        
        currentPolylines.push(routePolyline)
        
        // Verificar que la ruta esté en el mapa
        const polylineMap = routePolyline.getMap()
        if (!polylineMap) {
          console.error(`❌ ERROR: Ruta ${i + 1} NO está en el mapa!`)
          routePolyline.setMap(map)
        } else {
          const isOnCorrectMap = polylineMap === map
          console.log(`✅ Viaje ${i + 1}: Ruta dibujada ${isOnCorrectMap ? 'en el mapa correcto' : 'EN EL MAPA INCORRECTO'} (color: ${routeColor})`)
        }
        } catch (routeError) {
          console.error(`❌ Viaje ${i + 1}: Error procesando ruta:`, routeError)
          throw routeError
        }
      }
      
      // Ejecutar async pero no esperar - dibujar línea recta inmediatamente
      processRoute().catch((error) => {
        console.error(`❌ Viaje ${i + 1}: Error calculando ruta con Routes API:`, error)
        console.log(`⚠️ Viaje ${i + 1}: Usando fallback a línea recta`)
        
        // Fallback a línea recta con color único
        const fallbackPolyline = new google.maps.Polyline({
          path: [
            { lat: trip.origin_lat, lng: trip.origin_lng },
            { lat: trip.destination_lat, lng: trip.destination_lng }
          ],
          map: map,
          strokeColor: routeColor,
          strokeOpacity: 0.7,
          strokeWeight: 4,
          geodesic: true
        })
        currentPolylines.push(fallbackPolyline)
        
        // Verificar que la línea recta esté en el mapa
        const fallbackMap = fallbackPolyline.getMap()
        if (!fallbackMap) {
          console.error(`❌ ERROR: Línea recta ${i + 1} NO está en el mapa!`)
          fallbackPolyline.setMap(map)
        } else {
          console.log(`✅ Viaje ${i + 1}: Línea recta dibujada en el mapa correcto`)
        }
      }
      
      processedCount++
      console.log(`✅ Viaje ${i + 1}/${results.length} completado exitosamente`)
    } catch (error) {
      errorCount++
      console.error(`❌ Error procesando viaje ${i + 1}:`, error)
      console.error(`   Error detalle:`, error.message || error)
      console.error(`   Stack:`, error.stack)
      // Continuar con el siguiente viaje aunque este falle
      console.log(`   ⏭️ Continuando con el siguiente viaje...`)
      continue
    }
  }
  
  console.log(`\n📊 ========== RESUMEN FINAL ==========`)
  console.log(`✅ Total viajes a procesar: ${results.length}`)
  console.log(`✅ Total viajes procesados exitosamente: ${processedCount}`)
  console.log(`❌ Total viajes con errores: ${errorCount}`)
  console.log(`✅ Total marcadores creados: ${currentMarkers.length}`)
  console.log(`✅ Total rutas creadas: ${currentPolylines.length}`)
  console.log(`📍 Mapa usado: ${isMobile ? 'MÓVIL' : 'DESKTOP'}`)
  
  // Verificar que se procesaron todos los resultados
  const expectedMarkers = results.length * 2 // 2 marcadores por viaje (origen + destino)
  if (currentMarkers.length < expectedMarkers) {
    console.warn(`⚠️ ADVERTENCIA: Se esperaban ${expectedMarkers} marcadores (2 por viaje), pero solo se crearon ${currentMarkers.length}`)
    console.warn(`   Diferencia: ${expectedMarkers - currentMarkers.length} marcadores faltantes`)
  }
  
  // Verificar cuántos marcadores están realmente visibles en el mapa
  const visibleMarkers = currentMarkers.filter(m => {
    const markerMap = m.getMap()
    return markerMap !== null && markerMap === map
  }).length
  
  const visiblePolylines = currentPolylines.filter(p => {
    const polyMap = p.getMap()
    return polyMap !== null && polyMap === map
  }).length
  
  console.log(`✅ Marcadores visibles en el mapa correcto: ${visibleMarkers}/${currentMarkers.length}`)
  console.log(`✅ Rutas visibles en el mapa correcto: ${visiblePolylines}/${currentPolylines.length}`)
  
  if (visibleMarkers < currentMarkers.length) {
    console.warn(`⚠️ ADVERTENCIA: ${currentMarkers.length - visibleMarkers} marcadores NO están visibles en el mapa correcto`)
    // Intentar corregir los marcadores que no están en el mapa correcto
    currentMarkers.forEach((marker, idx) => {
      const markerMap = marker.getMap()
      if (!markerMap || markerMap !== map) {
        console.log(`   🔧 Corrigiendo marcador ${idx + 1}...`)
        marker.setMap(map)
      }
    })
  }
  
  if (visiblePolylines < currentPolylines.length) {
    console.warn(`⚠️ ADVERTENCIA: ${currentPolylines.length - visiblePolylines} rutas NO están visibles en el mapa correcto`)
    // Intentar corregir las rutas que no están en el mapa correcto
    currentPolylines.forEach((polyline, idx) => {
      const polyMap = polyline.getMap()
      if (!polyMap || polyMap !== map) {
        console.log(`   🔧 Corrigiendo ruta ${idx + 1}...`)
        polyline.setMap(map)
      }
    })
  }
  
  console.log(`📊 ====================================\n`)

  // Ajustar la vista para mostrar todos los marcadores
  if (results.length > 0 && visibleMarkers > 0) {
    const bounds = new google.maps.LatLngBounds()
    
    // Solo incluir marcadores que estén visibles
    currentMarkers.forEach(marker => {
      if (marker.getMap()) {
        const position = marker.getPosition()
        if (position) {
          bounds.extend(position)
        }
      }
    })
    
    if (!bounds.isEmpty()) {
      // Añadir padding para que los marcadores no queden en el borde
      const padding = isMobile ? 50 : 100
      map.fitBounds(bounds, {
        top: padding,
        right: padding,
        bottom: padding,
        left: padding
      })
      
      console.log(`✅ Vista ajustada para mostrar ${visibleMarkers} marcadores visibles`)
    } else {
      console.warn('⚠️ No hay marcadores visibles para ajustar la vista')
    }
  }
}

// Inicialización
searchForm.date = today

// Inicializar mapa cuando el componente se monte
onMounted(() => {
  console.log('🔧 Componente montado, iniciando inicialización del mapa...')
  console.log('📏 Ancho de ventana al montar:', window.innerWidth)
  console.log('📱 Es móvil:', window.innerWidth < 1024)
  
  // Esperar a que el DOM esté listo
  setTimeout(() => {
    // Verificar si Google Maps ya está cargado
    if (typeof window.google !== 'undefined' && window.google.maps) {
      console.log('✅ Google Maps ya está cargado, inicializando mapas inmediatamente')
      initializeMap()
      
      // En móvil, hacer una verificación adicional después de un delay
      if (window.innerWidth < 1024 && !mapMobile) {
        setTimeout(() => {
          console.log('🔄 Verificación adicional del mapa móvil después del montaje...')
          const mapMobileElement = document.getElementById('map-mobile')
          if (mapMobileElement) {
            const rect = mapMobileElement.getBoundingClientRect()
            console.log('📏 Dimensiones elemento mapa móvil:', rect.width, 'x', rect.height)
            if (rect.width > 0 && rect.height > 0 && !mapMobile) {
              console.log('📱 Inicializando mapa móvil en verificación adicional...')
              mapMobile = new window.google.maps.Map(mapMobileElement, {
                center: { lat: 40.4168, lng: -3.7038 },
                zoom: 10,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                styles: [
                  {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'off' }]
                  }
                ]
              })
              console.log('✅ Mapa móvil inicializado en verificación adicional:', mapMobile)
            }
          }
        }, 1500)
      }
    } else {
      console.log('⏳ Google Maps no está cargado aún, esperando...')
      // Intentar inicializar con un delay
      setTimeout(initializeMap, 500)
      
      // También escuchar cuando Google Maps se cargue completamente
      const checkGoogleMaps = setInterval(() => {
        if (typeof window.google !== 'undefined' && window.google.maps) {
          console.log('✅ Google Maps detectado, inicializando mapas')
          clearInterval(checkGoogleMaps)
          initializeMap()
        }
      }, 500)
      
      // Limpiar el interval después de 10 segundos
      setTimeout(() => {
        clearInterval(checkGoogleMaps)
      }, 10000)
    }
  }, 300)
})
</script>
