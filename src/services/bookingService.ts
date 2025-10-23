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
      // Verificar que el viaje existe y tiene asientos disponibles
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .select('available_seats, price_per_seat')
        .eq('id', bookingData.trip_id)
        .eq('status', 'active')
        .single()

      if (tripError || !trip) {
        throw new Error('Viaje no encontrado o no disponible')
      }

      // Calcular asientos ya reservados
      const { data: existingBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('seats_requested')
        .eq('trip_id', bookingData.trip_id)
        .in('status', ['pending', 'confirmed'])

      if (bookingsError) {
        throw new Error('Error al verificar reservas existentes')
      }

      const totalReservedSeats = existingBookings?.reduce((sum, booking) => sum + booking.seats_requested, 0) || 0
      const remainingSeats = trip.available_seats - totalReservedSeats

      if (remainingSeats < bookingData.seats_requested) {
        throw new Error(`Solo quedan ${remainingSeats} asientos disponibles`)
      }

      // Crear la reserva
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          ...bookingData,
          total_price: trip.price_per_seat * bookingData.seats_requested
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Error al crear la reserva: ${error.message}`)
      }

      return data
    } catch (error) {
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
        throw new Error(`Error al obtener reservas: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error fetching trip bookings:', error)
      throw error
    }
  }

  // Obtener viajes con información de reservas
  async getTripsWithBookingInfo(): Promise<TripWithBookings[]> {
    try {
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
      throw error
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
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          trips:trip_id(
            origin_name,
            destination_name,
            departure_time,
            price_per_seat
          )
        `)
        .eq('passenger_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Error al obtener reservas del usuario: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error fetching user bookings:', error)
      throw error
    }
  }
}

export const bookingService = new BookingService()
