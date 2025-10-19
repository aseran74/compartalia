<template>
  <div class="bg-white rounded-lg shadow border border-gray-200">
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">Mensajes Recientes</h3>
        <router-link 
          to="/carpooling/mensajeria" 
          class="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Ver todos
        </router-link>
      </div>
    </div>
    
    <div class="p-6">
      <div v-if="messages.length === 0" class="text-center py-8">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
        </div>
        <p class="text-gray-500">No tienes mensajes aún</p>
        <p class="text-sm text-gray-400 mt-1">¡Comienza una conversación!</p>
      </div>
      
      <div v-else class="space-y-4">
        <div 
          v-for="message in messages" 
          :key="message.id"
          class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div class="flex-shrink-0">
            <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span class="text-white text-sm font-semibold">
                {{ message.sender.name.charAt(0).toUpperCase() }}
              </span>
            </div>
          </div>
          
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-gray-900">{{ message.sender.name }}</p>
              <p class="text-xs text-gray-500">{{ formatTime(message.created_at) }}</p>
            </div>
            <p class="text-sm text-gray-600 mt-1 truncate">{{ message.content }}</p>
            <div class="flex items-center mt-2 space-x-2">
              <span class="text-xs text-gray-500">{{ message.trip.route }}</span>
              <span v-if="message.isUnread" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Nuevo
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { userMetricsService, type UserMessage } from '@/services/userMetricsService';

const { userProfile } = useAuth();

const messages = ref<UserMessage[]>([]);

onMounted(async () => {
  await loadMessages();
});

const loadMessages = async () => {
  try {
    if (!userProfile.value) {
      console.log('Usuario no autenticado, usando datos por defecto');
      return;
    }

    // Obtener mensajes reales del usuario
    const userMessages = await userMetricsService.getUserMessages(
      userProfile.value.id,
      userProfile.value.role
    );
    
    messages.value = userMessages;

    console.log('Mensajes cargados para usuario:', userProfile.value.name);
  } catch (error) {
    console.error('Error loading messages:', error);
  }
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    return 'Hace unos minutos';
  } else if (diffInHours < 24) {
    return `Hace ${Math.floor(diffInHours)} horas`;
  } else {
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  }
};
</script>
