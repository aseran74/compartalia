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
            Mis Viajes
          </h1>
          <p class="text-sm font-medium text-body-color">
            Gestiona tus viajes como conductor y pasajero
          </p>
        </div>
        <button
          @click="$router.push('/carpooling/create-trip')"
          class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-center font-medium text-white hover:bg-opacity-90"
        >
          <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Crear Viaje
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="mb-6 rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center space-x-2">
          <button
            @click="activeTab = 'all'"
            :class="[
              'rounded-md px-3 py-1 text-sm font-medium transition-colors',
              activeTab === 'all'
                ? 'bg-primary text-white'
                : 'text-body-color hover:bg-gray-50 dark:hover:bg-gray-700'
            ]"
          >
            Todos
          </button>
          <button
            @click="activeTab = 'asDriver'"
            :class="[
              'rounded-md px-3 py-1 text-sm font-medium transition-colors',
              activeTab === 'asDriver'
                ? 'bg-primary text-white'
                : 'text-body-color hover:bg-gray-50 dark:hover:bg-gray-700'
            ]"
          >
            Como Conductor
          </button>
          <button
            @click="activeTab = 'asPassenger'"
            :class="[
              'rounded-md px-3 py-1 text-sm font-medium transition-colors',
              activeTab === 'asPassenger'
                ? 'bg-primary text-white'
                : 'text-body-color hover:bg-gray-50 dark:hover:bg-gray-700'
            ]"
          >
            Como Pasajero
          </button>
        </div>
      </div>
    </div>

    <!-- Lista de Viajes -->
    <div class="space-y-4">
      <!-- Viaje como Conductor -->
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <!-- Header del Viaje -->
            <div class="mb-4 flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  Conductor
                </div>
                <div class="rounded-full bg-success/10 px-3 py-1 text-sm font-medium text-success">
                  Activo
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <button class="rounded-md border border-stroke px-3 py-1 text-sm text-body-color hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-700">
                  Editar
                </button>
                <button class="rounded-md bg-warning px-3 py-1 text-sm font-medium text-white hover:bg-opacity-90">
                  Cancelar
                </button>
              </div>
            </div>

            <!-- Información de la Ruta -->
            <div class="mb-4">
              <div class="flex items-center space-x-4">
                <div class="flex flex-col items-center">
                  <div class="h-3 w-3 rounded-full bg-primary"></div>
                  <div class="mt-2 h-8 w-0.5 bg-body-color"></div>
                  <div class="h-3 w-3 rounded-full bg-secondary"></div>
                </div>
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-black dark:text-white">
                    Majadahonda → Plaza España
                  </h3>
                  <p class="text-sm text-body-color">
                    Mañana, 8:00 AM • 3 asientos disponibles
                  </p>
                </div>
              </div>
            </div>

            <!-- Detalles del Viaje -->
            <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p class="text-sm text-body-color">Precio</p>
                <p class="font-medium text-black dark:text-white">€8 por asiento</p>
              </div>
              <div>
                <p class="text-sm text-body-color">Duración</p>
                <p class="font-medium text-black dark:text-white">25 minutos</p>
              </div>
              <div>
                <p class="text-sm text-body-color">Vehículo</p>
                <p class="font-medium text-black dark:text-white">Toyota Prius</p>
              </div>
              <div>
                <p class="text-sm text-body-color">Solicitudes</p>
                <p class="font-medium text-black dark:text-white">3 pendientes</p>
              </div>
            </div>

            <!-- Pasajeros Confirmados -->
            <div class="mt-4">
              <h4 class="mb-2 text-sm font-medium text-black dark:text-white">Pasajeros Confirmados</h4>
              <div class="space-y-2">
                <div class="flex items-center justify-between rounded-lg border border-stroke p-3 dark:border-strokedark">
                  <div class="flex items-center space-x-3">
                    <div class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg class="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-black dark:text-white">Ana García</p>
                      <p class="text-xs text-body-color">Moncloa → Plaza España</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-medium text-black dark:text-white">€8</p>
                    <button class="text-xs text-primary hover:text-primary/80">Chat</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Viaje como Pasajero -->
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <!-- Header del Viaje -->
            <div class="mb-4 flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="rounded-full bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary">
                  Pasajero
                </div>
                <div class="rounded-full bg-success/10 px-3 py-1 text-sm font-medium text-success">
                  Confirmado
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <button class="rounded-md border border-stroke px-3 py-1 text-sm text-body-color hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-700">
                  Ver Detalles
                </button>
                <button class="rounded-md bg-warning px-3 py-1 text-sm font-medium text-white hover:bg-opacity-90">
                  Cancelar
                </button>
              </div>
            </div>

            <!-- Información de la Ruta -->
            <div class="mb-4">
              <div class="flex items-center space-x-4">
                <div class="flex flex-col items-center">
                  <div class="h-3 w-3 rounded-full bg-primary"></div>
                  <div class="mt-2 h-8 w-0.5 bg-body-color"></div>
                  <div class="h-3 w-3 rounded-full bg-secondary"></div>
                </div>
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-black dark:text-white">
                    Las Rozas → Nuevos Ministerios
                  </h3>
                  <p class="text-sm text-body-color">
                    Lunes, 7:30 AM • Conductor: María López
                  </p>
                </div>
              </div>
            </div>

            <!-- Detalles del Viaje -->
            <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p class="text-sm text-body-color">Precio</p>
                <p class="font-medium text-black dark:text-white">€12</p>
              </div>
              <div>
                <p class="text-sm text-body-color">Duración</p>
                <p class="font-medium text-black dark:text-white">35 minutos</p>
              </div>
              <div>
                <p class="text-sm text-body-color">Vehículo</p>
                <p class="font-medium text-black dark:text-white">Volkswagen Golf</p>
              </div>
              <div>
                <p class="text-sm text-body-color">Punto de Recogida</p>
                <p class="font-medium text-black dark:text-white">Estación Las Rozas</p>
              </div>
            </div>

            <!-- Información del Conductor -->
            <div class="mt-4 flex items-center space-x-3">
              <div class="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <svg class="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-black dark:text-white">María López</p>
                <div class="flex items-center space-x-2">
                  <div class="flex items-center">
                    <svg class="h-3 w-3 text-warning" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <span class="ml-1 text-xs text-body-color">4.8</span>
                  </div>
                  <span class="text-xs text-body-color">• 23 viajes</span>
                </div>
              </div>
              <button class="ml-auto rounded-md bg-primary px-3 py-1 text-sm font-medium text-white hover:bg-opacity-90">
                Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Viaje Completado -->
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <!-- Header del Viaje -->
            <div class="mb-4 flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="rounded-full bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary">
                  Pasajero
                </div>
                <div class="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  Completado
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <button class="rounded-md border border-stroke px-3 py-1 text-sm text-body-color hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-700">
                  Ver Detalles
                </button>
                <button class="rounded-md bg-primary px-3 py-1 text-sm font-medium text-white hover:bg-opacity-90">
                  Valorar
                </button>
              </div>
            </div>

            <!-- Información de la Ruta -->
            <div class="mb-4">
              <div class="flex items-center space-x-4">
                <div class="flex flex-col items-center">
                  <div class="h-3 w-3 rounded-full bg-primary"></div>
                  <div class="mt-2 h-8 w-0.5 bg-body-color"></div>
                  <div class="h-3 w-3 rounded-full bg-secondary"></div>
                </div>
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-black dark:text-white">
                    Pozuelo → Moncloa
                  </h3>
                  <p class="text-sm text-body-color">
                    Ayer, 8:15 AM • Conductor: Carlos Ruiz
                  </p>
                </div>
              </div>
            </div>

            <!-- Detalles del Viaje -->
            <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p class="text-sm text-body-color">Precio</p>
                <p class="font-medium text-black dark:text-white">€6</p>
              </div>
              <div>
                <p class="text-sm text-body-color">Duración</p>
                <p class="font-medium text-black dark:text-white">20 minutos</p>
              </div>
              <div>
                <p class="text-sm text-body-color">Vehículo</p>
                <p class="font-medium text-black dark:text-white">Ford Focus</p>
              </div>
              <div>
                <p class="text-sm text-body-color">Estado</p>
                <p class="font-medium text-black dark:text-white">Pendiente de valoración</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sin Viajes -->
    <div v-if="false" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-body-color" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <h3 class="mt-4 text-lg font-medium text-black dark:text-white">
        No tienes viajes aún
      </h3>
      <p class="mt-2 text-sm text-body-color">
        Crea tu primer viaje o busca viajes disponibles.
      </p>
      <div class="mt-6 flex items-center justify-center space-x-4">
        <button
          @click="$router.push('/carpooling/create-trip')"
          class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
        >
          Crear Viaje
        </button>
        <button
          @click="$router.push('/carpooling/search-trips')"
          class="rounded-md border border-stroke px-4 py-2 text-sm font-medium text-body-color hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-700"
        >
          Buscar Viajes
        </button>
      </div>
    </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppSidebar from '@/components/layout/AppSidebar.vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import { useSidebar } from '@/composables/useSidebar';

const activeTab = ref('all');
const { isExpanded } = useSidebar();
</script>
