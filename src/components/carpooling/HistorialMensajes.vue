<template>
  <div class="p-6 max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">📚 Historial de Mensajes</h1>
    
    <!-- Verificación de permisos -->
    <div v-if="!canViewHistorial()" class="bg-white rounded-lg shadow-md p-8 text-center">
      <div class="text-6xl mb-4">🔒</div>
      <h2 class="text-2xl font-bold text-gray-900 mb-4">
        Acceso Restringido
      </h2>
      <p class="text-gray-600 mb-6">
        Solo los administradores pueden acceder al historial de mensajes.
      </p>
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <div class="text-yellow-600 text-2xl mr-3">⚠️</div>
          <div>
            <h3 class="text-sm font-medium text-yellow-800">
              Información de Privacidad
            </h3>
            <p class="text-sm text-yellow-700 mt-1">
              El historial de mensajes contiene información privada de los usuarios. 
              Solo está disponible para administradores por motivos de seguridad y privacidad.
            </p>
          </div>
        </div>
      </div>
      <div class="flex justify-center space-x-4">
        <button
          @click="$router.push('/carpooling/mensajeria')"
          class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          💬 Ir a Mensajería
        </button>
        <button
          @click="$router.push('/')"
          class="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          🏠 Volver al Dashboard
        </button>
      </div>
    </div>
    
    <!-- Contenido principal (solo visible para admins) -->
    <div v-else>
    
    <!-- Filtros y búsqueda -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Búsqueda -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">🔍 Buscar mensajes</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar en mensajes..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <!-- Filtro por usuario -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">👤 Usuario</label>
          <select
            v-model="selectedUser"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los usuarios</option>
            <option
              v-for="usuario in usuarios"
              :key="usuario.id"
              :value="usuario.id"
            >
              {{ usuario.nombre }}
            </option>
          </select>
        </div>
        
        <!-- Filtro por fecha -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">📅 Rango de fechas</label>
          <select
            v-model="selectedDateRange"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las fechas</option>
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="quarter">Este trimestre</option>
            <option value="year">Este año</option>
          </select>
        </div>
        
        <!-- Filtro por tipo de mensaje -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">💬 Tipo</label>
          <select
            v-model="selectedType"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los tipos</option>
            <option value="sent">Enviados</option>
            <option value="received">Recibidos</option>
            <option value="unread">No leídos</option>
          </select>
        </div>
      </div>
      
      <!-- Estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div class="bg-blue-50 rounded-lg p-4">
          <div class="text-2xl font-bold text-blue-600">{{ stats.totalMensajes }}</div>
          <div class="text-sm text-blue-600">Total Mensajes</div>
        </div>
        <div class="bg-green-50 rounded-lg p-4">
          <div class="text-2xl font-bold text-green-600">{{ stats.mensajesEnviados }}</div>
          <div class="text-sm text-green-600">Enviados</div>
        </div>
        <div class="bg-purple-50 rounded-lg p-4">
          <div class="text-2xl font-bold text-purple-600">{{ stats.mensajesRecibidos }}</div>
          <div class="text-sm text-purple-600">Recibidos</div>
        </div>
        <div class="bg-orange-50 rounded-lg p-4">
          <div class="text-2xl font-bold text-orange-600">{{ stats.conversacionesActivas }}</div>
          <div class="text-sm text-orange-600">Conversaciones</div>
        </div>
      </div>
    </div>
    
    <!-- Lista de mensajes -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">📋 Historial de Mensajes</h2>
          <div class="flex items-center space-x-2">
            <button
              @click="exportarHistorial"
              class="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
            >
              📊 Exportar
            </button>
            <button
              @click="limpiarFiltros"
              class="px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700"
            >
              🔄 Limpiar Filtros
            </button>
          </div>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mensaje
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="mensaje in filteredMensajes" :key="mensaje.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="flex flex-col">
                  <span class="font-medium">{{ formatDate(mensaje.fecha) }}</span>
                  <span class="text-gray-500">{{ formatTime(mensaje.fecha) }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <img
                    :src="getUsuarioById(mensaje.remitenteId)?.avatar || '/images/user/default-avatar.png'"
                    :alt="getUsuarioById(mensaje.remitenteId)?.nombre"
                    class="h-8 w-8 rounded-full object-cover"
                  />
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">
                      {{ getUsuarioById(mensaje.remitenteId)?.nombre }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ getUsuarioById(mensaje.remitenteId)?.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    mensaje.remitenteId === currentUser.id ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  ]"
                >
                  {{ mensaje.remitenteId === currentUser.id ? '📤 Enviado' : '📥 Recibido' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 max-w-xs">
                <div class="truncate" :title="mensaje.contenido">
                  {{ mensaje.contenido }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    mensaje.leido ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  ]"
                >
                  {{ mensaje.leido ? '✅ Leído' : '⏳ No leído' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button
                    @click="verMensajeCompleto(mensaje)"
                    class="text-blue-600 hover:text-blue-900"
                    title="Ver mensaje completo"
                  >
                    👁️ Ver
                  </button>
                  <button
                    @click="verConversacion(mensaje)"
                    class="text-green-600 hover:text-green-900"
                    title="Ver conversación"
                  >
                    💬 Chat
                  </button>
                  <button
                    v-if="mensaje.remitenteId !== currentUser.id && !mensaje.leido"
                    @click="marcarComoLeido(mensaje)"
                    class="text-purple-600 hover:text-purple-900"
                    title="Marcar como leído"
                  >
                    ✅ Leer
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Paginación -->
      <div class="px-6 py-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Mostrando {{ filteredMensajes.length }} de {{ allMensajes.length }} mensajes
          </div>
          <div class="flex space-x-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span class="px-3 py-1 text-sm">
              Página {{ currentPage }} de {{ totalPages }}
            </span>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de mensaje completo -->
    <div
      v-if="showMessageModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              📝 Mensaje Completo
            </h3>
            <button
              @click="showMessageModal = false"
              class="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div v-if="selectedMessage" class="space-y-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center space-x-3 mb-3">
                <img
                  :src="getUsuarioById(selectedMessage.remitenteId)?.avatar || '/images/user/default-avatar.png'"
                  :alt="getUsuarioById(selectedMessage.remitenteId)?.nombre"
                  class="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <h4 class="font-medium text-gray-900">
                    {{ getUsuarioById(selectedMessage.remitenteId)?.nombre }}
                  </h4>
                  <p class="text-sm text-gray-500">
                    {{ formatDateTime(selectedMessage.fecha) }}
                  </p>
                </div>
              </div>
              <p class="text-gray-800">{{ selectedMessage.contenido }}</p>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button
                @click="showMessageModal = false"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cerrar
              </button>
              <button
                @click="verConversacion(selectedMessage)"
                class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                💬 Ver Conversación
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    </div> <!-- Cierre del contenido principal (solo para admins) -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// Interfaces
interface Usuario {
  id: string;
  nombre: string;
  email: string;
  avatar?: string;
}

interface Mensaje {
  id: string;
  conversacionId: string;
  remitenteId: string;
  contenido: string;
  fecha: Date;
  leido: boolean;
}

// Estado reactivo
const searchQuery = ref('');
const selectedUser = ref('');
const selectedDateRange = ref('');
const selectedType = ref('');
const currentPage = ref(1);
const showMessageModal = ref(false);
const selectedMessage = ref<Mensaje | null>(null);

// Sistema de roles y permisos
const currentUser = ref({
  id: 'admin-1',
  nombre: 'Administrador',
  email: 'admin@compartalia.com',
  role: 'admin' // admin, moderator, user
});

const userRoles = {
  admin: ['read', 'write', 'delete', 'view_historial'],
  moderator: ['read', 'write'],
  user: ['read']
};

// Datos de ejemplo
const usuarios = ref<Usuario[]>([
  {
    id: 'user-1',
    nombre: 'Usuario Actual',
    email: 'usuario@compartalia.com'
  },
  {
    id: 'user-2',
    nombre: 'María García',
    email: 'maria.garcia@email.com',
    avatar: '/images/user/user-01.jpg'
  },
  {
    id: 'user-3',
    nombre: 'Carlos López',
    email: 'carlos.lopez@email.com',
    avatar: '/images/user/user-02.jpg'
  },
  {
    id: 'user-4',
    nombre: 'Ana Martínez',
    email: 'ana.martinez@email.com',
    avatar: '/images/user/user-03.jpg'
  }
]);

const allMensajes = ref<Mensaje[]>([
  {
    id: 'msg-1',
    conversacionId: 'conv-1',
    remitenteId: 'user-2',
    contenido: 'Hola! ¿Estás interesado en compartir el viaje a Madrid el viernes?',
    fecha: new Date('2024-01-15T10:30:00'),
    leido: true
  },
  {
    id: 'msg-2',
    conversacionId: 'conv-1',
    remitenteId: 'user-1',
    contenido: '¡Hola María! Sí, me interesa mucho. ¿A qué hora saldrías?',
    fecha: new Date('2024-01-15T10:35:00'),
    leido: true
  },
  {
    id: 'msg-3',
    conversacionId: 'conv-1',
    remitenteId: 'user-2',
    contenido: 'Perfecto! Saldría a las 7:30 AM desde Móstoles. ¿Te viene bien?',
    fecha: new Date('2024-01-15T10:40:00'),
    leido: true
  },
  {
    id: 'msg-4',
    conversacionId: 'conv-1',
    remitenteId: 'user-1',
    contenido: 'Perfecto, me viene genial. ¿Cuánto sería el precio?',
    fecha: new Date('2024-01-15T10:45:00'),
    leido: true
  },
  {
    id: 'msg-5',
    conversacionId: 'conv-1',
    remitenteId: 'user-2',
    contenido: 'Serían 15€ por persona. ¿Te parece bien?',
    fecha: new Date('2024-01-15T10:50:00'),
    leido: false
  },
  {
    id: 'msg-6',
    conversacionId: 'conv-2',
    remitenteId: 'user-3',
    contenido: 'Hola! Vi que buscas viaje a Madrid. Tengo uno disponible el lunes.',
    fecha: new Date('2024-01-14T15:20:00'),
    leido: true
  },
  {
    id: 'msg-7',
    conversacionId: 'conv-2',
    remitenteId: 'user-1',
    contenido: '¡Hola Carlos! ¿A qué hora y desde dónde?',
    fecha: new Date('2024-01-14T15:25:00'),
    leido: true
  },
  {
    id: 'msg-8',
    conversacionId: 'conv-3',
    remitenteId: 'user-4',
    contenido: 'Hola! ¿Te interesa compartir viaje el miércoles?',
    fecha: new Date('2024-01-13T09:15:00'),
    leido: false
  }
]);

// Computed properties
const filteredMensajes = computed(() => {
  let filtered = allMensajes.value;
  
  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(mensaje =>
      mensaje.contenido.toLowerCase().includes(query) ||
      getUsuarioById(mensaje.remitenteId)?.nombre.toLowerCase().includes(query) ||
      getUsuarioById(mensaje.remitenteId)?.email.toLowerCase().includes(query)
    );
  }
  
  // Filtrar por usuario
  if (selectedUser.value) {
    filtered = filtered.filter(mensaje => mensaje.remitenteId === selectedUser.value);
  }
  
  // Filtrar por tipo
  if (selectedType.value) {
    filtered = filtered.filter(mensaje => {
      if (selectedType.value === 'sent') return mensaje.remitenteId === currentUser.value.id;
      if (selectedType.value === 'received') return mensaje.remitenteId !== currentUser.value.id;
      if (selectedType.value === 'unread') return !mensaje.leido;
      return true;
    });
  }
  
  // Filtrar por fecha
  if (selectedDateRange.value) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    filtered = filtered.filter(mensaje => {
      const mensajeDate = new Date(mensaje.fecha);
      
      switch (selectedDateRange.value) {
        case 'today':
          return mensajeDate >= today;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return mensajeDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          return mensajeDate >= monthAgo;
        case 'quarter':
          const quarterAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
          return mensajeDate >= quarterAgo;
        case 'year':
          const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
          return mensajeDate >= yearAgo;
        default:
          return true;
      }
    });
  }
  
  // Ordenar por fecha (más reciente primero)
  return filtered.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
});

const stats = computed(() => {
  const totalMensajes = allMensajes.value.length;
  const mensajesEnviados = allMensajes.value.filter(m => m.remitenteId === currentUser.value.id).length;
  const mensajesRecibidos = allMensajes.value.filter(m => m.remitenteId !== currentUser.value.id).length;
  const conversacionesActivas = new Set(allMensajes.value.map(m => m.conversacionId)).size;
  
  return { totalMensajes, mensajesEnviados, mensajesRecibidos, conversacionesActivas };
});

const totalPages = computed(() => {
  return Math.ceil(filteredMensajes.value.length / 20);
});

// Métodos de verificación de permisos
function hasPermission(permission: string): boolean {
  const userRole = currentUser.value.role;
  return userRoles[userRole as keyof typeof userRoles]?.includes(permission) || false;
}

function canViewHistorial(): boolean {
  return hasPermission('view_historial');
}

// Métodos
function getUsuarioById(id: string): Usuario | undefined {
  return usuarios.value.find(u => u.id === id);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDateTime(date: Date): string {
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function verMensajeCompleto(mensaje: Mensaje) {
  selectedMessage.value = mensaje;
  showMessageModal.value = true;
}

function verConversacion(mensaje: Mensaje) {
  // TODO: Navegar a la conversación
  console.log('Ver conversación:', mensaje.conversacionId);
}

function marcarComoLeido(mensaje: Mensaje) {
  mensaje.leido = true;
}

function exportarHistorial() {
  // TODO: Implementar exportación
  console.log('Exportar historial');
}

function limpiarFiltros() {
  searchQuery.value = '';
  selectedUser.value = '';
  selectedDateRange.value = '';
  selectedType.value = '';
  currentPage.value = 1;
}

// Inicialización
onMounted(() => {
  console.log('Componente HistorialMensajes montado');
});
</script>

<style scoped>
/* Estilos adicionales si es necesario */
</style>
