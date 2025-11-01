import { ref, computed, onMounted, onUnmounted } from 'vue'
import { supabase } from '@/config/supabase'
import type { User } from '@supabase/supabase-js'

export interface NotificationItem {
  id: string
  type: 'message' | 'booking_request' | 'booking_confirmed' | 'booking_cancelled'
  title: string
  message: string
  userName: string
  userImage: string | null
  userId: string
  relatedId: string // trip_id o booking_id
  createdAt: Date
  read: boolean
  action: string
  project: string
  status: 'online' | 'offline'
}

export function useNotifications() {
  const notifications = ref<NotificationItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  let subscription: any = null

  // Contador de notificaciones no leídas
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
  })

  // Formatear tiempo relativo
  const formatTimeAgo = (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'Ahora mismo'
    if (minutes < 60) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`
    return `Hace ${days} día${days > 1 ? 's' : ''}`
  }

  // Cargar notificaciones desde Supabase
  const loadNotifications = async (userId: string) => {
    if (!userId) return

    try {
      isLoading.value = true
      error.value = null

      // 1. Obtener mensajes no leídos donde el usuario es destinatario
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          recipient_id,
          content,
          created_at,
          read_at,
          trip_id,
          profiles!messages_sender_id_fkey(name, avatar_url)
        `)
        .eq('recipient_id', userId)
        .is('read_at', null)
        .order('created_at', { ascending: false })
        .limit(10)

      if (messagesError) {
        console.error('Error cargando mensajes:', messagesError)
      }

      // 2. Obtener reservas pendientes en viajes del usuario (si es conductor)
      // Primero obtener los viajes del usuario como conductor
      const { data: userTrips, error: tripsError } = await supabase
        .from('trips')
        .select('id, origin, destination')
        .eq('driver_id', userId)
        .eq('is_active', true)

      let bookings: any[] = []
      
      if (userTrips && userTrips.length > 0 && !tripsError) {
        const tripIds = userTrips.map(trip => trip.id)
        
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            trip_id,
            passenger_id,
            seats_requested,
            status,
            created_at,
            profiles!bookings_passenger_id_fkey(name, avatar_url)
          `)
          .eq('status', 'pending')
          .in('trip_id', tripIds)
          .order('created_at', { ascending: false })
          .limit(10)

        if (bookingsError) {
          console.error('Error cargando reservas:', bookingsError)
        } else {
          bookings = bookingsData || []
          // Enriquecer con información del viaje
          bookings = bookings.map(booking => ({
            ...booking,
            trip: userTrips.find(trip => trip.id === booking.trip_id)
          }))
        }
      }

      // 3. Combinar y formatear notificaciones
      const notificationList: NotificationItem[] = []

      // Notificaciones de mensajes
      if (messages && messages.length > 0) {
        for (const msg of messages) {
          const senderProfile = msg.profiles as any
          notificationList.push({
            id: `msg_${msg.id}`,
            type: 'message',
            title: 'Nuevo mensaje',
            message: msg.content,
            userName: senderProfile?.name || 'Usuario',
            userImage: senderProfile?.avatar_url || null,
            userId: msg.sender_id,
            relatedId: msg.trip_id,
            createdAt: new Date(msg.created_at),
            read: !!msg.read_at,
            action: 'envió un nuevo mensaje',
            project: 'en tu conversación',
            status: 'online'
          })
        }
      }

      // Notificaciones de reservas (solo si el usuario es conductor)
      if (bookings && bookings.length > 0) {
        for (const booking of bookings) {
          const trip = booking.trip
          const passengerProfile = booking.profiles as any
          notificationList.push({
            id: `booking_${booking.id}`,
            type: 'booking_request',
            title: 'Nueva solicitud de reserva',
            message: `Solicitó ${booking.seats_requested || 1} asiento(s) en tu viaje`,
            userName: passengerProfile?.name || 'Usuario',
            userImage: passengerProfile?.avatar_url || null,
            userId: booking.passenger_id,
            relatedId: booking.trip_id,
            createdAt: new Date(booking.created_at),
            read: false,
            action: 'solicitó reserva en tu viaje',
            project: `${trip?.origin || ''} → ${trip?.destination || ''}`,
            status: 'online'
          })
        }
      }

      // Ordenar por fecha (más recientes primero)
      notificationList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      notifications.value = notificationList
    } catch (err) {
      console.error('Error cargando notificaciones:', err)
      error.value = 'Error al cargar notificaciones'
    } finally {
      isLoading.value = false
    }
  }

  // Marcar notificación como leída
  const markAsRead = async (notificationId: string) => {
    try {
      if (notificationId.startsWith('msg_')) {
        const messageId = notificationId.replace('msg_', '')
        const { error } = await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .eq('id', messageId)

        if (error) {
          console.error('Error marcando mensaje como leído:', error)
          return
        }
      } else if (notificationId.startsWith('booking_')) {
        // Para reservas, simplemente marcamos como vista localmente
        // o podrías crear una tabla de notificaciones vistas
      }

      // Actualizar estado local
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.read = true
      }
    } catch (err) {
      console.error('Error marcando notificación como leída:', err)
    }
  }

  // Suscribirse a cambios en tiempo real
  const subscribeToNotifications = (userId: string) => {
    if (!userId) return

    // Suscripción a mensajes nuevos
    subscription = supabase
      .channel(`notifications_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`
        },
        async () => {
          // Recargar notificaciones cuando hay un nuevo mensaje
          await loadNotifications(userId)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
          filter: `status=eq.pending`
        },
        async (payload) => {
          // Verificar si el booking es para un viaje del usuario (conductor)
          const { data: trip } = await supabase
            .from('trips')
            .select('driver_id')
            .eq('id', payload.new.trip_id)
            .single()

          if (trip && trip.driver_id === userId) {
            await loadNotifications(userId)
          }
        }
      )
      .subscribe()
  }

  // Limpiar suscripción
  const unsubscribe = () => {
    if (subscription) {
      supabase.removeChannel(subscription)
      subscription = null
    }
  }

  return {
    notifications: computed(() => notifications.value.map(n => ({
      ...n,
      time: formatTimeAgo(n.createdAt)
    }))),
    unreadCount,
    isLoading,
    error,
    loadNotifications,
    markAsRead,
    subscribeToNotifications,
    unsubscribe
  }
}

