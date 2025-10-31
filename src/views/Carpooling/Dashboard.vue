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
        <div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <!-- Viajes Activos -->
          <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-body-color">Viajes Activos</p>
                <h4 class="text-2xl font-bold text-black dark:text-white">{{ stats.totalTrips }}</h4>
              </div>
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <svg class="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Reservas Confirmadas -->
          <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-body-color">Reservas Confirmadas</p>
                <h4 class="text-2xl font-bold text-black dark:text-white">{{ stats.activeBookings }}</h4>
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
                <h4 class="text-2xl font-bold text-black dark:text-white">{{ formatCurrency(stats.totalSaved) }}</h4>
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
                <h4 class="text-2xl font-bold text-black dark:text-white">{{ stats.co2Saved }}kg</h4>
              </div>
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                <svg class="h-6 w-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Amigos Conectados -->
          <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-body-color">Amigos Conectados</p>
                <h4 class="text-2xl font-bold text-black dark:text-white">{{ stats.friendsCount }}</h4>
              </div>
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <svg class="h-6 w-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
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
            <!-- Estado de carga -->
            <div v-if="loading" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p class="mt-2 text-body-color">Cargando viajes...</p>
            </div>

            <!-- Sin viajes -->
            <div v-else-if="recentTrips.length === 0" class="text-center py-8">
              <div class="text-4xl mb-4">🚗</div>
              <h3 class="text-lg font-semibold text-black dark:text-white mb-2">No hay viajes recientes</h3>
              <p class="text-body-color mb-4">¡Crea tu primer viaje o busca viajes disponibles!</p>
            </div>

            <!-- Lista de viajes -->
            <div v-else class="flex flex-col space-y-4">
              <div 
                v-for="trip in recentTrips" 
                :key="trip.id"
                class="flex items-center justify-between rounded-lg border border-stroke p-4 dark:border-strokedark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div class="flex items-center space-x-4">
                  <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg class="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-black dark:text-white">{{ trip.origin }} → {{ trip.destination }}</h4>
                    <p class="text-sm text-body-color">{{ formatDate(trip.createdAt) }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-medium text-black dark:text-white">{{ formatCurrency(trip.price) }}</p>
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

        <!-- Mis Reservas Recientes -->
        <div class="mt-8 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div class="border-b border-stroke px-6 py-4 dark:border-strokedark">
            <h3 class="font-medium text-black dark:text-white">
              Mis Reservas Recientes
            </h3>
          </div>
          <div class="p-6">
            <!-- Estado de carga -->
            <div v-if="loading" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p class="mt-2 text-body-color">Cargando reservas...</p>
            </div>

            <!-- Sin reservas -->
            <div v-else-if="recentBookings.length === 0" class="text-center py-8">
              <div class="text-4xl mb-4">🎫</div>
              <h3 class="text-lg font-semibold text-black dark:text-white mb-2">No tienes reservas</h3>
              <p class="text-body-color mb-4">¡Busca y reserva tu próximo viaje!</p>
            </div>

            <!-- Lista de reservas -->
            <div v-else class="flex flex-col space-y-4">
              <div 
                v-for="booking in recentBookings" 
                :key="booking.id"
                class="flex items-center justify-between rounded-lg border border-stroke p-4 dark:border-strokedark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div class="flex items-center space-x-4">
                  <div class="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <svg class="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-black dark:text-white">
                      {{ booking.trip_info?.origin_name || 'Origen' }} → {{ booking.trip_info?.destination_name || 'Destino' }}
                    </h4>
                    <p class="text-sm text-body-color">{{ formatDate(booking.created_at) }} • {{ booking.status }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-medium text-black dark:text-white">{{ formatCurrency(parseFloat(booking.total_price) || 0) }}</p>
                  <p class="text-sm text-body-color">{{ booking.seats_requested }} asiento(s)</p>
                </div>
              </div>
            </div>

            <div class="mt-6 text-center">
              <button 
                @click="navigateToMyTrips"
                class="inline-flex items-center justify-center rounded-md bg-secondary px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90"
              >
                Ver Mis Viajes
              </button>
            </div>
          </div>
        </div>

        <!-- Últimos Mensajes y Amigos -->
        <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Últimos Mensajes -->
          <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div class="border-b border-stroke px-6 py-4 dark:border-strokedark">
              <h3 class="font-medium text-black dark:text-white">
                💬 Últimos Mensajes
              </h3>
            </div>
            <div class="p-6">
              <!-- Estado de carga -->
              <div v-if="loading" class="text-center py-4">
                <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <p class="mt-2 text-sm text-body-color">Cargando mensajes...</p>
              </div>

              <!-- Sin mensajes -->
              <div v-else-if="recentMessages.length === 0" class="text-center py-4">
                <div class="text-3xl mb-2">💬</div>
                <h4 class="text-sm font-semibold text-black dark:text-white mb-1">No hay mensajes</h4>
                <p class="text-xs text-body-color">¡Inicia una conversación!</p>
              </div>

              <!-- Lista de mensajes -->
              <div v-else class="space-y-3">
                <div 
                  v-for="message in recentMessages" 
                  :key="message.id"
                  class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  @click="navigateToMessages"
                >
                  <div class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg class="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-gray-500 mb-1">{{ message.otherUserName }}</p>
                    <p class="text-sm font-medium text-black dark:text-white truncate">
                      {{ message.content }}
                    </p>
                    <p class="text-xs text-body-color">{{ formatDate(message.createdAt) }}</p>
                  </div>
                </div>
              </div>

              <div class="mt-4 text-center">
                <button 
                  @click="navigateToMessages"
                  class="inline-flex items-center justify-center rounded-md bg-warning px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 text-sm"
                >
                  Ver Mensajes
                </button>
              </div>
            </div>
          </div>

          <!-- Últimos Amigos -->
          <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div class="border-b border-stroke px-6 py-4 dark:border-strokedark">
              <h3 class="font-medium text-black dark:text-white">
                👥 Últimos Amigos
              </h3>
            </div>
            <div class="p-6">
              <!-- Estado de carga -->
              <div v-if="loading" class="text-center py-4">
                <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <p class="mt-2 text-sm text-body-color">Cargando amigos...</p>
              </div>

              <!-- Sin amigos -->
              <div v-else-if="friends.length === 0" class="text-center py-4">
                <div class="text-3xl mb-2">👥</div>
                <h4 class="text-sm font-semibold text-black dark:text-white mb-1">No hay amigos</h4>
                <p class="text-xs text-body-color">¡Conecta con otros usuarios!</p>
              </div>

              <!-- Lista de amigos -->
              <div v-else class="space-y-3">
                <div 
                  v-for="friend in friends.slice(0, 5)" 
                  :key="friend.id"
                  class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <img
                    :src="friend.avatar || '/images/user/default-avatar.png'"
                    :alt="friend.name"
                    class="h-8 w-8 rounded-full object-cover bg-gray-200"
                    loading="lazy"
                    @error.once="(event: any) => event.target.src = '/images/user/default-avatar.png'"
                  />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-black dark:text-white truncate">
                      {{ friend.name }}
                    </p>
                    <p class="text-xs text-body-color">{{ friend.role }}</p>
                  </div>
                  <div class="flex items-center space-x-1">
                    <span
                      :class="[
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        friend.role === 'conductor' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      ]"
                    >
                      {{ friend.role === 'conductor' ? '🚗' : '👤' }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="mt-4 text-center">
                <button 
                  @click="router.push('/carpooling/miembros')"
                  class="inline-flex items-center justify-center rounded-md bg-success px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 text-sm"
                >
                  Ver Miembros
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AppSidebar from '@/components/layout/AppSidebar.vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import { useSidebar } from '@/composables/useSidebar';
import { useDashboardData } from '@/composables/useDashboardData';

const router = useRouter();
const { isExpanded } = useSidebar();
const { 
  loading,
  error,
  recentTrips,
  recentBookings,
  recentMessages,
  friends,
  stats,
  loadDashboardData,
  formatDate,
  formatCurrency
} = useDashboardData();

// Cargar datos al montar el componente
onMounted(async () => {
  await loadDashboardData();
});

const navigateToCreateTrip = () => {
  router.push('/carpooling/create-trip');
};

const navigateToSearchTrips = () => {
  router.push('/carpooling/buscar-viajes-hibrido');
};

const navigateToMyTrips = () => {
  router.push('/carpooling/my-trips');
};

const navigateToMessages = () => {
  router.push('/carpooling/mensajeria');
};
</script>