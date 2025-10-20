<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Debug Búsqueda de Viajes</h1>
    
    <!-- Formulario simple -->
    <div class="bg-white p-4 rounded-lg shadow mb-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium mb-2">Origen</label>
          <input 
            v-model="searchForm.origin" 
            type="text" 
            placeholder="Chamartín"
            class="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Destino</label>
          <input 
            v-model="searchForm.destination" 
            type="text" 
            placeholder="Getafe"
            class="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Fecha</label>
          <input 
            v-model="searchForm.date" 
            type="date" 
            class="w-full p-2 border rounded"
          />
        </div>
      </div>
      
      <button 
        @click="searchTrips" 
        :disabled="isSearching"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {{ isSearching ? 'Buscando...' : 'Buscar Viajes' }}
      </button>
    </div>

    <!-- Resultados -->
    <div v-if="hasSearched" class="bg-white p-4 rounded-lg shadow">
      <h2 class="text-lg font-semibold mb-2">
        Resultados ({{ searchResults.length }} viajes encontrados)
      </h2>
      
      <div v-if="searchResults.length === 0" class="text-gray-500">
        No se encontraron viajes para los criterios especificados.
      </div>
      
      <div v-else class="space-y-4">
        <div 
          v-for="trip in searchResults" 
          :key="trip.id"
          class="border p-4 rounded-lg"
        >
          <h3 class="font-semibold">{{ trip.origin.name }} → {{ trip.destination.name }}</h3>
          <p><strong>Fecha:</strong> {{ formatDate(trip.departureTime) }}</p>
          <p><strong>Hora:</strong> {{ formatTime(trip.departureTime) }}</p>
          <p><strong>Precio:</strong> {{ trip.pricePerSeat }}€ por asiento</p>
          <p><strong>Asientos disponibles:</strong> {{ trip.availableSeats }}</p>
          <p><strong>Descripción:</strong> {{ trip.description }}</p>
          
          <!-- Debug info -->
          <div class="mt-2 p-2 bg-gray-100 rounded text-sm">
            <strong>Debug Info:</strong><br>
            ID: {{ trip.id }}<br>
            Driver ID: {{ trip.driverId }}<br>
            Status: {{ trip.status }}
          </div>
        </div>
      </div>
    </div>

    <!-- Logs de debug -->
    <div v-if="debugLogs.length > 0" class="mt-4 bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
      <h3 class="text-white mb-2">Debug Logs:</h3>
      <div v-for="(log, index) in debugLogs" :key="index" class="mb-1">
        {{ log }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCarpoolingData } from '@/composables/useCarpoolingData';
import type { Trip, TripFilters } from '@/types/carpooling';

const { searchTripsAdvanced, loading } = useCarpoolingData();

// Estado del formulario
const searchForm = ref({
  origin: 'Chamartín',
  destination: 'Getafe',
  date: '2024-01-18'
});

// Estado de la búsqueda
const isSearching = ref(false);
const hasSearched = ref(false);
const searchResults = ref<Trip[]>([]);
const debugLogs = ref<string[]>([]);

// Función para agregar logs
const addLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString();
  debugLogs.value.push(`[${timestamp}] ${message}`);
  console.log(message);
};

// Función de búsqueda
const searchTrips = async () => {
  isSearching.value = true;
  hasSearched.value = true;
  debugLogs.value = []; // Limpiar logs anteriores
  
  try {
    addLog('🔍 Iniciando búsqueda de viajes...');
    
    const filters: TripFilters = {
      originName: searchForm.value.origin,
      destinationName: searchForm.value.destination,
      departureDate: searchForm.value.date,
      limit: 50
    };
    
    addLog(`📋 Filtros: ${JSON.stringify(filters)}`);
    
    const results = await searchTripsAdvanced(filters);
    
    addLog(`📊 Resultados recibidos: ${results.length} viajes`);
    
    searchResults.value = results;
    
    if (results.length > 0) {
      addLog(`✅ Búsqueda exitosa - ${results.length} viajes encontrados`);
      results.forEach((trip, index) => {
        addLog(`   Viaje ${index + 1}: ${trip.origin.name} → ${trip.destination.name} (${trip.id})`);
      });
    } else {
      addLog('⚠️ No se encontraron viajes');
    }
    
  } catch (error) {
    addLog(`❌ Error en la búsqueda: ${error}`);
    console.error('Error searching trips:', error);
  } finally {
    isSearching.value = false;
  }
};

// Funciones de formato
const formatDate = (date: Date) => {
  return date.toLocaleDateString('es-ES');
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

// Búsqueda automática al montar el componente
onMounted(() => {
  addLog('🚀 Componente montado - Listo para búsqueda');
});
</script>

<style scoped>
/* Estilos adicionales si es necesario */
</style>
