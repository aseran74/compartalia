<template>
  <div class="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">
          🚗 Tipos de Viajes Disponibles
        </h2>
        <p class="text-lg text-gray-600 max-w-3xl mx-auto">
          Descubre las diferentes modalidades de viajes compartidos y cómo pueden beneficiarte
        </p>
      </div>

      <!-- Grid de opciones -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <!-- Como Conductor -->
        <div class="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-green-500">
          <div class="flex items-center mb-6">
            <div class="bg-green-100 p-3 rounded-full mr-4">
              <span class="text-2xl">🚗</span>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-900">Como Conductor</h3>
              <p class="text-green-600 font-semibold">Maximiza tus ingresos y reduce costes</p>
            </div>
          </div>

          <div class="space-y-6">
            <!-- Viajes Diarios -->
            <div class="bg-gray-50 rounded-xl p-6">
              <div class="flex items-center mb-4">
                <span class="text-3xl mr-3">📅</span>
                <h4 class="text-xl font-semibold text-gray-900">Viajes Diarios</h4>
              </div>
              <p class="text-gray-600 mb-3">
                Viajes puntuales cuando necesites compañía. Perfecto para ocasiones especiales o viajes esporádicos.
              </p>
              <div class="flex items-center text-sm text-green-600 font-medium">
                <span class="mr-2">💰</span>
                <span>Flexibilidad total - Gana según tus necesidades</span>
              </div>
            </div>

            <!-- Viajes Semanales -->
            <div class="bg-gray-50 rounded-xl p-6">
              <div class="flex items-center mb-4">
                <span class="text-3xl mr-3">📅</span>
                <h4 class="text-xl font-semibold text-gray-900">Viajes Semanales</h4>
              </div>
              <p class="text-gray-600 mb-3">
                Establece rutas fijas de lunes a viernes. Los pasajeros se reservan con antelación y tienes ingresos garantizados.
              </p>
              <div class="flex items-center text-sm text-green-600 font-medium">
                <span class="mr-2">💰</span>
                <span>Beneficio: Puedes ganar hasta 300€/mes cubriendo solo tus gastos de combustible.</span>
              </div>
            </div>

            <!-- Viajes Mensuales -->
            <div class="bg-gray-50 rounded-xl p-6">
              <div class="flex items-center mb-4">
                <span class="text-3xl mr-3">🗓️</span>
                <h4 class="text-xl font-semibold text-gray-900">Viajes Mensuales</h4>
              </div>
              <p class="text-gray-600 mb-3">
                Planifica rutas mensuales con descuentos especiales. Ideal para trabajadores con horarios fijos.
              </p>
              <div class="flex items-center text-sm text-green-600 font-medium">
                <span class="mr-2">💰</span>
                <span>Beneficio: Puedes ganar hasta 300€/mes cubriendo solo tus gastos de combustible.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Como Pasajero -->
        <div class="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-blue-500">
          <div class="flex items-center mb-6">
            <div class="bg-blue-100 p-3 rounded-full mr-4">
              <span class="text-2xl">👥</span>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-900">Como Pasajero</h3>
              <p class="text-blue-600 font-semibold">Ahorra dinero y tiempo en tus desplazamientos</p>
            </div>
          </div>

          <div class="space-y-6">
            <!-- Viajes Diarios -->
            <div class="bg-gray-50 rounded-xl p-6">
              <div class="flex items-center mb-4">
                <span class="text-3xl mr-3">📅</span>
                <h4 class="text-xl font-semibold text-gray-900">Viajes Diarios</h4>
              </div>
              <p class="text-gray-600 mb-3">
                Reserva viajes puntuales cuando los necesites. Ideal para citas, eventos o viajes ocasionales.
              </p>
              <div class="flex items-center text-sm text-blue-600 font-medium">
                <span class="mr-2">💡</span>
                <span>Máxima flexibilidad - Reserva cuando necesites</span>
              </div>
            </div>

            <!-- Viajes Semanales -->
            <div class="bg-gray-50 rounded-xl p-6">
              <div class="flex items-center mb-4">
                <span class="text-3xl mr-3">📅</span>
                <h4 class="text-xl font-semibold text-gray-900">Viajes Semanales</h4>
              </div>
              <p class="text-gray-600 mb-3">
                Reserva tu plaza para toda la semana. Precio fijo y garantía de disponibilidad en tu ruta habitual.
              </p>
              <div class="flex items-center text-sm text-blue-600 font-medium">
                <span class="mr-2">💡</span>
                <span>Beneficio: Ahorra hasta 200€/mes comparado con transporte público o taxi.</span>
              </div>
            </div>

            <!-- Viajes Mensuales -->
            <div class="bg-gray-50 rounded-xl p-6">
              <div class="flex items-center mb-4">
                <span class="text-3xl mr-3">🗓️</span>
                <h4 class="text-xl font-semibold text-gray-900">Viajes Mensuales</h4>
              </div>
              <p class="text-gray-600 mb-3">
                Descuentos especiales por reservas mensuales. Perfecto para trabajadores con horarios regulares.
              </p>
              <div class="flex items-center text-sm text-blue-600 font-medium">
                <span class="mr-2">💡</span>
                <span>Beneficio: Ahorra hasta 200€/mes comparado con transporte público o taxi.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Call to Action -->
      <div class="text-center bg-white rounded-2xl shadow-lg p-8">
        <h3 class="text-2xl font-bold text-gray-900 mb-4">
          🚀 ¿Listo para empezar?
        </h3>
        <p class="text-gray-600 mb-6 max-w-2xl mx-auto">
          Únete a la comunidad de Compartalia y comienza a ahorrar dinero mientras reduces tu huella de carbono
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button class="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
            🚗 Soy Conductor
          </button>
          <button class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            👥 Soy Pasajero
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Componente informativo sobre tipos de viajes
// No necesita lógica adicional
</script>

<style scoped>
/* Estilos adicionales si es necesario */
</style>
