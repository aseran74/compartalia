<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <admin-layout>
      <div class="max-w-4xl mx-auto p-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          🔔 Notificaciones
        </h1>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div v-if="notifications.length === 0" class="text-center py-12">
            <p class="text-gray-500 dark:text-gray-400 text-lg">
              No tienes notificaciones
            </p>
          </div>
          
          <div v-else class="space-y-4">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              class="flex gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div class="relative flex-shrink-0">
                <img
                  :src="notification.userImage"
                  :alt="notification.userName"
                  class="w-12 h-12 rounded-full object-cover"
                />
                <span
                  :class="notification.status === 'online' ? 'bg-green-500' : 'bg-gray-400'"
                  class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800"
                ></span>
              </div>
              
              <div class="flex-1 min-w-0">
                <div class="mb-1">
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{ notification.userName }}
                  </span>
                  <span class="text-gray-600 dark:text-gray-400">
                    {{ notification.action }}
                  </span>
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{ notification.project }}
                  </span>
                </div>
                
                <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>{{ notification.type }}</span>
                  <span class="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>{{ notification.time }}</span>
                </div>
              </div>
              
              <button
                @click="markAsRead(notification.id)"
                class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </admin-layout>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'

// Datos mock de notificaciones (iguales a los del NotificationMenu)
const notifications = ref([
  {
    id: 1,
    userName: 'Terry Franci',
    userImage: '/images/user/user-02.jpg',
    action: 'solicitó permiso para cambiar',
    project: 'Proyecto - Nganter App',
    type: 'Proyecto',
    time: 'Hace 5 minutos',
    status: 'online',
  },
  {
    id: 2,
    userName: 'María García',
    userImage: '/images/user/user-03.jpg',
    action: 'confirmó tu reserva en el viaje a',
    project: 'Madrid Centro',
    type: 'Viaje',
    time: 'Hace 15 minutos',
    status: 'offline',
  },
  {
    id: 3,
    userName: 'Juan Pérez',
    userImage: '/images/user/user-04.jpg',
    action: 'canceló el viaje',
    project: 'Alcalá de Henares → Madrid',
    type: 'Viaje',
    time: 'Hace 1 hora',
    status: 'online',
  },
  {
    id: 4,
    userName: 'Ana López',
    userImage: '/images/user/user-05.jpg',
    action: 'envió un nuevo mensaje sobre',
    project: 'tu reserva',
    type: 'Mensaje',
    time: 'Hace 2 horas',
    status: 'online',
  },
  {
    id: 5,
    userName: 'Carlos Ruiz',
    userImage: '/images/user/user-06.jpg',
    action: 'publicó un nuevo viaje desde',
    project: 'Getafe',
    type: 'Nuevo viaje',
    time: 'Hace 3 horas',
    status: 'offline',
  },
  {
    id: 6,
    userName: 'Laura Martínez',
    userImage: '/images/user/user-07.jpg',
    action: 'calificó tu viaje',
    project: 'Madrid → Alcalá',
    type: 'Calificación',
    time: 'Hace 1 día',
    status: 'online',
  },
  {
    id: 7,
    userName: 'Pedro Sánchez',
    userImage: '/images/user/user-08.jpg',
    action: 'aceptó tu solicitud de reserva para',
    project: 'Madrid Centro',
    type: 'Reserva',
    time: 'Hace 2 días',
    status: 'online',
  },
  {
    id: 8,
    userName: 'Sofía Torres',
    userImage: '/images/user/user-09.jpg',
    action: 'recordatorio: tu viaje es mañana a las',
    project: '8:00 AM',
    type: 'Recordatorio',
    time: 'Hace 3 días',
    status: 'online',
  },
])

const markAsRead = (id) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index !== -1) {
    notifications.value.splice(index, 1)
  }
}
</script>

