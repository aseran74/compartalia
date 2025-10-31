import { ref, computed } from 'vue'
import { supabaseClean } from '@/config/supabaseClean'
import { supabase } from '@/config/supabase'
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
  const allUserBookings = ref<any[]>([]) // Todas las reservas del usuario para estadísticas
  const recentMessages = ref<any[]>([])
  const friends = ref<any[]>([])
  const userTrips = ref<any[]>([]) // Viajes del usuario si es conductor
  
  // Estadísticas calculadas (usando todos los datos, no solo los recientes)
  const stats = computed(() => {
    // Viajes activos: si es conductor, sus viajes activos; si es pasajero, viajes con reservas confirmadas
    const totalTrips = userProfile.value?.role === 'conductor' 
      ? userTrips.value.filter(t => t.is_active !== false).length
      : allUserBookings.value.filter(b => b.status === 'confirmed').length
    
    const activeBookings = allUserBookings.value.filter(b => b.status === 'confirmed').length
    const totalSaved = allUserBookings.value
      .filter(b => b.status === 'confirmed')
      .reduce((total, booking) => {
        const price = parseFloat(booking.total_price) || 0
        return total + price
      }, 0)
    
    // Calcular CO2 ahorrado basado en distancias reales de viajes completados
    let co2Saved = 0
    const confirmedBookings = allUserBookings.value.filter(b => b.status === 'confirmed')
    // Agrupar por viaje para evitar duplicados
    const uniqueTripIds = new Set(confirmedBookings.map(b => b.trip_id))
    
    uniqueTripIds.forEach(tripId => {
      const bookingsForTrip = confirmedBookings.filter(b => b.trip_id === tripId)
      if (bookingsForTrip.length > 0) {
        const booking = bookingsForTrip[0] // Usar el primero para obtener distancia
        // Usar distancia real si está disponible, sino estimar
        const distanceKm = booking.distance_km || 30 // 30km por defecto si no hay datos
        // CO2 promedio por km en coche: ~0.12 kg/km
        // Con carpooling compartimos 2-3 personas: ahorramos ~60-70% de CO2
        const co2PerKm = 0.12
        const savingsPercentage = 0.65 // 65% de ahorro compartiendo viaje
        // Calcular CO2 ahorrado: distancia * CO2/km * % ahorro por viaje compartido
        co2Saved += distanceKm * co2PerKm * savingsPercentage
      }
    })
    
    return {
      totalTrips,
      activeBookings,
      totalSaved: Math.round(totalSaved * 100) / 100,
      co2Saved: Math.round(co2Saved * 100) / 100,
      friendsCount: friends.value.length
    }
  })
  
  // Función auxiliar para calcular distancia entre dos puntos
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371 // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }
  
  // Cargar viajes recientes
  const loadRecentTrips = async () => {
    try {
      // Si es conductor, cargar sus viajes; si no, cargar viajes disponibles
      if (userProfile.value?.role === 'conductor' && userProfile.value?.id) {
        // Cargar todos los viajes del conductor para estadísticas
        const { data: allTrips, error: allTripsError } = await supabaseClean
          .from('monthly_trips')
          .select('id, origin_name, destination_name, origin_lat, origin_lng, destination_lat, destination_lng, start_date, end_date, price_per_seat, monthly_price, driver_id, created_at, is_active')
          .eq('driver_id', userProfile.value.id)
        
        if (allTripsError) throw allTripsError
        
        // Guardar todos los viajes para estadísticas
        userTrips.value = allTrips || []
        
        // Mostrar solo los 5 más recientes
        recentTrips.value = (allTrips || []).slice(0, 5).map(trip => ({
          id: trip.id,
          origin: trip.origin_name,
          destination: trip.destination_name,
          startDate: trip.start_date,
          endDate: trip.end_date,
          price: trip.price_per_seat || trip.monthly_price,
          driverId: trip.driver_id,
          createdAt: trip.created_at,
          isActive: trip.is_active,
          distance: trip.origin_lat && trip.origin_lng && trip.destination_lat && trip.destination_lng
            ? calculateDistance(trip.origin_lat, trip.origin_lng, trip.destination_lat, trip.destination_lng)
            : null
        }))
      } else {
        // Cargar viajes disponibles recientes
        const { data, error: tripsError } = await supabaseClean
          .from('monthly_trips')
          .select('id, origin_name, destination_name, origin_lat, origin_lng, destination_lat, destination_lng, start_date, end_date, price_per_seat, monthly_price, driver_id, created_at, is_active')
          .eq('is_active', true)
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
          createdAt: trip.created_at,
          isActive: trip.is_active,
          distance: trip.origin_lat && trip.origin_lng && trip.destination_lat && trip.destination_lng
            ? calculateDistance(trip.origin_lat, trip.origin_lng, trip.destination_lat, trip.destination_lng)
            : null
        }))
      }
    } catch (err) {
      console.error('Error cargando viajes recientes:', err)
    }
  }
  
  // Cargar reservas recientes del usuario
  const loadRecentBookings = async () => {
    if (!userProfile.value?.id) return
    
    try {
      // Cargar todas las reservas del usuario para estadísticas
      const bookings = await bookingService.getUserBookings(userProfile.value.id)
      
      // Enriquecer reservas con información de distancia del viaje
      const enrichedBookings = await Promise.all(
        bookings.map(async (booking: any) => {
          try {
            // Obtener información del viaje para calcular distancia
            const { data: trip } = await supabaseClean
              .from('monthly_trips')
              .select('origin_lat, origin_lng, destination_lat, destination_lng')
              .eq('id', booking.trip_id)
              .single()
            
            if (trip?.origin_lat && trip?.origin_lng && trip?.destination_lat && trip?.destination_lng) {
              booking.distance_km = calculateDistance(
                trip.origin_lat,
                trip.origin_lng,
                trip.destination_lat,
                trip.destination_lng
              )
            }
          } catch (err) {
            console.warn('Error obteniendo distancia del viaje:', err)
          }
          return booking
        })
      )
      
      // Guardar todas las reservas para estadísticas
      allUserBookings.value = enrichedBookings
      // Mostrar solo las 5 más recientes en la UI
      recentBookings.value = enrichedBookings.slice(0, 5)
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
  
  // Cargar amigos (usuarios con los que has interactuado)
  const loadFriends = async () => {
    if (!userProfile.value?.id) return
    
    try {
      // Obtener IDs de usuarios con los que has interactuado (a través de reservas o mensajes)
      const userIds = new Set<string>()
      
      // Usuarios de reservas: conductores de viajes donde eres pasajero
      if (recentBookings.value.length > 0) {
        const tripIds = recentBookings.value.map(b => b.trip_id).filter(Boolean)
        if (tripIds.length > 0) {
          const { data: trips } = await supabaseClean
            .from('monthly_trips')
            .select('driver_id')
            .in('id', tripIds)
          
          trips?.forEach(trip => {
            if (trip.driver_id && trip.driver_id !== userProfile.value?.id) {
              userIds.add(trip.driver_id)
            }
          })
        }
      }
      
      // Usuarios de mensajes: participantes en conversaciones
      if (recentMessages.value.length > 0) {
        recentMessages.value.forEach(msg => {
          if (msg.otherUserId && msg.otherUserId !== userProfile.value?.id) {
            userIds.add(msg.otherUserId)
          }
        })
      }
      
      // Si es conductor, también incluir pasajeros de sus viajes
      if (userProfile.value?.role === 'conductor' && userTrips.value.length > 0) {
        const tripIds = userTrips.value.map(t => t.id)
        const { data: bookings } = await supabaseClean
          .from('bookings')
          .select('passenger_id')
          .in('trip_id', tripIds)
          .eq('status', 'confirmed')
        
        bookings?.forEach(booking => {
          if (booking.passenger_id && booking.passenger_id !== userProfile.value?.id) {
            userIds.add(booking.passenger_id)
          }
        })
      }
      
      // Si no hay interacciones, obtener usuarios recientes como fallback
      if (userIds.size === 0) {
        const { data: profiles } = await supabaseClean
          .from('profiles')
          .select('id, name, email, avatar_url, role')
          .neq('id', userProfile.value.id)
          .limit(10)
        
        profiles?.forEach(profile => {
          userIds.add(profile.id)
        })
      }
      
      // Obtener información de los usuarios
      if (userIds.size > 0) {
        const { data: profiles, error: friendsError } = await supabaseClean
          .from('profiles')
          .select('id, name, email, avatar_url, role')
          .in('id', Array.from(userIds))
          .limit(10)
        
        if (friendsError) throw friendsError
        
        friends.value = (profiles || []).map(profile => ({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          avatar: profile.avatar_url,
          role: profile.role
        }))
      }
    } catch (err) {
      console.error('Error cargando amigos:', err)
      friends.value = []
    }
  }
  
  // Cargar todos los datos del dashboard
  const loadDashboardData = async () => {
    loading.value = true
    error.value = ''
    
    try {
      // Primero cargar viajes y reservas (necesarios para calcular amigos)
      await Promise.all([
        loadRecentTrips(),
        loadRecentBookings(),
        loadRecentMessages()
      ])
      
      // Luego cargar amigos (depende de las reservas y mensajes ya cargados)
      await loadFriends()
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
