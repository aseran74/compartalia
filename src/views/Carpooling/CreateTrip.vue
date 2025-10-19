<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <AppSidebar />
    
            <!-- Main Content -->
            <div class="flex flex-1 flex-col overflow-hidden" :class="{ 'ml-[90px]': !isExpanded, 'ml-[280px]': isExpanded }">
      <!-- Header -->
      <AppHeader />
      
      <!-- Page Content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6 xl:p-7.5 dark:bg-boxdark">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-black dark:text-white">
            Crear Viaje
          </h1>
          <p class="text-sm font-medium text-body-color">
            Ofrece un asiento en tu vehículo y ayuda a otros a llegar a su destino
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

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Formulario Principal -->
      <div class="lg:col-span-2">
        <form @submit.prevent="createTrip" class="space-y-6">
          <!-- Tipo de Viaje -->
          <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
              Tipo de Viaje
            </h3>
            
            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label class="mb-2.5 block text-black dark:text-white">
                  Tipo de Viaje *
                </label>
                <select
                  v-model="tripForm.tripType"
                  class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  required
                  @change="onTripTypeChange"
                >
                  <option value="single">Viaje único</option>
                  <option value="recurring">Viaje recurrente</option>
                  <option value="weekly">Viaje semanal fijo</option>
                </select>
              </div>

              <div>
                <label class="mb-2.5 block text-black dark:text-white">
                  Modalidad *
                </label>
                <select
                  v-model="tripForm.modality"
                  class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  required
                >
                  <option value="one_way">Solo ida</option>
                  <option value="round_trip">Ida y vuelta</option>
                </select>
              </div>

              <div>
                <label class="mb-2.5 block text-black dark:text-white">
                  Modelo de Precio *
                </label>
                <select
                  v-model="tripForm.pricingModel"
                  class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  required
                  @change="onPricingModelChange"
                >
                  <option value="per_seat">Por asiento</option>
                  <option value="monthly_fixed">Precio mensual fijo</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Información de la Ruta -->
          <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
              Información de la Ruta
            </h3>
            
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <!-- Origen -->
              <div>
                <label class="mb-2.5 block text-black dark:text-white">
                  Origen *
                </label>
                <AddressAutocomplete
                  v-model="tripForm.origin"
                  placeholder="¿Desde dónde sales?"
                  :required="true"
                  @select="onOriginSelect"
                />
              </div>

              <!-- Destino -->
              <div>
                <label class="mb-2.5 block text-black dark:text-white">
                  Destino *
                </label>
                <AddressAutocomplete
                  v-model="tripForm.destination"
                  placeholder="¿Hacia dónde vas?"
                  :required="true"
                  @select="onDestinationSelect"
                />
              </div>
            </div>

            <!-- Fecha y Hora -->
            <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div v-if="tripForm.tripType === 'single'">
                <label class="mb-2.5 block text-black dark:text-white">
                  Fecha de Salida *
                </label>
                <input
                  v-model="tripForm.departureDate"
                  type="date"
                  :min="minDate"
                  class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  required
                />
              </div>

              <div v-if="tripForm.tripType !== 'single'">
                <label class="mb-2.5 block text-black dark:text-white">
                  Días de la Semana *
                </label>
                <div class="flex flex-wrap gap-2">
                  <label v-for="day in weekDays" :key="day.value" class="flex items-center space-x-2">
                    <input
                      v-model="tripForm.selectedDays"
                      type="checkbox"
                      :value="day.value"
                      class="rounded border-stroke text-primary focus:ring-primary dark:border-strokedark"
                    />
                    <span class="text-sm text-black dark:text-white">{{ day.label }}</span>
                  </label>
                </div>
              </div>

              <div>
                <label class="mb-2.5 block text-black dark:text-white">
                  Hora de Salida *
                </label>
                <input
                  v-model="tripForm.departureTime"
                  type="time"
                  class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  required
                />
              </div>
            </div>

            <!-- Horarios Flexibles para Viajes Recurrentes -->
            <div v-if="tripForm.tripType === 'weekly'" class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="mb-2.5 block text-black dark:text-white">
                  Margen de Recogida (minutos)
                </label>
                <select
                  v-model="tripForm.pickupMargin"
                  class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                >
                  <option value="0">Sin margen</option>
                  <option value="5">±5 minutos</option>
                  <option value="10">±10 minutos</option>
                  <option value="15">±15 minutos</option>
                  <option value="30">±30 minutos</option>
                </select>
              </div>

              <div>
                <label class="mb-2.5 block text-black dark:text-white">
                  Margen de Llegada (minutos)
                </label>
                <select
                  v-model="tripForm.arrivalMargin"
                  class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                >
                  <option value="0">Sin margen</option>
                  <option value="5">±5 minutos</option>
                  <option value="10">±10 minutos</option>
                  <option value="15">±15 minutos</option>
                  <option value="30">±30 minutos</option>
                </select>
              </div>
            </div>

            <!-- Viaje de Ida y Vuelta -->
            <div v-if="tripForm.modality === 'round_trip'" class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="mb-2.5 block text-black dark:text-white">
                  Hora de Regreso *
                </label>
                <input
                  v-model="tripForm.returnTime"
                  type="time"
                  class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  required
                />
              </div>

              <div>
                <label class="mb-2.5 block text-black dark:text-white">
                  Días de Regreso
                </label>
                <div class="flex flex-wrap gap-2">
                  <label v-for="day in weekDays" :key="day.value" class="flex items-center space-x-2">
                    <input
                      v-model="tripForm.selectedReturnDays"
                      type="checkbox"
                      :value="day.value"
                      class="rounded border-stroke text-primary focus:ring-primary dark:border-strokedark"
                    />
                    <span class="text-sm text-black dark:text-white">{{ day.label }}</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Puntos de Recogida -->
            <div class="mt-4">
              <label class="mb-2.5 block text-black dark:text-white">
                Puntos de Recogida (opcional)
              </label>
              <div class="space-y-2">
                <div
                  v-for="(waypoint, index) in tripForm.waypoints"
                  :key="index"
                  class="flex items-center space-x-2"
                >
                  <input
                    v-model="tripForm.waypoints[index]"
                    type="text"
                    :placeholder="`Punto de recogida ${index + 1}`"
                    class="flex-1 rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  />
                  <button
                    type="button"
                    @click="removeWaypoint(index)"
                    class="rounded-md border border-stroke p-2 text-body-color hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-800"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
                <button
                  type="button"
                  @click="addWaypoint"
                  class="flex items-center space-x-2 text-sm text-primary hover:text-primary/80"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  <span>Añadir punto de recogida</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Información del Vehículo -->
          <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
              Información del Vehículo
            </h3>
            
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="mb-2.5 block text-black dark:text-white">
                  Asientos Disponibles *
                </label>
                <select
                  v-model="tripForm.availableSeats"
                  class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  required
                >
                  <option value="1">1 asiento</option>
                  <option value="2">2 asientos</option>
                  <option value="3">3 asientos</option>
                  <option value="4">4 asientos</option>
                </select>
              </div>

              <div v-if="tripForm.pricingModel === 'per_seat'">
                <label class="mb-2.5 block text-black dark:text-white">
                  Precio por Asiento (€) *
                </label>
                <input
                  v-model.number="tripForm.pricePerSeat"
                  type="number"
                  min="1"
                  max="50"
                  placeholder="8"
                  class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  required
                />
              </div>

              <div v-if="tripForm.pricingModel === 'monthly_fixed'">
                <label class="mb-2.5 block text-black dark:text-white">
                  Precio Mensual (€) *
                </label>
                <input
                  v-model.number="tripForm.monthlyPrice"
                  type="number"
                  min="50"
                  max="500"
                  placeholder="150"
                  class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  required
                />
                <p class="mt-1 text-xs text-body-color">
                  Precio fijo mensual para todos los viajes
                </p>
              </div>
            </div>

            <!-- Características del Vehículo -->
            <div class="mt-4">
              <label class="mb-2.5 block text-black dark:text-white">
                Características del Vehículo
              </label>
              <div class="grid grid-cols-2 gap-4 md:grid-cols-3">
                <label class="flex items-center space-x-2">
                  <input
                    v-model="tripForm.vehicleFeatures.airConditioning"
                    type="checkbox"
                    class="rounded border-stroke text-primary focus:border-primary focus:ring-primary"
                  />
                  <span class="text-sm text-black dark:text-white">Aire acondicionado</span>
                </label>
                
                <label class="flex items-center space-x-2">
                  <input
                    v-model="tripForm.vehicleFeatures.wifi"
                    type="checkbox"
                    class="rounded border-stroke text-primary focus:border-primary focus:ring-primary"
                  />
                  <span class="text-sm text-black dark:text-white">WiFi</span>
                </label>
                
                <label class="flex items-center space-x-2">
                  <input
                    v-model="tripForm.vehicleFeatures.chargingPorts"
                    type="checkbox"
                    class="rounded border-stroke text-primary focus:border-primary focus:ring-primary"
                  />
                  <span class="text-sm text-black dark:text-white">Carga USB</span>
                </label>
                
                <label class="flex items-center space-x-2">
                  <input
                    v-model="tripForm.vehicleFeatures.luggageSpace"
                    type="checkbox"
                    class="rounded border-stroke text-primary focus:border-primary focus:ring-primary"
                  />
                  <span class="text-sm text-black dark:text-white">Espacio para equipaje</span>
                </label>
                
                <label class="flex items-center space-x-2">
                  <input
                    v-model="tripForm.smokingAllowed"
                    type="checkbox"
                    class="rounded border-stroke text-primary focus:border-primary focus:ring-primary"
                  />
                  <span class="text-sm text-black dark:text-white">Fumar permitido</span>
                </label>
                
                <label class="flex items-center space-x-2">
                  <input
                    v-model="tripForm.petsAllowed"
                    type="checkbox"
                    class="rounded border-stroke text-primary focus:border-primary focus:ring-primary"
                  />
                  <span class="text-sm text-black dark:text-white">Mascotas permitidas</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Información Adicional -->
          <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
              Información Adicional
            </h3>
            
            <div>
              <label class="mb-2.5 block text-black dark:text-white">
                Descripción del Viaje
              </label>
              <textarea
                v-model="tripForm.description"
                rows="4"
                placeholder="Comparte información adicional sobre el viaje, preferencias musicales, si haces paradas, etc."
                class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              ></textarea>
            </div>
          </div>

          <!-- Botones de Acción -->
          <div class="flex items-center justify-end space-x-4">
            <button
              type="button"
              @click="$router.go(-1)"
              class="rounded-md border border-stroke px-6 py-2.5 text-center font-medium text-body-color hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isCreating"
              class="inline-flex items-center justify-center rounded-md bg-primary px-8 py-2.5 text-center font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
            >
              <svg v-if="isCreating" class="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isCreating ? 'Creando...' : 'Crear Viaje' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Panel Lateral -->
      <div class="lg:col-span-1">
        <!-- Resumen del Viaje -->
        <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
            Resumen del Viaje
          </h3>
          
          <div class="space-y-3">
            <div>
              <p class="text-sm text-body-color">Ruta</p>
              <p class="font-medium text-black dark:text-white">
                {{ tripForm.origin || 'Origen' }} → {{ tripForm.destination || 'Destino' }}
              </p>
            </div>
            
            <div>
              <p class="text-sm text-body-color">Tipo de Viaje</p>
              <p class="font-medium text-black dark:text-white">
                {{ getTripTypeLabel() }} - {{ getModalityLabel() }}
              </p>
            </div>

            <div v-if="tripForm.tripType === 'single'">
              <p class="text-sm text-body-color">Fecha y Hora</p>
              <p class="font-medium text-black dark:text-white">
                {{ formatDateTime() }}
              </p>
            </div>

            <div v-if="tripForm.tripType !== 'single'">
              <p class="text-sm text-body-color">Días de la Semana</p>
              <p class="font-medium text-black dark:text-white">
                {{ getSelectedDaysLabel() }}
              </p>
            </div>

            <div>
              <p class="text-sm text-body-color">Hora de Salida</p>
              <p class="font-medium text-black dark:text-white">
                {{ tripForm.departureTime || 'No especificada' }}
              </p>
            </div>

            <div v-if="tripForm.modality === 'round_trip'">
              <p class="text-sm text-body-color">Hora de Regreso</p>
              <p class="font-medium text-black dark:text-white">
                {{ tripForm.returnTime || 'No especificada' }}
              </p>
            </div>
            
            <div>
              <p class="text-sm text-body-color">Asientos</p>
              <p class="font-medium text-black dark:text-white">
                {{ tripForm.availableSeats }} disponibles
              </p>
            </div>
            
            <div>
              <p class="text-sm text-body-color">Precio</p>
              <p class="font-medium text-black dark:text-white">
                <span v-if="tripForm.pricingModel === 'per_seat'">
                  €{{ tripForm.pricePerSeat || 0 }} por asiento
                </span>
                <span v-else-if="tripForm.pricingModel === 'monthly_fixed'">
                  €{{ tripForm.monthlyPrice || 0 }} mensual
                </span>
              </p>
            </div>
          </div>
        </div>

        <!-- Consejos -->
        <div class="mt-6 rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
            💡 Consejos
          </h3>
          
          <div class="space-y-3 text-sm text-body-color">
            <div class="flex items-start space-x-2">
              <span class="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary"></span>
              <p>Establece un precio justo basado en la distancia y el combustible</p>
            </div>
            <div class="flex items-start space-x-2">
              <span class="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary"></span>
              <p>Menciona si haces paradas en el camino</p>
            </div>
            <div class="flex items-start space-x-2">
              <span class="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary"></span>
              <p>Sé claro sobre las reglas del vehículo</p>
            </div>
            <div class="flex items-start space-x-2">
              <span class="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary"></span>
              <p>Responde rápidamente a las solicitudes</p>
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import AppSidebar from '@/components/layout/AppSidebar.vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import AddressAutocomplete from '@/components/carpooling/AddressAutocomplete.vue';
import { useSidebar } from '@/composables/useSidebar';
import type { Location } from '@/types/carpooling';

const router = useRouter();
const { isExpanded } = useSidebar();

// Estado del formulario
const tripForm = ref({
  tripType: 'single',
  modality: 'one_way',
  pricingModel: 'per_seat',
  origin: '',
  destination: '',
  departureDate: '',
  departureTime: '',
  returnTime: '',
  selectedDays: [] as number[],
  selectedReturnDays: [] as number[],
  pickupMargin: 0,
  arrivalMargin: 0,
  waypoints: [] as string[],
  availableSeats: 1,
  pricePerSeat: 8,
  monthlyPrice: 150,
  description: '',
  smokingAllowed: false,
  petsAllowed: false,
  vehicleFeatures: {
    airConditioning: false,
    wifi: false,
    chargingPorts: false,
    luggageSpace: false
  }
});

// Ubicaciones seleccionadas
const selectedOrigin = ref<Location | null>(null);
const selectedDestination = ref<Location | null>(null);

// Días de la semana
const weekDays = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' }
];

// Estado de la UI
const isCreating = ref(false);

// Fecha mínima (hoy)
const minDate = computed(() => {
  return new Date().toISOString().split('T')[0];
});

// Métodos
const addWaypoint = () => {
  tripForm.value.waypoints.push('');
};

const removeWaypoint = (index: number) => {
  tripForm.value.waypoints.splice(index, 1);
};

const onTripTypeChange = () => {
  // Resetear días seleccionados cuando cambia el tipo
  if (tripForm.value.tripType === 'single') {
    tripForm.value.selectedDays = [];
    tripForm.value.selectedReturnDays = [];
  } else if (tripForm.value.tripType === 'weekly') {
    // Por defecto seleccionar lunes a viernes para viajes semanales
    tripForm.value.selectedDays = [1, 2, 3, 4, 5];
    if (tripForm.value.modality === 'round_trip') {
      tripForm.value.selectedReturnDays = [1, 2, 3, 4, 5];
    }
  }
};

const onPricingModelChange = () => {
  // Resetear precios cuando cambia el modelo
  if (tripForm.value.pricingModel === 'per_seat') {
    tripForm.value.pricePerSeat = 8;
  } else if (tripForm.value.pricingModel === 'monthly_fixed') {
    tripForm.value.monthlyPrice = 150;
  }
};

// Métodos auxiliares para mostrar etiquetas
const getTripTypeLabel = () => {
  switch (tripForm.value.tripType) {
    case 'single': return 'Viaje único';
    case 'recurring': return 'Viaje recurrente';
    case 'weekly': return 'Viaje semanal';
    default: return 'Viaje único';
  }
};

const getModalityLabel = () => {
  return tripForm.value.modality === 'one_way' ? 'Solo ida' : 'Ida y vuelta';
};

const getSelectedDaysLabel = () => {
  if (tripForm.value.selectedDays.length === 0) return 'No seleccionados';
  
  const dayNames = tripForm.value.selectedDays.map(dayValue => {
    const day = weekDays.find(d => d.value === dayValue);
    return day ? day.label : '';
  }).filter(Boolean);
  
  return dayNames.join(', ');
};

const formatDateTime = () => {
  if (!tripForm.value.departureDate || !tripForm.value.departureTime) {
    return 'Selecciona fecha y hora';
  }
  
  const date = new Date(`${tripForm.value.departureDate}T${tripForm.value.departureTime}`);
  return date.toLocaleString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Handlers para la selección de ubicaciones
const onOriginSelect = (location: Location) => {
  selectedOrigin.value = location;
  // Aquí podrías calcular la distancia y sugerir un precio
  if (selectedDestination.value) {
    calculateTripDetails();
  }
};

const onDestinationSelect = (location: Location) => {
  selectedDestination.value = location;
  if (selectedOrigin.value) {
    calculateTripDetails();
  }
};

// Calcular detalles del viaje (distancia, duración estimada, precio sugerido)
const calculateTripDetails = () => {
  if (!selectedOrigin.value || !selectedDestination.value) return;
  
  // TODO: Implementar cálculo real usando la API de rutas
  console.log('Calculando detalles del viaje...');
};

const createTrip = async () => {
  isCreating.value = true;
  
  try {
    // Validaciones específicas según el tipo de viaje
    if (tripForm.value.tripType !== 'single' && tripForm.value.selectedDays.length === 0) {
      alert('Por favor selecciona al menos un día de la semana para viajes recurrentes');
      return;
    }

    if (tripForm.value.modality === 'round_trip' && tripForm.value.tripType !== 'single' && tripForm.value.selectedReturnDays.length === 0) {
      alert('Por favor selecciona los días de regreso para viajes de ida y vuelta');
      return;
    }

    if (tripForm.value.modality === 'round_trip' && !tripForm.value.returnTime) {
      alert('Por favor especifica la hora de regreso para viajes de ida y vuelta');
      return;
    }

    // Simular creación del viaje
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Preparar datos del viaje
    const tripData = {
      ...tripForm.value,
      origin: selectedOrigin.value,
      destination: selectedDestination.value,
      tripType: tripForm.value.tripType,
      modality: tripForm.value.modality,
      pricingModel: tripForm.value.pricingModel,
      weeklySchedule: tripForm.value.tripType === 'weekly' ? {
        days: tripForm.value.selectedDays,
        returnDays: tripForm.value.selectedReturnDays,
        pickupMargin: tripForm.value.pickupMargin,
        arrivalMargin: tripForm.value.arrivalMargin
      } : null
    };
    
    console.log('Creando viaje:', tripData);
    
    // TODO: Implementar lógica de creación real con dataService
    
    // Redirigir al dashboard con mensaje de éxito
    router.push({
      path: '/carpooling',
      query: { created: 'true' }
    });
  } catch (error) {
    console.error('Error creating trip:', error);
  } finally {
    isCreating.value = false;
  }
};

// Establecer fecha por defecto (hoy)
tripForm.value.departureDate = new Date().toISOString().split('T')[0];
</script>
