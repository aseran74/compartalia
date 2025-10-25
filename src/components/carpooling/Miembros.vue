<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header móvil -->
    <div class="lg:hidden bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
      <button
        @click="$router.back()"
        class="p-2 text-gray-600 hover:text-gray-900"
      >
        ← Volver
      </button>
      <h1 class="text-lg font-semibold text-gray-900">👥 Miembros</h1>
      <button
        @click="showFilters = !showFilters"
        class="p-2 text-blue-600 hover:text-blue-800"
      >
        🔍
      </button>
    </div>

    <!-- Header desktop -->
    <div class="hidden lg:block bg-white shadow-sm border-b px-6 py-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">👥 Gestión de Miembros</h1>
        <div v-if="!isAuthenticated" class="flex items-center space-x-4">
          <span class="text-sm text-red-600">⚠️ No autenticado</span>
          <button
            @click="router.push('/login')"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔐 Iniciar Sesión
          </button>
        </div>
        <div v-else class="flex items-center space-x-2">
          <span class="text-sm text-green-600">✅ Autenticado</span>
          <span class="text-sm text-gray-600">{{ user?.email }}</span>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto p-4 lg:p-6">
      <!-- Filtros móviles -->
      <div v-if="showFilters" class="lg:hidden bg-white rounded-lg shadow-md p-4 mb-4">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">🔍 Buscar</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Nombre, email..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select
                v-model="selectedType"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="conductor">🚗 Conductor</option>
                <option value="pasajero">👤 Pasajero</option>
                <option value="ambos">🔄 Ambos</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                v-model="selectedStatus"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="activo">✅ Activo</option>
                <option value="inactivo">⏸️ Inactivo</option>
                <option value="verificado">✅ Verificado</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros desktop -->
      <div class="hidden lg:block bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex flex-col md:flex-row gap-4 mb-6">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">🔍 Buscar miembros</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="md:w-48">
            <label class="block text-sm font-medium text-gray-700 mb-2">👤 Tipo</label>
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
            </select>
          </div>
        </div>
        
        <!-- Estadísticas -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div class="bg-blue-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-blue-600">{{ stats.total }}</div>
            <div class="text-sm text-blue-600">Total</div>
          </div>
          <div class="bg-green-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-green-600">{{ stats.conductores }}</div>
            <div class="text-sm text-green-600">Conductores</div>
          </div>
          <div class="bg-purple-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-purple-600">{{ stats.pasajeros }}</div>
            <div class="text-sm text-purple-600">Pasajeros</div>
          </div>
          <div class="bg-orange-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-orange-600">{{ stats.verificados }}</div>
            <div class="text-sm text-orange-600">Verificados</div>
          </div>
          <div class="bg-pink-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-pink-600">{{ stats.amigos }}</div>
            <div class="text-sm text-pink-600">Amigos</div>
          </div>
        </div>
      </div>

      <!-- Lista de miembros -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <!-- Header desktop -->
        <div class="hidden lg:block px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold">📋 Lista de Miembros</h2>
        </div>
        
        <!-- Estado de carga -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p class="text-gray-600">Cargando miembros...</p>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
          <div class="flex items-center">
            <span class="text-red-600 mr-2">⚠️</span>
            <p class="text-red-800">{{ error }}</p>
          </div>
          <button 
            @click="loadMembers"
            class="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            🔄 Reintentar
          </button>
        </div>

        <!-- Lista móvil -->
        <div v-else class="lg:hidden">
          <div
            v-for="miembro in filteredMembers"
            :key="miembro.id"
            class="p-4 border-b border-gray-100 hover:bg-gray-50"
          >
            <div class="flex items-center space-x-3">
              <div class="relative">
                <img
                  :src="miembro.avatar || '/images/user/default-avatar.png'"
                  :alt="miembro.nombre"
                  class="h-12 w-12 rounded-full object-cover"
                  @error="(event: any) => event.target.src = '/images/user/default-avatar.png'"
                />
                <div
                  :class="[
                    'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
                    miembro.estado === 'activo' ? 'bg-green-400' : 'bg-gray-400'
                  ]"
                ></div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-medium text-gray-900 truncate">
                    {{ miembro.nombre }}
                  </h3>
                  <div class="flex items-center space-x-2">
                    <span
                      :class="[
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        miembro.tipo.includes('conductor') ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      ]"
                    >
                      {{ miembro.tipo.includes('conductor') ? '🚗' : '👤' }}
                    </span>
                    <span
                      :class="getStatusClass(miembro.estado)"
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    >
                      {{ getStatusLabel(miembro.estado) }}
                    </span>
                  </div>
                </div>
                <p class="text-sm text-gray-500 truncate">{{ miembro.email }}</p>
                <div class="flex items-center justify-between mt-2">
                  <div class="flex items-center space-x-4">
                    <div class="flex items-center space-x-1">
                      <span class="text-yellow-400 text-sm">⭐</span>
                      <span class="text-sm text-gray-600">{{ miembro.rating.toFixed(1) }}</span>
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ miembro.viajesCompletados }} viajes
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button
                      @click="toggleAmigo(miembro)"
                      :class="[
                        'p-2 rounded-full transition-colors',
                        miembro.esAmigo ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-600'
                      ]"
                      :title="miembro.esAmigo ? 'Quitar de amigos' : 'Añadir a amigos'"
                    >
                      {{ miembro.esAmigo ? '❤️' : '🤍' }}
                    </button>
                    <button
                      @click="iniciarConversacion(miembro)"
                      class="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                      title="Enviar mensaje"
                    >
                      💬
                    </button>
                    <button
                      @click="verPerfil(miembro)"
                      class="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                      title="Ver perfil"
                    >
                      👁️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabla desktop -->
        <div v-if="!loading && !error" class="hidden lg:block overflow-x-auto">
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
              <tr
                v-for="miembro in filteredMembers"
                :key="miembro.id"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="relative">
                      <img
                        :src="miembro.avatar || '/images/user/default-avatar.png'"
                        :alt="miembro.nombre"
                        class="h-10 w-10 rounded-full object-cover"
                        @error="(event: any) => event.target.src = '/images/user/default-avatar.png'"
                      />
                      <div
                        :class="[
                          'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
                          miembro.estado === 'activo' ? 'bg-green-400' : 'bg-gray-400'
                        ]"
                      ></div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ miembro.nombre }}</div>
                      <div class="text-sm text-gray-500">{{ miembro.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      miembro.tipo.includes('conductor') ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    ]"
                  >
                    {{ miembro.tipo.includes('conductor') ? '🚗 Conductor' : '👤 Pasajero' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="getStatusClass(miembro.estado)"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {{ getStatusLabel(miembro.estado) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ miembro.viajesCompletados }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <span class="text-yellow-400 mr-1">⭐</span>
                    <span class="text-sm font-medium">{{ miembro.rating.toFixed(1) }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(miembro.ultimaActividad) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center space-x-2">
                    <button
                      @click="toggleAmigo(miembro)"
                      :class="[
                        'p-2 rounded-full transition-colors',
                        miembro.esAmigo ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-600'
                      ]"
                      :title="miembro.esAmigo ? 'Quitar de amigos' : 'Añadir a amigos'"
                    >
                      {{ miembro.esAmigo ? '❤️' : '🤍' }}
                    </button>
                    <button
                      @click="iniciarConversacion(miembro)"
                      class="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                      title="Enviar mensaje"
                    >
                      💬
                    </button>
                    <button
                      @click="verPerfil(miembro)"
                      class="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                      title="Ver perfil"
                    >
                      👁️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Estado vacío -->
        <div v-if="filteredMembers.length === 0" class="p-8 text-center">
          <div class="text-4xl mb-4">👥</div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No hay miembros</h3>
          <p class="text-gray-500">No se encontraron miembros con los filtros aplicados</p>
        </div>
      </div>
    </div>

    <!-- Modal de perfil -->
    <div
      v-if="showProfileModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              👤 Perfil de {{ selectedMember?.nombre }}
            </h3>
            <button
              @click="showProfileModal = false"
              class="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div class="space-y-4">
            <div class="flex items-center space-x-4">
              <img
                :src="selectedMember?.avatar || '/images/user/default-avatar.png'"
                :alt="selectedMember?.nombre"
                class="h-16 w-16 rounded-full object-cover"
              />
              <div>
                <h4 class="text-lg font-medium text-gray-900">{{ selectedMember?.nombre }}</h4>
                <p class="text-sm text-gray-500">{{ selectedMember?.email }}</p>
                <p class="text-sm text-gray-500">{{ selectedMember?.telefono }}</p>
              </div>
            </div>
            
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Tipo:</span>
                <span
                  :class="[
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    selectedMember?.tipo.includes('conductor') ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  ]"
                >
                  {{ selectedMember?.tipo.includes('conductor') ? '🚗 Conductor' : '👤 Pasajero' }}
                </span>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Estado:</span>
                <span
                  :class="getStatusClass(selectedMember?.estado || '')"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ getStatusLabel(selectedMember?.estado || '') }}
                </span>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Rating:</span>
                <div class="flex items-center">
                  <span class="text-yellow-400">⭐</span>
                  <span class="ml-1 text-sm font-medium">{{ selectedMember?.rating?.toFixed(1) }}</span>
                </div>
              </div>
            </div>
            
            <div class="pt-4 border-t border-gray-200 flex space-x-2">
              <button
                @click="iniciarConversacion(selectedMember)"
                class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                💬 Mensaje
              </button>
              <button
                @click="toggleAmigo(selectedMember)"
                :class="[
                  'flex-1 px-4 py-2 rounded-md',
                  selectedMember?.esAmigo ? 'bg-pink-100 text-pink-600 hover:bg-pink-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                ]"
              >
                {{ selectedMember?.esAmigo ? '❤️ Quitar Amigo' : '🤍 Añadir Amigo' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { messagingService } from '@/services/messagingService';
import { useAuth } from '@/composables/useAuth';
import { supabaseClean } from '@/config/supabaseClean';

const router = useRouter();
const { user, isAuthenticated } = useAuth();

// Estado reactivo
const searchQuery = ref('');
const selectedType = ref('');
const selectedStatus = ref('');
const showFilters = ref(false);
const showProfileModal = ref(false);
const selectedMember = ref<any>(null);

// Estado reactivo
const loading = ref(false);
const error = ref('');

// Datos de miembros (se cargarán desde Supabase)
const miembros = ref<any[]>([]);

// Computed properties
const filteredMembers = computed(() => {
  let filtered = miembros.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(miembro =>
      miembro.nombre.toLowerCase().includes(query) ||
      miembro.email.toLowerCase().includes(query) ||
      miembro.telefono.includes(query)
    );
  }

  if (selectedType.value) {
    if (selectedType.value === 'conductor') {
      filtered = filtered.filter(miembro => miembro.tipo.includes('conductor'));
    } else if (selectedType.value === 'pasajero') {
      filtered = filtered.filter(miembro => miembro.tipo.includes('pasajero'));
    } else if (selectedType.value === 'ambos') {
      filtered = filtered.filter(miembro => miembro.tipo.length > 1);
    }
  }

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
  const amigos = miembros.value.filter(m => m.esAmigo).length;

  return { total, conductores, pasajeros, verificados, amigos };
});

// Función para cargar miembros desde Supabase
async function loadMembers() {
  try {
    loading.value = true;
    error.value = '';
    
    console.log('Cargando miembros desde Supabase...');
    
    const { data, error: supabaseError } = await supabaseClean
      .from('profiles')
      .select(`
        id,
        name,
        email,
        avatar_url,
        role,
        phone,
        created_at
      )
      .order('created_at', { ascending: false });

    if (supabaseError) {
      console.error('Error cargando miembros:', supabaseError);
      error.value = 'Error al cargar los miembros';
      return;
    }

    console.log('Miembros cargados:', data);

    // Transformar datos de Supabase al formato esperado
    miembros.value = (data || []).map(profile => ({
      id: profile.id,
      nombre: profile.name || 'Sin nombre',
      email: profile.email,
      telefono: profile.phone || 'Sin teléfono',
      avatar: profile.avatar_url || '/images/user/default-avatar.jpg',
      tipo: [profile.role || 'pasajero'],
      estado: 'activo', // Por defecto activo
      rating: 4.5, // Rating por defecto
      viajesCompletados: 0, // Se puede calcular después
      ultimaActividad: new Date(profile.created_at),
      esAmigo: false // Se puede implementar lógica de amigos después
    }));

    console.log('Miembros transformados:', miembros.value);
    
  } catch (err) {
    console.error('Error en loadMembers:', err);
    error.value = 'Error al cargar los miembros';
  } finally {
    loading.value = false;
  }
}

// Métodos
function toggleAmigo(miembro: any) {
  miembro.esAmigo = !miembro.esAmigo;
}

async function iniciarConversacion(miembro: any) {
  try {
    console.log('Iniciando conversación con:', miembro.nombre);
    console.log('Usuario autenticado:', isAuthenticated.value);
    console.log('Usuario actual:', user.value);
    
    // Verificar que el usuario esté autenticado usando Firebase Auth
    if (!isAuthenticated.value || !user.value) {
      alert('Debes estar autenticado para enviar mensajes. Por favor, inicia sesión primero.');
      // Redirigir al login
      router.push('/login');
      return;
    }

    console.log('Usuario autenticado correctamente, procediendo...');

    // Intentar crear conversación
    try {
      const conversation = await messagingService.createConversation(miembro.id, user.value?.uid);
      if (conversation) {
        console.log('Conversación creada:', conversation);
        // Navegar a mensajería
        router.push('/carpooling/mensajeria');
        return;
      }
    } catch (createError) {
      console.log('Error creando conversación, navegando directamente:', createError);
    }

    // Si no se puede crear la conversación, navegar directamente a mensajería
    // Pasando el ID del usuario como parámetro
    router.push(`/carpooling/mensajeria?user=${miembro.id}`);
    
  } catch (error) {
    console.error('Error en iniciarConversacion:', error);
    // Navegar a mensajería de todas formas con el parámetro
    router.push(`/carpooling/mensajeria?user=${miembro.id}`);
  }
}

function verPerfil(miembro: any) {
  selectedMember.value = miembro;
  showProfileModal.value = true;
}

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

onMounted(async () => {
  console.log('Componente Miembros montado');
  await loadMembers();
});
</script>

<style scoped>
/* Estilos adicionales si es necesario */
</style>