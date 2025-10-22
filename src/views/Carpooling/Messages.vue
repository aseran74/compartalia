<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <AppSidebar />
    
    <!-- Main Content -->
    <div class="flex flex-1 flex-col overflow-hidden" :class="{ 'ml-0 lg:ml-[90px]': !isExpanded, 'ml-0 lg:ml-[280px]': isExpanded }">
      <!-- Header -->
      <AppHeader />
      
      <!-- Page Content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6 xl:p-7.5 dark:bg-boxdark">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-black dark:text-white">
        Mensajes
      </h1>
      <p class="text-sm font-medium text-body-color">
        Chatea con otros usuarios sobre tus viajes
      </p>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Lista de Conversaciones -->
      <div class="lg:col-span-1">
        <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <!-- Header de Conversaciones -->
          <div class="border-b border-stroke px-4 py-3 dark:border-strokedark">
            <h3 class="font-medium text-black dark:text-white">
              Conversaciones
            </h3>
          </div>

          <!-- Lista de Chats -->
          <div class="max-h-96 overflow-auto">
            <div
              v-for="conversation in conversations"
              :key="conversation.id"
              @click="selectConversation(conversation)"
              :class="[
                'cursor-pointer border-b border-stroke p-4 transition-colors hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-700',
                selectedConversation?.id === conversation.id ? 'bg-primary/5' : ''
              ]"
            >
              <div class="flex items-center space-x-3">
                <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <img
                    v-if="conversation.user.avatar"
                    :src="conversation.user.avatar"
                    :alt="conversation.user.name"
                    class="h-10 w-10 rounded-full object-cover"
                  />
                  <svg v-else class="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-black dark:text-white truncate">
                      {{ conversation.user.name }}
                    </p>
                    <p class="text-xs text-body-color">
                      {{ formatTime(conversation.lastMessage.timestamp) }}
                    </p>
                  </div>
                  <p class="text-xs text-body-color truncate">
                    {{ conversation.lastMessage.message }}
                  </p>
                  <div class="mt-1 flex items-center justify-between">
                    <span class="text-xs text-body-color">
                      Viaje: {{ conversation.trip.origin.name }} → {{ conversation.trip.destination.name }}
                    </span>
                    <div
                      v-if="conversation.unreadCount > 0"
                      class="rounded-full bg-primary px-2 py-0.5 text-xs text-white"
                    >
                      {{ conversation.unreadCount }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Área de Chat -->
      <div class="lg:col-span-2">
        <div v-if="selectedConversation" class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <!-- Header del Chat -->
          <div class="border-b border-stroke px-4 py-3 dark:border-strokedark">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <img
                    v-if="selectedConversation.user.avatar"
                    :src="selectedConversation.user.avatar"
                    :alt="selectedConversation.user.name"
                    class="h-8 w-8 rounded-full object-cover"
                  />
                  <svg v-else class="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-black dark:text-white">
                    {{ selectedConversation.user.name }}
                  </h3>
                  <p class="text-xs text-body-color">
                    Viaje: {{ selectedConversation.trip.origin.name }} → {{ selectedConversation.trip.destination.name }}
                  </p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <button class="rounded-md border border-stroke p-2 text-body-color hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-700">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5v-5a7.5 7.5 0 0115 0v5z"/>
                  </svg>
                </button>
                <button class="rounded-md border border-stroke p-2 text-body-color hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-700">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Mensajes -->
          <div class="h-96 overflow-y-auto p-4">
            <div class="space-y-4">
              <div
                v-for="message in selectedConversation.messages"
                :key="message.id"
                :class="[
                  'flex',
                  message.sender.id === 'current-user' ? 'justify-end' : 'justify-start'
                ]"
              >
                <div
                  :class="[
                    'max-w-xs rounded-lg px-3 py-2 text-sm',
                    message.sender.id === 'current-user'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-black dark:bg-gray-700 dark:text-white'
                  ]"
                >
                  <p>{{ message.message }}</p>
                  <p class="mt-1 text-xs opacity-75">
                    {{ formatTime(message.timestamp) }}
                  </p>
                </div>
              </div>
              
              <!-- Indicador de "escribiendo" -->
              <div v-if="isTyping" class="flex justify-start">
                <div class="rounded-lg bg-gray-100 px-3 py-2 text-sm dark:bg-gray-700">
                  <div class="flex items-center space-x-1">
                    <span class="text-body-color">Escribiendo</span>
                    <div class="flex space-x-1">
                      <div class="h-1 w-1 rounded-full bg-body-color animate-bounce"></div>
                      <div class="h-1 w-1 rounded-full bg-body-color animate-bounce" style="animation-delay: 0.1s"></div>
                      <div class="h-1 w-1 rounded-full bg-body-color animate-bounce" style="animation-delay: 0.2s"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Input de Mensaje -->
          <div class="border-t border-stroke p-4 dark:border-strokedark">
            <form @submit.prevent="sendMessage" class="flex items-center space-x-2">
              <input
                v-model="newMessage"
                type="text"
                placeholder="Escribe un mensaje..."
                class="flex-1 rounded border border-stroke bg-transparent px-3 py-2 text-sm outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              />
              <button
                type="submit"
                :disabled="!newMessage.trim()"
                class="rounded-md bg-primary p-2 text-white hover:bg-opacity-90 disabled:opacity-50"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
              </button>
            </form>
          </div>
        </div>

        <!-- Sin Conversación Seleccionada -->
        <div v-else class="flex h-96 items-center justify-center rounded-sm border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
          <div class="text-center">
            <svg class="mx-auto h-12 w-12 text-body-color" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <h3 class="mt-4 text-lg font-medium text-black dark:text-white">
              Selecciona una conversación
            </h3>
            <p class="mt-2 text-sm text-body-color">
              Elige una conversación de la lista para comenzar a chatear.
            </p>
          </div>
        </div>
      </div>
    </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppSidebar from '@/components/layout/AppSidebar.vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import { useSidebar } from '@/composables/useSidebar';
import type { ChatMessage, Trip, User } from '@/types/carpooling';

interface Conversation {
  id: string;
  user: User;
  trip: Trip;
  lastMessage: ChatMessage;
  unreadCount: number;
  messages: ChatMessage[];
}

// Estado del componente
const selectedConversation = ref<Conversation | null>(null);
const newMessage = ref('');
const isTyping = ref(false);
const { isExpanded } = useSidebar();

// Datos mock de conversaciones
const conversations = ref<Conversation[]>([
  {
    id: '1',
    user: {
      id: '1',
      name: 'María García',
      email: 'maria@email.com',
      phone: '+34600123456',
      rating: 4.8,
      totalTrips: 45,
      preferences: {
        maxDeviation: 1000,
        maxWaitTime: 10,
        walkDistance: 300,
        preferredHubs: [],
        smokingAllowed: false,
        petsAllowed: true,
        musicPreference: 'low'
      },
      verified: true,
      createdAt: new Date()
    },
    trip: {
      id: '1',
      driver: {
        id: 'current-user',
        name: 'Yo',
        email: 'yo@email.com',
        phone: '+34600123456',
        rating: 4.9,
        totalTrips: 12,
        preferences: {
          maxDeviation: 1000,
          maxWaitTime: 10,
          walkDistance: 300,
          preferredHubs: [],
          smokingAllowed: false,
          petsAllowed: true,
          musicPreference: 'low'
        },
        verified: true,
        createdAt: new Date()
      },
      route: {
        id: '1',
        origin: {
          id: '1',
          name: 'Majadahonda',
          address: 'Majadahonda, Madrid',
          coordinates: { lat: 40.4727, lng: -3.8718 },
          type: 'origin'
        },
        destination: {
          id: '2',
          name: 'Plaza España',
          address: 'Plaza España, Madrid',
          coordinates: { lat: 40.4238, lng: -3.7133 },
          type: 'destination'
        },
        waypoints: [],
        distance: 15000,
        estimatedDuration: 25
      },
      departureTime: new Date('2024-01-15T08:00:00'),
      arrivalTime: new Date('2024-01-15T08:25:00'),
      availableSeats: 3,
      pricePerSeat: 8,
      currency: 'EUR',
      status: 'active',
      vehicle: {
        id: '1',
        make: 'Toyota',
        model: 'Prius',
        year: 2020,
        color: 'Blanco',
        licensePlate: '1234ABC',
        seats: 5,
        features: {
          airConditioning: true,
          smokingAllowed: false,
          petsAllowed: true,
          luggageSpace: true,
          wifi: true,
          chargingPorts: true
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    lastMessage: {
      id: '1',
      tripId: '1',
      sender: {
        id: '1',
        name: 'María García',
        email: 'maria@email.com',
        phone: '+34600123456',
        rating: 4.8,
        totalTrips: 45,
        preferences: {
          maxDeviation: 1000,
          maxWaitTime: 10,
          walkDistance: 300,
          preferredHubs: [],
          smokingAllowed: false,
          petsAllowed: true,
          musicPreference: 'low'
        },
        verified: true,
        createdAt: new Date()
      },
      message: '¡Hola! ¿A qué hora sales exactamente?',
      timestamp: new Date(Date.now() - 300000), // 5 minutos atrás
      type: 'text'
    },
    unreadCount: 2,
    messages: [
      {
        id: '1',
        tripId: '1',
        sender: {
          id: '1',
          name: 'María García',
          email: 'maria@email.com',
          phone: '+34600123456',
          rating: 4.8,
          totalTrips: 45,
          preferences: {
            maxDeviation: 1000,
            maxWaitTime: 10,
            walkDistance: 300,
            preferredHubs: [],
            smokingAllowed: false,
            petsAllowed: true,
            musicPreference: 'low'
          },
          verified: true,
          createdAt: new Date()
        },
        message: '¡Hola! Me interesa tu viaje a Plaza España',
        timestamp: new Date(Date.now() - 600000), // 10 minutos atrás
        type: 'text'
      },
      {
        id: '2',
        tripId: '1',
        sender: {
          id: 'current-user',
          name: 'Yo',
          email: 'yo@email.com',
          phone: '+34600123456',
          rating: 4.9,
          totalTrips: 12,
          preferences: {
            maxDeviation: 1000,
            maxWaitTime: 10,
            walkDistance: 300,
            preferredHubs: [],
            smokingAllowed: false,
            petsAllowed: true,
            musicPreference: 'low'
          },
          verified: true,
          createdAt: new Date()
        },
        message: '¡Perfecto! Salgo a las 8:00 AM desde Majadahonda',
        timestamp: new Date(Date.now() - 480000), // 8 minutos atrás
        type: 'text'
      },
      {
        id: '3',
        tripId: '1',
        sender: {
          id: '1',
          name: 'María García',
          email: 'maria@email.com',
          phone: '+34600123456',
          rating: 4.8,
          totalTrips: 45,
          preferences: {
            maxDeviation: 1000,
            maxWaitTime: 10,
            walkDistance: 300,
            preferredHubs: [],
            smokingAllowed: false,
            petsAllowed: true,
            musicPreference: 'low'
          },
          verified: true,
          createdAt: new Date()
        },
        message: '¡Hola! ¿A qué hora sales exactamente?',
        timestamp: new Date(Date.now() - 300000), // 5 minutos atrás
        type: 'text'
      }
    ]
  },
  {
    id: '2',
    user: {
      id: '2',
      name: 'Carlos López',
      email: 'carlos@email.com',
      phone: '+34600987654',
      rating: 4.6,
      totalTrips: 23,
      preferences: {
        maxDeviation: 2000,
        maxWaitTime: 15,
        walkDistance: 500,
        preferredHubs: [],
        smokingAllowed: true,
        petsAllowed: false,
        musicPreference: 'medium'
      },
      verified: true,
      createdAt: new Date()
    },
    trip: {
      id: '2',
      driver: {
        id: 'current-user',
        name: 'Yo',
        email: 'yo@email.com',
        phone: '+34600123456',
        rating: 4.9,
        totalTrips: 12,
        preferences: {
          maxDeviation: 1000,
          maxWaitTime: 10,
          walkDistance: 300,
          preferredHubs: [],
          smokingAllowed: false,
          petsAllowed: true,
          musicPreference: 'low'
        },
        verified: true,
        createdAt: new Date()
      },
      route: {
        id: '2',
        origin: {
          id: '3',
          name: 'Getafe',
          address: 'Getafe, Madrid',
          coordinates: { lat: 40.3049, lng: -3.7321 },
          type: 'origin'
        },
        destination: {
          id: '4',
          name: 'Atocha',
          address: 'Atocha, Madrid',
          coordinates: { lat: 40.4072, lng: -3.6917 },
          type: 'destination'
        },
        waypoints: [],
        distance: 18000,
        estimatedDuration: 35
      },
      departureTime: new Date('2024-01-16T07:30:00'),
      arrivalTime: new Date('2024-01-16T08:05:00'),
      availableSeats: 2,
      pricePerSeat: 6,
      currency: 'EUR',
      status: 'active',
      vehicle: {
        id: '1',
        make: 'Toyota',
        model: 'Prius',
        year: 2020,
        color: 'Blanco',
        licensePlate: '1234ABC',
        seats: 5,
        features: {
          airConditioning: true,
          smokingAllowed: false,
          petsAllowed: true,
          luggageSpace: true,
          wifi: true,
          chargingPorts: true
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    lastMessage: {
      id: '4',
      tripId: '2',
      sender: {
        id: '2',
        name: 'Carlos López',
        email: 'carlos@email.com',
        phone: '+34600987654',
        rating: 4.6,
        totalTrips: 23,
        preferences: {
          maxDeviation: 2000,
          maxWaitTime: 15,
          walkDistance: 500,
          preferredHubs: [],
          smokingAllowed: true,
          petsAllowed: false,
          musicPreference: 'medium'
        },
        verified: true,
        createdAt: new Date()
      },
      message: '¿Tienes espacio para el viernes?',
      timestamp: new Date(Date.now() - 900000), // 15 minutos atrás
      type: 'text'
    },
    unreadCount: 1,
    messages: [
      {
        id: '4',
        tripId: '2',
        sender: {
          id: '2',
          name: 'Carlos López',
          email: 'carlos@email.com',
          phone: '+34600987654',
          rating: 4.6,
          totalTrips: 23,
          preferences: {
            maxDeviation: 2000,
            maxWaitTime: 15,
            walkDistance: 500,
            preferredHubs: [],
            smokingAllowed: true,
            petsAllowed: false,
            musicPreference: 'medium'
          },
          verified: true,
          createdAt: new Date()
        },
        message: '¿Tienes espacio para el viernes?',
        timestamp: new Date(Date.now() - 900000), // 15 minutos atrás
        type: 'text'
      }
    ]
  },
  {
    id: '3',
    user: {
      id: '3',
      name: 'Ana Martínez',
      email: 'ana@email.com',
      phone: '+34600555666',
      rating: 4.9,
      totalTrips: 67,
      preferences: {
        maxDeviation: 500,
        maxWaitTime: 5,
        walkDistance: 200,
        preferredHubs: [],
        smokingAllowed: false,
        petsAllowed: true,
        musicPreference: 'low'
      },
      verified: true,
      createdAt: new Date()
    },
    trip: {
      id: '3',
      driver: {
        id: '3',
        name: 'Ana Martínez',
        email: 'ana@email.com',
        phone: '+34600555666',
        rating: 4.9,
        totalTrips: 67,
        preferences: {
          maxDeviation: 500,
          maxWaitTime: 5,
          walkDistance: 200,
          preferredHubs: [],
          smokingAllowed: false,
          petsAllowed: true,
          musicPreference: 'low'
        },
        verified: true,
        createdAt: new Date()
      },
      route: {
        id: '3',
        origin: {
          id: '5',
          name: 'Las Rozas',
          address: 'Las Rozas, Madrid',
          coordinates: { lat: 40.4929, lng: -3.8737 },
          type: 'origin'
        },
        destination: {
          id: '6',
          name: 'Chamartín',
          address: 'Chamartín, Madrid',
          coordinates: { lat: 40.4620, lng: -3.6766 },
          type: 'destination'
        },
        waypoints: [],
        distance: 22000,
        estimatedDuration: 40
      },
      departureTime: new Date('2024-01-17T08:15:00'),
      arrivalTime: new Date('2024-01-17T08:55:00'),
      availableSeats: 1,
      pricePerSeat: 7,
      currency: 'EUR',
      status: 'active',
      vehicle: {
        id: '2',
        make: 'Volkswagen',
        model: 'Golf',
        year: 2019,
        color: 'Azul',
        licensePlate: '5678DEF',
        seats: 4,
        features: {
          airConditioning: true,
          smokingAllowed: false,
          petsAllowed: true,
          luggageSpace: true,
          wifi: false,
          chargingPorts: true
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    lastMessage: {
      id: '5',
      tripId: '3',
      sender: {
        id: 'current-user',
        name: 'Yo',
        email: 'yo@email.com',
        phone: '+34600123456',
        rating: 4.9,
        totalTrips: 12,
        preferences: {
          maxDeviation: 1000,
          maxWaitTime: 10,
          walkDistance: 300,
          preferredHubs: [],
          smokingAllowed: false,
          petsAllowed: true,
          musicPreference: 'low'
        },
        verified: true,
        createdAt: new Date()
      },
      message: '¡Perfecto! Te espero el lunes',
      timestamp: new Date(Date.now() - 1800000), // 30 minutos atrás
      type: 'text'
    },
    unreadCount: 0,
    messages: [
      {
        id: '5',
        tripId: '3',
        sender: {
          id: 'current-user',
          name: 'Yo',
          email: 'yo@email.com',
          phone: '+34600123456',
          rating: 4.9,
          totalTrips: 12,
          preferences: {
            maxDeviation: 1000,
            maxWaitTime: 10,
            walkDistance: 300,
            preferredHubs: [],
            smokingAllowed: false,
            petsAllowed: true,
            musicPreference: 'low'
          },
          verified: true,
          createdAt: new Date()
        },
        message: '¡Perfecto! Te espero el lunes',
        timestamp: new Date(Date.now() - 1800000), // 30 minutos atrás
        type: 'text'
      }
    ]
  }
]);

// Métodos
const selectConversation = (conversation: Conversation) => {
  selectedConversation.value = conversation;
  // Marcar como leído
  conversation.unreadCount = 0;
};

const sendMessage = () => {
  if (!newMessage.value.trim() || !selectedConversation.value) return;

  const message: ChatMessage = {
    id: Date.now().toString(),
    tripId: selectedConversation.value.trip.id,
    sender: {
      id: 'current-user',
      name: 'Yo',
      email: 'yo@email.com',
      phone: '+34600123456',
      rating: 4.9,
      totalTrips: 12,
      preferences: {
        maxDeviation: 1000,
        maxWaitTime: 10,
        walkDistance: 300,
        preferredHubs: [],
        smokingAllowed: false,
        petsAllowed: true,
        musicPreference: 'low'
      },
      verified: true,
      createdAt: new Date()
    },
    message: newMessage.value,
    timestamp: new Date(),
    type: 'text'
  };

  selectedConversation.value.messages.push(message);
  selectedConversation.value.lastMessage = message;
  newMessage.value = '';

  // Simular respuesta automática después de 2-5 segundos
  setTimeout(() => {
    simulateAutoReply();
  }, Math.random() * 3000 + 2000);
};

const simulateAutoReply = () => {
  if (!selectedConversation.value) return;

  // Mostrar indicador de "escribiendo"
  isTyping.value = true;

  setTimeout(() => {
    const autoReplies = [
      '¡Perfecto! Te confirmo',
      'Ok, entendido',
      '¡Genial! Nos vemos entonces',
      'Perfecto, gracias',
      '¡De acuerdo!',
      'Ok, perfecto',
      '¡Excelente!',
      'Perfecto, hasta entonces'
    ];

    const randomReply = autoReplies[Math.floor(Math.random() * autoReplies.length)];

    const replyMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      tripId: selectedConversation.value.trip.id,
      sender: selectedConversation.value.user,
      message: randomReply,
      timestamp: new Date(),
      type: 'text'
    };

    selectedConversation.value.messages.push(replyMessage);
    selectedConversation.value.lastMessage = replyMessage;
    
    // Ocultar indicador de "escribiendo"
    isTyping.value = false;
  }, 1500); // Simular tiempo de escritura
};

const formatTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes}m`;
  if (minutes < 1440) return `Hace ${Math.floor(minutes / 60)}h`;
  return date.toLocaleDateString('es-ES');
};
</script>
