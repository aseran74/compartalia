<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <!-- Header móvil -->
    <div class="lg:hidden bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
      <button
        v-if="showMobileChat"
        @click="showMobileChat = false"
        class="p-2 text-gray-600 hover:text-gray-900"
      >
        ← Volver
      </button>
      <h1 class="text-lg font-semibold text-gray-900">💬 Mensajes</h1>
      <button
        @click="showNewChatModal = true"
        class="p-2 text-blue-600 hover:text-blue-800"
      >
        ✉️
      </button>
    </div>

    <!-- Header desktop -->
    <div class="hidden lg:block bg-white shadow-sm border-b px-6 py-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">💬 Sistema de Mensajería</h1>
        <button
          @click="runDiagnostics"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
          title="Ejecutar diagnóstico del sistema de mensajería"
        >
          <span>🔧</span>
          <span>Diagnóstico</span>
        </button>
      </div>
    </div>
    
    <div class="flex-1 flex overflow-hidden">
      <!-- Lista de conversaciones -->
      <div 
        :class="[
          'bg-white shadow-lg border-r border-gray-200 transition-all duration-300',
          'lg:w-1/3',
          showMobileChat ? 'hidden' : 'w-full lg:block'
        ]"
      >
        <div class="h-full flex flex-col">
          <!-- Búsqueda -->
          <div class="p-4 border-b border-gray-200">
            <div class="relative">
              <input
                v-model="searchConversations"
                type="text"
                placeholder="Buscar conversaciones..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-400">🔍</span>
              </div>
            </div>
          </div>
          
          <!-- Lista de conversaciones -->
          <div class="flex-1 overflow-y-auto">
            <div
              v-for="conversation in filteredConversations"
              :key="conversation.id"
              @click="selectConversation(conversation)"
              :class="[
                'p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors duration-200',
                selectedConversation?.id === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              ]"
            >
              <div class="flex items-center space-x-3">
                <div class="relative">
                  <img
                    :src="getAvatarUrl(conversation.otherUser?.avatar_url)"
                    :alt="conversation.otherUser?.name || 'Usuario'"
                    class="h-12 w-12 rounded-full object-cover bg-gray-200"
                    loading="lazy"
                    @error.once="(event: any) => event.target.src = '/images/user/default-avatar.png'"
                  />
                  <!-- Indicador de estado online -->
                  <div
                    :class="[
                      'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
                      conversation.otherUser?.role === 'admin' ? 'bg-green-400' : 'bg-gray-400'
                    ]"
                  ></div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ conversation.otherUser?.name || 'Usuario' }}
                    </p>
                    <div class="flex items-center space-x-2">
                      <p class="text-xs text-gray-500">
                        {{ conversation.last_message ? formatTime(conversation.last_message.created_at) : '' }}
                      </p>
                      <span
                        v-if="conversation.unread_count > 0"
                        class="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full"
                      >
                        {{ conversation.unread_count }}
                      </span>
                    </div>
                  </div>
                  <p class="text-sm text-gray-600 truncate mt-1">
                    {{ conversation.last_message?.content || 'Sin mensajes' }}
                  </p>
                  <div class="flex items-center justify-between mt-2">
                    <span
                      :class="[
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        conversation.otherUser?.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      ]"
                    >
                      {{ conversation.otherUser?.role === 'admin' ? '🚗 Admin' : '👤 Usuario' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Estado vacío -->
            <div v-if="filteredConversations.length === 0" class="p-8 text-center">
              <div class="text-4xl mb-4">💬</div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">No hay conversaciones</h3>
              <p class="text-gray-500 mb-4">Inicia una nueva conversación</p>
              <button
                @click="showNewChatModal = true"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                💬 Nueva Conversación
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Área de chat -->
      <div 
        :class="[
          'flex-1 flex flex-col bg-white',
          showMobileChat ? 'block' : 'hidden lg:flex'
        ]"
      >
        <div v-if="selectedConversation" class="flex-1 flex flex-col h-full">
          <!-- Header del chat -->
          <div class="px-4 lg:px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="relative">
                <img
                  :src="getAvatarUrl(selectedConversation.otherUser?.avatar_url)"
                  :alt="selectedConversation.otherUser?.name || 'Usuario'"
                  class="h-10 w-10 rounded-full object-cover bg-gray-200"
                  loading="lazy"
                  @error.once="(event: any) => event.target.src = '/images/user/default-avatar.png'"
                />
                <div
                  :class="[
                    'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
                    selectedConversation.otherUser.role === 'admin' ? 'bg-green-400' : 'bg-gray-400'
                  ]"
                ></div>
              </div>
              <div>
                <h3 class="text-lg font-medium text-gray-900">
                  {{ selectedConversation.otherUser?.name || 'Usuario' }}
                </h3>
                <p class="text-sm text-gray-500">
                  {{ selectedConversation.otherUser?.id || 'ID no disponible' }}
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <span
                :class="[
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  selectedConversation.otherUser?.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                ]"
              >
                {{ selectedConversation.otherUser?.role === 'admin' ? '🚗 Admin' : '👤 Usuario' }}
              </span>
              <button
                @click="verPerfilUsuario(selectedConversation.otherUser)"
                class="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                title="Ver Perfil"
              >
                👁️
              </button>
            </div>
          </div>
          
          <!-- Mensajes -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="messagesContainer">
            <div
              v-for="mensaje in mensajes"
              :key="mensaje.id"
              :class="[
                'flex',
                mensaje.sender_id === currentUser.id ? 'justify-end' : 'justify-start'
              ]"
            >
              <div
                :class="[
                  'max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm',
                  mensaje.sender_id === currentUser.id
                    ? 'bg-blue-500 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-900 rounded-bl-md'
                ]"
              >
                <p class="text-sm leading-relaxed">{{ mensaje.content }}</p>
                <div class="flex items-center justify-end mt-1 space-x-1">
                  <p
                    :class="[
                      'text-xs',
                      mensaje.sender_id === currentUser.id ? 'text-blue-100' : 'text-gray-500'
                    ]"
                  >
                    {{ formatDateTime(mensaje.created_at) }}
                  </p>
                  <span
                    v-if="mensaje.sender_id === currentUser.id"
                    class="text-xs"
                  >
                    {{ mensaje.read_at ? '✓✓' : '✓' }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Indicador de escritura -->
            <div v-if="isTyping" class="flex justify-start">
              <div class="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div class="flex space-x-1">
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Input de mensaje -->
          <div class="px-4 lg:px-6 py-4 border-t border-gray-200 bg-white">
            <form @submit.prevent="enviarMensaje" class="flex space-x-2">
              <div class="flex-1 relative">
                <input
                  v-model="nuevoMensaje"
                  type="text"
                  placeholder="Escribe tu mensaje..."
                  class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  :disabled="!canSendMessage"
                  @keydown.enter="enviarMensaje"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  😊
                </button>
              </div>
              <button
                type="submit"
                :disabled="!nuevoMensaje.trim() || !canSendMessage"
                class="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <span>📤</span>
                <span class="hidden sm:inline">Enviar</span>
              </button>
            </form>
          </div>
        </div>
        
        <!-- Estado cuando no hay conversación seleccionada -->
        <div v-else class="flex-1 flex items-center justify-center bg-gray-50">
          <div class="text-center p-8">
            <div class="text-6xl mb-4">💬</div>
            <h3 class="text-xl font-medium text-gray-900 mb-2">
              Selecciona una conversación
            </h3>
            <p class="text-gray-500 mb-6">
              Elige una conversación de la lista para comenzar a chatear
            </p>
            <button
              @click="showNewChatModal = true"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              💬 Nueva Conversación
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de nueva conversación -->
    <div
      v-if="showNewChatModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              💬 Nueva Conversación
            </h3>
            <button
              @click="showNewChatModal = false"
              class="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Buscar usuario
              </label>
              <input
                v-model="searchNewUser"
                type="text"
                placeholder="Nombre o email..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div class="max-h-60 overflow-y-auto">
              <div
                v-for="user in filteredUsers"
                :key="user.id"
                @click="iniciarNuevaConversacionConUsuario(user)"
                class="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center space-x-3">
                  <img
                    :src="user.avatar || '/images/user/default-avatar.png'"
                    :alt="user.nombre"
                    class="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p class="font-medium text-gray-900">{{ user.nombre }}</p>
                    <p class="text-sm text-gray-500">{{ user.email }}</p>
                  </div>
                </div>
              </div>
            </div>
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
                    v-if="selectedUser?.tipo?.includes('conductor')"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    🚗 Conductor
                  </span>
                  <span
                    v-if="selectedUser?.tipo?.includes('pasajero')"
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
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { messagingService, type Message, type Conversation } from '@/services/messagingService';
import { useAuth } from '@/composables/useAuth';

// Usar el composable de autenticación
const { user, userProfile } = useAuth();

// Estado reactivo
const searchConversations = ref('');
const selectedConversation = ref<Conversation | null>(null);
const nuevoMensaje = ref('');
const showProfileModal = ref(false);
const showNewChatModal = ref(false);
const selectedUser = ref<any>(null);
const messagesContainer = ref<HTMLElement | null>(null);
const showMobileChat = ref(false);
const isTyping = ref(false);
const searchNewUser = ref('');
const loading = ref(false);
const error = ref('');
const showDiagnostics = ref(false);

// Datos reactivos
const conversaciones = ref<Conversation[]>([]);
const mensajes = ref<Message[]>([]);
const usuariosDisponibles = ref<any[]>([]);

// Computed properties
const currentUser = computed(() => ({
  id: user.value?.uid || '',
  nombre: userProfile.value?.name || user.value?.displayName || 'Usuario',
  email: user.value?.email || ''
}));

// Computed properties
const filteredConversations = computed(() => {
  if (!searchConversations.value) {
    return conversaciones.value;
  }
  
  const query = searchConversations.value.toLowerCase();
  return conversaciones.value.filter(conv =>
    (conv.otherUser?.name || '').toLowerCase().includes(query) ||
    (conv.otherUser?.id || '').toLowerCase().includes(query) ||
    (conv.last_message?.content || '').toLowerCase().includes(query)
  );
});

const canSendMessage = computed(() => {
  return selectedConversation.value && user.value;
});

const filteredUsers = computed(() => {
  if (!searchNewUser.value) {
    return usuariosDisponibles.value;
  }
  
  const query = searchNewUser.value.toLowerCase();
  return usuariosDisponibles.value.filter(user =>
    user.name.toLowerCase().includes(query) ||
    user.id.toLowerCase().includes(query)
  );
});

// Helper para obtener la URL del avatar de forma estable
const getAvatarUrl = (avatarUrl: string | null | undefined): string => {
  return avatarUrl || '/images/user/default-avatar.png';
};

// Métodos
async function selectConversation(conversation: Conversation) {
  selectedConversation.value = conversation;
  
  // En móvil, mostrar el chat
  if (window.innerWidth < 1024) {
    showMobileChat.value = true;
  }
  
  // Cargar mensajes de la conversación
  await loadMessages(conversation.id);
  
  // Marcar mensajes como leídos
  await messagingService.markMessagesAsRead(conversation.id, user.value?.uid || '');
  
  // Suscribirse a mensajes en tiempo real
  subscribeToMessages();
  
  // Scroll al final de los mensajes
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

async function enviarMensaje() {
  if (!nuevoMensaje.value.trim() || !selectedConversation.value) return;
  
  const content = nuevoMensaje.value.trim();
  
  console.log('📤 === ENVIANDO MENSAJE ===');
  console.log('Conversación ID:', selectedConversation.value.id);
  console.log('Usuario ID:', user.value?.uid);
  console.log('Contenido:', content);
  console.log('Usuario autenticado:', user.value);
  
  // Verificar autenticación
  if (!user.value || !user.value.uid) {
    console.error('❌ Usuario no autenticado');
    error.value = 'Debes estar autenticado para enviar mensajes';
    return;
  }
  
  nuevoMensaje.value = '';
  
  try {
    console.log('Llamando a messagingService.sendMessage...');
    const newMessage = await messagingService.sendMessage(
      selectedConversation.value.id, 
      content,
      user.value.uid
    );
    
    console.log('Respuesta del servicio:', newMessage);
    
    if (newMessage) {
      console.log('✅ Mensaje enviado exitosamente');
      // Recargar mensajes para mostrar el nuevo
      await loadMessages(selectedConversation.value.id);
      
      // Scroll al final
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
      });
    } else {
      console.error('❌ No se recibió respuesta del servicio');
      error.value = 'Error al enviar el mensaje. Por favor, intenta de nuevo.';
    }
  } catch (err: any) {
    console.error('❌ Error enviando mensaje:', err);
    console.error('Tipo de error:', typeof err);
    console.error('Error completo:', JSON.stringify(err, null, 2));
    error.value = `Error al enviar el mensaje: ${err.message || 'Error desconocido'}`;
  }
}

// Función para cargar mensajes
async function loadMessages(conversationId: string) {
  try {
    const messages = await messagingService.getMessages(conversationId);
    mensajes.value = messages;
  } catch (error) {
    console.error('Error cargando mensajes:', error);
  }
}

// Función para cargar conversaciones
async function loadConversations() {
  try {
    loading.value = true;
    console.log('🔍 loadConversations - user.value?.uid:', user.value?.uid);
    const conversations = await messagingService.getConversations(user.value?.uid || '');
    console.log('🔍 loadConversations - conversaciones recibidas:', conversations);
    conversaciones.value = conversations;
    console.log('🔍 loadConversations - conversaciones.value actualizado:', conversaciones.value);
  } catch (err: any) {
    console.error('Error cargando conversaciones:', err);
    error.value = 'Error al cargar las conversaciones';
  } finally {
    loading.value = false;
  }
}

// Función para cargar usuarios disponibles
async function loadAvailableUsers() {
  try {
    const users = await messagingService.getAvailableUsers(user.value?.uid || '');
    usuariosDisponibles.value = users;
  } catch (error) {
    console.error('Error cargando usuarios:', error);
  }
}

function verPerfilUsuario(usuario: any) {
  selectedUser.value = usuario;
  showProfileModal.value = true;
}

async function iniciarNuevaConversacion() {
  if (selectedUser.value && user.value?.uid) {
    try {
      const conversation = await messagingService.createConversation(selectedUser.value.id, user.value.uid);
      if (conversation) {
        // Recargar conversaciones
        await loadConversations();
        selectConversation(conversation);
        showProfileModal.value = false;
      }
    } catch (err: any) {
      console.error('Error creando conversación:', err);
      error.value = 'Error al crear la conversación';
    }
  }
}

async function iniciarNuevaConversacionConUsuario(usuario: any) {
  try {
    const conversation = await messagingService.createConversation(usuario.id, user.value?.uid || '');
    if (conversation) {
      // Recargar conversaciones
      await loadConversations();
      selectConversation(conversation);
      showNewChatModal.value = false;
      searchNewUser.value = '';
    }
  } catch (err: any) {
    console.error('Error creando conversación:', err);
    error.value = 'Error al crear la conversación';
  }
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
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

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
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

// Función de diagnóstico
async function runDiagnostics() {
  console.log('🔧 === EJECUTANDO DIAGNÓSTICO ===\n');
  
  // 1. Verificar usuario autenticado
  console.log('1️⃣ Usuario autenticado:');
  console.log('   Firebase user:', user.value);
  console.log('   User profile:', userProfile.value);
  console.log('   User ID:', user.value?.uid);
  
  // 2. Verificar conexión a Supabase
  console.log('\n2️⃣ Probando conexión a Supabase...');
  try {
    const { data, error } = await messagingService.supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Error de conexión:', error);
    } else {
      console.log('✅ Conexión exitosa');
    }
  } catch (err) {
    console.error('❌ Error fatal:', err);
  }
  
  // 3. Verificar permisos de lectura
  console.log('\n3️⃣ Verificando permisos de lectura...');
  try {
    const { data: profiles, error: profilesError } = await messagingService.supabase
      .from('profiles')
      .select('id, name')
      .limit(3);
    
    if (profilesError) {
      console.error('❌ Error en profiles:', profilesError);
    } else {
      console.log('✅ Profiles:', profiles?.length || 0);
    }
    
    const { data: convs, error: convsError } = await messagingService.supabase
      .from('conversations')
      .select('id')
      .limit(3);
    
    if (convsError) {
      console.error('❌ Error en conversations:', convsError);
    } else {
      console.log('✅ Conversations:', convs?.length || 0);
    }
    
    const { data: msgs, error: msgsError } = await messagingService.supabase
      .from('messages')
      .select('id')
      .limit(3);
    
    if (msgsError) {
      console.error('❌ Error en messages:', msgsError);
    } else {
      console.log('✅ Messages:', msgs?.length || 0);
    }
  } catch (err) {
    console.error('❌ Error verificando permisos:', err);
  }
  
  // 4. Verificar conversaciones del usuario
  console.log('\n4️⃣ Verificando conversaciones del usuario...');
  console.log('   Conversaciones cargadas:', conversaciones.value.length);
  console.log('   Conversación seleccionada:', selectedConversation.value?.id);
  
  // 5. Probar inserción (si hay conversación seleccionada)
  if (selectedConversation.value && user.value?.uid) {
    console.log('\n5️⃣ Probando inserción de mensaje de prueba...');
    try {
      const testMessage = await messagingService.sendMessage(
        selectedConversation.value.id,
        '[DIAGNÓSTICO] Este es un mensaje de prueba',
        user.value.uid
      );
      
      if (testMessage) {
        console.log('✅ Mensaje de prueba enviado exitosamente:', testMessage);
        // Recargar mensajes
        await loadMessages(selectedConversation.value.id);
      } else {
        console.error('❌ No se pudo enviar el mensaje de prueba');
      }
    } catch (err) {
      console.error('❌ Error enviando mensaje de prueba:', err);
    }
  } else {
    console.log('\n5️⃣ No se puede probar inserción (selecciona una conversación primero)');
  }
  
  console.log('\n✅ === DIAGNÓSTICO COMPLETADO ===\n');
  alert('Diagnóstico completado. Revisa la consola del navegador (F12) para ver los resultados.');
}

// Variables para almacenar las suscripciones
let messageSubscription: any = null;
let conversationsSubscription: any = null;

// Suscribirse a cambios en tiempo real de mensajes
function subscribeToMessages() {
  if (!selectedConversation.value) return;
  
  console.log('🔔 Suscribiéndose a mensajes en tiempo real para conversación:', selectedConversation.value.id);
  
  // Cancelar suscripción anterior si existe
  if (messageSubscription) {
    messageSubscription.unsubscribe();
  }
  
  // Suscribirse a nuevos mensajes en la conversación actual
  messageSubscription = messagingService.supabase
    .channel(`messages:${selectedConversation.value.id}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${selectedConversation.value.id}`
      },
      (payload) => {
        console.log('🔔 Nuevo mensaje recibido en tiempo real:', payload);
        
        // Agregar el nuevo mensaje a la lista
        const newMessage = payload.new as Message;
        
        // Solo agregar si no existe ya (evitar duplicados)
        const exists = mensajes.value.some(m => m.id === newMessage.id);
        if (!exists) {
          mensajes.value.push(newMessage);
          
          // Scroll al final
          nextTick(() => {
            if (messagesContainer.value) {
              messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
            }
          });
        }
      }
    )
    .subscribe((status) => {
      console.log('🔔 Estado de suscripción mensajes:', status);
    });
}

// Suscribirse a cambios en el historial de conversaciones
function subscribeToConversations() {
  if (!user.value?.uid) return;
  
  console.log('🔔 Suscribiéndose a actualizaciones de conversaciones para usuario:', user.value.uid);
  
  // Cancelar suscripción anterior si existe
  if (conversationsSubscription) {
    conversationsSubscription.unsubscribe();
  }
  
  // Suscribirse a nuevos mensajes en TODAS las conversaciones del usuario
  conversationsSubscription = messagingService.supabase
    .channel(`conversations:${user.value.uid}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      },
      async (payload) => {
        console.log('🔔 Nuevo mensaje en alguna conversación:', payload);
        
        const newMessage = payload.new as any;
        
        // Verificar si el mensaje es de una conversación del usuario
        const conversation = conversaciones.value.find(c => c.id === newMessage.conversation_id);
        
        if (conversation) {
          console.log('🔔 Actualizando historial de conversaciones...');
          
          // Actualizar el último mensaje de la conversación
          conversation.last_message = {
            id: newMessage.id,
            conversation_id: newMessage.conversation_id,
            sender_id: newMessage.sender_id,
            content: newMessage.content,
            read_at: null,
            created_at: newMessage.created_at
          };
          
          // Si el mensaje no es del usuario actual, incrementar contador de no leídos
          if (newMessage.sender_id !== user.value?.uid) {
            conversation.unread_count = (conversation.unread_count || 0) + 1;
          }
          
          // Mover la conversación al principio de la lista
          const index = conversaciones.value.indexOf(conversation);
          if (index > 0) {
            conversaciones.value.splice(index, 1);
            conversaciones.value.unshift(conversation);
          }
        } else {
          // Si es una conversación nueva, recargar todas las conversaciones
          console.log('🔔 Nueva conversación detectada, recargando...');
          await loadConversations();
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'conversations'
      },
      async (payload) => {
        console.log('🔔 Nueva conversación creada:', payload);
        
        const newConv = payload.new as any;
        
        // Si el usuario es parte de la conversación, recargar
        if (newConv.user1_id === user.value?.uid || newConv.user2_id === user.value?.uid) {
          console.log('🔔 Nueva conversación para el usuario, recargando...');
          await loadConversations();
        }
      }
    )
    .subscribe((status) => {
      console.log('🔔 Estado de suscripción conversaciones:', status);
    });
}

// Cancelar suscripciones al desmontar
onUnmounted(() => {
  if (messageSubscription) {
    console.log('🔔 Cancelando suscripción a mensajes');
    messageSubscription.unsubscribe();
  }
  if (conversationsSubscription) {
    console.log('🔔 Cancelando suscripción a conversaciones');
    conversationsSubscription.unsubscribe();
  }
});

// Watch para detectar cuando el usuario se autentica
watch(() => user.value?.uid, async (newUid, oldUid) => {
  console.log('👤 Usuario cambió:', { oldUid, newUid });
  
  if (newUid && !oldUid) {
    // Usuario acaba de autenticarse
    console.log('✅ Usuario autenticado, cargando conversaciones...');
    await loadConversations();
    await loadAvailableUsers();
    subscribeToConversations();
  } else if (!newUid && oldUid) {
    // Usuario cerró sesión
    console.log('❌ Usuario cerró sesión, limpiando datos...');
    conversaciones.value = [];
    mensajes.value = [];
    usuariosDisponibles.value = [];
    selectedConversation.value = null;
    
    // Cancelar suscripciones
    if (messageSubscription) messageSubscription.unsubscribe();
    if (conversationsSubscription) conversationsSubscription.unsubscribe();
  }
});

// Inicialización
onMounted(async () => {
  console.log('Componente Mensajería montado');
  console.log('Usuario en mount:', user.value?.uid);
  
  // Solo cargar si el usuario ya está autenticado
  if (user.value?.uid) {
    console.log('Usuario ya autenticado, cargando datos...');
    // Cargar datos primero
    await loadConversations();
    await loadAvailableUsers();
    
    // Suscribirse a actualizaciones de conversaciones en tiempo real
    subscribeToConversations();
    
    // Verificar si hay parámetros de usuario en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user') || urlParams.get('driverId');
    const driverName = urlParams.get('driverName');
    const tripId = urlParams.get('tripId');
    
    if (userId) {
      console.log('Usuario específico solicitado:', userId);
      console.log('Nombre del conductor:', driverName);
      console.log('ID del viaje:', tripId);
      
      // Buscar el usuario en la lista de usuarios disponibles
      const targetUser = usuariosDisponibles.value.find(u => u.id === userId);
      if (targetUser) {
        console.log('Usuario encontrado:', targetUser);
        // Crear conversación automáticamente
        await iniciarNuevaConversacionConUsuario(targetUser);
      } else {
        console.log('Usuario no encontrado en la lista:', userId);
        console.log('Usuarios disponibles:', usuariosDisponibles.value);
        
        // Si no se encuentra en la lista, crear un usuario temporal para mostrar
        if (driverName) {
          console.log('Creando usuario temporal para:', driverName);
          const tempUser = {
            id: userId,
            name: driverName,
            email: 'conductor@compartalia.com',
            avatar: '/images/user/default-avatar.png',
            role: 'conductor'
          };
          
          // Añadir a la lista temporalmente
          usuariosDisponibles.value.push(tempUser);
          
          // Crear conversación automáticamente
          await iniciarNuevaConversacionConUsuario(tempUser);
        }
      }
    }
  } else {
    console.log('⏳ Esperando autenticación del usuario...');
  }
});
</script>

<style scoped>
/* Estilos adicionales si es necesario */
</style>
