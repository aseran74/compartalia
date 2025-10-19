<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">👥 Gestión de Miembros</h1>
    
    <!-- Filtros y búsqueda -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="flex flex-col md:flex-row gap-4 mb-6">
        <!-- Búsqueda -->
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-2">🔍 Buscar miembros</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <!-- Filtro por tipo -->
        <div class="md:w-48">
          <label class="block text-sm font-medium text-gray-700 mb-2">👤 Tipo de miembro</label>
          <select
            v-model="selectedType"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="conductor">🚗 Conductores</option>
            <option value="pasajero">👤 Pasajeros</option>
            <option value="ambos">🔄 Ambos</option>
          </select>
        </div>
        
        <!-- Filtro por estado -->
        <div class="md:w-48">
          <label class="block text-sm font-medium text-gray-700 mb-2">📊 Estado</label>
          <select
            v-model="selectedStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="activo">✅ Activo</option>
            <option value="inactivo">⏸️ Inactivo</option>
            <option value="verificado">✅ Verificado</option>
            <option value="pendiente">⏳ Pendiente</option>
          </select>
        </div>
      </div>
      
      <!-- Estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div class="bg-blue-50 rounded-lg p-4">
          <div class="text-2xl font-bold text-blue-600">{{ stats.total }}</div>
          <div class="text-sm text-blue-600">Total Miembros</div>
        </div>
        <div class="bg-green-50 rounded-lg p-4">
          <div class="text-2xl font-bold text-green-600">{{ stats.conductores }}</div>
          <div class="text-sm text-green-600">Conductores</div>
        </div>
        <div class="bg-purple-50 rounded-lg p-4">
          <div class="text-2xl font-bold text-purple-600">{{ stats.pasajeros }}</div>
          <div class="text-sm text-purple-600">Pasajeros</div>
        </div>
        <div class="bg-orange-50 rounded-lg p-4">
          <div class="text-2xl font-bold text-orange-600">{{ stats.verificados }}</div>
          <div class="text-sm text-orange-600">Verificados</div>
        </div>
        <div class="bg-pink-50 rounded-lg p-4">
          <div class="text-2xl font-bold text-pink-600">{{ stats.amigos }}</div>
          <div class="text-sm text-pink-600">Mis Amigos</div>
        </div>
      </div>
    </div>
    
    <!-- Lista de miembros -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-xl font-semibold">📋 Lista de Miembros</h2>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Miembro
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Viajes
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Última Actividad
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="miembro in filteredMiembros" :key="miembro.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img
                      :src="miembro.avatar || '/images/user/default-avatar.png'"
                      :alt="miembro.nombre"
                      class="h-10 w-10 rounded-full object-cover"
                    />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ miembro.nombre }}</div>
                    <div class="text-sm text-gray-500">{{ miembro.email }}</div>
                    <div class="text-sm text-gray-500">{{ miembro.telefono }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col space-y-1">
                  <span
                    v-if="miembro.tipo.includes('conductor')"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    🚗 Conductor
                  </span>
                  <span
                    v-if="miembro.tipo.includes('pasajero')"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    👤 Pasajero
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getStatusClass(miembro.estado)"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                >
                  {{ getStatusLabel(miembro.estado) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="flex flex-col">
                  <span v-if="miembro.tipo.includes('conductor')">
                    Creados: {{ miembro.viajesCreados }}
                  </span>
                  <span v-if="miembro.tipo.includes('pasajero')">
                    Reservados: {{ miembro.viajesReservados }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex items-center">
                    <span class="text-yellow-400">⭐</span>
                    <span class="ml-1 text-sm font-medium">{{ miembro.rating.toFixed(1) }}</span>
                  </div>
                  <div class="ml-2 text-sm text-gray-500">
                    ({{ miembro.totalEvaluaciones }})
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(miembro.ultimaActividad) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <!-- Botón Ver - Disponible para todos -->
                  <button
                    @click="verPerfil(miembro)"
                    class="text-blue-600 hover:text-blue-900"
                    title="Ver perfil"
                  >
                    👁️ Ver
                  </button>
                  
                  <!-- Botón Enviar Mensaje - Disponible para todos -->
                  <button
                    @click="enviarMensaje(miembro)"
                    class="text-purple-600 hover:text-purple-900"
                    title="Enviar mensaje"
                  >
                    💬 Mensaje
                  </button>
                  
                  <!-- Botón Editar - Solo para admin -->
                  <button
                    v-if="canEdit(miembro)"
                    @click="editarPerfil(miembro)"
                    class="text-green-600 hover:text-green-900"
                    title="Editar perfil (Solo Admin)"
                  >
                    ✏️ Editar
                  </button>
                  
                  <!-- Botón Cambiar Estado - Solo para admin -->
                  <button
                    v-if="canEdit(miembro)"
                    @click="cambiarEstado(miembro)"
                    :class="miembro.estado === 'activo' ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'"
                    :title="miembro.estado === 'activo' ? 'Pausar miembro (Solo Admin)' : 'Activar miembro (Solo Admin)'"
                  >
                    {{ miembro.estado === 'activo' ? '⏸️ Pausar' : '▶️ Activar' }}
                  </button>
                  
                  <!-- Botón Eliminar - Solo para admin -->
                  <button
                    v-if="canDelete(miembro)"
                    @click="eliminarMiembro(miembro)"
                    class="text-red-600 hover:text-red-900"
                    title="Eliminar miembro (Solo Admin)"
                  >
                    🗑️ Eliminar
                  </button>
                  
                  <!-- Indicador de permisos insuficientes -->
                  <span
                    v-if="!canEdit(miembro) && !canDelete(miembro)"
                    class="text-gray-400 text-xs"
                    title="Solo los administradores pueden editar miembros"
                  >
                    🔒 Solo lectura
                  </span>
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
            Mostrando {{ filteredMiembros.length }} de {{ miembros.length }} miembros
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
    
    <!-- Sección de Mis Amigos -->
    <div class="bg-white rounded-lg shadow-md mt-6">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">👥 Mis Amigos</h2>
          <button
            @click="showAddFriendModal = true"
            class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            ➕ Agregar Amigo
          </button>
        </div>
      </div>
      
      <div class="p-6">
        <div v-if="misAmigos.length === 0" class="text-center py-8">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <p class="text-gray-500">No tienes amigos agregados aún</p>
          <p class="text-sm text-gray-400 mt-1">¡Agrega amigos para compartir viajes!</p>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="amigo in misAmigos" 
            :key="amigo.id"
            class="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center space-x-3 mb-3">
              <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <span class="text-white text-lg font-semibold">
                  {{ amigo.nombre.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div>
                <h3 class="font-medium text-gray-900">{{ amigo.nombre }}</h3>
                <p class="text-sm text-gray-500">{{ amigo.email }}</p>
              </div>
            </div>
            
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-2">
                <span
                  v-if="amigo.tipo.includes('conductor')"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  🚗 Conductor
                </span>
                <span
                  v-if="amigo.tipo.includes('pasajero')"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  👤 Pasajero
                </span>
              </div>
              <div class="flex items-center">
                <span class="text-yellow-400">⭐</span>
                <span class="ml-1 text-sm font-medium">{{ amigo.rating.toFixed(1) }}</span>
              </div>
            </div>
            
            <div class="flex space-x-2">
              <button
                @click="enviarMensaje(amigo)"
                class="flex-1 px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                💬 Mensaje
              </button>
              <button
                @click="verPerfil(amigo)"
                class="flex-1 px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 transition-colors"
              >
                👁️ Ver
              </button>
              <button
                @click="eliminarAmigo(amigo)"
                class="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
                title="Eliminar amigo"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal para agregar amigo -->
    <div
      v-if="showAddFriendModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            ➕ Agregar Amigo
          </h3>
          
          <form @submit.prevent="agregarAmigo" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">🔍 Buscar miembro</label>
              <input
                v-model="searchAmigo"
                type="text"
                placeholder="Buscar por nombre o email..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                @input="buscarMiembros"
              />
            </div>
            
            <div v-if="miembrosEncontrados.length > 0" class="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
              <div
                v-for="miembro in miembrosEncontrados"
                :key="miembro.id"
                @click="seleccionarAmigo(miembro)"
                class="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span class="text-white text-sm font-semibold">
                      {{ miembro.nombre.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ miembro.nombre }}</p>
                    <p class="text-sm text-gray-500">{{ miembro.email }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
              <button
                @click="showAddFriendModal = false"
                type="button"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Modal de edición de perfil -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            ✏️ Editar Perfil de {{ selectedMiembro?.nombre }}
          </h3>
          
          <form @submit.prevent="guardarCambios" class="space-y-4">
            <!-- Información básica -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">👤 Nombre completo</label>
              <input
                v-model="editForm.nombre"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">📧 Email</label>
              <input
                v-model="editForm.email"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">📱 Teléfono</label>
              <input
                v-model="editForm.telefono"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <!-- Tipo de miembro -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">👥 Tipo de miembro</label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    v-model="editForm.tipo"
                    type="checkbox"
                    value="conductor"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-sm">🚗 Conductor</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="editForm.tipo"
                    type="checkbox"
                    value="pasajero"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-sm">👤 Pasajero</span>
                </label>
              </div>
            </div>
            
            <!-- Estado -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">📊 Estado</label>
              <select
                v-model="editForm.estado"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="activo">✅ Activo</option>
                <option value="inactivo">⏸️ Inactivo</option>
                <option value="verificado">✅ Verificado</option>
                <option value="pendiente">⏳ Pendiente</option>
              </select>
            </div>
            
            <!-- Botones -->
            <div class="flex justify-end space-x-3 pt-4">
              <button
                @click="cerrarModal"
                type="button"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                💾 Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '@/composables/useAuth';

// Interfaces
interface Miembro {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  avatar?: string;
  tipo: string[];
  estado: string;
  viajesCreados: number;
  viajesReservados: number;
  rating: number;
  totalEvaluaciones: number;
  ultimaActividad: Date;
  fechaRegistro: Date;
}

// Estado reactivo
const searchQuery = ref('');
const selectedType = ref('');
const selectedStatus = ref('');
const currentPage = ref(1);
const showEditModal = ref(false);
const selectedMiembro = ref<Miembro | null>(null);

// Estado para amigos
const showAddFriendModal = ref(false);
const searchAmigo = ref('');
const miembrosEncontrados = ref<Miembro[]>([]);
const misAmigos = ref<Miembro[]>([]);

// Sistema de roles y permisos
const { userProfile } = useAuth();

const currentUser = computed(() => ({
  id: userProfile.value?.id || 'guest',
  nombre: userProfile.value?.name || 'Usuario',
  email: userProfile.value?.email || 'usuario@compartalia.com',
  role: userProfile.value?.role === 'conductor' ? 'admin' : 'user' // Conductores pueden editar
}));

const userRoles = {
  admin: ['read', 'write', 'delete', 'edit_roles'],
  moderator: ['read', 'write'],
  user: ['read']
};

// Formulario de edición
const editForm = ref({
  nombre: '',
  email: '',
  telefono: '',
  tipo: [] as string[],
  estado: ''
});

// Datos de ejemplo
const miembros = ref<Miembro[]>([
  {
    id: '1',
    nombre: 'María García',
    email: 'maria.garcia@email.com',
    telefono: '+34600123456',
    avatar: '/images/user/user-01.jpg',
    tipo: ['conductor', 'pasajero'],
    estado: 'verificado',
    viajesCreados: 15,
    viajesReservados: 8,
    rating: 4.8,
    totalEvaluaciones: 23,
    ultimaActividad: new Date('2024-01-15'),
    fechaRegistro: new Date('2023-06-15')
  },
  {
    id: '2',
    nombre: 'Carlos López',
    email: 'carlos.lopez@email.com',
    telefono: '+34600234567',
    avatar: '/images/user/user-02.jpg',
    tipo: ['conductor'],
    estado: 'activo',
    viajesCreados: 32,
    viajesReservados: 0,
    rating: 4.6,
    totalEvaluaciones: 45,
    ultimaActividad: new Date('2024-01-14'),
    fechaRegistro: new Date('2023-08-20')
  },
  {
    id: '3',
    nombre: 'Ana Martínez',
    email: 'ana.martinez@email.com',
    telefono: '+34600345678',
    avatar: '/images/user/user-03.jpg',
    tipo: ['pasajero'],
    estado: 'activo',
    viajesCreados: 0,
    viajesReservados: 12,
    rating: 4.9,
    totalEvaluaciones: 18,
    ultimaActividad: new Date('2024-01-13'),
    fechaRegistro: new Date('2023-09-10')
  },
  {
    id: '4',
    nombre: 'David Rodríguez',
    email: 'david.rodriguez@email.com',
    telefono: '+34600456789',
    avatar: '/images/user/user-04.jpg',
    tipo: ['conductor', 'pasajero'],
    estado: 'pendiente',
    viajesCreados: 5,
    viajesReservados: 3,
    rating: 4.2,
    totalEvaluaciones: 8,
    ultimaActividad: new Date('2024-01-12'),
    fechaRegistro: new Date('2024-01-01')
  },
  {
    id: '5',
    nombre: 'Laura Sánchez',
    email: 'laura.sanchez@email.com',
    telefono: '+34600567890',
    avatar: '/images/user/user-05.jpg',
    tipo: ['conductor'],
    estado: 'inactivo',
    viajesCreados: 8,
    viajesReservados: 0,
    rating: 4.4,
    totalEvaluaciones: 12,
    ultimaActividad: new Date('2023-12-20'),
    fechaRegistro: new Date('2023-07-05')
  }
]);

// Computed properties
const filteredMiembros = computed(() => {
  let filtered = miembros.value;
  
  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(miembro =>
      miembro.nombre.toLowerCase().includes(query) ||
      miembro.email.toLowerCase().includes(query) ||
      miembro.telefono.includes(query)
    );
  }
  
  // Filtrar por tipo
  if (selectedType.value) {
    filtered = filtered.filter(miembro => {
      if (selectedType.value === 'ambos') {
        return miembro.tipo.length > 1;
      }
      return miembro.tipo.includes(selectedType.value);
    });
  }
  
  // Filtrar por estado
  if (selectedStatus.value) {
    filtered = filtered.filter(miembro => miembro.estado === selectedStatus.value);
  }
  
  return filtered;
});

const stats = computed(() => {
  const total = miembros.value.length;
  const conductores = miembros.value.filter(m => m.tipo.includes('conductor')).length;
  const pasajeros = miembros.value.filter(m => m.tipo.includes('pasajero')).length;
  const verificados = miembros.value.filter(m => m.estado === 'verificado').length;
  const amigos = misAmigos.value.length;
  
  return { total, conductores, pasajeros, verificados, amigos };
});

const totalPages = computed(() => {
  return Math.ceil(filteredMiembros.value.length / 10);
});

// Métodos de verificación de permisos
function hasPermission(permission: string): boolean {
  const userRole = currentUser.value.role;
  return userRoles[userRole as keyof typeof userRoles]?.includes(permission) || false;
}

function canEdit(miembro: Miembro): boolean {
  // Solo admin puede editar
  return hasPermission('write');
}

function canDelete(miembro: Miembro): boolean {
  // Solo admin puede eliminar
  return hasPermission('delete');
}

function canEditRoles(miembro: Miembro): boolean {
  // Solo admin puede editar roles
  return hasPermission('edit_roles');
}

// Métodos
function getStatusClass(estado: string): string {
  const classes = {
    'activo': 'bg-green-100 text-green-800',
    'inactivo': 'bg-gray-100 text-gray-800',
    'verificado': 'bg-blue-100 text-blue-800',
    'pendiente': 'bg-yellow-100 text-yellow-800'
  };
  return classes[estado as keyof typeof classes] || 'bg-gray-100 text-gray-800';
}

function getStatusLabel(estado: string): string {
  const labels = {
    'activo': '✅ Activo',
    'inactivo': '⏸️ Inactivo',
    'verificado': '✅ Verificado',
    'pendiente': '⏳ Pendiente'
  };
  return labels[estado as keyof typeof labels] || estado;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function verPerfil(miembro: Miembro) {
  // TODO: Implementar vista de perfil
  console.log('Ver perfil de:', miembro.nombre);
}

function enviarMensaje(miembro: Miembro) {
  // Navegar a la página de mensajería con el usuario seleccionado
  window.location.href = `/carpooling/mensajeria?user=${miembro.id}`;
}

function editarPerfil(miembro: Miembro) {
  selectedMiembro.value = miembro;
  editForm.value = {
    nombre: miembro.nombre,
    email: miembro.email,
    telefono: miembro.telefono,
    tipo: [...miembro.tipo],
    estado: miembro.estado
  };
  showEditModal.value = true;
}

function cambiarEstado(miembro: Miembro) {
  miembro.estado = miembro.estado === 'activo' ? 'inactivo' : 'activo';
}

function guardarCambios() {
  if (selectedMiembro.value) {
    const index = miembros.value.findIndex(m => m.id === selectedMiembro.value!.id);
    if (index !== -1) {
      miembros.value[index] = {
        ...miembros.value[index],
        nombre: editForm.value.nombre,
        email: editForm.value.email,
        telefono: editForm.value.telefono,
        tipo: editForm.value.tipo,
        estado: editForm.value.estado
      };
    }
  }
  cerrarModal();
}

function cerrarModal() {
  showEditModal.value = false;
  selectedMiembro.value = null;
  editForm.value = {
    nombre: '',
    email: '',
    telefono: '',
    tipo: [],
    estado: ''
  };
}

// Funciones para manejar amigos
function buscarMiembros() {
  if (searchAmigo.value.length < 2) {
    miembrosEncontrados.value = [];
    return;
  }
  
  const query = searchAmigo.value.toLowerCase();
  miembrosEncontrados.value = miembros.value.filter(miembro => {
    const esAmigo = misAmigos.value.some(amigo => amigo.id === miembro.id);
    const coincide = miembro.nombre.toLowerCase().includes(query) || 
                    miembro.email.toLowerCase().includes(query);
    return !esAmigo && coincide;
  });
}

function seleccionarAmigo(miembro: Miembro) {
  // Agregar a la lista de amigos
  misAmigos.value.push(miembro);
  
  // Limpiar búsqueda
  searchAmigo.value = '';
  miembrosEncontrados.value = [];
  showAddFriendModal.value = false;
  
  console.log('Amigo agregado:', miembro.nombre);
}

function eliminarAmigo(amigo: Miembro) {
  const index = misAmigos.value.findIndex(a => a.id === amigo.id);
  if (index !== -1) {
    misAmigos.value.splice(index, 1);
    console.log('Amigo eliminado:', amigo.nombre);
  }
}

function eliminarMiembro(miembro: Miembro) {
  if (confirm(`¿Estás seguro de que quieres eliminar a ${miembro.nombre}?`)) {
    const index = miembros.value.findIndex(m => m.id === miembro.id);
    if (index !== -1) {
      miembros.value.splice(index, 1);
    }
  }
}

// Inicialización
onMounted(() => {
  console.log('Componente Miembros montado');
  
  // Cargar amigos de ejemplo
  misAmigos.value = [
    miembros.value[0], // María García
    miembros.value[1], // Carlos López
  ];
});
</script>

<style scoped>
/* Estilos adicionales si es necesario */
</style>
