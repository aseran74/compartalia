import { ref, computed } from 'vue'
import { supabaseClean } from '@/config/supabaseClean'
import { useAuth } from './useAuth'
import { bookingService } from '@/services/bookingService'
import { messagingService } from '@/services/messagingService'

export function useDashboardData() {
  const { user, userProfile } = useAuth()
  
  // Estado reactivo
  const loading = ref(false)
  const error = ref('')
  
  // Datos del dashboard
  const recentTrips = ref<any[]>([])
  const recentBookings = ref<any[]>([])
  const recentMessages = ref<any[]>([])
  const friends = ref<any[]>([])
  
  // Estadísticas calculadas
  const stats = computed(() => {
    const totalTrips = recentTrips.value.length
    const activeBookings = recentBookings.value.filter(b => b.status === 'confirmed').length
    const totalSaved = recentBookings.value
      .filter(b => b.status === 'confirmed')
      .reduce((total, booking) => total + (parseFloat(booking.total_price) || 0), 0)
    
    // Calcular CO2 ahorrado (estimación: 0.2kg CO2 por km ahorrado)
    const co2Saved = totalSaved * 0.2 // Estimación basada en ahorro económico
    
    return {
      totalTrips,
      activeBookings,
      totalSaved: Math.round(totalSaved),
      co2Saved: Math.round(co2Saved),
      friendsCount: friends.value.length
    }
  })
  
  // Cargar viajes recientes
  const loadRecentTrips = async () => {
    try {
      const { data, error: tripsError } = await supabaseClean
        .from('monthly_trips')
        .select('id, origin_name, destination_name, start_date, end_date, price_per_seat, monthly_price, driver_id, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (tripsError) throw tripsError
      
      recentTrips.value = (data || []).map(trip => ({
        id: trip.id,
        origin: trip.origin_name,
        destination: trip.destination_name,
        startDate: trip.start_date,
        endDate: trip.end_date,
        price: trip.price_per_seat || trip.monthly_price,
        driverId: trip.driver_id,
        createdAt: trip.created_at
      }))
    } catch (err) {
      console.error('Error cargando viajes recientes:', err)
    }
  }
  
  // Cargar reservas recientes del usuario
  const loadRecentBookings = async () => {
    if (!userProfile.value?.id) return
    
    try {
      const bookings = await bookingService.getUserBookings(userProfile.value.id)
      recentBookings.value = bookings.slice(0, 5)
    } catch (err) {
      console.error('Error cargando reservas recientes:', err)
    }
  }
  
  // Cargar mensajes recientes
  const loadRecentMessages = async () => {
    if (!userProfile.value?.id) {
      console.log('No hay userProfile.id para cargar mensajes')
      return
    }
    
    try {
      console.log('Cargando mensajes para usuario:', userProfile.value.id)
      const conversations = await messagingService.getConversations(userProfile.value.id)
      console.log('Conversaciones encontradas:', conversations.length)
      
      // Obtener el último mensaje de cada conversación
      const messagesPromises = conversations.map(async (conv) => {
        try {
          const messages = await messagingService.getMessages(conv.id)
          if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1]
            return {
              id: lastMessage.id,
              content: lastMessage.content,
              senderId: lastMessage.sender_id,
              createdAt: lastMessage.created_at,
              conversationId: conv.id,
              otherUserId: conv.user1_id === userProfile.value?.id ? conv.user2_id : conv.user1_id,
              otherUserName: conv.otherUser?.name || 'Usuario'
            }
          }
        } catch (err) {
          console.error('Error obteniendo mensajes de conversación:', err)
        }
        return null
      })
      
      const messages = await Promise.all(messagesPromises)
      recentMessages.value = messages.filter(msg => msg !== null).slice(0, 5)
      console.log('Mensajes recientes cargados:', recentMessages.value.length)
    } catch (err) {
      console.error('Error cargando mensajes recientes:', err)
    }
  }
  
  // Cargar amigos (usuarios marcados como amigos)
  const loadFriends = async () => {
    try {
      const { data, error: friendsError } = await supabaseClean
        .from('profiles')
        .select('id, name, email, avatar_url, role')
        .limit(10)
      
      if (friendsError) throw friendsError
      
      // Por ahora, todos los usuarios son "amigos" potenciales
      // En el futuro se puede implementar una tabla de relaciones de amistad
      friends.value = (data || []).map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar_url,
        role: profile.role
      }))
    } catch (err) {
      console.error('Error cargando amigos:', err)
    }
  }
  
  // Cargar todos los datos del dashboard
  const loadDashboardData = async () => {
    loading.value = true
    error.value = ''
    
    try {
      await Promise.all([
        loadRecentTrips(),
        loadRecentBookings(),
        loadRecentMessages(),
        loadFriends()
      ])
    } catch (err) {
      error.value = 'Error cargando datos del dashboard'
      console.error('Error cargando datos del dashboard:', err)
    } finally {
      loading.value = false
    }
  }
  
  // Formatear fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Fecha no disponible'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Fecha inválida'
    }
  }
  
  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }
  
  return {
    loading,
    error,
    recentTrips,
    recentBookings,
    recentMessages,
    friends,
    stats,
    loadDashboardData,
    formatDate,
    formatCurrency
  }
}
