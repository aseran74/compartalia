<template>
  <admin-layout>
    <div class="min-h-screen bg-gray-50">
      <!-- Hero Section -->
      <div class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div class="text-center">
            <h1 class="text-4xl md:text-6xl font-bold mb-6">
              🚗 Compartir Viajes
            </h1>
            <p class="text-xl md:text-2xl mb-8 text-blue-100">
              Ahorra dinero, reduce emisiones y conecta con tu comunidad
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <router-link
                to="/carpooling/buscar-viajes-hibrido"
                class="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
              >
                🔍 Buscar Viajes
              </router-link>
              <router-link
                to="/carpooling/crear-viaje"
                class="bg-blue-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-400 transition-colors text-lg"
              >
                ➕ Crear Viaje
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Tipos de Viajes Info -->
      <TiposViajesInfo />

      <!-- Quick Actions -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">
          🚀 Acciones Rápidas
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Buscar Viajes -->
          <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div class="text-center">
              <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-2xl">🔍</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Buscar Viajes</h3>
              <p class="text-gray-600 mb-4">Encuentra viajes disponibles en tu ruta</p>
              <router-link
                to="/carpooling/buscar-viajes-hibrido"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Buscar
              </router-link>
            </div>
          </div>

          <!-- Crear Viaje -->
          <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div class="text-center">
              <div class="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-2xl">➕</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Crear Viaje</h3>
              <p class="text-gray-600 mb-4">Ofrece un viaje y gana dinero</p>
              <router-link
                to="/carpooling/crear-viaje"
                class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Crear
              </router-link>
            </div>
          </div>

          <!-- Mis Viajes -->
          <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div class="text-center">
              <div class="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-2xl">📋</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Mis Viajes</h3>
              <p class="text-gray-600 mb-4">Gestiona tus viajes y reservas</p>
              <router-link
                to="/carpooling/mis-viajes"
                class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Ver
              </router-link>
            </div>
          </div>

          <!-- Mensajes -->
          <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div class="text-center">
              <div class="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-2xl">💬</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Mensajes</h3>
              <p class="text-gray-600 mb-4">Comunícate con otros usuarios</p>
              <router-link
                to="/carpooling/mensajeria"
                class="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Chatear
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="bg-gray-900 text-white py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold mb-4">📊 Nuestro Impacto</h2>
            <p class="text-gray-300">Datos que demuestran el éxito de nuestra comunidad</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="text-center">
              <div class="text-4xl font-bold text-green-400 mb-2">1,250+</div>
              <div class="text-gray-300">Viajes Completados</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-blue-400 mb-2">€15,000+</div>
              <div class="text-gray-300">Ahorrado por Usuarios</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-purple-400 mb-2">2.5T</div>
              <div class="text-gray-300">CO₂ Reducido</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue';
import TiposViajesInfo from '@/components/carpooling/TiposViajesInfo.vue';
</script>

<style scoped>
/* Estilos adicionales si es necesario */
</style>
