<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-lg text-center">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">
        ✅ Ruta Pública Funcionando
      </h1>
      <p class="text-gray-600 mb-4">
        La ruta /buscar-viajes está funcionando correctamente
      </p>
      <div class="space-x-4">
        <router-link 
          to="/buscar-viajes" 
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Ir a Buscar Viajes
        </router-link>
        <router-link 
          to="/" 
          class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          Volver al Inicio
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Componente de prueba simple
</script>
