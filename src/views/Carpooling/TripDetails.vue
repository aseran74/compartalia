<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <AppSidebar />
    
    <!-- Main Content -->
    <div class="flex flex-1 flex-col overflow-hidden lg:ml-[90px]">
      <!-- Header -->
      <AppHeader />
      
      <!-- Page Content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6 xl:p-7.5 dark:bg-boxdark">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-black dark:text-white">
            Detalles del Viaje
          </h1>
          <p class="text-sm font-medium text-body-color">
            Información completa sobre este viaje
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
      <!-- Información Principal -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Información de la Ruta -->
        <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
            Ruta del Viaje
          </h3>
          
          <div class="flex items-center space-x-4">
            <div class="flex flex-col items-center">
              <div class="h-4 w-4 rounded-full bg-primary"></div>
              <div class="mt-2 h-12 w-0.5 bg-body-color"></div>
              <div class="h-4 w-4 rounded-full bg-secondary"></div>
            </div>
            <div class="flex-1">
              <div class="mb-2">
                <h4 class="text-lg font-medium text-black dark:text-white">
                  Majadahonda → Plaza España
                </h4>
                <p class="text-sm text-body-color">
                  Mañana, 8:00 AM • Duración estimada: 25 minutos
                </p>
              </div>
              
              <div class="grid grid-cols-2 gap-4 md:grid-cols-3">
                <div>
                  <p class="text-sm text-body-color">Distancia</p>
                  <p class="font-medium text-black dark:text-white">15.2 km</p>
                </div>
                <div>
                  <p class="text-sm text-body-color">Precio</p>
                  <p class="font-medium text-black dark:text-white">€8 por asiento</p>
                </div>
                <div>
                  <p class="text-sm text-body-color">Asientos</p>
                  <p class="font-medium text-black dark:text-white">3 disponibles</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Puntos de Recogida -->
          <div class="mt-6">
            <h4 class="mb-3 text-sm font-medium text-black dark:text-white">
              Puntos de Recogida
            </h4>
            <div class="space-y-2">
              <div class="flex items-center space-x-3 rounded-lg border border-stroke p-3 dark:border-strokedark">
                <div class="h-2 w-2 rounded-full bg-primary"></div>
                <div>
                  <p class="text-sm font-medium text-black dark:text-white">Majadahonda Centro</p>
                  <p class="text-xs text-body-color">8:00 AM - Punto de inicio</p>
                </div>
              </div>
              <div class="flex items-center space-x-3 rounded-lg border border-stroke p-3 dark:border-strokedark">
                <div class="h-2 w-2 rounded-full bg-secondary"></div>
                <div>
                  <p class="text-sm font-medium text-black dark:text-white">Moncloa</p>
                  <p class="text-xs text-body-color">8:15 AM - Parada intermedia</p>
                </div>
              </div>
              <div class="flex items-center space-x-3 rounded-lg border border-stroke p-3 dark:border-strokedark">
                <div class="h-2 w-2 rounded-full bg-success"></div>
                <div>
                  <p class="text-sm font-medium text-black dark:text-white">Plaza España</p>
                  <p class="text-xs text-body-color">8:25 AM - Destino final</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Información del Conductor -->
        <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
            Información del Conductor
          </h3>
          
          <div class="flex items-start space-x-4">
            <div class="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <img
                v-if="trip.driver.avatar"
                :src="trip.driver.avatar"
                :alt="trip.driver.name"
                class="h-16 w-16 rounded-full object-cover"
              />
              <svg v-else class="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-lg font-medium text-black dark:text-white">
                    {{ trip.driver.name }}
                  </h4>
                  <div class="flex items-center space-x-2">
                    <div class="flex items-center">
                      <svg class="h-4 w-4 text-warning" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <span class="ml-1 text-sm text-body-color">{{ trip.driver.rating.toFixed(1) }}</span>
                    </div>
                    <span class="text-sm text-body-color">• {{ trip.driver.totalTrips }} viajes</span>
                    <div v-if="trip.driver.verified" class="rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">
                      Verificado
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2">
                  <button class="rounded-md border border-stroke px-3 py-1 text-sm text-body-color hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-700">
                    Ver Perfil
                  </button>
                  <button class="rounded-md bg-primary px-3 py-1 text-sm font-medium text-white hover:bg-opacity-90">
                    Chat
                  </button>
                </div>
              </div>
              
              <p class="mt-2 text-sm text-body-color">
                Conductor experimentado y puntual. Siempre respeto los horarios y mantengo el vehículo limpio.
              </p>
            </div>
          </div>
        </div>

        <!-- Información del Vehículo -->
        <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
            Información del Vehículo
          </h3>
          
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h4 class="mb-3 text-sm font-medium text-black dark:text-white">
                {{ trip.vehicle.make }} {{ trip.vehicle.model }}
              </h4>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-body-color">Año:</span>
                  <span class="text-sm text-black dark:text-white">{{ trip.vehicle.year }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-body-color">Color:</span>
                  <span class="text-sm text-black dark:text-white">{{ trip.vehicle.color }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-body-color">Asientos:</span>
                  <span class="text-sm text-black dark:text-white">{{ trip.vehicle.seats }} plazas</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-body-color">Matrícula:</span>
                  <span class="text-sm text-black dark:text-white">{{ trip.vehicle.licensePlate }}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 class="mb-3 text-sm font-medium text-black dark:text-white">
                Características
              </h4>
              <div class="space-y-2">
                <div v-if="trip.vehicle.features.airConditioning" class="flex items-center space-x-2">
                  <svg class="h-4 w-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span class="text-sm text-black dark:text-white">Aire acondicionado</span>
                </div>
                <div v-if="trip.vehicle.features.wifi" class="flex items-center space-x-2">
                  <svg class="h-4 w-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span class="text-sm text-black dark:text-white">WiFi</span>
                </div>
                <div v-if="trip.vehicle.features.chargingPorts" class="flex items-center space-x-2">
                  <svg class="h-4 w-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span class="text-sm text-black dark:text-white">Carga USB</span>
                </div>
                <div v-if="trip.vehicle.features.luggageSpace" class="flex items-center space-x-2">
                  <svg class="h-4 w-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span class="text-sm text-black dark:text-white">Espacio para equipaje</span>
                </div>
                <div v-if="trip.smokingAllowed" class="flex items-center space-x-2">
                  <svg class="h-4 w-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span class="text-sm text-black dark:text-white">Fumar permitido</span>
                </div>
                <div v-if="trip.petsAllowed" class="flex items-center space-x-2">
                  <svg class="h-4 w-4 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span class="text-sm text-black dark:text-white">Mascotas permitidas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Descripción del Viaje -->
        <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
            Descripción del Viaje
          </h3>
          
          <p class="text-sm text-body-color">
            {{ trip.description || 'Viaje regular de lunes a viernes. Salgo puntual y suelo hacer una parada en Moncloa para recoger a otros pasajeros. El vehículo está siempre limpio y con aire acondicionado. Prefiero música suave durante el trayecto.' }}
          </p>
        </div>
      </div>

      <!-- Panel Lateral -->
      <div class="lg:col-span-1 space-y-6">
        <!-- Acciones -->
        <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
            Acciones
          </h3>
          
          <div class="space-y-3">
            <button class="w-full rounded-md bg-primary px-4 py-2 text-center font-medium text-white hover:bg-opacity-90">
              Solicitar Viaje
            </button>
            <button class="w-full rounded-md border border-stroke px-4 py-2 text-center font-medium text-body-color hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-700">
              Chat con el Conductor
            </button>
            <button class="w-full rounded-md border border-stroke px-4 py-2 text-center font-medium text-body-color hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-700">
              Compartir Viaje
            </button>
            <button class="w-full rounded-md border border-stroke px-4 py-2 text-center font-medium text-body-color hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-700">
              Reportar Problema
            </button>
          </div>
        </div>

        <!-- Resumen del Precio -->
        <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
            Resumen del Precio
          </h3>
          
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-body-color">Precio por asiento:</span>
              <span class="text-sm font-medium text-black dark:text-white">€{{ trip.pricePerSeat }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-body-color">Comisión de la plataforma:</span>
              <span class="text-sm font-medium text-black dark:text-white">€{{ (trip.pricePerSeat * 0.1).toFixed(2) }}</span>
            </div>
            <div class="border-t border-stroke pt-3 dark:border-strokedark">
              <div class="flex justify-between">
                <span class="font-medium text-black dark:text-white">Total a pagar:</span>
                <span class="font-bold text-black dark:text-white">€{{ (trip.pricePerSeat * 1.1).toFixed(2) }}</span>
              </div>
            </div>
          </div>
          
          <p class="mt-3 text-xs text-body-color">
            El pago se realizará al conductor al finalizar el viaje.
          </p>
        </div>

        <!-- Otros Viajes Similares -->
        <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h3 class="mb-4 text-lg font-semibold text-black dark:text-white">
            Viajes Similares
          </h3>
          
          <div class="space-y-3">
            <div class="rounded-lg border border-stroke p-3 dark:border-strokedark">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-black dark:text-white">Majadahonda → Moncloa</p>
                  <p class="text-xs text-body-color">8:30 AM • €6</p>
                </div>
                <button class="text-xs text-primary hover:text-primary/80">Ver</button>
              </div>
            </div>
            
            <div class="rounded-lg border border-stroke p-3 dark:border-strokedark">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-black dark:text-white">Majadahonda → Plaza España</p>
                  <p class="text-xs text-body-color">9:00 AM • €7</p>
                </div>
                <button class="text-xs text-primary hover:text-primary/80">Ver</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Trip } from '@/types/carpooling';

// Datos mock del viaje
const trip = ref<Trip>({
  id: '1',
  driver: {
    id: '1',
    name: 'María García',
    email: 'maria@email.com',
    phone: '+34600123456',
    avatar: '',
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
    distance: 15200,
    estimatedDuration: 25
  },
  departureTime: new Date('2024-01-15T08:00:00'),
  arrivalTime: new Date('2024-01-15T08:25:00'),
  availableSeats: 3,
  pricePerSeat: 8,
  currency: 'EUR',
  status: 'active',
  description: 'Viaje regular de lunes a viernes. Salgo puntual y suelo hacer una parada en Moncloa para recoger a otros pasajeros. El vehículo está siempre limpio y con aire acondicionado. Prefiero música suave durante el trayecto.',
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
});
</script>
