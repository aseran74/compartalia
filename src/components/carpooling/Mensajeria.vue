<template>
  <div class="p-6 max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">💬 Sistema de Mensajería</h1>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Lista de conversaciones -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow-md">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-semibold">📋 Conversaciones</h2>
            <div class="mt-2">
              <input
                v-model="searchConversations"
                type="text"
                placeholder="Buscar conversaciones..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div class="max-h-96 overflow-y-auto">
            <div
              v-for="conversation in filteredConversations"
              :key="conversation.id"
              @click="selectConversation(conversation)"
              :class="[
                'p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50',
                selectedConversation?.id === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              ]"
            >
              <div class="flex items-center space-x-3">
                <img
                  :src="conversation.otherUser.avatar || '/images/user/default-avatar.png'"
                  :alt="conversation.otherUser.nombre"
                  class="h-10 w-10 rounded-full object-cover"
                />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ conversation.otherUser.nombre }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ formatTime(conversation.lastMessage.fecha) }}
                    </p>
                  </div>
                  <p class="text-sm text-gray-600 truncate">
                    {{ conversation.lastMessage.contenido }}
                  </p>
                  <div class="flex items-center justify-between mt-1">
                    <span
                      :class="[
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        conversation.otherUser.tipo.includes('conductor') ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      ]"
                    >
                      {{ conversation.otherUser.tipo.includes('conductor') ? '🚗 Conductor' : '👤 Pasajero' }}
                    </span>
                    <span
                      v-if="conversation.unreadCount > 0"
                      class="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full"
                    >
                      {{ conversation.unreadCount }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Área de chat -->
      <div class="lg:col-span-2">
        <div v-if="selectedConversation" class="bg-white rounded-lg shadow-md h-96 flex flex-col">
          <!-- Header del chat -->
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <img
                :src="selectedConversation.otherUser.avatar || '/images/user/default-avatar.png'"
                :alt="selectedConversation.otherUser.nombre"
                class="h-8 w-8 rounded-full object-cover"
              />
              <div>
                <h3 class="text-lg font-medium text-gray-900">
                  {{ selectedConversation.otherUser.nombre }}
                </h3>
                <p class="text-sm text-gray-500">
                  {{ selectedConversation.otherUser.email }}
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <span
                :class="[
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  selectedConversation.otherUser.tipo.includes('conductor') ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                ]"
              >
                {{ selectedConversation.otherUser.tipo.includes('conductor') ? '🚗 Conductor' : '👤 Pasajero' }}
              </span>
              <button
                @click="verPerfilUsuario(selectedConversation.otherUser)"
                class="text-blue-600 hover:text-blue-900 text-sm"
              >
                👁️ Ver Perfil
              </button>
            </div>
          </div>
          
          <!-- Mensajes -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="messagesContainer">
            <div
              v-for="mensaje in selectedConversation.mensajes"
              :key="mensaje.id"
              :class="[
                'flex',
                mensaje.remitenteId === currentUser.id ? 'justify-end' : 'justify-start'
              ]"
            >
              <div
                :class="[
                  'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                  mensaje.remitenteId === currentUser.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-900'
                ]"
              >
                <p class="text-sm">{{ mensaje.contenido }}</p>
                <p
                  :class="[
                    'text-xs mt-1',
                    mensaje.remitenteId === currentUser.id ? 'text-blue-100' : 'text-gray-500'
                  ]"
                >
                  {{ formatDateTime(mensaje.fecha) }}
                </p>
              </div>
            </div>
          </div>
          
          <!-- Input de mensaje -->
          <div class="px-6 py-4 border-t border-gray-200">
            <form @submit.prevent="enviarMensaje" class="flex space-x-2">
              <input
                v-model="nuevoMensaje"
                type="text"
                placeholder="Escribe tu mensaje..."
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :disabled="!canSendMessage"
              />
              <button
                type="submit"
                :disabled="!nuevoMensaje.trim() || !canSendMessage"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📤 Enviar
              </button>
            </form>
          </div>
        </div>
        
        <!-- Estado cuando no hay conversación seleccionada -->
        <div v-else class="bg-white rounded-lg shadow-md h-96 flex items-center justify-center">
          <div class="text-center">
            <div class="text-6xl mb-4">💬</div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              Selecciona una conversación
            </h3>
            <p class="text-gray-500">
              Elige una conversación de la lista para comenzar a chatear
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de perfil de usuario -->
    <div
      v-if="showProfileModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              👤 Perfil de {{ selectedUser?.nombre }}
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
                :src="selectedUser?.avatar || '/images/user/default-avatar.png'"
                :alt="selectedUser?.nombre"
                class="h-16 w-16 rounded-full object-cover"
              />
              <div>
                <h4 class="text-lg font-medium text-gray-900">{{ selectedUser?.nombre }}</h4>
                <p class="text-sm text-gray-500">{{ selectedUser?.email }}</p>
                <p class="text-sm text-gray-500">{{ selectedUser?.telefono }}</p>
              </div>
            </div>
            
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Tipo:</span>
                <div class="flex space-x-2">
                  <span
                    v-if="selectedUser?.tipo.includes('conductor')"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    🚗 Conductor
                  </span>
                  <span
                    v-if="selectedUser?.tipo.includes('pasajero')"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    👤 Pasajero
                  </span>
                </div>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Estado:</span>
                <span
                  :class="getStatusClass(selectedUser?.estado || '')"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ getStatusLabel(selectedUser?.estado || '') }}
                </span>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Rating:</span>
                <div class="flex items-center">
                  <span class="text-yellow-400">⭐</span>
                  <span class="ml-1 text-sm font-medium">{{ selectedUser?.rating?.toFixed(1) }}</span>
                </div>
              </div>
            </div>
            
            <div class="pt-4 border-t border-gray-200">
              <button
                @click="iniciarNuevaConversacion"
                class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                💬 Iniciar Conversación
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';

// Interfaces
interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  avatar?: string;
  tipo: string[];
  estado: string;
  rating: number;
}

interface Mensaje {
  id: string;
  conversacionId: string;
  remitenteId: string;
  contenido: string;
  fecha: Date;
  leido: boolean;
}

interface Conversacion {
  id: string;
  usuario1Id: string;
  usuario2Id: string;
  otherUser: Usuario;
  mensajes: Mensaje[];
  lastMessage: Mensaje;
  unreadCount: number;
  fechaCreacion: Date;
}

// Estado reactivo
const searchConversations = ref('');
const selectedConversation = ref<Conversacion | null>(null);
const nuevoMensaje = ref('');
const showProfileModal = ref(false);
const selectedUser = ref<Usuario | null>(null);
const messagesContainer = ref<HTMLElement | null>(null);

// Usuario actual (simulado)
const currentUser = ref({
  id: 'user-1',
  nombre: 'Usuario Actual',
  email: 'usuario@compartalia.com'
});

// Datos de ejemplo
const conversaciones = ref<Conversacion[]>([
  {
    id: 'conv-1',
    usuario1Id: 'user-1',
    usuario2Id: 'user-2',
    otherUser: {
      id: 'user-2',
      nombre: 'María García',
      email: 'maria.garcia@email.com',
      telefono: '+34600123456',
      avatar: '/images/user/user-01.jpg',
      tipo: ['conductor', 'pasajero'],
      estado: 'verificado',
      rating: 4.8
    },
    mensajes: [
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
      }
    ],
    lastMessage: {
      id: 'msg-5',
      conversacionId: 'conv-1',
      remitenteId: 'user-2',
      contenido: 'Serían 15€ por persona. ¿Te parece bien?',
      fecha: new Date('2024-01-15T10:50:00'),
      leido: false
    },
    unreadCount: 1,
    fechaCreacion: new Date('2024-01-15T10:30:00')
  },
  {
    id: 'conv-2',
    usuario1Id: 'user-1',
    usuario2Id: 'user-3',
    otherUser: {
      id: 'user-3',
      nombre: 'Carlos López',
      email: 'carlos.lopez@email.com',
      telefono: '+34600234567',
      avatar: '/images/user/user-02.jpg',
      tipo: ['conductor'],
      estado: 'activo',
      rating: 4.6
    },
    mensajes: [
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
      }
    ],
    lastMessage: {
      id: 'msg-7',
      conversacionId: 'conv-2',
      remitenteId: 'user-1',
      contenido: '¡Hola Carlos! ¿A qué hora y desde dónde?',
      fecha: new Date('2024-01-14T15:25:00'),
      leido: true
    },
    unreadCount: 0,
    fechaCreacion: new Date('2024-01-14T15:20:00')
  }
]);

// Computed properties
const filteredConversations = computed(() => {
  if (!searchConversations.value) {
    return conversaciones.value;
  }
  
  const query = searchConversations.value.toLowerCase();
  return conversaciones.value.filter(conv =>
    conv.otherUser.nombre.toLowerCase().includes(query) ||
    conv.otherUser.email.toLowerCase().includes(query) ||
    conv.lastMessage.contenido.toLowerCase().includes(query)
  );
});

const canSendMessage = computed(() => {
  return selectedConversation.value && selectedConversation.value.otherUser.estado === 'activo';
});

// Métodos
function selectConversation(conversation: Conversacion) {
  selectedConversation.value = conversation;
  // Marcar mensajes como leídos
  conversation.mensajes.forEach(mensaje => {
    if (mensaje.remitenteId !== currentUser.value.id) {
      mensaje.leido = true;
    }
  });
  conversation.unreadCount = 0;
  
  // Scroll al final de los mensajes
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

function enviarMensaje() {
  if (!nuevoMensaje.value.trim() || !selectedConversation.value) return;
  
  const nuevoMensajeObj: Mensaje = {
    id: `msg-${Date.now()}`,
    conversacionId: selectedConversation.value.id,
    remitenteId: currentUser.value.id,
    contenido: nuevoMensaje.value.trim(),
    fecha: new Date(),
    leido: false
  };
  
  selectedConversation.value.mensajes.push(nuevoMensajeObj);
  selectedConversation.value.lastMessage = nuevoMensajeObj;
  
  nuevoMensaje.value = '';
  
  // Scroll al final
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

function verPerfilUsuario(usuario: Usuario) {
  selectedUser.value = usuario;
  showProfileModal.value = true;
}

function iniciarNuevaConversacion() {
  if (selectedUser.value) {
    // Buscar conversación existente o crear nueva
    let conversacion = conversaciones.value.find(conv =>
      conv.usuario1Id === currentUser.value.id && conv.usuario2Id === selectedUser.value!.id ||
      conv.usuario1Id === selectedUser.value!.id && conv.usuario2Id === currentUser.value.id
    );
    
    if (!conversacion) {
      // Crear nueva conversación
      conversacion = {
        id: `conv-${Date.now()}`,
        usuario1Id: currentUser.value.id,
        usuario2Id: selectedUser.value.id,
        otherUser: selectedUser.value,
        mensajes: [],
        lastMessage: {
          id: '',
          conversacionId: '',
          remitenteId: '',
          contenido: '',
          fecha: new Date(),
          leido: false
        },
        unreadCount: 0,
        fechaCreacion: new Date()
      };
      conversaciones.value.unshift(conversacion);
    }
    
    selectConversation(conversacion);
    showProfileModal.value = false;
  }
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  
  return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
}

function formatDateTime(date: Date): string {
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
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

// Inicialización
onMounted(() => {
  console.log('Componente Mensajería montado');
});
</script>

<style scoped>
/* Estilos adicionales si es necesario */
</style>
