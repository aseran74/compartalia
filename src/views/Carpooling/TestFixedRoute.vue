<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">Test Ruta Fija</h1>
      <p class="text-gray-600">Prueba de ruta sin depender del archivo .env</p>
    </div>

    <!-- Formulario -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Origen</label>
          <input
            v-model="origin"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Chamartín, Madrid"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Destino</label>
          <input
            v-model="destination"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Getafe, Madrid"
          />
        </div>
      </div>
      
      <button
        @click="calculateRoute"
        :disabled="loading"
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? 'Calculando...' : 'Calcular Ruta' }}
      </button>
    </div>

    <!-- Logs de Debug -->
    <div v-if="logs.length > 0" class="bg-gray-900 text-green-400 rounded-lg p-4 mb-8 font-mono text-sm">
      <h3 class="text-white mb-2">🔍 Logs de Debug</h3>
      <div class="space-y-1 max-h-60 overflow-y-auto">
        <div v-for="(log, index) in logs" :key="index" class="text-xs">
          {{ log }}
        </div>
      </div>
    </div>

    <!-- Mapa -->
    <div v-if="routeResult" class="bg-white rounded-lg shadow-md overflow-hidden">
      <SimpleRouteMapFixed
        :route-data="routeResult"
        :origin-location="originLocation"
        :destination-location="destinationLocation"
      />
    </div>

    <!-- Información de la ruta -->
    <div v-if="routeResult" class="bg-white rounded-lg shadow-md p-6 mt-8">
      <h3 class="text-xl font-semibold text-gray-900 mb-4">📊 Resumen de la Ruta</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">{{ routeResult.distance.toFixed(2) }} km</div>
          <div class="text-sm text-gray-600">Distancia total</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">{{ Math.round(routeResult.duration) }} min</div>
          <div class="text-sm text-gray-600">Duración</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600">{{ routeResult.coordinates.length }}</div>
          <div class="text-sm text-gray-600">Puntos de ruta</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold" :class="routeResult.source === 'simulated-realistic' ? 'text-green-600' : 'text-yellow-600'">
            {{ routeResult.source === 'simulated-realistic' ? '✅' : '⚠️' }}
          </div>
          <div class="text-sm text-gray-600">Fuente de ruta</div>
        </div>
      </div>
      
      <div class="mt-4 p-4 bg-blue-50 rounded-md">
        <p class="text-sm text-blue-800">
          <strong>Nota:</strong> Esta ruta usa un algoritmo simulado que genera rutas realistas 
          siguiendo patrones de carreteras reales, sin depender de APIs externas.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import routeServiceFixed from '@/services/routeServiceFixed';
import SimpleRouteMapFixed from '@/components/carpooling/SimpleRouteMapFixed.vue';
import type { Route } from '@/types/carpooling';

// Estado del formulario
const origin = ref('Chamartín, Madrid');
const destination = ref('Getafe, Madrid');
const loading = ref(false);
const routeResult = ref<Route | null>(null);
const logs = ref<string[]>([]);

// Variables para el mapa
const originLocation = ref<any>(null);
const destinationLocation = ref<any>(null);

const addLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString();
  logs.value.push(`[${timestamp}] ${message}`);
  console.log(`[${timestamp}] ${message}`);
};

const calculateRoute = async () => {
  loading.value = true;
  logs.value = [];
  routeResult.value = null;
  originLocation.value = null;
  destinationLocation.value = null;

  addLog('🔍 Calculando ruta con servicio fijo...');
  addLog(`📍 Origen: ${origin.value}`);
  addLog(`🎯 Destino: ${destination.value}`);

  try {
    // 1. Geolocalizar origen y destino
    addLog('🌍 Geocodificando direcciones...');
    const originLocationData = await routeServiceFixed.geocodeAddress(origin.value);
    const destLocationData = await routeServiceFixed.geocodeAddress(destination.value);

    if (!originLocationData || !destLocationData) {
      addLog('❌ No se pudieron geocodificar las direcciones.');
      loading.value = false;
      return;
    }

    addLog(`✅ Origen: ${originLocationData.coordinates.lat.toFixed(4)}, ${originLocationData.coordinates.lng.toFixed(4)}`);
    addLog(`✅ Destino: ${destLocationData.coordinates.lat.toFixed(4)}, ${destLocationData.coordinates.lng.toFixed(4)}`);

    // Asignar las ubicaciones para el mapa
    originLocation.value = originLocationData;
    destinationLocation.value = destLocationData;

    // 2. Obtener ruta
    addLog('🗺️ Calculando ruta realista...');
    const route = await routeServiceFixed.getRoute(originLocationData.coordinates, destLocationData.coordinates);
    
    if (!route) {
      addLog('❌ No se pudo obtener la ruta.');
      loading.value = false;
      return;
    }

    addLog(`✅ Ruta calculada desde ${route.source}`);
    addLog(`📏 Distancia: ${route.distance.toFixed(2)} km`);
    addLog(`⏱️ Duración: ${Math.round(route.duration)} min`);
    addLog(`📍 Puntos de ruta: ${route.coordinates.length}`);
    addLog(`🗺️ Fuente de ruta: ${route.source}`);
    addLog(`🛣️ La ruta sigue patrones de carreteras reales`);
    
    routeResult.value = route;
    
    addLog('✅ Ruta calculada exitosamente - Sin dependencia de APIs externas');
    
  } catch (error: any) {
    addLog(`❌ Error: ${error.message || error}`);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>

