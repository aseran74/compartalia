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
      <h1 class="text-2xl font-bold text-black dark:text-white">
        Buscar Viajes
      </h1>
      <p class="text-sm font-medium text-body-color">
        Encuentra viajes compatibles con tu ruta
      </p>
    </div>

    <!-- Formulario de Búsqueda -->
    <div class="mb-8 rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <form @submit.prevent="searchTrips" class="space-y-6">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <!-- Origen -->
                      <div>
                        <label class="mb-2.5 block text-black dark:text-white">
                          Origen
                        </label>
                        <AddressAutocomplete
                          v-model="searchForm.origin"
                          placeholder="¿Desde dónde viajas?"
                          :required="true"
                          @select="onOriginSelect"
                        />
                      </div>

          <!-- Destino -->
          <div>
            <label class="mb-2.5 block text-black dark:text-white">
              Destino
            </label>
            <AddressAutocomplete
              v-model="searchForm.destination"
              placeholder="¿Hacia dónde vas?"
              :required="true"
              @select="onDestinationSelect"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <!-- Fecha -->
          <div>
            <label class="mb-2.5 block text-black dark:text-white">
              Fecha
            </label>
            <input
              v-model="searchForm.date"
              type="date"
              class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              required
            />
          </div>

          <!-- Hora -->
          <div>
            <label class="mb-2.5 block text-black dark:text-white">
              Hora (opcional)
            </label>
            <input
              v-model="searchForm.time"
              type="time"
              class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            />
          </div>

          <!-- Pasajeros -->
          <div>
            <label class="mb-2.5 block text-black dark:text-white">
              Pasajeros
            </label>
            <select
              v-model="searchForm.passengers"
              class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            >
              <option value="1">1 pasajero</option>
              <option value="2">2 pasajeros</option>
              <option value="3">3 pasajeros</option>
              <option value="4">4 pasajeros</option>
            </select>
          </div>
        </div>

        <!-- Filtros Avanzados -->
        <div class="border-t border-stroke pt-6 dark:border-strokedark">
          <button
            type="button"
            @click="showAdvancedFilters = !showAdvancedFilters"
            class="flex items-center text-sm font-medium text-primary hover:text-primary/80"
          >
            <span>Filtros Avanzados</span>
            <svg 
              class="ml-2 h-4 w-4 transition-transform"
              :class="{ 'rotate-180': showAdvancedFilters }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <div v-if="showAdvancedFilters" class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <!-- Modelo de Precios -->
            <div>
              <label class="mb-2.5 block text-black dark:text-white">
                Tipo de Precio
              </label>
              <select
                v-model="searchForm.pricingModel"
                class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              >
                <option value="">Cualquiera</option>
                <option value="per_seat">Por asiento</option>
                <option value="monthly_fixed">Precio mensual</option>
              </select>
            </div>

            <!-- Precio Máximo -->
            <div>
              <label class="mb-2.5 block text-black dark:text-white">
                Precio Máximo (€)
              </label>
              <input
                v-model.number="searchForm.maxPrice"
                type="number"
                placeholder="Sin límite"
                class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              />
            </div>

            <!-- Desviación Máxima -->
            <div>
              <label class="mb-2.5 block text-black dark:text-white">
                Desviación Máxima
              </label>
              <select
                v-model="searchForm.maxDeviation"
                class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              >
                <option value="500">500m</option>
                <option value="1000">1km</option>
                <option value="2000">2km</option>
                <option value="5000">5km</option>
              </select>
            </div>

            <!-- Fumar -->
            <div>
              <label class="mb-2.5 block text-black dark:text-white">
                Fumar
              </label>
              <select
                v-model="searchForm.smokingAllowed"
                class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              >
                <option value="">Cualquiera</option>
                <option value="true">Permitido</option>
                <option value="false">No permitido</option>
              </select>
            </div>

            <!-- Mascotas -->
            <div>
              <label class="mb-2.5 block text-black dark:text-white">
                Mascotas
              </label>
              <select
                v-model="searchForm.petsAllowed"
                class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              >
                <option value="">Cualquiera</option>
                <option value="true">Permitidas</option>
                <option value="false">No permitidas</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Botón de Búsqueda -->
        <div class="text-center">
          <button
            type="submit"
            :disabled="isSearching"
            class="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-center font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
          >
            <svg v-if="isSearching" class="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isSearching ? 'Buscando...' : 'Buscar Viajes' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Resultados de Búsqueda -->
    <div v-if="searchResults.length > 0" class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-black dark:text-white">
          {{ searchResults.length }} viajes encontrados
        </h2>
        <div class="flex items-center space-x-4">
          <select
            v-model="sortBy"
            class="rounded border border-stroke bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input"
          >
            <option value="price">Precio</option>
            <option value="departureTime">Hora de salida</option>
            <option value="compatibility">Compatibilidad</option>
          </select>
        </div>
      </div>

      <!-- Lista de Viajes -->
      <div class="space-y-4">
        <div
          v-for="trip in sortedResults"
          :key="trip.id"
          class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <!-- Información del Conductor -->
              <div class="mb-4 flex items-center space-x-3">
                <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <img
                    v-if="trip.driver.avatar"
                    :src="trip.driver.avatar"
                    :alt="trip.driver.name"
                    class="h-10 w-10 rounded-full object-cover"
                  />
                  <svg v-else class="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium text-black dark:text-white">{{ trip.driver.name }}</h3>
                  <div class="flex items-center space-x-2">
                    <div class="flex items-center">
                      <svg class="h-4 w-4 text-warning" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <span class="ml-1 text-sm text-body-color">{{ trip.driver.rating.toFixed(1) }}</span>
                    </div>
                    <span class="text-sm text-body-color">• {{ trip.driver.totalTrips }} viajes</span>
                  </div>
                </div>
              </div>

              <!-- Ruta Expandible - DEBUG -->
              <div class="mb-4">
                <DebugTripRoute :trip="trip" />
              </div>

              <!-- Detalles del Viaje -->
              <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <p class="text-sm text-body-color">Salida</p>
                  <p class="font-medium text-black dark:text-white">
                    {{ formatTime(trip.departureTime) }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-body-color">Duración</p>
                  <p class="font-medium text-black dark:text-white">
                    {{ trip.route.estimatedDuration }}min
                  </p>
                </div>
                <div>
                  <p class="text-sm text-body-color">Asientos</p>
                  <p class="font-medium text-black dark:text-white">
                    {{ trip.availableSeats }} disponibles
                  </p>
                </div>
                <div>
                  <p class="text-sm text-body-color">Vehículo</p>
                  <p class="font-medium text-black dark:text-white">
                    {{ trip.vehicle.make }} {{ trip.vehicle.model }}
                  </p>
                </div>
              </div>

              <!-- Características del Vehículo -->
              <div class="mt-4 flex flex-wrap gap-2">
                <span v-if="trip.vehicle.features.airConditioning" class="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                  Aire acondicionado
                </span>
                <span v-if="trip.vehicle.features.wifi" class="rounded-full bg-secondary/10 px-3 py-1 text-xs text-secondary">
                  WiFi
                </span>
                <span v-if="trip.vehicle.features.chargingPorts" class="rounded-full bg-success/10 px-3 py-1 text-xs text-success">
                  Carga USB
                </span>
                <span v-if="trip.smokingAllowed" class="rounded-full bg-warning/10 px-3 py-1 text-xs text-warning">
                  Fumar permitido
                </span>
                <span v-if="trip.petsAllowed" class="rounded-full bg-info/10 px-3 py-1 text-xs text-info">
                  Mascotas
                </span>
              </div>
            </div>

            <!-- Precio y Acciones -->
            <div class="ml-6 text-right">
              <div class="mb-4">
                <p class="text-2xl font-bold text-black dark:text-white">
                  €{{ trip.pricingModel === 'monthly_fixed' ? trip.monthlyPrice : trip.pricePerSeat }}
                </p>
                <p class="text-sm text-body-color">
                  {{ trip.pricingModel === 'monthly_fixed' ? 'mensual' : 'por asiento' }}
                </p>
                <div v-if="trip.compatibilityScore" class="mt-2">
                  <span class="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    {{ Math.round(trip.compatibilityScore * 100) }}% compatible
                  </span>
                </div>
              </div>
              <button
                @click="requestBooking(trip)"
                class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
              >
                {{ trip.pricingModel === 'monthly_fixed' ? 'Suscribirse' : 'Solicitar Viaje' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

                <!-- Sin Resultados -->
                <div v-else-if="hasSearched && searchResults.length === 0" class="text-center py-12">
                  <svg class="mx-auto h-12 w-12 text-body-color" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <h3 class="mt-4 text-lg font-medium text-black dark:text-white">
                    No se encontraron viajes
                  </h3>
                  <p class="mt-2 text-sm text-body-color">
                    Intenta ajustar tus filtros de búsqueda o crear tu propio viaje.
                  </p>
                  <div class="mt-6">
                    <button
                      @click="navigateToCreateTrip"
                      class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
                    >
                      Crear Viaje
                    </button>
                  </div>
                </div>

              <!-- Mapa de Ruta -->
              <div v-if="selectedOrigin && selectedDestination" class="mt-8">
                <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
                    Ruta Calculada
                  </h3>
                  <p class="mb-4 text-sm text-body-color">
                    Visualiza la ruta exacta entre {{ selectedOrigin.name }} y {{ selectedDestination.name }} con puntos de recogida disponibles.
                  </p>
            <!-- Mapa temporalmente deshabilitado para debug -->
            <div class="p-4 bg-gray-100 rounded-lg">
              <p class="text-gray-600">Mapa temporalmente deshabilitado para debug</p>
              <p class="text-sm text-gray-500">Origen: {{ selectedOrigin?.name }}</p>
              <p class="text-sm text-gray-500">Destino: {{ selectedDestination?.name }}</p>
            </div>
                </div>
              </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AppSidebar from '@/components/layout/AppSidebar.vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import AddressAutocomplete from '@/components/carpooling/AddressAutocomplete.vue';
// import SimpleRouteMap from '@/components/carpooling/SimpleRouteMap.vue';
// import GoogleRouteMap from '@/components/carpooling/GoogleRouteMap.vue';
// import SimpleTripRoute from '@/components/carpooling/SimpleTripRoute.vue';
import DebugTripRoute from '@/components/carpooling/DebugTripRoute.vue';
import { useCarpoolingData } from '@/composables/useCarpoolingData';
import { useSidebar } from '@/composables/useSidebar';
import type { Trip, TripFilters, Location } from '@/types/carpooling';

const router = useRouter();
const { isExpanded } = useSidebar();

        // Detectar si tenemos API key de Google Maps (temporalmente deshabilitado)
        // const hasGoogleMapsApi = computed(() => {
        //   return !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        // });
const { 
  searchTripsAdvanced, 
  searchTripsByProximity, 
  searchCompatibleRoutes,
  loading, 
  error 
} = useCarpoolingData();

// Ubicaciones seleccionadas
const selectedOrigin = ref<Location | null>(null);
const selectedDestination = ref<Location | null>(null);

// Estado del formulario
const searchForm = ref({
  origin: '',
  destination: '',
  date: '',
  time: '',
  passengers: 1,
  pricingModel: '',
  maxPrice: null as number | null,
  maxDeviation: 2000,
  smokingAllowed: '',
  petsAllowed: ''
});

// Estado de la UI
const isSearching = ref(false);
const hasSearched = ref(false);
const showAdvancedFilters = ref(false);
const sortBy = ref('price');

// Resultados de búsqueda (mock data por ahora)
const searchResults = ref<Trip[]>([]);

// Datos mock para demostración
const mockTrips: Trip[] = [
  {
    id: '1',
    driver: {
      id: '1',
      name: 'María García',
      email: 'maria@email.com',
      phone: '+34600123456',
      rating: 4.8,
      totalTrips: 45,
      preferences: {
        maxDeviation: 1000,
        maxWaitTime: 10,
        walkDistance: 300,
        preferredHubs: [],
        smokingAllowed: false,
        petsAllowed: true,
        musicPreference: 'low'
      },
      verified: true,
      createdAt: new Date()
    },
    route: {
      id: '1',
      origin: {
        id: '1',
        name: 'Majadahonda',
        address: 'Majadahonda, Madrid',
        coordinates: { lat: 40.4727, lng: -3.8718 },
        type: 'origin'
      },
      destination: {
        id: '2',
        name: 'Plaza España',
        address: 'Plaza España, Madrid',
        coordinates: { lat: 40.4238, lng: -3.7133 },
        type: 'destination'
      },
      waypoints: [
        {
          id: '3',
          name: 'Moncloa',
          address: 'Moncloa, Madrid',
          coordinates: { lat: 40.4350, lng: -3.7194 },
          type: 'waypoint'
        }
      ],
      distance: 15000,
      estimatedDuration: 25
    },
    departureTime: new Date('2024-01-15T08:00:00'),
    arrivalTime: new Date('2024-01-15T08:25:00'),
    availableSeats: 3,
    pricePerSeat: 8,
    currency: 'EUR',
    status: 'active',
    vehicle: {
      id: '1',
      make: 'Toyota',
      model: 'Prius',
      year: 2020,
      color: 'Blanco',
      licensePlate: '1234ABC',
      seats: 5,
      features: {
        airConditioning: true,
        smokingAllowed: false,
        petsAllowed: true,
        luggageSpace: true,
        wifi: true,
        chargingPorts: true
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Computed para resultados ordenados
const sortedResults = computed(() => {
  const results = [...searchResults.value];
  
  switch (sortBy.value) {
    case 'price':
      return results.sort((a, b) => a.pricePerSeat - b.pricePerSeat);
    case 'departureTime':
      return results.sort((a, b) => a.departureTime.getTime() - b.departureTime.getTime());
    case 'compatibility':
      // Por ahora ordenamos por rating del conductor
      return results.sort((a, b) => b.driver.rating - a.driver.rating);
    default:
      return results;
  }
});

// Métodos
        const searchTrips = async () => {
          isSearching.value = true;
          hasSearched.value = true;
          
          try {
            // Búsqueda avanzada con filtros
            const filters = {
              originName: searchForm.value.origin || undefined,
              destinationName: searchForm.value.destination || undefined,
              originLat: selectedOrigin.value?.lat || undefined,
              originLng: selectedOrigin.value?.lng || undefined,
              destinationLat: selectedDestination.value?.lat || undefined,
              destinationLng: selectedDestination.value?.lng || undefined,
              departureDate: searchForm.value.date || undefined,
              departureTimeFrom: searchForm.value.time || undefined,
              departureTimeTo: searchForm.value.time || undefined,
              maxPrice: searchForm.value.maxPrice || undefined,
              pricingModel: searchForm.value.pricingModel || undefined,
              maxDeviationKm: searchForm.value.maxDeviation / 1000, // Convertir a km
              limit: 50
            };

            console.log('🔍 Buscando viajes con filtros:', filters);
            const results = await searchTripsAdvanced(filters);
            console.log('📊 Resultados encontrados:', results);
    
    // Convertir resultados al formato esperado
    searchResults.value = results.map(trip => ({
      id: trip.id,
      driverId: trip.driverId,
      origin: trip.origin,
      destination: trip.destination,
      departureTime: new Date(trip.departureTime),
      availableSeats: trip.availableSeats,
      pricePerSeat: trip.pricePerSeat,
      monthlyPrice: trip.monthlyPrice,
      pricingModel: trip.pricingModel,
      description: trip.description,
      status: trip.status,
      // Datos del conductor
      driver: {
        id: trip.driverId,
        name: trip.driverName || 'Conductor',
        email: '',
        phone: trip.driverPhone || '',
        rating: 4.5,
        totalTrips: 0,
        preferences: {},
        verified: true,
        createdAt: new Date()
      },
      // Datos del vehículo (por defecto)
      vehicle: {
        id: '1',
        make: 'Toyota',
        model: 'Prius',
        year: 2020,
        color: 'Blanco',
        licensePlate: '1234ABC',
        seats: 5,
        features: {
          airConditioning: true,
          smokingAllowed: false,
          petsAllowed: true,
          luggageSpace: true,
          wifi: true,
          chargingPorts: true
        }
      },
      // Datos de la ruta
      route: {
        id: '1',
        origin: trip.origin,
        destination: trip.destination,
        waypoints: [],
        distance: trip.distanceFromOrigin || 0,
        estimatedDuration: 25
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
  } catch (error) {
    console.error('Error searching trips:', error);
    searchResults.value = [];
  } finally {
    isSearching.value = false;
  }
};

const requestBooking = (trip: Trip) => {
  // TODO: Implementar solicitud de reserva
  router.push(`/carpooling/trip/${trip.id}`);
};

const navigateToCreateTrip = () => {
  router.push('/carpooling/create-trip');
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

// Handlers para la selección de ubicaciones
const onOriginSelect = (location: Location) => {
  selectedOrigin.value = location;
  searchForm.value.origin = location.name;
};

const onDestinationSelect = (location: Location) => {
  selectedDestination.value = location;
  searchForm.value.destination = location.name;
};

// Establecer fecha por defecto (hoy)
searchForm.value.date = new Date().toISOString().split('T')[0];
</script>
