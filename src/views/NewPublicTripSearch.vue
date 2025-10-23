<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <img src="/images/logo/Compartalia2.png" alt="Compartalia Logo" class="h-8 w-auto object-contain" />
          </div>
          
          <!-- Navbar dinámica basada en el estado de autenticación -->
          <div class="flex items-center space-x-4">
            <router-link to="/" class="text-gray-600 hover:text-green-600 font-medium">
              Inicio
            </router-link>
            
            <!-- Debug info (temporal) -->
            <div v-if="user" class="text-xs text-gray-500 mr-4">
              Debug: {{ user.email }} | {{ userProfile?.name || 'Sin perfil' }}
            </div>
            
            <!-- Si el usuario está logueado -->
            <div v-if="user" class="flex items-center space-x-4">
              <router-link to="/dashboard" class="text-gray-600 hover:text-green-600 font-medium">
                Dashboard
              </router-link>
              <router-link to="/carpooling/buscar-viajes-hibrido" class="text-gray-600 hover:text-green-600 font-medium">
                Búsqueda Avanzada
              </router-link>
              
              <!-- Dropdown del perfil -->
              <div class="relative">
                <button
                  @click="toggleProfileDropdown"
                  class="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors"
                >
                  <img
                    :src="userProfile?.avatar_url || '/images/user/user-01.jpg'"
                    :alt="userProfile?.name || 'Usuario'"
                    class="h-8 w-8 rounded-full object-cover"
                  />
                  <span class="font-medium">{{ userProfile?.name || 'Usuario' }}</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                <!-- Dropdown menu -->
                <div
                  v-if="showProfileDropdown"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                >
                  <div class="py-2">
                    <div class="px-4 py-2 border-b border-gray-100">
                      <p class="text-sm font-medium text-gray-900">{{ userProfile?.name || 'Usuario' }}</p>
                      <p class="text-xs text-gray-500">{{ userProfile?.email || user?.email }}</p>
                    </div>
                    <router-link
                      to="/profile"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      @click="closeProfileDropdown"
                    >
                      👤 Mi Perfil
                    </router-link>
                    <router-link
                      to="/dashboard"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      @click="closeProfileDropdown"
                    >
                      📊 Dashboard
                    </router-link>
                    <router-link
                      to="/carpooling/my-trips"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      @click="closeProfileDropdown"
                    >
                      🚗 Mis Viajes
                    </router-link>
                    <div class="border-t border-gray-100"></div>
                    <button
                      @click="handleLogout"
                      class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      🚪 Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Si el usuario NO está logueado -->
            <div v-else class="flex items-center space-x-4">
              <router-link to="/login" class="text-gray-600 hover:text-green-600 font-medium">
                Iniciar Sesión
              </router-link>
              <router-link to="/register" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                Registrarse
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Busca viajes compartidos
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Encuentra viajes mensuales desde tu localidad a Madrid sin necesidad de registrarte
        </p>
      </div>

      <!-- Call to Action Section -->
      <div class="text-center mb-12">
        <div class="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
          <!-- Botón Regístrate -->
          <router-link 
            to="/register"
            class="group relative px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:scale-105"
          >
            <div class="flex items-center space-x-3">
              <span class="text-2xl">🚀</span>
              <span>Regístrate Gratis</span>
              <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </div>
            <div class="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </router-link>

          <!-- Botón Buscar Viajes -->
          <button 
            @click="scrollToSearch"
            class="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:scale-105"
          >
            <div class="flex items-center space-x-3">
              <span class="text-2xl">🔍</span>
              <span>Buscar Viajes</span>
              <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </div>
            <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
        
        <!-- Texto descriptivo -->
        <p class="text-gray-600 mt-6 text-lg">
          <span class="font-semibold text-green-600">Gratis</span> para empezar • 
          <span class="font-semibold text-blue-600">Sin compromiso</span> • 
          <span class="font-semibold text-purple-600">Ahorra dinero</span>
        </p>
      </div>

      <!-- Search Form -->
      <div class="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 class="text-xl font-semibold mb-4">📝 Información del Viaje</h2>

        <form @submit.prevent="searchTrips" class="space-y-4 sm:space-y-6">
          <!-- Origen Específico -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">📍 Origen</label>
            
            <!-- Selector de tipo de origen -->
            <div class="mb-3">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  @click="originType = 'predefined'"
                  type="button"
                  :class="[
                    'px-3 py-2 rounded-lg border-2 transition-colors text-center text-sm',
                    originType === 'predefined' 
                      ? 'bg-green-50 border-green-300 text-green-700' 
                      : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                  ]"
                >
                  🏙️ Ciudad Extrarradio
                </button>
                <button
                  @click="originType = 'specific'"
                  type="button"
                  :class="[
                    'px-3 py-2 rounded-lg border-2 transition-colors text-center text-sm',
                    originType === 'specific' 
                      ? 'bg-blue-50 border-blue-300 text-blue-700' 
                      : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                  ]"
                >
                  📍 Dirección Específica
                </button>
              </div>
            </div>

            <!-- Origen Predefinido -->
            <div v-if="originType === 'predefined'">
              <button
                @click="openOriginModal"
                type="button"
                class="w-full px-4 py-3 bg-green-50 border-2 border-dashed border-green-300 rounded-lg text-green-700 hover:bg-green-100 hover:border-green-400 transition-colors text-center mb-3"
              >
                🏙️ Seleccionar ciudad del extrarradio de Madrid
              </button>
              
              <AutocompleteInput
                v-model="searchForm.origin"
                placeholder="Escribe tu ciudad de origen..."
                :suggestions="originSuggestions"
                :is-loading="isLoadingOrigin"
                @input="handleOriginInput"
                @select="handleOriginSelect"
                input-class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <!-- Origen Específico -->
            <div v-if="originType === 'specific'">
                <div class="relative">
                  <input
                    v-model="specificOrigin"
                    @input="handleSpecificOriginInput"
                    @focus="showOriginSuggestionsSpecific = true"
                    @blur="hideOriginSuggestionsSpecific"
                    type="text"
                    placeholder="Ej: Calle Gran Vía 1, Madrid"
                    class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span class="text-gray-400">📍</span>
                  </div>
                  
                  <!-- Sugerencias de origen específico -->
                  <div v-if="showOriginSuggestionsSpecific && originSuggestionsSpecific.length > 0" class="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div class="p-2">
                      <div
                        v-for="(suggestion, index) in originSuggestionsSpecific"
                        :key="index"
                        @click="selectSpecificOrigin(suggestion)"
                        class="px-4 py-3 hover:bg-blue-50 cursor-pointer rounded-lg transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div class="font-semibold text-gray-900">{{ suggestion.main_text }}</div>
                        <div class="text-sm text-gray-500">{{ suggestion.secondary_text }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            <!-- Destino Específico -->
            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700 mb-2">🎯 Destino</label>
              
              <!-- Selector de tipo de destino -->
              <div class="mb-3">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    @click="destinationType = 'predefined'"
                    type="button"
                    :class="[
                      'px-3 py-2 rounded-lg border-2 transition-colors text-center text-sm',
                      destinationType === 'predefined' 
                        ? 'bg-green-50 border-green-300 text-green-700' 
                        : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                    ]"
                  >
                    🏢 Destinos Madrid
                  </button>
                  <button
                    @click="destinationType = 'specific'"
                    type="button"
                    :class="[
                      'px-3 py-2 rounded-lg border-2 transition-colors text-center text-sm',
                      destinationType === 'specific' 
                        ? 'bg-blue-50 border-blue-300 text-blue-700' 
                        : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                    ]"
                  >
                    📍 Dirección Específica
                  </button>
                </div>
              </div>

              <!-- Destino Predefinido -->
              <div v-if="destinationType === 'predefined'">
                <button
                  @click="openDestinationModal"
                  type="button"
                  class="w-full px-4 py-3 bg-green-50 border-2 border-dashed border-green-300 rounded-lg text-green-700 hover:bg-green-100 hover:border-green-400 transition-colors text-center mb-3"
                >
                  🏢 Seleccionar destino en Madrid
                </button>
                
                <AutocompleteInput
                  v-model="searchForm.destination"
                  placeholder="Escribe tu destino en Madrid..."
                  :suggestions="destinationSuggestions"
                  :is-loading="isLoadingDestination"
                  @input="handleDestinationInput"
                  @select="handleDestinationSelect"
                  input-class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <!-- Destino Específico -->
              <div v-if="destinationType === 'specific'">
                <div class="relative">
                  <input
                    v-model="specificDestination"
                    @input="handleSpecificDestinationInput"
                    @focus="showDestinationSuggestionsSpecific = true"
                    @blur="hideDestinationSuggestionsSpecific"
                    type="text"
                    placeholder="Ej: Hospital La Paz, Madrid"
                    class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span class="text-gray-400">🎯</span>
                  </div>
                  
                  <!-- Sugerencias de destino específico -->
                  <div v-if="showDestinationSuggestionsSpecific && destinationSuggestionsSpecific.length > 0" class="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div class="p-2">
                      <div
                        v-for="(suggestion, index) in destinationSuggestionsSpecific"
                        :key="index"
                        @click="selectSpecificDestination(suggestion)"
                        class="px-4 py-3 hover:bg-blue-50 cursor-pointer rounded-lg transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div class="font-semibold text-gray-900">{{ suggestion.main_text }}</div>
                        <div class="text-sm text-gray-500">{{ suggestion.secondary_text }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Fecha y Hora -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700 mb-2">📅 Fecha</label>
              <DatePicker
                v-model="searchForm.date"
                :min-date="today"
                placeholder="Selecciona la fecha del viaje"
              />
            </div>
            
            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700 mb-2">🕐 Hora</label>
              <input
                v-model="searchForm.time"
                type="time"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Botón de búsqueda -->
          <div class="text-center">
            <button
              type="submit"
              :disabled="isSearching"
              class="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium transition-colors"
            >
              <span v-if="isSearching">🔍 Buscando...</span>
              <span v-else>🚗 Buscar Viajes</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Resultados -->
      <div v-if="hasSearched" class="bg-white rounded-lg shadow-lg p-6">
        <h3 class="text-xl font-semibold mb-4">
          {{ searchResults.length > 0 ? `Encontrados ${searchResults.length} viajes` : 'No se encontraron viajes' }}
        </h3>
        
        <div v-if="searchResults.length > 0" class="space-y-4">
          <div
            v-for="result in searchResults"
            :key="result.trip.id"
            class="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:border-green-300"
          >
            <!-- Header con conductor y precio -->
            <div class="flex items-start justify-between mb-4">
              <!-- Información del conductor -->
              <div class="flex items-center space-x-3">
                <div class="relative">
                <img 
                  :src="(result.trip as any).driver_avatar || '/images/user/user-01.jpg'" 
                  :alt="(result.trip as any).driver_name || 'Conductor'"
                  class="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-green-200"
                  @error="(event: any) => event.target.src = '/images/user/user-01.jpg'"
                />
                  <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold text-gray-900 text-sm sm:text-base truncate">
                    {{ (result.trip as any).driver_name || 'Conductor' }}
                  </h4>
                  <div class="flex items-center space-x-1 text-xs text-gray-500 mb-1">
                    <span>⭐</span>
                    <span>{{ (result.trip as any).driver_rating || '4.8' }}</span>
                    <span>•</span>
                    <span>{{ (result.trip as any).trips_completed || '50+' }} viajes</span>
                  </div>
                  <div class="flex items-center space-x-1 text-xs text-blue-600 font-medium">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span>{{ searchForm.date ? new Date(searchForm.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Hoy' }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Precio -->
              <div class="text-right">
                <div class="text-2xl sm:text-3xl font-bold text-green-600">
                  {{ result.trip.price_per_seat }}€
                </div>
                <div class="text-xs text-gray-500">por asiento</div>
              </div>
            </div>

            <!-- Ruta -->
            <div class="mb-4">
              <div class="flex items-center space-x-2 mb-2">
                <div class="flex-shrink-0 w-3 h-3 bg-green-500 rounded-full"></div>
                <span class="font-medium text-gray-900 text-sm sm:text-base">{{ result.trip.origin_name }}</span>
              </div>
              <div class="flex items-center space-x-2 ml-1.5">
                <div class="w-px h-4 bg-gray-300 ml-1"></div>
                <div class="flex-1 h-px bg-gray-300"></div>
                <span class="text-gray-400 text-xs">→</span>
                <div class="flex-1 h-px bg-gray-300"></div>
              </div>
              <div class="flex items-center space-x-2 mt-2">
                <div class="flex-shrink-0 w-3 h-3 bg-red-500 rounded-full"></div>
                <span class="font-medium text-gray-900 text-sm sm:text-base">{{ result.trip.destination_name }}</span>
              </div>
            </div>

            <!-- Información del viaje -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div class="text-center sm:text-left">
                <div class="text-xs text-gray-500 mb-1">🕐 Salida</div>
                <div class="font-medium text-sm">{{ formatTime(result.trip.departure_time) }}</div>
              </div>
              <div class="text-center sm:text-left">
                <div class="text-xs text-gray-500 mb-1">🪑 Asientos</div>
                <div class="font-medium text-sm">
                  <span v-if="result.bookingInfo">{{ result.bookingInfo.remaining_seats }}/{{ result.bookingInfo.total_seats }}</span>
                  <span v-else>{{ result.trip.available_seats }}</span>
                </div>
              </div>
              <div class="text-center sm:text-left">
                <div class="text-xs text-gray-500 mb-1">📏 Distancia</div>
                <div class="font-medium text-sm">
                  <span v-if="result.distance">{{ result.distance.toFixed(1) }} km</span>
                  <span v-else>N/A</span>
                </div>
              </div>
              <div class="text-center sm:text-left">
                <div class="text-xs text-gray-500 mb-1">Tipo</div>
                <div class="font-medium text-sm">
                  <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {{ getTripTypeLabel(result.trip) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Indicador de disponibilidad -->
            <div v-if="result.bookingInfo" class="mb-4">
              <div v-if="result.bookingInfo.remaining_seats > 0" class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-sm text-green-700 font-medium">
                  {{ result.bookingInfo.remaining_seats }} asiento{{ result.bookingInfo.remaining_seats > 1 ? 's' : '' }} disponible{{ result.bookingInfo.remaining_seats > 1 ? 's' : '' }}
                </span>
              </div>
              <div v-else class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-red-500 rounded-full"></div>
                <span class="text-sm text-red-700 font-medium">Completamente ocupado</span>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="flex justify-between items-center">
              <button
                @click="viewTripDetails(result.trip.id)"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Ver Detalles
              </button>
              
              <button
                v-if="!result.bookingInfo || result.bookingInfo.remaining_seats > 0"
                @click="openBookingModal(result.trip, result.bookingInfo)"
                class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 text-sm font-medium transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Reservar Ahora
              </button>
              <div
                v-else
                class="bg-gray-300 text-gray-600 px-6 py-3 rounded-lg text-sm cursor-not-allowed"
              >
                Sin asientos
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8">
          <p class="text-gray-500 mb-4">No se encontraron viajes para tu búsqueda</p>
          <button
            @click="resetSearch"
            class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Nueva Búsqueda
          </button>
        </div>
      </div>
    </main>

    <!-- Modal de Ciudades de Origen -->
    <div v-if="showOriginModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h3 class="text-2xl font-bold text-gray-900">🏙️ Ciudades del Extrarradio de Madrid</h3>
            <button
              @click="closeOriginModal"
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
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <button
              v-for="city in madridCities"
              :key="city.name"
              @click="selectPredefinedOrigin(city)"
              class="p-4 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-lg text-left transition-all duration-200 hover:shadow-md"
            >
              <div class="font-semibold text-gray-900 mb-1">{{ city.name.split(',')[0] }}</div>
              <div class="text-sm text-gray-500">{{ city.name.split(',')[1]?.trim() }}</div>
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
              @click="closeDestinationModal"
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
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <button
              v-for="destination in madridDestinations"
              :key="destination.name"
              @click="selectPredefinedDestination(destination)"
              class="p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-left transition-all duration-200 hover:shadow-md"
            >
              <div class="font-semibold text-gray-900 mb-1">{{ destination.name }}</div>
              <div class="text-sm text-gray-500">Madrid, España</div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Reserva -->
    <BookingModal
      :is-open="showBookingModal"
      :trip="selectedTrip"
      :booking-info="selectedBookingInfo"
      @close="closeBookingModal"
      @booking-confirmed="onBookingConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { HybridTripService, type SearchResult } from '@/services/hybridTripService'
import { supabase } from '@/config/supabase'
import type { User } from '@supabase/supabase-js'
import DatePicker from '@/components/DatePicker.vue'
import AutocompleteInput from '@/components/AutocompleteInput.vue'
import { SimpleAutocompleteService, type AutocompleteSuggestion } from '@/services/simpleAutocompleteService'
import { GeolocationService } from '@/services/geolocation'
import { GooglePlacesService } from '@/services/googlePlacesService'
import BookingModal from '@/components/carpooling/BookingModal.vue'

// Router
const router = useRouter()

// Formulario de búsqueda
const searchForm = reactive({
  origin: '',
  destination: '',
  date: '',
  time: ''
})

// Estados de la búsqueda
const searchResults = ref<SearchResult[]>([])
const isSearching = ref(false)
const hasSearched = ref(false)

// Estados de autenticación
const user = ref<User | null>(null)
const userProfile = ref<any>(null)
const showProfileDropdown = ref(false)

// Estados del modal de localidades
const showOriginModal = ref(false)
const showDestinationModal = ref(false)

// Estados del modal de reservas
const showBookingModal = ref(false)
const selectedTrip = ref<any>(null)
const selectedBookingInfo = ref<any>(null)

// Estados del tipo de búsqueda
const searchType = ref<'municipality' | 'address'>('address')
const specificOrigin = ref('')
const specificDestination = ref('')
const originSuggestionsSpecific = ref<any[]>([])
const destinationSuggestionsSpecific = ref<any[]>([])
const isLoadingOriginSpecific = ref(false)
const isLoadingDestinationSpecific = ref(false)
const showOriginSuggestionsSpecific = ref(false)
const showDestinationSuggestionsSpecific = ref(false)

// Estados para tipos de origen y destino
const originType = ref<'predefined' | 'specific'>('predefined')
const destinationType = ref<'predefined' | 'specific'>('predefined')

// Autocompletado
const originSuggestions = ref<AutocompleteSuggestion[]>([])
const destinationSuggestions = ref<AutocompleteSuggestion[]>([])
const isLoadingOrigin = ref(false)
const isLoadingDestination = ref(false)

// Fecha actual
const today = new Date().toISOString().split('T')[0]

// Servicio de búsqueda híbrida
const hybridService = new HybridTripService()

// Servicios de autocompletado
const autocompleteService = new SimpleAutocompleteService()
const geolocationService = new GeolocationService()
let googlePlacesService: GooglePlacesService | null = null

// Inicializar Google Places Service de forma asíncrona
const initGooglePlacesService = async () => {
  try {
    console.log('🔄 Inicializando Google Places Service...')
    console.log('🔍 Verificando Google Maps API:', {
      google: !!window.google,
      maps: !!window.google?.maps,
      places: !!window.google?.maps?.places,
      autocompleteService: !!window.google?.maps?.places?.AutocompleteService
    })
    
    googlePlacesService = new GooglePlacesService()
    
    // Esperar a que el servicio se inicialice completamente
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('✅ Google Places Service inicializado')
  } catch (error) {
    console.error('❌ Error inicializando Google Places Service:', error)
    googlePlacesService = null
  }
}

// Fallback local para cuando Google Places no esté disponible
const getLocalSuggestions = (input: string, type: 'origin' | 'destination') => {
  const localSuggestions = [
    // Orígenes comunes
    { main_text: 'Calle Gran Vía 1, Madrid', secondary_text: 'Madrid, España', place_id: 'granvia1', lat: 40.4194, lng: -3.7108 },
    { main_text: 'Plaza de España, Madrid', secondary_text: 'Madrid, España', place_id: 'plazaespana', lat: 40.4236, lng: -3.7122 },
    { main_text: 'Puerta del Sol, Madrid', secondary_text: 'Madrid, España', place_id: 'puertadelsol', lat: 40.4168, lng: -3.7038 },
    { main_text: 'Plaza de Colón, Madrid', secondary_text: 'Madrid, España', place_id: 'plazacolon', lat: 40.4260, lng: -3.6900 },
    { main_text: 'Calle Velázquez, Madrid', secondary_text: 'Madrid, España', place_id: 'velazquez', lat: 40.4300, lng: -3.6800 },
    { main_text: 'Chamartín, Madrid', secondary_text: 'Madrid, España', place_id: 'chamartin', lat: 40.4720, lng: -3.6806 },
    { main_text: 'Atocha, Madrid', secondary_text: 'Madrid, España', place_id: 'atocha', lat: 40.4075, lng: -3.6917 },
    { main_text: 'Nuevos Ministerios, Madrid', secondary_text: 'Madrid, España', place_id: 'nuevosministerios', lat: 40.4459, lng: -3.6900 },
    { main_text: 'Plaza de Castilla, Madrid', secondary_text: 'Madrid, España', place_id: 'plazacastilla', lat: 40.4669, lng: -3.6889 },
    { main_text: 'Moncloa, Madrid', secondary_text: 'Madrid, España', place_id: 'moncloa', lat: 40.4350, lng: -3.7200 },
    
    // Destinos comunes
    { main_text: 'Hospital La Paz, Madrid', secondary_text: 'Madrid, España', place_id: 'hospitallapaz', lat: 40.4720, lng: -3.6806 },
    { main_text: 'Hospital Ramón y Cajal, Madrid', secondary_text: 'Madrid, España', place_id: 'hospitalryc', lat: 40.4500, lng: -3.6800 },
    { main_text: 'Universidad Complutense, Madrid', secondary_text: 'Madrid, España', place_id: 'complutense', lat: 40.4459, lng: -3.7297 },
    { main_text: 'Universidad Politécnica, Madrid', secondary_text: 'Madrid, España', place_id: 'upm', lat: 40.4500, lng: -3.7300 },
    { main_text: 'AZCA, Madrid', secondary_text: 'Madrid, España', place_id: 'azca', lat: 40.4459, lng: -3.6900 },
    { main_text: 'Cuatro Torres, Madrid', secondary_text: 'Madrid, España', place_id: 'cuatrotorres', lat: 40.4720, lng: -3.6806 },
    { main_text: 'Centro Comercial La Vaguada, Madrid', secondary_text: 'Madrid, España', place_id: 'lavaguada', lat: 40.4663, lng: -3.6896 },
    { main_text: 'Centro Comercial Príncipe Pío, Madrid', secondary_text: 'Madrid, España', place_id: 'principepio', lat: 40.4200, lng: -3.7200 },
    { main_text: 'Aeropuerto Adolfo Suárez, Madrid', secondary_text: 'Madrid, España', place_id: 'aeropuerto', lat: 40.4839, lng: -3.5680 }
  ]

  return localSuggestions.filter(suggestion => 
    suggestion.main_text.toLowerCase().includes(input.toLowerCase())
  )
}

// Ciudades del extrarradio de Madrid
const madridCities = ref([
  { name: 'Alcalá de Henares, Madrid, España', lat: 40.4818, lng: -3.3641 },
  { name: 'Alcobendas, Madrid, España', lat: 40.5475, lng: -3.6420 },
  { name: 'Alcorcón, Madrid, España', lat: 40.3458, lng: -3.8249 },
  { name: 'Arganda del Rey, Madrid, España', lat: 40.3012, lng: -3.4373 },
  { name: 'Boadilla del Monte, Madrid, España', lat: 40.4057, lng: -3.8753 },
  { name: 'Collado Villalba, Madrid, España', lat: 40.6419, lng: -4.0089 },
  { name: 'Colmenar Viejo, Madrid, España', lat: 40.6592, lng: -3.7678 },
  { name: 'Coslada, Madrid, España', lat: 40.4238, lng: -3.5613 },
  { name: 'Fuenlabrada, Madrid, España', lat: 40.2839, lng: -3.7942 },
  { name: 'Getafe, Madrid, España', lat: 40.3047, lng: -3.7312 },
  { name: 'Leganés, Madrid, España', lat: 40.3275, lng: -3.7639 },
  { name: 'Móstoles, Madrid, España', lat: 40.3228, lng: -3.8647 },
  { name: 'Parla, Madrid, España', lat: 40.2375, lng: -3.7731 },
  { name: 'Rivas-Vaciamadrid, Madrid, España', lat: 40.3319, lng: -3.5206 },
  { name: 'San Sebastián de los Reyes, Madrid, España', lat: 40.5475, lng: -3.6250 },
  { name: 'Torrejón de Ardoz, Madrid, España', lat: 40.4594, lng: -3.4697 },
  { name: 'Valdemoro, Madrid, España', lat: 40.1908, lng: -3.6778 },
  { name: 'Villaviciosa de Odón, Madrid, España', lat: 40.3569, lng: -3.9006 }
])

// Destinos populares en Madrid
const madridDestinations = ref([
  { name: 'Puerta del Sol', lat: 40.4168, lng: -3.7038 },
  { name: 'Gran Vía', lat: 40.4194, lng: -3.7108 },
  { name: 'Chamartín', lat: 40.4720, lng: -3.6806 },
  { name: 'Atocha', lat: 40.4075, lng: -3.6917 },
  { name: 'Nuevos Ministerios', lat: 40.4459, lng: -3.6900 },
  { name: 'Plaza de Castilla', lat: 40.4669, lng: -3.6889 },
  { name: 'Moncloa', lat: 40.4350, lng: -3.7200 },
  { name: 'Plaza de España', lat: 40.4236, lng: -3.7122 },
  { name: 'AZCA', lat: 40.4459, lng: -3.6900 },
  { name: 'Cuatro Torres', lat: 40.4720, lng: -3.6806 },
  { name: 'Universidad Complutense', lat: 40.4459, lng: -3.7297 },
  { name: 'Hospital La Paz', lat: 40.4720, lng: -3.6806 },
  { name: 'Madrid Centro', lat: 40.4168, lng: -3.7038 },
  { name: 'Colón', lat: 40.4260, lng: -3.6900 },
  { name: 'Velázquez', lat: 40.4300, lng: -3.6800 },
  { name: 'Ciudad financiera Santander (Boadilla)', lat: 40.4057, lng: -3.8753 },
  { name: 'Ciudad financiera BBVA (Las Tablas)', lat: 40.5475, lng: -3.6420 }
])

// Funciones de selección
const selectPredefinedOrigin = (city: any) => {
  searchForm.origin = city.name
  showOriginModal.value = false
}

const selectPredefinedDestination = (destination: any) => {
  searchForm.destination = destination.name
  showDestinationModal.value = false
}

// Funciones del modal
const openOriginModal = () => {
  showOriginModal.value = true
}

const openDestinationModal = () => {
  showDestinationModal.value = true
}

const closeOriginModal = () => {
  showOriginModal.value = false
}

const closeDestinationModal = () => {
  showDestinationModal.value = false
}

// Función para hacer scroll al formulario de búsqueda
const scrollToSearch = () => {
  const searchForm = document.querySelector('.bg-white.rounded-lg.shadow-lg')
  if (searchForm) {
    searchForm.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    })
  }
}

// Función de búsqueda
const searchTrips = async () => {
  // Validar origen
  let originValid = false
  if (originType.value === 'predefined' && searchForm.origin) {
    originValid = true
  } else if (originType.value === 'specific' && specificOrigin.value) {
    originValid = true
  }
  
  // Validar destino
  let destinationValid = false
  if (destinationType.value === 'predefined' && searchForm.destination) {
    destinationValid = true
  } else if (destinationType.value === 'specific' && specificDestination.value) {
    destinationValid = true
  }
  
  if (!originValid || !destinationValid) {
    return
  }

  isSearching.value = true
  hasSearched.value = true

  try {
    console.log('🔍 Iniciando búsqueda híbrida...')
    
    // Determinar origen y destino
    let origin = ''
    let destination = ''
    
    // Origen
    if (originType.value === 'predefined') {
      origin = searchForm.origin
    } else {
      origin = specificOrigin.value
    }
    
    // Destino
    if (destinationType.value === 'predefined') {
      destination = searchForm.destination
    } else {
      destination = specificDestination.value
    }
    
    console.log('📍 Búsqueda:', { origin, destination, originType: originType.value, destinationType: destinationType.value })
    
    const results = await hybridService.searchTrips(
      origin,
      destination,
      {
        useGeolocation: true,
        maxDistanceKm: 50,
        limit: 20,
        date: searchForm.date
      }
    )
    
    searchResults.value = results
    console.log(`✅ Encontrados ${results.length} viajes`)
  } catch (error) {
    console.error('❌ Error al buscar viajes:', error)
  } finally {
    isSearching.value = false
  }
}

// Función para abrir modal de reserva
const openBookingModal = (trip: any, bookingInfo?: any) => {
  selectedTrip.value = trip
  selectedBookingInfo.value = bookingInfo
  showBookingModal.value = true
}

// Función para cerrar modal de reserva
const closeBookingModal = () => {
  showBookingModal.value = false
  selectedTrip.value = null
  selectedBookingInfo.value = null
}

// Función para confirmar reserva
const onBookingConfirmed = (booking: any) => {
  console.log('Reserva confirmada:', booking)
  closeBookingModal()
}

// Función para ver detalles del viaje
const viewTripDetails = (tripId: string) => {
  router.push(`/viaje/${tripId}`)
}

// Función para formatear tiempo
const formatTime = (time: string) => {
  return new Date(time).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
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

// Función para obtener etiqueta del tipo de viaje
const getTripTypeLabel = (trip: any) => {
  const routeData = trip.route_data || {}
  const pricingType = routeData.pricing_type || 'single'
  
  switch (pricingType) {
    case 'daily': return 'Diario'
    case 'weekly': return 'Semanal'
    case 'monthly': return 'Mensual'
    default: return 'Único'
  }
}

// Función para resetear búsqueda
const resetSearch = () => {
  searchForm.origin = ''
  searchForm.destination = ''
  searchForm.date = ''
  searchForm.time = ''
  searchResults.value = []
  hasSearched.value = false
}

// Funciones de autenticación
const checkAuth = async () => {
  try {
    console.log('🔍 Verificando autenticación...')
    const { data: { user: currentUser }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('❌ Error obteniendo usuario:', error)
      return
    }
    
    console.log('👤 Usuario actual:', currentUser)
    user.value = currentUser
    
    if (currentUser) {
      console.log('📋 Obteniendo perfil del usuario...')
      await fetchUserProfile(currentUser.id)
    } else {
      console.log('❌ No hay usuario logueado')
    }
  } catch (error) {
    console.error('❌ Error checking auth:', error)
  }
}

const fetchUserProfile = async (userId: string) => {
  try {
    console.log('📋 Buscando perfil para usuario:', userId)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('❌ Error obteniendo perfil:', error)
      // Si no existe el perfil, crear uno básico
      userProfile.value = {
        id: userId,
        name: user.value?.user_metadata?.name || user.value?.email?.split('@')[0] || 'Usuario',
        email: user.value?.email || '',
        avatar_url: user.value?.user_metadata?.avatar_url || null
      }
      return
    }
    
    console.log('✅ Perfil obtenido:', data)
    userProfile.value = data
  } catch (error) {
    console.error('❌ Error fetching profile:', error)
    // Fallback a datos básicos del usuario
    userProfile.value = {
      id: userId,
      name: user.value?.user_metadata?.name || user.value?.email?.split('@')[0] || 'Usuario',
      email: user.value?.email || '',
      avatar_url: user.value?.user_metadata?.avatar_url || null
    }
  }
}

// Funciones del dropdown del perfil
const toggleProfileDropdown = () => {
  showProfileDropdown.value = !showProfileDropdown.value
}

// Funciones para búsqueda específica con Google Places
const handleSpecificOriginInput = async () => {
  if (specificOrigin.value.length < 3) {
    originSuggestionsSpecific.value = []
    return
  }

  try {
    console.log('🔍 Buscando origen específico:', specificOrigin.value)
    
    // Verificar si el servicio está disponible
    if (!googlePlacesService) {
      console.log('⚠️ Google Places Service no está disponible, inicializando...')
      await initGooglePlacesService()
      
      if (!googlePlacesService) {
        console.error('❌ No se pudo inicializar Google Places Service, usando fallback local')
        originSuggestionsSpecific.value = getLocalSuggestions(specificOrigin.value, 'origin')
        return
      }
    }

    isLoadingOriginSpecific.value = true
    console.log('📡 Llamando a Google Places API...')
    
    try {
      const suggestions = await googlePlacesService.autocompleteAddress(specificOrigin.value)
      console.log('✅ Sugerencias recibidas:', suggestions)
      
      if (suggestions && suggestions.length > 0) {
        originSuggestionsSpecific.value = suggestions.map(suggestion => ({
          main_text: suggestion.name,
          secondary_text: suggestion.address,
          place_id: (suggestion as any).place_id,
          lat: (suggestion as any).lat,
          lng: (suggestion as any).lng
        }))
      } else {
        console.log('⚠️ No se recibieron sugerencias de Google Places, usando fallback local')
        originSuggestionsSpecific.value = getLocalSuggestions(specificOrigin.value, 'origin')
      }
    } catch (apiError) {
      console.error('❌ Error con Google Places API, usando fallback local:', apiError)
      originSuggestionsSpecific.value = getLocalSuggestions(specificOrigin.value, 'origin')
    }
    
    console.log('📋 Sugerencias procesadas:', originSuggestionsSpecific.value)
  } catch (error) {
    console.error('❌ Error obteniendo sugerencias de origen específico:', error)
    originSuggestionsSpecific.value = getLocalSuggestions(specificOrigin.value, 'origin')
  } finally {
    isLoadingOriginSpecific.value = false
  }
}

const handleSpecificDestinationInput = async () => {
  if (specificDestination.value.length < 3) {
    destinationSuggestionsSpecific.value = []
    return
  }

  try {
    console.log('🔍 Buscando destino específico:', specificDestination.value)
    
    // Verificar si el servicio está disponible
    if (!googlePlacesService) {
      console.log('⚠️ Google Places Service no está disponible, inicializando...')
      await initGooglePlacesService()
      
      if (!googlePlacesService) {
        console.error('❌ No se pudo inicializar Google Places Service, usando fallback local')
        destinationSuggestionsSpecific.value = getLocalSuggestions(specificDestination.value, 'destination')
        return
      }
    }

    isLoadingDestinationSpecific.value = true
    console.log('📡 Llamando a Google Places API...')
    
    try {
      const suggestions = await googlePlacesService.autocompleteAddress(specificDestination.value)
      console.log('✅ Sugerencias recibidas:', suggestions)
      
      if (suggestions && suggestions.length > 0) {
        destinationSuggestionsSpecific.value = suggestions.map(suggestion => ({
          main_text: suggestion.name,
          secondary_text: suggestion.address,
          place_id: (suggestion as any).place_id,
          lat: (suggestion as any).lat,
          lng: (suggestion as any).lng
        }))
      } else {
        console.log('⚠️ No se recibieron sugerencias de Google Places, usando fallback local')
        destinationSuggestionsSpecific.value = getLocalSuggestions(specificDestination.value, 'destination')
      }
    } catch (apiError) {
      console.error('❌ Error con Google Places API, usando fallback local:', apiError)
      destinationSuggestionsSpecific.value = getLocalSuggestions(specificDestination.value, 'destination')
    }
    
    console.log('📋 Sugerencias procesadas:', destinationSuggestionsSpecific.value)
  } catch (error) {
    console.error('❌ Error obteniendo sugerencias de destino específico:', error)
    destinationSuggestionsSpecific.value = getLocalSuggestions(specificDestination.value, 'destination')
  } finally {
    isLoadingDestinationSpecific.value = false
  }
}

const selectSpecificOrigin = (suggestion: any) => {
  specificOrigin.value = suggestion.main_text
  originSuggestionsSpecific.value = []
  showOriginSuggestionsSpecific.value = false
}

const selectSpecificDestination = (suggestion: any) => {
  specificDestination.value = suggestion.main_text
  destinationSuggestionsSpecific.value = []
  showDestinationSuggestionsSpecific.value = false
}

const hideOriginSuggestionsSpecific = () => {
  setTimeout(() => {
    showOriginSuggestionsSpecific.value = false
  }, 200)
}

const hideDestinationSuggestionsSpecific = () => {
  setTimeout(() => {
    showDestinationSuggestionsSpecific.value = false
  }, 200)
}

const closeProfileDropdown = () => {
  showProfileDropdown.value = false
}

const handleLogout = async () => {
  try {
    await supabase.auth.signOut()
    user.value = null
    userProfile.value = null
    showProfileDropdown.value = false
    console.log('Usuario deslogueado exitosamente')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}

// Cerrar dropdown al hacer click fuera
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showProfileDropdown.value = false
  }
}

// Variables para cleanup
let authSubscription: any = null

// Inicializar fecha actual y autenticación
onMounted(async () => {
  searchForm.date = today
  await checkAuth()
  
  // Inicializar Google Places Service
  await initGooglePlacesService()
  
  // Escuchar cambios de autenticación
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔄 Cambio de autenticación:', event, session?.user?.email)
    
    if (event === 'SIGNED_IN' && session?.user) {
      console.log('✅ Usuario logueado:', session.user.email)
      user.value = session.user
      await fetchUserProfile(session.user.id)
    } else if (event === 'SIGNED_OUT') {
      console.log('❌ Usuario deslogueado')
      user.value = null
      userProfile.value = null
    } else if (event === 'TOKEN_REFRESHED' && session?.user) {
      console.log('🔄 Token refrescado para:', session.user.email)
      user.value = session.user
      if (!userProfile.value) {
        await fetchUserProfile(session.user.id)
      }
    }
  })
  
  authSubscription = subscription
  
  // Agregar listener para cerrar dropdown
  document.addEventListener('click', handleClickOutside)
})

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

// Cleanup
onUnmounted(() => {
  if (authSubscription) {
    authSubscription.unsubscribe()
  }
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Custom styles if needed */
</style>
