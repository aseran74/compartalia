import { ref, computed } from 'vue'
import dataService from '@/services/dataService'
import type { User, Trip, Booking, Message, Notification } from '@/types/carpooling'

export function useCarpoolingData() {
  // Estado reactivo
  const users = ref<User[]>([])
  const trips = ref<Trip[]>([])
  const bookings = ref<Booking[]>([])
  const messages = ref<Message[]>([])
  const notifications = ref<Notification[]>([])
  
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const activeTrips = computed(() => trips.value.filter(trip => trip.status === 'active'))
  const completedTrips = computed(() => trips.value.filter(trip => trip.status === 'completed'))
  const pendingBookings = computed(() => bookings.value.filter(booking => booking.status === 'pending'))
  const unreadNotifications = computed(() => notifications.value.filter(notification => !notification.readAt))

  // Métodos para usuarios
  const loadUsers = async () => {
    loading.value = true
    error.value = null
    try {
      users.value = await dataService.getUsers()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error loading users'
    } finally {
      loading.value = false
    }
  }

  const createUser = async (user: Omit<User, 'id'>) => {
    loading.value = true
    error.value = null
    try {
      const newUser = await dataService.createUser(user)
      if (newUser) {
        users.value.push(newUser)
      }
      return newUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error creating user'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (id: string, updates: Partial<User>) => {
    loading.value = true
    error.value = null
    try {
      const updatedUser = await dataService.updateUser(id, updates)
      if (updatedUser) {
        const index = users.value.findIndex(user => user.id === id)
        if (index !== -1) {
          users.value[index] = updatedUser
        }
      }
      return updatedUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error updating user'
      return null
    } finally {
      loading.value = false
    }
  }

  // Métodos para viajes
  const loadTrips = async () => {
    loading.value = true
    error.value = null
    try {
      trips.value = await dataService.getTrips()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error loading trips'
    } finally {
      loading.value = false
    }
  }

  const createTrip = async (trip: Omit<Trip, 'id'>) => {
    loading.value = true
    error.value = null
    try {
      const newTrip = await dataService.createTrip(trip)
      if (newTrip) {
        trips.value.push(newTrip)
      }
      return newTrip
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error creating trip'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateTrip = async (id: string, updates: Partial<Trip>) => {
    loading.value = true
    error.value = null
    try {
      const updatedTrip = await dataService.updateTrip(id, updates)
      if (updatedTrip) {
        const index = trips.value.findIndex(trip => trip.id === id)
        if (index !== -1) {
          trips.value[index] = updatedTrip
        }
      }
      return updatedTrip
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error updating trip'
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteTrip = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const success = await dataService.deleteTrip(id)
      if (success) {
        trips.value = trips.value.filter(trip => trip.id !== id)
      }
      return success
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error deleting trip'
      return false
    } finally {
      loading.value = false
    }
  }

  // Métodos para reservas
  const loadBookings = async () => {
    loading.value = true
    error.value = null
    try {
      bookings.value = await dataService.getBookings()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error loading bookings'
    } finally {
      loading.value = false
    }
  }

  const createBooking = async (booking: Omit<Booking, 'id'>) => {
    loading.value = true
    error.value = null
    try {
      const newBooking = await dataService.createBooking(booking)
      if (newBooking) {
        bookings.value.push(newBooking)
      }
      return newBooking
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error creating booking'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    loading.value = true
    error.value = null
    try {
      const updatedBooking = await dataService.updateBooking(id, updates)
      if (updatedBooking) {
        const index = bookings.value.findIndex(booking => booking.id === id)
        if (index !== -1) {
          bookings.value[index] = updatedBooking
        }
      }
      return updatedBooking
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error updating booking'
      return null
    } finally {
      loading.value = false
    }
  }

  // Métodos para mensajes
  const loadMessages = async () => {
    loading.value = true
    error.value = null
    try {
      messages.value = await dataService.getMessages()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error loading messages'
    } finally {
      loading.value = false
    }
  }

  const loadMessagesByTrip = async (tripId: string) => {
    loading.value = true
    error.value = null
    try {
      const tripMessages = await dataService.getMessagesByTrip(tripId)
      return tripMessages
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error loading messages'
      return []
    } finally {
      loading.value = false
    }
  }

  const sendMessage = async (message: Omit<Message, 'id'>) => {
    loading.value = true
    error.value = null
    try {
      const newMessage = await dataService.createMessage(message)
      if (newMessage) {
        messages.value.push(newMessage)
      }
      return newMessage
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error sending message'
      return null
    } finally {
      loading.value = false
    }
  }

  // Métodos para notificaciones
  const loadNotifications = async () => {
    loading.value = true
    error.value = null
    try {
      notifications.value = await dataService.getNotifications()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error loading notifications'
    } finally {
      loading.value = false
    }
  }

  const createNotification = async (notification: Omit<Notification, 'id'>) => {
    loading.value = true
    error.value = null
    try {
      const newNotification = await dataService.createNotification(notification)
      if (newNotification) {
        notifications.value.push(newNotification)
      }
      return newNotification
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error creating notification'
      return null
    } finally {
      loading.value = false
    }
  }

  const markNotificationAsRead = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const success = await dataService.markNotificationAsRead(id)
      if (success) {
        const notification = notifications.value.find(n => n.id === id)
        if (notification) {
          notification.readAt = new Date().toISOString()
        }
      }
      return success
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error marking notification as read'
      return false
    } finally {
      loading.value = false
    }
  }

  // Método para buscar viajes
  const searchTrips = async (filters: any) => {
    loading.value = true
    error.value = null
    try {
      const results = await dataService.searchTrips(filters)
      return results
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error searching trips'
      return []
    } finally {
      loading.value = false
    }
  }

  // Método para buscar viajes compatibles
  const searchCompatibleTrips = async (
    originLat: number,
    originLng: number,
    destinationLat: number,
    destinationLng: number,
    departureTime: string,
    maxDeviationKm: number = 5,
    timeWindowHours: number = 2
  ) => {
    loading.value = true
    error.value = null
    try {
      const results = await dataService.searchCompatibleTrips(
        originLat,
        originLng,
        destinationLat,
        destinationLng,
        departureTime,
        maxDeviationKm,
        timeWindowHours
      )
      return results
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error searching compatible trips'
      return []
    } finally {
      loading.value = false
    }
  }

  // Método para búsqueda avanzada
  const searchTripsAdvanced = async (filters: {
    originName?: string;
    destinationName?: string;
    originLat?: number;
    originLng?: number;
    destinationLat?: number;
    destinationLng?: number;
    departureDate?: string;
    departureTimeFrom?: string;
    departureTimeTo?: string;
    maxPrice?: number;
    pricingModel?: string;
    maxDeviationKm?: number;
    limit?: number;
  }) => {
    loading.value = true
    error.value = null
    try {
      console.log('🔍 useCarpoolingData - searchTripsAdvanced llamada con filtros:', filters)
      const results = await dataService.searchTripsAdvanced(filters)
      console.log('📊 useCarpoolingData - Resultados del dataService:', results)
      return results
    } catch (err) {
      console.error('❌ useCarpoolingData - Error en searchTripsAdvanced:', err)
      error.value = err instanceof Error ? err.message : 'Error in advanced search'
      return []
    } finally {
      loading.value = false
    }
  }

  // Método para búsqueda por proximidad
  const searchTripsByProximity = async (
    lat: number,
    lng: number,
    radiusKm: number = 10.0,
    date?: string,
    limit: number = 20
  ) => {
    loading.value = true
    error.value = null
    try {
      const results = await dataService.searchTripsByProximity(lat, lng, radiusKm, date, limit)
      return results
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error searching by proximity'
      return []
    } finally {
      loading.value = false
    }
  }

  // Método para buscar rutas compatibles
  const searchCompatibleRoutes = async (
    originLat: number,
    originLng: number,
    destinationLat: number,
    destinationLng: number,
    departureDate?: string,
    maxDeviationKm: number = 3.0,
    timeWindowHours: number = 2.0,
    limit: number = 20
  ) => {
    loading.value = true
    error.value = null
    try {
      const results = await dataService.searchCompatibleRoutes(
        originLat,
        originLng,
        destinationLat,
        destinationLng,
        departureDate,
        maxDeviationKm,
        timeWindowHours,
        limit
      )
      return results
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error searching compatible routes'
      return []
    } finally {
      loading.value = false
    }
  }

  // Método para cargar todos los datos
  const loadAllData = async () => {
    loading.value = true
    error.value = null
    try {
      await Promise.all([
        loadUsers(),
        loadTrips(),
        loadBookings(),
        loadMessages(),
        loadNotifications()
      ])
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error loading data'
    } finally {
      loading.value = false
    }
  }

  // Limpiar errores
  const clearError = () => {
    error.value = null
  }

  return {
    // Estado
    users,
    trips,
    bookings,
    messages,
    notifications,
    loading,
    error,
    
    // Computed
    activeTrips,
    completedTrips,
    pendingBookings,
    unreadNotifications,
    
    // Métodos
    loadUsers,
    createUser,
    updateUser,
    loadTrips,
    createTrip,
    updateTrip,
    deleteTrip,
    loadBookings,
    createBooking,
    updateBooking,
    loadMessages,
    loadMessagesByTrip,
    sendMessage,
    loadNotifications,
    createNotification,
    markNotificationAsRead,
    searchTrips,
    searchCompatibleTrips,
    searchTripsAdvanced,
    searchTripsByProximity,
    searchCompatibleRoutes,
    loadAllData,
    clearError
  }
}