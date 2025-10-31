import { supabase } from '@/config/supabase'

export interface Booking {
  id?: string
  trip_id: string
  passenger_id: string
  seats_requested: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  pickup_location?: string
  pickup_lat?: number
  pickup_lng?: number
  total_price?: number
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface TripWithBookings {
  id: string
  origin_name: string
  destination_name: string
  departure_time: string
  available_seats: number
  price_per_seat: number
  total_seats: number
  confirmed_bookings: number
  remaining_seats: number
  is_fully_booked: boolean
}

export class BookingService {
  // Crear una nueva reserva
  async createBooking(bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Promise<Booking | null> {
    try {
      // Intentar buscar en monthly_trips primero
      let trip = null
      let tripError = null
      
      const { data: monthlyTrip, error: monthlyError } = await supabase
        .from('monthly_trips')
        .select('available_seats, price_per_seat, monthly_price')
        .eq('id', bookingData.trip_id)
        .single()

      if (!monthlyError && monthlyTrip) {
        trip = monthlyTrip
        trip.price_per_seat = trip.price_per_seat || trip.monthly_price
      } else {
        // Si no se encuentra, intentar en trips
        const { data: regularTrip, error: regularError } = await supabase
          .from('trips')
          .select('available_seats, price_per_seat')
          .eq('id', bookingData.trip_id)
          .eq('status', 'active')
          .single()

        if (!regularError && regularTrip) {
          trip = regularTrip
        }
      }

      if (!trip) {
        throw new Error('Viaje no encontrado o no disponible')
      }

      // Calcular asientos ya reservados (opcional, si existe la tabla bookings)
      const { data: existingBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('seats_requested')
        .eq('trip_id', bookingData.trip_id)
        .in('status', ['pending', 'confirmed'])

      if (!bookingsError && existingBookings) {
        const totalReservedSeats = existingBookings.reduce((sum, booking) => sum + booking.seats_requested, 0)
        const remainingSeats = trip.available_seats - totalReservedSeats

        if (remainingSeats < bookingData.seats_requested) {
          throw new Error(`Solo quedan ${remainingSeats} asientos disponibles`)
        }
      }

      // Calcular precio total
      const pricePerSeat = trip.price_per_seat || 0
      const totalPrice = bookingData.total_price || (pricePerSeat * bookingData.seats_requested)

      // Crear la reserva en la base de datos
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          trip_id: bookingData.trip_id,
          passenger_id: bookingData.passenger_id,
          seats_requested: bookingData.seats_requested,
          status: bookingData.status,
          pickup_location: bookingData.pickup_location,
          pickup_lat: bookingData.pickup_lat,
          pickup_lng: bookingData.pickup_lng,
          total_price: totalPrice,
          payment_method: (bookingData as any).payment_method,
          payment_status: (bookingData as any).payment_status || 'pending',
          transaction_id: (bookingData as any).transaction_id,
          notes: bookingData.notes
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Error al crear la reserva: ${error.message}`)
      }

      console.log('✅ Reserva creada exitosamente en la base de datos:', data)
      return data
    } catch (error: any) {
      console.error('Error creating booking:', error)
      throw error
    }
  }

  // Obtener reservas de un viaje
  async getTripBookings(tripId: string): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('trip_id', tripId)
        .in('status', ['pending', 'confirmed'])
        .order('created_at', { ascending: true })

      if (error) {
        // Si la tabla no existe, devolver array vacío en lugar de lanzar error
        if (error.message.includes('Could not find the table') || error.message.includes('schema cache')) {
          console.warn('⚠️ Tabla bookings no encontrada, devolviendo array vacío')
          return []
        }
        throw new Error(`Error al obtener reservas: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error fetching trip bookings:', error)
      // En caso de error, devolver array vacío para evitar que falle la aplicación
      return []
    }
  }

  // Obtener viajes con información de reservas
  async getTripsWithBookingInfo(): Promise<TripWithBookings[]> {
    try {
      // Intentar obtener desde monthly_trips primero (tabla actual)
      const { data: monthlyTrips, error: monthlyError } = await supabase
        .from('monthly_trips')
        .select('id, origin_name, destination_name, start_date, end_date, available_seats, price_per_seat, monthly_price')
        .order('start_date', { ascending: true })

      if (!monthlyError && monthlyTrips) {
        // Usar monthly_trips si está disponible
        const tripsWithBookings = await Promise.all(
          monthlyTrips.map(async (trip) => {
            const bookings = await this.getTripBookings(trip.id)
            const confirmedBookings = bookings.reduce((sum, booking) => sum + booking.seats_requested, 0)
            const remainingSeats = trip.available_seats - confirmedBookings

            return {
              id: trip.id,
              origin_name: trip.origin_name,
              destination_name: trip.destination_name,
              departure_time: trip.start_date || new Date().toISOString(),
              available_seats: trip.available_seats,
              price_per_seat: trip.price_per_seat || trip.monthly_price,
              total_seats: trip.available_seats,
              confirmed_bookings: confirmedBookings,
              remaining_seats: Math.max(0, remainingSeats),
              is_fully_booked: remainingSeats <= 0
            }
          })
        )
        return tripsWithBookings
      }

      // Fallback a la tabla trips si monthly_trips no existe
      const { data: trips, error: tripsError } = await supabase
        .from('trips')
        .select('id, origin_name, destination_name, departure_time, available_seats, price_per_seat, status')
        .eq('status', 'active')
        .order('departure_time', { ascending: true })

      if (tripsError) {
        throw new Error(`Error al obtener viajes: ${tripsError.message}`)
      }

      if (!trips) return []

      // Obtener reservas para cada viaje
      const tripsWithBookings = await Promise.all(
        trips.map(async (trip) => {
          const bookings = await this.getTripBookings(trip.id)
          const confirmedBookings = bookings.reduce((sum, booking) => sum + booking.seats_requested, 0)
          const remainingSeats = trip.available_seats - confirmedBookings

          return {
            id: trip.id,
            origin_name: trip.origin_name,
            destination_name: trip.destination_name,
            departure_time: trip.departure_time,
            available_seats: trip.available_seats,
            price_per_seat: trip.price_per_seat,
            total_seats: trip.available_seats,
            confirmed_bookings: confirmedBookings,
            remaining_seats: Math.max(0, remainingSeats),
            is_fully_booked: remainingSeats <= 0
          }
        })
      )

      return tripsWithBookings
    } catch (error) {
      console.error('Error fetching trips with booking info:', error)
      // Devolver array vacío en caso de error para evitar que falle la aplicación
      return []
    }
  }

  // Obtener viajes disponibles (con asientos libres)
  async getAvailableTrips(): Promise<TripWithBookings[]> {
    try {
      const allTrips = await this.getTripsWithBookingInfo()
      return allTrips.filter(trip => !trip.is_fully_booked)
    } catch (error) {
      console.error('Error fetching available trips:', error)
      throw error
    }
  }

  // Confirmar una reserva
  async confirmBooking(bookingId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId)

      if (error) {
        throw new Error(`Error al confirmar reserva: ${error.message}`)
      }

      return true
    } catch (error) {
      console.error('Error confirming booking:', error)
      throw error
    }
  }

  // Cancelar una reserva
  async cancelBooking(bookingId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)

      if (error) {
        throw new Error(`Error al cancelar reserva: ${error.message}`)
      }

      return true
    } catch (error) {
      console.error('Error cancelling booking:', error)
      throw error
    }
  }

  // Obtener reservas de un usuario
  async getUserBookings(userId: string): Promise<Booking[]> {
    try {
      // Obtener reservas con información de monthly_trips usando JOIN manual
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('passenger_id', userId)
        .order('created_at', { ascending: false })

      if (bookingsError) {
        throw new Error(`Error al obtener reservas del usuario: ${bookingsError.message}`)
      }

      if (!bookings || bookings.length === 0) {
        return []
      }

      // Obtener información de los viajes por separado
      const tripIds = bookings.map(booking => booking.trip_id)
      const { data: trips, error: tripsError } = await supabase
        .from('monthly_trips')
        .select('id, origin_name, destination_name, start_date, end_date, price_per_seat, monthly_price, driver_id')
        .in('id', tripIds)

      if (tripsError) {
        console.warn('Error obteniendo información de viajes:', tripsError)
      }

      // Obtener información de los conductores
      const driverIds = trips?.map(trip => trip.driver_id).filter(Boolean) || []
      let driversMap = new Map()
      if (driverIds.length > 0) {
        const { data: drivers, error: driversError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', driverIds)

        if (!driversError && drivers) {
          drivers.forEach(driver => {
            driversMap.set(driver.id, driver.name)
          })
        }
      }

      // Crear mapa de viajes para acceso rápido
      const tripsMap = new Map()
      if (trips) {
        trips.forEach(trip => {
          tripsMap.set(trip.id, trip)
        })
      }

      // Combinar reservas con información de viajes
      const bookingsWithTripInfo = bookings.map(booking => {
        const trip = tripsMap.get(booking.trip_id)
        return {
          ...booking,
          trip_info: trip ? {
            origin_name: trip.origin_name,
            destination_name: trip.destination_name,
            departure_time: trip.start_date,
            price_per_seat: trip.price_per_seat || trip.monthly_price,
            driver_id: trip.driver_id,
            driver_name: driversMap.get(trip.driver_id) || 'Conductor no disponible'
          } : null
        }
      })

      return bookingsWithTripInfo
    } catch (error) {
      console.error('Error fetching user bookings:', error)
      throw error
    }
  }
}

export const bookingService = new BookingService()
