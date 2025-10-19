<template>
  <div class="route-map-container">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Cargando mapa...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
    </div>
    
    <div v-else-if="!routeData" class="no-route-container">
      <p>No hay datos de ruta para mostrar</p>
    </div>
    
    <!-- Mapa SVG como fallback -->
    <div v-else class="svg-map-container">
      <svg 
        :width="mapWidth" 
        :height="mapHeight" 
        viewBox="0 0 800 600"
        class="route-svg"
      >
        <!-- Fondo del mapa -->
        <defs>
          <pattern id="streetPattern" patternUnits="userSpaceOnUse" width="20" height="20">
            <path d="M0,10 L20,10" stroke="#e5e7eb" stroke-width="1" opacity="0.3"/>
            <path d="M10,0 L10,20" stroke="#e5e7eb" stroke-width="1" opacity="0.3"/>
          </pattern>
          <pattern id="highwayPattern" patternUnits="userSpaceOnUse" width="40" height="40">
            <path d="M0,20 L40,20" stroke="#fbbf24" stroke-width="3" opacity="0.5"/>
            <path d="M20,0 L20,40" stroke="#fbbf24" stroke-width="3" opacity="0.5"/>
          </pattern>
        </defs>
        
        <!-- Fondo con patrón de calles -->
        <rect width="800" height="600" fill="#f9fafb"/>
        <rect width="800" height="600" fill="url(#streetPattern)"/>
        
        <!-- Carreteras principales simuladas -->
        <path d="M100,300 Q200,250 300,300 Q400,350 500,300 Q600,250 700,300" 
              stroke="#fbbf24" stroke-width="8" fill="none" opacity="0.7"/>
        <path d="M200,100 Q300,150 400,100 Q500,50 600,100" 
              stroke="#fbbf24" stroke-width="6" fill="none" opacity="0.7"/>
        <path d="M300,400 Q400,450 500,400 Q600,350 700,400" 
              stroke="#fbbf24" stroke-width="6" fill="none" opacity="0.7"/>
        
        <!-- Etiquetas de ubicaciones -->
        <text x="100" y="320" class="location-label" fill="#374151">Chamartín</text>
        <text x="700" y="320" class="location-label" fill="#374151">Getafe</text>
        <text x="400" y="280" class="highway-label" fill="#92400e">A-5</text>
        <text x="400" y="80" class="highway-label" fill="#92400e">M-30</text>
        
        <!-- Ruta calculada -->
        <path 
          :d="routePath" 
          stroke="#3b82f6" 
          stroke-width="4" 
          fill="none"
          class="route-line"
        />
        
        <!-- Marcadores de origen y destino -->
        <circle :cx="originX" :cy="originY" r="12" fill="#10b981" stroke="white" stroke-width="3"/>
        <circle :cx="destinationX" :cy="destinationY" r="12" fill="#ef4444" stroke="white" stroke-width="3"/>
        
        <!-- Etiquetas de marcadores -->
        <text :x="originX" :y="originY - 20" class="marker-label" fill="#374151">Origen</text>
        <text :x="destinationX" :y="destinationY - 20" class="marker-label" fill="#374151">Destino</text>
      </svg>
      
      <!-- Información de la ruta -->
      <div class="route-info">
        <h3 class="route-title">Ruta Calculada</h3>
        <div class="route-stats">
          <div class="stat">
            <span class="stat-label">Distancia:</span>
            <span class="stat-value">{{ routeData.distance.toFixed(2) }} km</span>
          </div>
          <div class="stat">
            <span class="stat-label">Duración:</span>
            <span class="stat-value">{{ Math.round(routeData.duration) }} min</span>
          </div>
          <div class="stat">
            <span class="stat-label">Puntos de ruta:</span>
            <span class="stat-value">{{ routeData.coordinates.length }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Fuente:</span>
            <span class="stat-value" :class="routeData.source === 'fallback' ? 'text-yellow-600' : 'text-green-600'">
              {{ routeData.source }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { Route } from '@/types/carpooling';

interface Props {
  routeData: Route | null;
  originLocation: any;
  destinationLocation: any;
}

const props = defineProps<Props>();

const loading = ref(true);
const error = ref<string | null>(null);
const mapWidth = ref(800);
const mapHeight = ref(600);

// Coordenadas del mapa SVG (normalizadas)
const originX = computed(() => 100);
const originY = computed(() => 300);
const destinationX = computed(() => 700);
const destinationY = computed(() => 300);

// Generar ruta SVG basada en los datos
const routePath = computed(() => {
  if (!props.routeData?.coordinates || props.routeData.coordinates.length < 2) {
    return `M ${originX.value} ${originY.value} L ${destinationX.value} ${destinationY.value}`;
  }
  
  // Convertir coordenadas a puntos SVG
  const points = props.routeData.coordinates.map((coord, index) => {
    const progress = index / (props.routeData.coordinates.length - 1);
    const x = originX.value + (destinationX.value - originX.value) * progress;
    
    // Añadir variación para simular curvas de carretera
    const variation = Math.sin(progress * Math.PI * 2) * 20;
    const y = originY.value + variation;
    
    return `${x},${y}`;
  });
  
  return `M ${points[0]} Q ${points[Math.floor(points.length / 2)]} ${points[points.length - 1]}`;
});

// Simular carga del mapa
onMounted(() => {
  setTimeout(() => {
    loading.value = false;
    console.log('🗺️ Mapa SVG cargado exitosamente');
  }, 1000);
});

// Watch para cambios en routeData
watch(() => props.routeData, (newRouteData) => {
  if (newRouteData) {
    console.log('🗺️ Actualizando mapa con nueva ruta:', {
      distance: newRouteData.distance,
      duration: newRouteData.duration,
      source: newRouteData.source,
      points: newRouteData.coordinates.length
    });
  }
}, { immediate: true });
</script>

<style scoped>
.route-map-container {
  width: 100%;
  height: 600px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: #f9fafb;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.error-message {
  color: #ef4444;
  font-size: 16px;
  text-align: center;
}

.no-route-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.svg-map-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.route-svg {
  width: 100%;
  height: 100%;
}

.location-label {
  font-size: 14px;
  font-weight: 600;
  text-anchor: middle;
}

.highway-label {
  font-size: 12px;
  font-weight: 500;
  text-anchor: middle;
}

.marker-label {
  font-size: 12px;
  font-weight: 500;
  text-anchor: middle;
}

.route-line {
  filter: drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3));
}

.route-info {
  position: absolute;
  top: 16px;
  left: 16px;
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  min-width: 200px;
}

.route-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
}

.route-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  font-size: 14px;
  color: #111827;
  font-weight: 600;
}

.text-yellow-600 {
  color: #d97706;
}

.text-green-600 {
  color: #059669;
}
</style>

