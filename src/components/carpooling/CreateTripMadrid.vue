<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">🚗 Crear Viaje Mensual - Extrarradio Madrid</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">📝 Información del Viaje</h2>
      
      <form @submit.prevent="createTrip" class="space-y-6">
        <!-- Información básica -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Origen -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">📍 Origen</label>
            
            <!-- Opciones predefinidas -->
            <div class="mb-3">
              <p class="text-sm text-gray-600 mb-2">Ciudades del extrarradio de Madrid:</p>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  v-for="city in madridCities.slice(0, 16)"
                  :key="city.name"
                  @click="selectPredefinedOrigin(city)"
                  type="button"
                  class="px-3 py-2 text-sm bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {{ city.name.split(',')[0] }}
                </button>
              </div>
            </div>
            
            <!-- Búsqueda personalizada -->
            <div class="relative">
              <input
                v-model="tripForm.origin_name"
                @input="searchOriginPlaces"
                @focus="showOriginSuggestions = true"
                @blur="hideOriginSuggestions"
                type="text"
                placeholder="O busca otra ciudad..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <!-- Sugerencias de origen -->
              <div v-if="showOriginSuggestions && originSuggestions.length > 0" class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <div
                  v-for="(suggestion, index) in originSuggestions"
                  :key="index"
                  @click="selectOriginPlace(suggestion)"
                  class="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div class="font-medium text-gray-900">{{ suggestion.main_text }}</div>
                  <div class="text-sm text-gray-600">{{ suggestion.secondary_text }}</div>
                </div>
              </div>
            </div>
            
            <!-- Ubicación exacta del origen -->
            <div class="mt-3">
              <label class="block text-sm font-medium text-gray-700 mb-2">📍 Ubicación exacta del origen</label>
              <div class="relative">
                <input
                  v-model="tripForm.origin_exact_location"
                  @input="searchOriginExactPlaces"
                  @focus="showOriginExactSuggestions = true"
                  @blur="hideOriginExactSuggestions"
                  type="text"
                  placeholder="Ej: Estación de tren, centro comercial, parada de autobús..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <!-- Sugerencias de ubicación exacta -->
                <div v-if="showOriginExactSuggestions && originExactSuggestions.length > 0" class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div
                    v-for="(suggestion, index) in originExactSuggestions"
                    :key="index"
                    @click="selectOriginExactPlace(suggestion)"
                    class="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div class="font-medium text-gray-900">{{ suggestion.main_text }}</div>
                    <div class="text-sm text-gray-600">{{ suggestion.secondary_text }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Destino -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">🎯 Destino</label>
            
            <!-- Opciones predefinidas -->
            <div class="mb-3">
              <p class="text-sm text-gray-600 mb-2">Destinos populares en Madrid:</p>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                <button
                  v-for="destination in popularDestinations"
                  :key="destination.name"
                  @click="selectPredefinedDestination(destination)"
                  type="button"
                  class="px-3 py-2 text-sm bg-green-50 border border-green-200 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {{ destination.name }}
                </button>
              </div>
            </div>
            
            <!-- Búsqueda personalizada -->
            <div class="relative">
              <input
                v-model="tripForm.destination_name"
                @input="searchDestinationPlaces"
                @focus="showDestinationSuggestions = true"
                @blur="hideDestinationSuggestions"
                type="text"
                placeholder="O busca otro destino específico..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <!-- Sugerencias de destino -->
              <div v-if="showDestinationSuggestions && destinationSuggestions.length > 0" class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <div
                  v-for="(suggestion, index) in destinationSuggestions"
                  :key="index"
                  @click="selectDestinationPlace(suggestion)"
                  class="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div class="font-medium text-gray-900">{{ suggestion.main_text }}</div>
                  <div class="text-sm text-gray-600">{{ suggestion.secondary_text }}</div>
                </div>
              </div>
            </div>
            
            <!-- Ubicación exacta del destino -->
            <div class="mt-3">
              <label class="block text-sm font-medium text-gray-700 mb-2">🎯 Ubicación exacta del destino</label>
              <input
                v-model="tripForm.destination_exact_location"
                type="text"
                placeholder="Ej: Oficina, universidad, hospital, estación de metro..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Plazas disponibles -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">👥 Número de plazas</label>
            <select v-model.number="tripForm.available_seats" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              <option value="1">1 plaza</option>
              <option value="2">2 plazas</option>
              <option value="3">3 plazas</option>
              <option value="4">4 plazas</option>
              <option value="5">5 plazas</option>
              <option value="6">6 plazas</option>
              <option value="7">7 plazas</option>
              <option value="8">8 plazas</option>
            </select>
          </div>

          <!-- Precio mensual -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">💰 Precio mensual (€)</label>
            <input
              v-model.number="tripForm.monthly_price"
              type="number"
              min="50"
              max="1000"
              step="10"
              placeholder="Ej: 300"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <!-- Fecha de inicio -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">📅 Fecha de inicio</label>
            <input v-model="tripForm.start_date" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>

          <!-- Fecha de fin -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">📅 Fecha de fin (opcional)</label>
            <input v-model="tripForm.end_date" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <!-- Horarios normales -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Horario de ida -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">🕐 Horario de ida (normal)</label>
            <select v-model="tripForm.departure_time" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              <option value="06:30">06:30</option>
              <option value="07:00">07:00</option>
              <option value="07:15">07:15</option>
              <option value="07:30">07:30</option>
              <option value="07:45">07:45</option>
              <option value="08:00">08:00</option>
              <option value="08:15">08:15</option>
              <option value="08:30">08:30</option>
              <option value="08:45">08:45</option>
              <option value="09:00">09:00</option>
            </select>
          </div>

          <!-- Horario de regreso -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">🕐 Horario de regreso (normal)</label>
            <select v-model="tripForm.return_time" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              <option value="17:00">17:00</option>
              <option value="17:30">17:30</option>
              <option value="18:00">18:00</option>
              <option value="18:15">18:15</option>
              <option value="18:30">18:30</option>
              <option value="18:45">18:45</option>
              <option value="19:00">19:00</option>
              <option value="19:15">19:15</option>
              <option value="19:30">19:30</option>
              <option value="20:00">20:00</option>
            </select>
          </div>
        </div>

        <!-- Días de la semana -->
        <div class="form-group mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-4">📅 Días de la semana activos</label>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="flex items-center space-x-2">
              <input v-model="tripForm.days_enabled.monday" type="checkbox" class="rounded" />
              <label class="text-sm font-medium">Lunes</label>
            </div>
            <div class="flex items-center space-x-2">
              <input v-model="tripForm.days_enabled.tuesday" type="checkbox" class="rounded" />
              <label class="text-sm font-medium">Martes</label>
            </div>
            <div class="flex items-center space-x-2">
              <input v-model="tripForm.days_enabled.wednesday" type="checkbox" class="rounded" />
              <label class="text-sm font-medium">Miércoles</label>
            </div>
            <div class="flex items-center space-x-2">
              <input v-model="tripForm.days_enabled.thursday" type="checkbox" class="rounded" />
              <label class="text-sm font-medium">Jueves</label>
            </div>
            <div class="flex items-center space-x-2">
              <input v-model="tripForm.days_enabled.friday" type="checkbox" class="rounded" />
              <label class="text-sm font-medium">Viernes</label>
            </div>
            <div class="flex items-center space-x-2">
              <input v-model="tripForm.days_enabled.saturday" type="checkbox" class="rounded" />
              <label class="text-sm font-medium">Sábado</label>
            </div>
            <div class="flex items-center space-x-2">
              <input v-model="tripForm.days_enabled.sunday" type="checkbox" class="rounded" />
              <label class="text-sm font-medium">Domingo</label>
            </div>
          </div>
        </div>

        <!-- Horarios especiales -->
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-4">⭐ Horarios especiales por día</label>
          <p class="text-sm text-gray-600 mb-4">Marca los días que tienen horarios diferentes al normal</p>
          
          <div class="space-y-4">
            <!-- Viernes (especial para salir temprano) -->
            <div v-if="tripForm.days_enabled.friday" class="border border-orange-200 rounded-lg p-4 bg-orange-50">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-gray-800">Viernes 🎉</h4>
                <label class="flex items-center">
                  <input v-model="tripForm.special_days.friday" type="checkbox" class="mr-2" />
                  <span class="text-sm text-orange-600 font-medium">Horario especial para salir temprano</span>
                </label>
              </div>
              <div v-if="tripForm.special_days.friday" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Ida especial</label>
                  <select v-model="tripForm.special_departure_times.friday" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">Usar horario normal</option>
                    <option value="17:00">17:00</option>
                    <option value="17:15">17:15</option>
                    <option value="17:30">17:30</option>
                    <option value="17:45">17:45</option>
                    <option value="18:00">18:00</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Regreso especial</label>
                  <select v-model="tripForm.special_return_times.friday" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">Usar horario normal</option>
                    <option value="18:30">18:30</option>
                    <option value="19:00">19:00</option>
                    <option value="19:15">19:15</option>
                    <option value="19:30">19:30</option>
                    <option value="20:00">20:00</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Lunes -->
            <div v-if="tripForm.days_enabled.monday" class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-gray-800">Lunes</h4>
                <label class="flex items-center">
                  <input v-model="tripForm.special_days.monday" type="checkbox" class="mr-2" />
                  <span class="text-sm text-orange-600">Horario especial</span>
                </label>
              </div>
              <div v-if="tripForm.special_days.monday" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Ida especial</label>
                  <select v-model="tripForm.special_departure_times.monday" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">Usar horario normal</option>
                    <option value="06:30">06:30</option>
                    <option value="07:00">07:00</option>
                    <option value="07:30">07:30</option>
                    <option value="08:00">08:00</option>
                    <option value="08:30">08:30</option>
                    <option value="09:00">09:00</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Regreso especial</label>
                  <select v-model="tripForm.special_return_times.monday" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">Usar horario normal</option>
                    <option value="17:00">17:00</option>
                    <option value="17:30">17:30</option>
                    <option value="18:00">18:00</option>
                    <option value="18:30">18:30</option>
                    <option value="19:00">19:00</option>
                    <option value="19:30">19:30</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Martes -->
            <div v-if="tripForm.days_enabled.tuesday" class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-gray-800">Martes</h4>
                <label class="flex items-center">
                  <input v-model="tripForm.special_days.tuesday" type="checkbox" class="mr-2" />
                  <span class="text-sm text-orange-600">Horario especial</span>
                </label>
              </div>
              <div v-if="tripForm.special_days.tuesday" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Ida especial</label>
                  <select v-model="tripForm.special_departure_times.tuesday" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">Usar horario normal</option>
                    <option value="06:30">06:30</option>
                    <option value="07:00">07:00</option>
                    <option value="07:30">07:30</option>
                    <option value="08:00">08:00</option>
                    <option value="08:30">08:30</option>
                    <option value="09:00">09:00</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Regreso especial</label>
                  <select v-model="tripForm.special_return_times.tuesday" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">Usar horario normal</option>
                    <option value="17:00">17:00</option>
                    <option value="17:30">17:30</option>
                    <option value="18:00">18:00</option>
                    <option value="18:30">18:30</option>
                    <option value="19:00">19:00</option>
                    <option value="19:30">19:30</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Miércoles -->
            <div v-if="tripForm.days_enabled.wednesday" class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-gray-800">Miércoles</h4>
                <label class="flex items-center">
                  <input v-model="tripForm.special_days.wednesday" type="checkbox" class="mr-2" />
                  <span class="text-sm text-orange-600">Horario especial</span>
                </label>
              </div>
              <div v-if="tripForm.special_days.wednesday" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Ida especial</label>
                  <select v-model="tripForm.special_departure_times.wednesday" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">Usar horario normal</option>
                    <option value="06:30">06:30</option>
                    <option value="07:00">07:00</option>
                    <option value="07:30">07:30</option>
                    <option value="08:00">08:00</option>
                    <option value="08:30">08:30</option>
                    <option value="09:00">09:00</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Regreso especial</label>
                  <select v-model="tripForm.special_return_times.wednesday" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">Usar horario normal</option>
                    <option value="17:00">17:00</option>
                    <option value="17:30">17:30</option>
                    <option value="18:00">18:00</option>
                    <option value="18:30">18:30</option>
                    <option value="19:00">19:00</option>
                    <option value="19:30">19:30</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Jueves -->
            <div v-if="tripForm.days_enabled.thursday" class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-gray-800">Jueves</h4>
                <label class="flex items-center">
                  <input v-model="tripForm.special_days.thursday" type="checkbox" class="mr-2" />
                  <span class="text-sm text-orange-600">Horario especial</span>
                </label>
              </div>
              <div v-if="tripForm.special_days.thursday" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Ida especial</label>
                  <select v-model="tripForm.special_departure_times.thursday" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">Usar horario normal</option>
                    <option value="06:30">06:30</option>
                    <option value="07:00">07:00</option>
                    <option value="07:30">07:30</option>
                    <option value="08:00">08:00</option>
                    <option value="08:30">08:30</option>
                    <option value="09:00">09:00</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Regreso especial</label>
                  <select v-model="tripForm.special_return_times.thursday" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">Usar horario normal</option>
                    <option value="17:00">17:00</option>
                    <option value="17:30">17:30</option>
                    <option value="18:00">18:00</option>
                    <option value="18:30">18:30</option>
                    <option value="19:00">19:00</option>
                    <option value="19:30">19:30</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Sábado -->
            <div v-if="tripForm.days_enabled.saturday" class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-gray-800">Sábado</h4>
                <label class="flex items-center">
                  <input v-model="tripForm.special_days.saturday" type="checkbox" class="mr-2" />
                  <span class="text-sm text-orange-600">Horario especial</span>
                </label>
              </div>
              <div v-if="tripForm.special_days.saturday" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Ida especial</label>
                  <select v-model="tripForm.special_departure_times.saturday" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">Usar horario normal</option>
                    <option value="06:30">06:30</option>
                    <option value="07:00">07:00</option>
                    <option value="07:30">07:30</option>
                    <option value="08:00">08:00</option>
                    <option value="08:30">08:30</option>
                    <option value="09:00">09:00</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Regreso especial</label>
                  <select v-model="tripForm.special_return_times.saturday" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">Usar horario normal</option>
                    <option value="17:00">17:00</option>
                    <option value="17:30">17:30</option>
                    <option value="18:00">18:00</option>
                    <option value="18:30">18:30</option>
                    <option value="19:00">19:00</option>
                    <option value="19:30">19:30</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Domingo -->
            <div v-if="tripForm.days_enabled.sunday" class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-gray-800">Domingo</h4>
                <label class="flex items-center">
                  <input v-model="tripForm.special_days.sunday" type="checkbox" class="mr-2" />
                  <span class="text-sm text-orange-600">Horario especial</span>
                </label>
              </div>
              <div v-if="tripForm.special_days.sunday" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Ida especial</label>
                  <select v-model="tripForm.special_departure_times.sunday" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">Usar horario normal</option>
                    <option value="06:30">06:30</option>
                    <option value="07:00">07:00</option>
                    <option value="07:30">07:30</option>
                    <option value="08:00">08:00</option>
                    <option value="08:30">08:30</option>
                    <option value="09:00">09:00</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Regreso especial</label>
                  <select v-model="tripForm.special_return_times.sunday" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">Usar horario normal</option>
                    <option value="17:00">17:00</option>
                    <option value="17:30">17:30</option>
                    <option value="18:00">18:00</option>
                    <option value="18:30">18:30</option>
                    <option value="19:00">19:00</option>
                    <option value="19:30">19:30</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de acción rápida -->
        <div class="flex space-x-4">
          <button type="button" @click="setWeekdays" class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
            📅 Solo Lunes-Viernes
          </button>
          <button type="button" @click="setAllDays" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            📅 Todos los días
          </button>
          <button type="button" @click="setWeekends" class="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600">
            📅 Solo Fines de semana
          </button>
        </div>

        <!-- Descripción -->
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-2">📝 Descripción del viaje</label>
          <textarea v-model="tripForm.description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Describe tu viaje, rutas preferidas, características del vehículo, etc..."></textarea>
        </div>

        <!-- Botones de acción -->
        <div class="flex justify-end space-x-4">
          <button type="button" @click="resetForm" class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
            🔄 Limpiar
          </button>
          <button type="submit" :disabled="loading" class="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400">
            {{ loading ? '⏳ Creando...' : '🚗 Crear Viaje Mensual' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Logs -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">📝 Logs</h2>
      <div class="bg-gray-100 p-4 rounded max-h-96 overflow-auto">
        <div v-for="(log, index) in logs" :key="index" class="text-sm font-mono mb-1">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { supabase } from '@/config/supabase'

const loading = ref(false)
const logs = ref<string[]>([])

// Google Places API
const originSuggestions = ref<any[]>([])
const destinationSuggestions = ref<any[]>([])
const originExactSuggestions = ref<any[]>([])
const showOriginSuggestions = ref(false)
const showDestinationSuggestions = ref(false)
const showOriginExactSuggestions = ref(false)
const googlePlacesService = ref<any>(null)

// Ciudades del extrarradio de Madrid con población
const madridCities = [
  { name: 'Móstoles, Madrid', population: '210,000', lat: 40.3222, lng: -3.8647 },
  { name: 'Alcalá de Henares, Madrid', population: '195,000', lat: 40.4817, lng: -3.3643 },
  { name: 'Fuenlabrada, Madrid', population: '193,000', lat: 40.2842, lng: -3.7942 },
  { name: 'Leganés, Madrid', population: '190,000', lat: 40.3277, lng: -3.7656 },
  { name: 'Getafe, Madrid', population: '185,000', lat: 40.3071, lng: -3.7332 },
  { name: 'Alcorcón, Madrid', population: '170,000', lat: 40.3478, lng: -3.8244 },
  { name: 'Torrejón de Ardoz, Madrid', population: '132,000', lat: 40.4594, lng: -3.4697 },
  { name: 'Parla, Madrid', population: '130,000', lat: 40.2361, lng: -3.7675 },
  { name: 'Alcobendas, Madrid', population: '118,000', lat: 40.5474, lng: -3.6420 },
  { name: 'Las Rozas de Madrid, Madrid', population: '96,000', lat: 40.4929, lng: -3.8739 },
  { name: 'San Sebastián de los Reyes, Madrid', population: '90,000', lat: 40.5474, lng: -3.6256 },
  { name: 'Pozuelo de Alarcón, Madrid', population: '88,000', lat: 40.4329, lng: -3.8146 },
  { name: 'Coslada, Madrid', population: '83,000', lat: 40.4238, lng: -3.5613 },
  { name: 'Valdemoro, Madrid', population: '77,000', lat: 40.1908, lng: -3.6758 },
  { name: 'Rivas-Vaciamadrid, Madrid', population: '88,000', lat: 40.3333, lng: -3.5333 },
  { name: 'Majadahonda, Madrid', population: '72,000', lat: 40.4738, lng: -3.8725 },
  { name: 'Collado Villalba, Madrid', population: '64,000', lat: 40.6447, lng: -4.0075 },
  { name: 'Arganda del Rey, Madrid', population: '57,000', lat: 40.3000, lng: -3.4333 },
  { name: 'Pinto, Madrid', population: '52,000', lat: 40.2417, lng: -3.7000 },
  { name: 'Villaviciosa de Odón, Madrid', population: '48,000', lat: 40.3578, lng: -3.9000 },
  { name: 'Boadilla del Monte, Madrid', population: '46,000', lat: 40.4089, lng: -3.8750 },
  { name: 'San Fernando de Henares, Madrid', population: '43,000', lat: 40.4239, lng: -3.5333 },
  { name: 'Mejorada del Campo, Madrid', population: '39,000', lat: 40.3833, lng: -3.4833 },
  { name: 'Villanueva de la Cañada, Madrid', population: '36,000', lat: 40.4333, lng: -4.0000 },
  { name: 'Ciempozuelos, Madrid', population: '33,000', lat: 40.1589, lng: -3.6167 },
  { name: 'Navalcarnero, Madrid', population: '30,000', lat: 40.2833, lng: -4.0167 },
  { name: 'Colmenar Viejo, Madrid', population: '28,000', lat: 40.6500, lng: -3.7667 },
  { name: 'Humanes de Madrid, Madrid', population: '25,000', lat: 40.2500, lng: -3.8167 },
  { name: 'Velilla de San Antonio, Madrid', population: '22,000', lat: 40.3667, lng: -3.4833 },
  { name: 'Galapagar, Madrid', population: '20,000', lat: 40.5833, lng: -4.0000 },
  { name: 'Moralzarzal, Madrid', population: '18,000', lat: 40.6833, lng: -3.9667 },
  { name: 'Villanueva del Pardillo, Madrid', population: '15,000', lat: 40.4333, lng: -3.9667 },
  { name: 'Villalbilla, Madrid', population: '12,000', lat: 40.4333, lng: -3.3167 },
  { name: 'Villanueva de la Torre, Madrid', population: '10,000', lat: 40.5833, lng: -3.3333 }
]

// Destinos populares en Madrid
const popularDestinations = [
  { name: 'Puerta del Sol', lat: 40.4168, lng: -3.7038 },
  { name: 'Gran Vía', lat: 40.4192, lng: -3.7075 },
  { name: 'Chamartín', lat: 40.4740, lng: -3.6827 },
  { name: 'Atocha', lat: 40.4078, lng: -3.6893 },
  { name: 'Nuevos Ministerios', lat: 40.4460, lng: -3.6910 },
  { name: 'Plaza de Castilla', lat: 40.4663, lng: -3.6896 },
  { name: 'Moncloa', lat: 40.4350, lng: -3.7200 },
  { name: 'Plaza de España', lat: 40.4239, lng: -3.7146 },
  { name: 'AZCA', lat: 40.4460, lng: -3.6910 },
  { name: 'Cuatro Torres', lat: 40.4770, lng: -3.6900 },
  { name: 'Universidad Complutense', lat: 40.4495, lng: -3.7292 },
  { name: 'Hospital La Paz', lat: 40.4790, lng: -3.6900 }
]

const tripForm = reactive({
  driver_id: 'driver-1',
  origin_name: '',
  origin_lat: 0,
  origin_lng: 0,
  origin_exact_location: '',
  destination_name: '',
  destination_lat: 0,
  destination_lng: 0,
  destination_exact_location: '',
  available_seats: 4,
  monthly_price: 300,
  start_date: '',
  end_date: '',
  description: '',
  
  // Horarios normales
  departure_time: '08:00',
  return_time: '18:00',
  
  // Días habilitados
  days_enabled: {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false
  },
  
  // Días con horarios especiales
  special_days: {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: true, // Viernes por defecto
    saturday: false,
    sunday: false
  },
  
  // Horarios especiales de ida
  special_departure_times: {
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '17:30',
    saturday: '',
    sunday: ''
  },
  
  // Horarios especiales de regreso
  special_return_times: {
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '19:30',
    saturday: '',
    sunday: ''
  }
})

// Días que no son viernes para mostrar en el loop
const otherDays = computed(() => [
  { key: 'monday', name: 'Lunes' },
  { key: 'tuesday', name: 'Martes' },
  { key: 'wednesday', name: 'Miércoles' },
  { key: 'thursday', name: 'Jueves' },
  { key: 'saturday', name: 'Sábado' },
  { key: 'sunday', name: 'Domingo' }
])

// Coordenadas de destinos en Madrid
const destinationCoordinates = {
  'Madrid Centro': { lat: 40.4168, lng: -3.7038 },
  'Chamartín, Madrid': { lat: 40.4740, lng: -3.6827 },
  'Atocha, Madrid': { lat: 40.4076, lng: -3.6900 },
  'Nuevos Ministerios, Madrid': { lat: 40.4464, lng: -3.6893 },
  'Sol, Madrid': { lat: 40.4168, lng: -3.7038 },
  'Gran Vía, Madrid': { lat: 40.4200, lng: -3.7050 }
}

function addLog(message: string) {
  logs.value.push(`[${new Date().toLocaleTimeString()}] ${message}`)
}

// Google Places API functions - Nueva implementación
function initializeGooglePlaces() {
  if (window.google && window.google.maps && window.google.maps.places) {
    // Usar la nueva API de Places
    googlePlacesService.value = new window.google.maps.places.Place(document.createElement('div'))
    addLog('🗺️ Google Places API (nueva) inicializada')
  } else {
    addLog('⚠️ Google Places API no disponible')
  }
}

function searchOriginPlaces() {
  if (tripForm.origin_name.length < 3) {
    originSuggestions.value = []
    return
  }

  // Implementación simple con fallback a datos locales
  const localSuggestions = [
    { main_text: 'Móstoles, Madrid', secondary_text: 'Comunidad de Madrid, España', place_id: 'mostoles', lat: 40.3222, lng: -3.8647 },
    { main_text: 'Alcalá de Henares, Madrid', secondary_text: 'Comunidad de Madrid, España', place_id: 'alcala', lat: 40.4817, lng: -3.3643 },
    { main_text: 'Fuenlabrada, Madrid', secondary_text: 'Comunidad de Madrid, España', place_id: 'fuenlabrada', lat: 40.2842, lng: -3.7942 },
    { main_text: 'Leganés, Madrid', secondary_text: 'Comunidad de Madrid, España', place_id: 'leganes', lat: 40.3277, lng: -3.7656 },
    { main_text: 'Getafe, Madrid', secondary_text: 'Comunidad de Madrid, España', place_id: 'getafe', lat: 40.3071, lng: -3.7332 },
    { main_text: 'Alcorcón, Madrid', secondary_text: 'Comunidad de Madrid, España', place_id: 'alcorcon', lat: 40.3478, lng: -3.8244 },
    { main_text: 'Torrejón de Ardoz, Madrid', secondary_text: 'Comunidad de Madrid, España', place_id: 'torrejon', lat: 40.4594, lng: -3.4697 },
    { main_text: 'Parla, Madrid', secondary_text: 'Comunidad de Madrid, España', place_id: 'parla', lat: 40.2361, lng: -3.7675 },
    { main_text: 'Alcobendas, Madrid', secondary_text: 'Comunidad de Madrid, España', place_id: 'alcobendas', lat: 40.5474, lng: -3.6420 },
    { main_text: 'Las Rozas de Madrid, Madrid', secondary_text: 'Comunidad de Madrid, España', place_id: 'lasrozas', lat: 40.4929, lng: -3.8739 }
  ]

  // Filtrar sugerencias locales basadas en la entrada
  const filteredSuggestions = localSuggestions.filter(suggestion => 
    suggestion.main_text.toLowerCase().includes(tripForm.origin_name.toLowerCase())
  )

  originSuggestions.value = filteredSuggestions
  addLog(`📍 Origen: ${filteredSuggestions.length} sugerencias encontradas (modo local)`)
}

function searchDestinationPlaces() {
  if (tripForm.destination_name.length < 3) {
    destinationSuggestions.value = []
    return
  }

  // Implementación simple con fallback a datos locales
  const localDestinations = [
    { main_text: 'Puerta del Sol, Madrid', secondary_text: 'Madrid, España', place_id: 'sol', lat: 40.4168, lng: -3.7038 },
    { main_text: 'Gran Vía, Madrid', secondary_text: 'Madrid, España', place_id: 'granvia', lat: 40.4192, lng: -3.7075 },
    { main_text: 'Chamartín, Madrid', secondary_text: 'Madrid, España', place_id: 'chamartin', lat: 40.4740, lng: -3.6827 },
    { main_text: 'Atocha, Madrid', secondary_text: 'Madrid, España', place_id: 'atocha', lat: 40.4078, lng: -3.6893 },
    { main_text: 'Nuevos Ministerios, Madrid', secondary_text: 'Madrid, España', place_id: 'nuevosministerios', lat: 40.4460, lng: -3.6910 },
    { main_text: 'Plaza de Castilla, Madrid', secondary_text: 'Madrid, España', place_id: 'plazacastilla', lat: 40.4663, lng: -3.6896 },
    { main_text: 'Moncloa, Madrid', secondary_text: 'Madrid, España', place_id: 'moncloa', lat: 40.4350, lng: -3.7200 },
    { main_text: 'Plaza de España, Madrid', secondary_text: 'Madrid, España', place_id: 'plazaespana', lat: 40.4239, lng: -3.7146 },
    { main_text: 'AZCA, Madrid', secondary_text: 'Madrid, España', place_id: 'azca', lat: 40.4460, lng: -3.6910 },
    { main_text: 'Cuatro Torres, Madrid', secondary_text: 'Madrid, España', place_id: 'cuatrotorres', lat: 40.4770, lng: -3.6900 },
    { main_text: 'Universidad Complutense, Madrid', secondary_text: 'Madrid, España', place_id: 'complutense', lat: 40.4495, lng: -3.7292 },
    { main_text: 'Hospital La Paz, Madrid', secondary_text: 'Madrid, España', place_id: 'hospitalpaz', lat: 40.4790, lng: -3.6900 }
  ]

  // Filtrar sugerencias locales basadas en la entrada
  const filteredSuggestions = localDestinations.filter(suggestion => 
    suggestion.main_text.toLowerCase().includes(tripForm.destination_name.toLowerCase())
  )

  destinationSuggestions.value = filteredSuggestions
  addLog(`🎯 Destino: ${filteredSuggestions.length} sugerencias encontradas (modo local)`)
}

function searchOriginExactPlaces() {
  if (tripForm.origin_exact_location.length < 3) {
    originExactSuggestions.value = []
    return
  }

  // Implementación simple con fallback a datos locales
  const localExactLocations = [
    { main_text: 'Estación de Atocha', secondary_text: 'Madrid, España', place_id: 'estacionatocha', lat: 40.4078, lng: -3.6893 },
    { main_text: 'Estación de Chamartín', secondary_text: 'Madrid, España', place_id: 'estacionchamartin', lat: 40.4740, lng: -3.6827 },
    { main_text: 'Centro Comercial La Vaguada', secondary_text: 'Madrid, España', place_id: 'lavaguada', lat: 40.4663, lng: -3.6896 },
    { main_text: 'Centro Comercial Príncipe Pío', secondary_text: 'Madrid, España', place_id: 'principepio', lat: 40.4200, lng: -3.7200 },
    { main_text: 'Hospital La Paz', secondary_text: 'Madrid, España', place_id: 'hospitalpaz', lat: 40.4790, lng: -3.6900 },
    { main_text: 'Hospital Ramón y Cajal', secondary_text: 'Madrid, España', place_id: 'hospitalryc', lat: 40.4500, lng: -3.6800 },
    { main_text: 'Universidad Complutense', secondary_text: 'Madrid, España', place_id: 'complutense', lat: 40.4495, lng: -3.7292 },
    { main_text: 'Universidad Politécnica', secondary_text: 'Madrid, España', place_id: 'upm', lat: 40.4500, lng: -3.7300 },
    { main_text: 'Parada de Autobús Intercambiador', secondary_text: 'Madrid, España', place_id: 'intercambiador', lat: 40.4200, lng: -3.7000 },
    { main_text: 'Metro Sol', secondary_text: 'Madrid, España', place_id: 'metrosol', lat: 40.4168, lng: -3.7038 },
    { main_text: 'Metro Gran Vía', secondary_text: 'Madrid, España', place_id: 'metrogranvia', lat: 40.4192, lng: -3.7075 },
    { main_text: 'Aeropuerto Adolfo Suárez', secondary_text: 'Madrid, España', place_id: 'aeropuerto', lat: 40.4839, lng: -3.5680 }
  ]

  // Filtrar sugerencias locales basadas en la entrada
  const filteredSuggestions = localExactLocations.filter(suggestion => 
    suggestion.main_text.toLowerCase().includes(tripForm.origin_exact_location.toLowerCase())
  )

  originExactSuggestions.value = filteredSuggestions
  addLog(`📍 Ubicación exacta: ${filteredSuggestions.length} sugerencias encontradas (modo local)`)
}

function selectOriginPlace(suggestion: any) {
  tripForm.origin_name = suggestion.main_text
  tripForm.origin_lat = suggestion.lat
  tripForm.origin_lng = suggestion.lng
  showOriginSuggestions.value = false
  originSuggestions.value = []
  addLog(`📍 Origen seleccionado: ${suggestion.main_text} (${suggestion.lat}, ${suggestion.lng})`)
}

function selectDestinationPlace(suggestion: any) {
  tripForm.destination_name = suggestion.main_text
  tripForm.destination_lat = suggestion.lat
  tripForm.destination_lng = suggestion.lng
  showDestinationSuggestions.value = false
  destinationSuggestions.value = []
  addLog(`🎯 Destino seleccionado: ${suggestion.main_text} (${suggestion.lat}, ${suggestion.lng})`)
}

function selectOriginExactPlace(suggestion: any) {
  tripForm.origin_exact_location = suggestion.main_text
  showOriginExactSuggestions.value = false
  originExactSuggestions.value = []
  addLog(`📍 Ubicación exacta seleccionada: ${suggestion.main_text}`)
}

function hideOriginSuggestions() {
  setTimeout(() => {
    showOriginSuggestions.value = false
  }, 200)
}

function hideDestinationSuggestions() {
  setTimeout(() => {
    showDestinationSuggestions.value = false
  }, 200)
}

function hideOriginExactSuggestions() {
  setTimeout(() => {
    showOriginExactSuggestions.value = false
  }, 200)
}

// Funciones para seleccionar opciones predefinidas
function selectPredefinedOrigin(city: any) {
  tripForm.origin_name = city.name
  tripForm.origin_lat = city.lat
  tripForm.origin_lng = city.lng
  addLog(`📍 Origen predefinido seleccionado: ${city.name} (${city.population} hab.)`)
}

function selectPredefinedDestination(destination: any) {
  tripForm.destination_name = destination.name
  tripForm.destination_lat = destination.lat
  tripForm.destination_lng = destination.lng
  addLog(`🎯 Destino predefinido seleccionado: ${destination.name}`)
}

function setWeekdays() {
  tripForm.days_enabled = {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false
  }
  addLog('📅 Configurado: Solo días laborables')
}

function setAllDays() {
  tripForm.days_enabled = {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true
  }
  addLog('📅 Configurado: Todos los días')
}

function setWeekends() {
  tripForm.days_enabled = {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: true,
    sunday: true
  }
  addLog('📅 Configurado: Solo fines de semana')
}

async function createTrip() {
  if (!tripForm.origin_name || !tripForm.destination_name || !tripForm.start_date) {
    addLog('❌ Por favor, completa todos los campos obligatorios')
    return
  }

  // Verificar que al menos un día esté habilitado
  const hasEnabledDay = Object.values(tripForm.days_enabled).some(enabled => enabled)
  if (!hasEnabledDay) {
    addLog('❌ Debes seleccionar al menos un día de la semana')
    return
  }

  loading.value = true
  addLog('🚗 Iniciando creación de viaje mensual...')

  try {
    // Crear el conductor si no existe
    const { data: existingDriver } = await supabase
      .from('drivers')
      .select('id')
      .eq('id', tripForm.driver_id)
      .single()

    let driverId = tripForm.driver_id

    if (!existingDriver) {
      const { data: newDriver, error: driverError } = await supabase
        .from('drivers')
        .insert({
          id: tripForm.driver_id,
          name: 'Conductor Ejemplo',
          email: 'conductor@ejemplo.com',
          phone: '+34 600 000 000',
          rating: 4.5
        })
        .select()
        .single()

      if (driverError) {
        addLog(`❌ Error creando conductor: ${driverError.message}`)
        return
      }

      driverId = newDriver.id
      addLog(`✅ Conductor creado: ${driverId}`)
    }

    // Preparar horarios especiales
    const specialDepartureTimes: any = {};
    const specialReturnTimes: any = {};
    
    Object.keys(tripForm.special_days).forEach(day => {
      if (tripForm.special_days[day as keyof typeof tripForm.special_days]) {
        specialDepartureTimes[day] = tripForm.special_departure_times[day as keyof typeof tripForm.special_departure_times];
        specialReturnTimes[day] = tripForm.special_return_times[day as keyof typeof tripForm.special_return_times];
      }
    });

    // Crear el viaje mensual
    const tripData = {
      driver_id: driverId,
      origin_name: tripForm.origin_name,
      origin_lat: tripForm.origin_lat,
      origin_lng: tripForm.origin_lng,
      destination_name: tripForm.destination_name,
      destination_lat: tripForm.destination_lat,
      destination_lng: tripForm.destination_lng,
      available_seats: tripForm.available_seats,
      monthly_price: tripForm.monthly_price,
      start_date: tripForm.start_date,
      end_date: tripForm.end_date || null,
      description: tripForm.description,
      is_active: true,
      
      // Horarios normales
      departure_time: tripForm.departure_time,
      return_time: tripForm.return_time,
      
      // Solo incluir horarios de días habilitados
      monday_time: tripForm.days_enabled.monday ? tripForm.departure_time : null,
      tuesday_time: tripForm.days_enabled.tuesday ? tripForm.departure_time : null,
      wednesday_time: tripForm.days_enabled.wednesday ? tripForm.departure_time : null,
      thursday_time: tripForm.days_enabled.thursday ? tripForm.departure_time : null,
      friday_time: tripForm.days_enabled.friday ? tripForm.departure_time : null,
      saturday_time: tripForm.days_enabled.saturday ? tripForm.departure_time : null,
      sunday_time: tripForm.days_enabled.sunday ? tripForm.departure_time : null,
      
      // Horarios especiales
      special_departure_times: specialDepartureTimes,
      special_return_times: specialReturnTimes
    }

    const { data: trip, error: tripError } = await supabase
      .from('monthly_trips')
      .insert(tripData)
      .select()
      .single()

    if (tripError) {
      addLog(`❌ Error creando viaje: ${tripError.message}`)
      return
    }

    addLog(`✅ Viaje mensual creado exitosamente con ID: ${trip.id}`)
    addLog(`📍 Ruta: ${tripForm.origin_name} → ${tripForm.destination_name}`)
    addLog(`👥 Plazas: ${tripForm.available_seats}`)
    addLog(`💰 Precio mensual: €${tripForm.monthly_price}`)
    addLog('🎉 ¡Viaje mensual configurado correctamente!')

  } catch (error) {
    addLog(`❌ Error: ${error}`)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  tripForm.origin_name = ''
  tripForm.destination_name = ''
  tripForm.available_seats = 4
  tripForm.monthly_price = 300
  tripForm.start_date = ''
  tripForm.end_date = ''
  tripForm.description = ''
  
  // Resetear horarios normales
  tripForm.departure_time = '08:00'
  tripForm.return_time = '18:00'
  
  // Resetear días habilitados
  tripForm.days_enabled = {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false
  }
  
  // Resetear días especiales
  tripForm.special_days = {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: true,
    saturday: false,
    sunday: false
  }
  
  // Resetear horarios especiales
  tripForm.special_departure_times = {
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '17:30',
    saturday: '',
    sunday: ''
  }
  
  tripForm.special_return_times = {
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '19:30',
    saturday: '',
    sunday: ''
  }
  
  logs.value = []
  addLog('🔄 Formulario limpiado')
}

// Establecer fecha por defecto
const today = new Date()
tripForm.start_date = today.toISOString().split('T')[0]

// Inicializar Google Places API cuando el componente se monte
onMounted(() => {
  addLog('🚀 Componente CreateTripMadrid montado')
  
  // Esperar a que Google Maps esté cargado
  const checkGoogleMaps = () => {
    if (window.google && window.google.maps && window.google.maps.places) {
      addLog('✅ Google Maps detectado, inicializando Places...')
      initializeGooglePlaces()
    } else {
      addLog('⏳ Esperando Google Maps...')
      setTimeout(checkGoogleMaps, 100)
    }
  }
  
  // Verificar si ya está cargado
  if (window.google && window.google.maps && window.google.maps.places) {
    addLog('✅ Google Maps ya está disponible')
    initializeGooglePlaces()
  } else {
    checkGoogleMaps()
  }
})
</script>
