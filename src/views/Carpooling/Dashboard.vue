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
            Compartalia - Carpooling
          </h1>
          <p class="text-sm font-medium text-body-color">
            Encuentra o comparte viajes de manera inteligente
          </p>
        </div>

        <!-- Quick Actions -->
        <div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <!-- Crear Viaje -->
          <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-primary">
              <svg class="fill-white" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17C15.24 5.06 14.32 5 13.4 5H10.6C9.68 5 8.76 5.06 7.83 5.17L10.5 2.5L9 1L3 7V9C3 10.1 3.9 11 5 11V20C5 21.1 5.9 22 7 22H9C10.1 22 11 21.1 11 20V16H13V20C13 21.1 13.9 22 15 22H17C18.1 22 19 21.1 19 20V11C20.1 11 21 10.1 21 9Z"/>
              </svg>
            </div>
            <div class="mt-4">
              <h4 class="text-title-md font-bold text-black dark:text-white">
                Crear Viaje
              </h4>
              <p class="text-sm font-medium">
                Ofrece un asiento en tu vehículo
              </p>
              <button 
                @click="navigateToCreateTrip"
                class="mt-2 text-sm text-primary hover:text-primary/80"
              >
                Crear ahora →
              </button>
            </div>
          </div>

          <!-- Buscar Viajes -->
          <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-secondary">
              <svg class="fill-white" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3S3 5.91 3 9.5S5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14Z"/>
              </svg>
            </div>
            <div class="mt-4">
              <h4 class="text-title-md font-bold text-black dark:text-white">
                Buscar Viajes
              </h4>
              <p class="text-sm font-medium">
                Encuentra viajes compatibles
              </p>
              <button 
                @click="navigateToSearchTrips"
                class="mt-2 text-sm text-secondary hover:text-secondary/80"
              >
                Buscar ahora →
              </button>
            </div>
          </div>

          <!-- Mis Viajes -->
          <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-success">
              <svg class="fill-white" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 1H8C6.34 1 5 2.34 5 4V20C5 21.66 6.34 23 8 23H16C17.66 23 19 21.66 19 20V4C19 2.34 17.66 1 16 1ZM17 20H7V4C7 3.45 7.45 3 8 3H16C16.55 3 17 3.45 17 4V20ZM12 6C10.34 6 9 7.34 9 9S10.34 12 12 12S15 10.66 15 9S13.66 6 12 6ZM6 18H18V17C18 15 14 13.5 12 13.5S6 15 6 17V18Z"/>
              </svg>
            </div>
            <div class="mt-4">
              <h4 class="text-title-md font-bold text-black dark:text-white">
                Mis Viajes
              </h4>
              <p class="text-sm font-medium">
                Gestiona tus viajes activos
              </p>
              <button 
                @click="navigateToMyTrips"
                class="mt-2 text-sm text-success hover:text-success/80"
              >
                Ver mis viajes →
              </button>
            </div>
          </div>

          <!-- Mensajes -->
          <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-warning">
              <svg class="fill-white" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z"/>
              </svg>
            </div>
            <div class="mt-4">
              <h4 class="text-title-md font-bold text-black dark:text-white">
                Mensajes
              </h4>
              <p class="text-sm font-medium">
                Chat con otros usuarios
              </p>
              <button 
                @click="navigateToMessages"
                class="mt-2 text-sm text-warning hover:text-warning/80"
              >
                Ver mensajes →
              </button>
            </div>
          </div>
        </div>

        <!-- Estadísticas -->
        <div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <!-- Viajes Activos -->
          <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-body-color">Viajes Activos</p>
                <h4 class="text-2xl font-bold text-black dark:text-white">12</h4>
              </div>
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <svg class="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Pasajeros Hoy -->
          <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-body-color">Pasajeros Hoy</p>
                <h4 class="text-2xl font-bold text-black dark:text-white">8</h4>
              </div>
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                <svg class="h-6 w-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Ahorro Total -->
          <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-body-color">Ahorro Total</p>
                <h4 class="text-2xl font-bold text-black dark:text-white">€156</h4>
              </div>
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <svg class="h-6 w-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- CO2 Ahorrado -->
          <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-body-color">CO2 Ahorrado</p>
                <h4 class="text-2xl font-bold text-black dark:text-white">24kg</h4>
              </div>
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                <svg class="h-6 w-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Viajes Recientes -->
        <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div class="border-b border-stroke px-6 py-4 dark:border-strokedark">
            <h3 class="font-medium text-black dark:text-white">
              Viajes Recientes
            </h3>
          </div>
          <div class="p-6">
            <div class="flex flex-col space-y-4">
              <!-- Viaje 1 -->
              <div class="flex items-center justify-between rounded-lg border border-stroke p-4 dark:border-strokedark">
                <div class="flex items-center space-x-4">
                  <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg class="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-black dark:text-white">Majadahonda → Moncloa</h4>
                    <p class="text-sm text-body-color">Hoy, 8:00 AM • 3 asientos disponibles</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-medium text-black dark:text-white">€8</p>
                  <p class="text-sm text-body-color">por asiento</p>
                </div>
              </div>

              <!-- Viaje 2 -->
              <div class="flex items-center justify-between rounded-lg border border-stroke p-4 dark:border-strokedark">
                <div class="flex items-center space-x-4">
                  <div class="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <svg class="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-black dark:text-white">Las Rozas → Plaza España</h4>
                    <p class="text-sm text-body-color">Mañana, 7:30 AM • 2 asientos disponibles</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-medium text-black dark:text-white">€12</p>
                  <p class="text-sm text-body-color">por asiento</p>
                </div>
              </div>

              <!-- Viaje 3 -->
              <div class="flex items-center justify-between rounded-lg border border-stroke p-4 dark:border-strokedark">
                <div class="flex items-center space-x-4">
                  <div class="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                    <svg class="h-5 w-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-black dark:text-white">Pozuelo → Nuevos Ministerios</h4>
                    <p class="text-sm text-body-color">Lunes, 8:15 AM • 1 asiento disponible</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-medium text-black dark:text-white">€6</p>
                  <p class="text-sm text-body-color">por asiento</p>
                </div>
              </div>
            </div>

            <div class="mt-6 text-center">
              <button 
                @click="navigateToSearchTrips"
                class="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90"
              >
                Ver Todos los Viajes
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppSidebar from '@/components/layout/AppSidebar.vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import { useCarpoolingData } from '@/composables/useCarpoolingData';
import { useSidebar } from '@/composables/useSidebar';

const router = useRouter();
const { isExpanded } = useSidebar();
const { 
  loadAllData, 
  loadTrips, 
  loadBookings, 
  trips, 
  bookings, 
  loading, 
  error 
} = useCarpoolingData();

// Estado reactivo
const stats = ref({
  totalTrips: 0,
  activeBookings: 0,
  totalSaved: 0,
  rating: 4.5
});

const recentTrips = ref([]);
const upcomingBookings = ref([]);

// Cargar datos al montar el componente
onMounted(async () => {
  await loadAllData();
  updateStats();
  updateRecentData();
});

const updateStats = () => {
  stats.value.totalTrips = trips.value.length;
  stats.value.activeBookings = bookings.value.filter(b => b.status === 'confirmed').length;
  stats.value.totalSaved = bookings.value
    .filter(b => b.status === 'confirmed')
    .reduce((total, booking) => total + booking.totalPrice, 0);
};

const updateRecentData = () => {
  // Últimos 5 viajes creados
  recentTrips.value = trips.value
    .slice(0, 5)
    .map(trip => ({
      id: trip.id,
      from: trip.origin.name,
      to: trip.destination.name,
      time: new Date(trip.departureTime).toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      date: new Date(trip.departureTime).toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
      }),
      availableSeats: trip.availableSeats,
      price: trip.pricePerSeat
    }));

  // Próximas 5 reservas
  upcomingBookings.value = bookings.value
    .filter(booking => booking.status === 'confirmed' || booking.status === 'pending')
    .slice(0, 5)
    .map(booking => ({
      id: booking.id,
      from: 'Origen', // Se puede obtener del trip
      to: 'Destino', // Se puede obtener del trip
      time: '08:00', // Se puede obtener del trip
      date: new Date(booking.createdAt).toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
      }),
      driver: 'Conductor', // Se puede obtener del trip
      status: booking.status
    }));
};

const navigateToCreateTrip = () => {
  router.push('/carpooling/create-trip');
};

const navigateToSearchTrips = () => {
  router.push('/carpooling/search-trips');
};

const navigateToMyTrips = () => {
  router.push('/carpooling/my-trips');
};

const navigateToMessages = () => {
  router.push('/carpooling/messages');
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};
</script>