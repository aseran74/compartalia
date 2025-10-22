// Servicio de datos para el sistema de carpooling
// Este servicio maneja la persistencia de datos usando Supabase

import { supabaseClean as supabase } from '@/config/supabaseClean'
import type { User, Trip, Booking, Message, Notification } from '@/types/carpooling'

class DataService {
  // Métodos para usuarios (profiles)
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return []
    }

    return data.map(profile => ({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone || '',
      avatar: profile.avatar_url || '',
      preferences: profile.preferences || {},
      rating: 4.5, // Valor por defecto, se puede calcular dinámicamente
      totalTrips: 0 // Se puede calcular dinámicamente
    }))
  }

  async getUser(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching user:', error)
      return null
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      avatar: data.avatar_url || '',
      preferences: data.preferences || {},
      rating: 4.5,
      totalTrips: 0
    }
  }

  async createUser(user: Omit<User, 'id'>): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar,
        preferences: user.preferences
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      return null
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      avatar: data.avatar_url || '',
      preferences: data.preferences || {},
      rating: 4.5,
      totalTrips: 0
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
        avatar_url: updates.avatar,
        preferences: updates.preferences
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return null
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      avatar: data.avatar_url || '',
      preferences: data.preferences || {},
      rating: 4.5,
      totalTrips: 0
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting user:', error)
      return false
    }

    return true
  }

  // Métodos para viajes
  async getTrips(): Promise<Trip[]> {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        profiles:driver_id(name, avatar_url),
        vehicles:vehicle_id(brand, model, year, color, features)
      `)
      .eq('status', 'active')
      .order('departure_time', { ascending: true })

    if (error) {
      console.error('Error fetching trips:', error)
      return []
    }

    return data.map(trip => ({
      id: trip.id,
      driverId: trip.driver_id,
      origin: {
        name: trip.origin_name,
        lat: trip.origin_lat,
        lng: trip.origin_lng
      },
      destination: {
        name: trip.destination_name,
        lat: trip.destination_lat,
        lng: trip.destination_lng
      },
      departureTime: trip.departure_time,
      availableSeats: trip.available_seats,
      pricePerSeat: trip.price_per_seat,
      description: trip.description || '',
      vehicle: trip.vehicles ? {
        brand: trip.vehicles.brand,
        model: trip.vehicles.model,
        year: trip.vehicles.year,
        color: trip.vehicles.color || '',
        features: trip.vehicles.features || {}
      } : undefined,
      route: {
        distance: trip.route_data?.distance_km || 0,
        duration: trip.route_data?.duration_minutes || 0,
        waypoints: trip.route_data?.waypoints || []
      },
      status: trip.status
    }))
  }

  async getTrip(id: string): Promise<Trip | null> {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        profiles:driver_id(name, avatar_url),
        vehicles:vehicle_id(brand, model, year, color, features)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching trip:', error)
      return null
    }

    return {
      id: data.id,
      driverId: data.driver_id,
      origin: {
        name: data.origin_name,
        lat: data.origin_lat,
        lng: data.origin_lng
      },
      destination: {
        name: data.destination_name,
        lat: data.destination_lat,
        lng: data.destination_lng
      },
      departureTime: data.departure_time,
      availableSeats: data.available_seats,
      pricePerSeat: data.price_per_seat,
      description: data.description || '',
      vehicle: data.vehicles ? {
        brand: data.vehicles.brand,
        model: data.vehicles.model,
        year: data.vehicles.year,
        color: data.vehicles.color || '',
        features: data.vehicles.features || {}
      } : undefined,
      route: {
        distance: data.route_data?.distance_km || 0,
        duration: data.route_data?.duration_minutes || 0,
        waypoints: data.route_data?.waypoints || []
      },
      status: data.status
    }
  }

  async createTrip(trip: Omit<Trip, 'id'>): Promise<Trip | null> {
    // Importar el servicio de rutas
    const { default: routeService } = await import('./routeService')
    
    // Calcular la ruta con waypoints
    const routeInfo = await routeService.calculateRoute(
      trip.origin,
      trip.destination
    )

    if (!routeInfo) {
      console.error('Error calculating route')
      return null
    }

    const { data, error } = await supabase
      .from('trips')
      .insert({
        driver_id: trip.driverId,
        origin_name: trip.origin.name,
        origin_lat: trip.origin.lat,
        origin_lng: trip.origin.lng,
        destination_name: trip.destination.name,
        destination_lat: trip.destination.lat,
        destination_lng: trip.destination.lng,
        departure_time: trip.departureTime,
        available_seats: trip.availableSeats,
        price_per_seat: trip.pricePerSeat,
        description: trip.description,
        route_data: {
          distance_km: routeInfo.distance / 1000, // Convertir a km
          duration_minutes: routeInfo.duration / 60, // Convertir a minutos
          waypoints: routeInfo.waypoints,
          encoded_polyline: routeInfo.encodedPolyline
        },
        waypoints: routeInfo.waypoints,
        encoded_polyline: routeInfo.encodedPolyline,
        route_metadata: {
          calculated_at: new Date().toISOString(),
          api_used: routeInfo.encodedPolyline ? 'google_maps' : 'fallback'
        },
        status: trip.status || 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating trip:', error)
      return null
    }

    // Insertar waypoints individuales en la tabla separada
    if (routeInfo.waypoints && routeInfo.waypoints.length > 0) {
      const waypointInserts = routeInfo.waypoints.map((wp, index) => ({
        trip_id: data.id,
        waypoint_index: index,
        latitude: wp.lat,
        longitude: wp.lng,
        distance_from_origin: wp.distance,
        is_pickup_point: index === 0, // Primer punto es pickup
        is_dropoff_point: index === routeInfo.waypoints.length - 1 // Último punto es dropoff
      }))

      const { error: waypointsError } = await supabase
        .from('trip_waypoints')
        .insert(waypointInserts)

      if (waypointsError) {
        console.error('Error inserting waypoints:', waypointsError)
      }
    }

    return {
      id: data.id,
      driverId: data.driver_id,
      origin: {
        name: data.origin_name,
        lat: data.origin_lat,
        lng: data.origin_lng
      },
      destination: {
        name: data.destination_name,
        lat: data.destination_lat,
        lng: data.destination_lng
      },
      departureTime: data.departure_time,
      availableSeats: data.available_seats,
      pricePerSeat: data.price_per_seat,
      description: data.description || '',
      vehicle: trip.vehicle,
      route: {
        distance: routeInfo.distance / 1000,
        duration: routeInfo.duration / 60,
        waypoints: routeInfo.waypoints
      },
      status: data.status
    }
  }

  async updateTrip(id: string, updates: Partial<Trip>): Promise<Trip | null> {
    const updateData: any = {}
    
    if (updates.origin) {
      updateData.origin_name = updates.origin.name
      updateData.origin_lat = updates.origin.lat
      updateData.origin_lng = updates.origin.lng
    }
    
    if (updates.destination) {
      updateData.destination_name = updates.destination.name
      updateData.destination_lat = updates.destination.lat
      updateData.destination_lng = updates.destination.lng
    }
    
    if (updates.departureTime) updateData.departure_time = updates.departureTime
    if (updates.availableSeats !== undefined) updateData.available_seats = updates.availableSeats
    if (updates.pricePerSeat !== undefined) updateData.price_per_seat = updates.pricePerSeat
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.status) updateData.status = updates.status
    
    if (updates.route) {
      updateData.route_data = {
        distance_km: updates.route.distance,
        duration_minutes: updates.route.duration,
        waypoints: updates.route.waypoints
      }
    }

    const { data, error } = await supabase
      .from('trips')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating trip:', error)
      return null
    }

    return await this.getTrip(id)
  }

  async deleteTrip(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting trip:', error)
      return false
    }

    return true
  }

  // Métodos para reservas
  async getBookings(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        trips:trip_id(origin_name, destination_name, departure_time, price_per_seat),
        profiles:passenger_id(name, avatar_url)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bookings:', error)
      return []
    }

    return data.map(booking => ({
      id: booking.id,
      tripId: booking.trip_id,
      passengerId: booking.passenger_id,
      seatsRequested: booking.seats_requested,
      status: booking.status,
      pickupLocation: booking.pickup_location || '',
      totalPrice: booking.total_price || 0,
      notes: booking.notes || '',
      createdAt: booking.created_at,
      updatedAt: booking.updated_at
    }))
  }

  async getBooking(id: string): Promise<Booking | null> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        trips:trip_id(origin_name, destination_name, departure_time, price_per_seat),
        profiles:passenger_id(name, avatar_url)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching booking:', error)
      return null
    }

    return {
      id: data.id,
      tripId: data.trip_id,
      passengerId: data.passenger_id,
      seatsRequested: data.seats_requested,
      status: data.status,
      pickupLocation: data.pickup_location || '',
      totalPrice: data.total_price || 0,
      notes: data.notes || '',
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  async createBooking(booking: Omit<Booking, 'id'>): Promise<Booking | null> {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        trip_id: booking.tripId,
        passenger_id: booking.passengerId,
        seats_requested: booking.seatsRequested,
        status: booking.status || 'pending',
        pickup_location: booking.pickupLocation,
        total_price: booking.totalPrice,
        notes: booking.notes
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating booking:', error)
      return null
    }

    return {
      id: data.id,
      tripId: data.trip_id,
      passengerId: data.passenger_id,
      seatsRequested: data.seats_requested,
      status: data.status,
      pickupLocation: data.pickup_location || '',
      totalPrice: data.total_price || 0,
      notes: data.notes || '',
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | null> {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        seats_requested: updates.seatsRequested,
        status: updates.status,
        pickup_location: updates.pickupLocation,
        total_price: updates.totalPrice,
        notes: updates.notes
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating booking:', error)
      return null
    }

    return await this.getBooking(id)
  }

  async deleteBooking(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting booking:', error)
      return false
    }

    return true
  }

  // Métodos para mensajes
  async getMessages(): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles:sender_id(name, avatar_url)
      `)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      return []
    }

    return data.map(message => ({
      id: message.id,
      tripId: message.trip_id,
      senderId: message.sender_id,
      recipientId: message.recipient_id,
      content: message.content,
      type: message.message_type,
      readAt: message.read_at,
      createdAt: message.created_at
    }))
  }

  async getMessagesByTrip(tripId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles:sender_id(name, avatar_url)
      `)
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages by trip:', error)
      return []
    }

    return data.map(message => ({
      id: message.id,
      tripId: message.trip_id,
      senderId: message.sender_id,
      recipientId: message.recipient_id,
      content: message.content,
      type: message.message_type,
      readAt: message.read_at,
      createdAt: message.created_at
    }))
  }

  async createMessage(message: Omit<Message, 'id'>): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        trip_id: message.tripId,
        sender_id: message.senderId,
        recipient_id: message.recipientId,
        content: message.content,
        message_type: message.type || 'text'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating message:', error)
      return null
    }

    return {
      id: data.id,
      tripId: data.trip_id,
      senderId: data.sender_id,
      recipientId: data.recipient_id,
      content: data.content,
      type: data.message_type,
      readAt: data.read_at,
      createdAt: data.created_at
    }
  }

  // Métodos para notificaciones
  async getNotifications(): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notifications:', error)
      return []
    }

    return data.map(notification => ({
      id: notification.id,
      userId: notification.user_id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data || {},
      readAt: notification.read_at,
      createdAt: notification.created_at
    }))
  }

  async createNotification(notification: Omit<Notification, 'id'>): Promise<Notification | null> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data || {}
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      return null
    }

    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data || {},
      readAt: data.read_at,
      createdAt: data.created_at
    }
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Error marking notification as read:', error)
      return false
    }

    return true
  }

  // Métodos de búsqueda y filtrado
  async searchTrips(filters: any): Promise<Trip[]> {
    let query = supabase
      .from('trips')
      .select(`
        *,
        profiles:driver_id(name, avatar_url),
        vehicles:vehicle_id(brand, model, year, color, features)
      `)
      .eq('status', 'active')

    if (filters.origin) {
      query = query.ilike('origin_name', `%${filters.origin}%`)
    }

    if (filters.destination) {
      query = query.ilike('destination_name', `%${filters.destination}%`)
    }

    if (filters.maxPrice) {
      query = query.lte('price_per_seat', filters.maxPrice)
    }

    if (filters.departureDate) {
      const startDate = new Date(filters.departureDate)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(filters.departureDate)
      endDate.setHours(23, 59, 59, 999)
      
      query = query
        .gte('departure_time', startDate.toISOString())
        .lte('departure_time', endDate.toISOString())
    }

    const { data, error } = await query.order('departure_time', { ascending: true })

    if (error) {
      console.error('Error searching trips:', error)
      return []
    }

    return data.map(trip => ({
      id: trip.id,
      driverId: trip.driver_id,
      origin: {
        name: trip.origin_name,
        lat: trip.origin_lat,
        lng: trip.origin_lng
      },
      destination: {
        name: trip.destination_name,
        lat: trip.destination_lat,
        lng: trip.destination_lng
      },
      departureTime: trip.departure_time,
      availableSeats: trip.available_seats,
      pricePerSeat: trip.price_per_seat,
      description: trip.description || '',
      vehicle: trip.vehicles ? {
        brand: trip.vehicles.brand,
        model: trip.vehicles.model,
        year: trip.vehicles.year,
        color: trip.vehicles.color || '',
        features: trip.vehicles.features || {}
      } : undefined,
      route: {
        distance: trip.route_data?.distance_km || 0,
        duration: trip.route_data?.duration_minutes || 0,
        waypoints: trip.route_data?.waypoints || []
      },
      status: trip.status
    }))
  }

  // Función para buscar viajes compatibles usando la función SQL
  async searchCompatibleTrips(
    originLat: number,
    originLng: number,
    destinationLat: number,
    destinationLng: number,
    departureTime: string,
    maxDeviationKm: number = 5,
    timeWindowHours: number = 2
  ) {
    try {
      console.log('🔍 Buscando viajes compatibles...');
      
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('status', 'active')
        .gte('departure_time', new Date().toISOString())
        .limit(50);

      if (error) {
        console.error('Error searching compatible trips:', error)
        return []
      }

      // Filtrar por proximidad (simplificado)
      const compatibleTrips = data?.filter(trip => {
        const originDistance = Math.sqrt(
          Math.pow(trip.origin_lat - originLat, 2) + 
          Math.pow(trip.origin_lng - originLng, 2)
        ) * 111;
        
        const destDistance = Math.sqrt(
          Math.pow(trip.destination_lat - destinationLat, 2) + 
          Math.pow(trip.destination_lng - destinationLng, 2)
        ) * 111;
        
        return originDistance <= maxDeviationKm && destDistance <= maxDeviationKm;
      }) || [];

      console.log(`✅ Encontrados ${compatibleTrips.length} viajes compatibles`);
      return compatibleTrips;
    } catch (error) {
      console.error('Error searching compatible trips:', error)
      return []
    }
  }

  // Buscar rutas compatibles usando el nuevo sistema de waypoints
  async findCompatibleRoutes(
    tripId: string,
    maxDeviationMeters: number = 1000,
    minSharedWaypoints: number = 3
  ) {
    const { data, error } = await supabase.rpc('find_compatible_routes', {
      p_trip_id: tripId,
      p_max_deviation_meters: maxDeviationMeters,
      p_min_shared_waypoints: minSharedWaypoints
    })

    if (error) {
      console.error('Error finding compatible routes:', error)
      return []
    }

    return data.map(trip => ({
      id: trip.trip_id,
      driverId: trip.trip_id, // Se puede obtener del trip
      origin: {
        name: 'Origen', // Se puede obtener del trip
        lat: 0,
        lng: 0
      },
      destination: {
        name: 'Destino', // Se puede obtener del trip
        lat: 0,
        lng: 0
      },
      departureTime: trip.departure_time,
      availableSeats: trip.available_seats,
      pricePerSeat: trip.price_per_seat,
      description: '',
      vehicle: trip.vehicle_info,
      route: {
        distance: 0,
        duration: 0,
        waypoints: []
      },
      status: 'active',
      compatibilityScore: trip.compatibility_score,
      matchType: trip.match_type,
      sharedWaypoints: trip.shared_waypoints,
      routeOverlapPercentage: trip.route_overlap_percentage
    }))
  }

  // Buscar puntos de pickup/dropoff compatibles
  async findPickupDropoffPoints(
    tripId: string,
    userLocation: { lat: number; lng: number }
  ) {
    const { default: routeService } = await import('./routeService')
    return await routeService.findPickupDropoffPoints(tripId, userLocation)
  }

  // Búsqueda avanzada de viajes
  async searchTripsAdvanced(filters: {
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
  }) {
    console.log('🔍 dataService - searchTripsAdvanced llamada con filtros:', filters);
    
    try {
      // Construir consulta directa a la tabla trips
      let query = supabase
        .from('trips')
        .select('*')
        .eq('status', 'active')
        .gte('departure_time', new Date().toISOString());

      // Aplicar filtros
      if (filters.originName) {
        query = query.ilike('origin_name', `%${filters.originName}%`);
      }
      
      if (filters.destinationName) {
        query = query.ilike('destination_name', `%${filters.destinationName}%`);
      }

      if (filters.maxPrice) {
        query = query.lte('price_per_seat', filters.maxPrice);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      } else {
        query = query.limit(50);
      }

      console.log('📡 dataService - Ejecutando consulta directa...');
      
      const { data, error } = await query;

      if (error) {
        console.error('❌ dataService - Error in advanced search:', error);
        return [];
      }
      
      console.log('✅ dataService - Consulta exitosa, datos recibidos:', data?.length || 0);

      return data?.map(trip => ({
        id: trip.id,
        driverId: trip.driver_id,
        origin: {
          name: trip.origin_name,
          lat: trip.origin_lat,
          lng: trip.origin_lng
        },
        destination: {
          name: trip.destination_name,
          lat: trip.destination_lat,
          lng: trip.destination_lng
        },
        departureTime: trip.departure_time,
        availableSeats: trip.available_seats,
        pricePerSeat: trip.price_per_seat,
        monthlyPrice: trip.route_data?.monthly_price,
        pricingModel: trip.route_data?.pricing_type || 'single',
        description: trip.description || '',
        driverName: 'Conductor', // No tenemos JOIN con profiles
        driverPhone: '',
        distanceFromOrigin: 0,
        compatibilityScore: 1.0,
        status: trip.status
      })) || [];
    } catch (error) {
      console.error('❌ dataService - Error in advanced search:', error);
      return [];
    }
  }

  // Búsqueda por proximidad
  async searchTripsByProximity(
    lat: number,
    lng: number,
    radiusKm: number = 10.0,
    date?: string,
    limit: number = 20
  ) {
    const { data, error } = await supabase.rpc('search_trips_by_proximity', {
      p_lat: lat,
      p_lng: lng,
      p_radius_km: radiusKm,
      p_date: date || null,
      p_limit: limit
    });

    if (error) {
      console.error('Error searching by proximity:', error);
      return [];
    }

    return data.map(trip => ({
      id: trip.trip_id,
      driverId: trip.trip_id,
      origin: {
        name: trip.origin_name,
        lat: 0,
        lng: 0
      },
      destination: {
        name: trip.destination_name,
        lat: 0,
        lng: 0
      },
      departureTime: trip.departure_time,
      availableSeats: trip.available_seats,
      pricePerSeat: trip.price_per_seat,
      pricingModel: trip.pricing_model,
      description: '',
      driverName: trip.driver_name,
      distanceKm: trip.distance_km,
      status: 'active'
    }));
  }

  // Búsqueda de rutas compatibles
  async searchCompatibleRoutes(
    originLat: number,
    originLng: number,
    destinationLat: number,
    destinationLng: number,
    departureDate?: string,
    maxDeviationKm: number = 3.0,
    timeWindowHours: number = 2.0,
    limit: number = 20
  ) {
    const { data, error } = await supabase.rpc('search_compatible_routes', {
      p_origin_lat: originLat,
      p_origin_lng: originLng,
      p_destination_lat: destinationLat,
      p_destination_lng: destinationLng,
      p_departure_date: departureDate || null,
      p_max_deviation_km: maxDeviationKm,
      p_time_window_hours: timeWindowHours,
      p_limit: limit
    });

    if (error) {
      console.error('Error searching compatible routes:', error);
      return [];
    }

    return data.map(trip => ({
      id: trip.trip_id,
      driverId: trip.trip_id,
      origin: {
        name: trip.origin_name,
        lat: 0,
        lng: 0
      },
      destination: {
        name: trip.destination_name,
        lat: 0,
        lng: 0
      },
      departureTime: trip.departure_time,
      availableSeats: trip.available_seats,
      pricePerSeat: trip.price_per_seat,
      pricingModel: trip.pricing_model,
      description: '',
      driverName: trip.driver_name,
      matchType: trip.match_type,
      compatibilityScore: trip.compatibility_score,
      pickupDistanceKm: trip.pickup_distance_km,
      dropoffDistanceKm: trip.dropoff_distance_km,
      status: 'active'
    }));
  }
}

export default new DataService()