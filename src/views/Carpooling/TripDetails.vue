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

        <!-- Trip Details Content -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <!-- Trip Information -->
          <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div class="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 class="font-medium text-black dark:text-white">
                Información del Viaje
              </h3>
            </div>
            <div class="p-6.5">
              <div class="mb-4">
                <label class="mb-2.5 block text-black dark:text-white">
                  Origen
                </label>
                <p class="text-body-color">{{ trip.origin }}</p>
              </div>
              <div class="mb-4">
                <label class="mb-2.5 block text-black dark:text-white">
                  Destino
                </label>
                <p class="text-body-color">{{ trip.destination }}</p>
              </div>
              <div class="mb-4">
                <label class="mb-2.5 block text-black dark:text-white">
                  Fecha
                </label>
                <p class="text-body-color">{{ formatDate(trip.date) }}</p>
              </div>
              <div class="mb-4">
                <label class="mb-2.5 block text-black dark:text-white">
                  Hora de Salida
                </label>
                <p class="text-body-color">{{ trip.departureTime }}</p>
              </div>
              <div class="mb-4">
                <label class="mb-2.5 block text-black dark:text-white">
                  Precio por Asiento
                </label>
                <p class="text-2xl font-bold text-primary">{{ trip.pricePerSeat }}€</p>
              </div>
              <div class="mb-4">
                <label class="mb-2.5 block text-black dark:text-white">
                  Asientos Disponibles
                </label>
                <p class="text-body-color">{{ trip.availableSeats }} asientos</p>
              </div>
            </div>
          </div>

          <!-- Driver Information -->
          <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div class="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 class="font-medium text-black dark:text-white">
                Información del Conductor
              </h3>
            </div>
            <div class="p-6.5">
              <div class="mb-4">
                <label class="mb-2.5 block text-black dark:text-white">
                  Nombre
                </label>
                <p class="text-body-color">{{ trip.driver.name }}</p>
              </div>
              <div class="mb-4">
                <label class="mb-2.5 block text-black dark:text-white">
                  Vehículo
                </label>
                <p class="text-body-color">{{ trip.vehicle.make }} {{ trip.vehicle.model }} ({{ trip.vehicle.year }})</p>
              </div>
              <div class="mb-4">
                <label class="mb-2.5 block text-black dark:text-white">
                  Color
                </label>
                <p class="text-body-color">{{ trip.vehicle.color }}</p>
              </div>
              <div class="mb-4">
                <label class="mb-2.5 block text-black dark:text-white">
                  Matrícula
                </label>
                <p class="text-body-color">{{ trip.vehicle.licensePlate }}</p>
              </div>
              <div class="mb-4">
                <label class="mb-2.5 block text-black dark:text-white">
                  Descripción
                </label>
                <p class="text-body-color">{{ trip.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-6 flex justify-center space-x-4">
          <button
            class="flex items-center justify-center rounded-md bg-primary px-8 py-3 text-center font-medium text-white hover:bg-opacity-90"
          >
            Reservar Asiento
          </button>
          <button
            class="flex items-center justify-center rounded-md border border-stroke px-8 py-3 text-center font-medium text-black hover:bg-gray-50 dark:border-strokedark dark:text-white dark:hover:bg-gray-800"
          >
            Contactar Conductor
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Trip } from '@/types/carpooling';

// Mock data for demonstration
const trip = ref<Trip>({
  id: '1',
  driver: {
    id: '1',
    name: 'María García',
    email: 'maria@example.com',
    phone: '+34 600 123 456',
    rating: 4.8,
    totalTrips: 156
  },
  origin: 'Torrejón de Ardoz',
  destination: 'Madrid Centro',
  date: new Date('2024-01-15'),
  departureTime: '08:00',
  arrivalTime: '09:00',
  pricePerSeat: 8,
  availableSeats: 3,
  totalSeats: 4,
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

const formatDate = (date: Date) => {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script>
