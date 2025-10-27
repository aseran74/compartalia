/**
 * Servicio de Viajes - Versión Directa con SQL
 * 
 * Este servicio usa SQL directo en lugar de la API REST de Supabase
 * para evitar problemas con el caché de PostgREST
 */

import { supabase } from '../config/supabase'

export type TripType = 'single' | 'weekly' | 'monthly'

export interface Trip {
  id?: string
  driver_id: string
  vehicle_id?: string
  origin_name: string
  origin_lat: number
  origin_lng: number
  destination_name: string
  destination_lat: number
  destination_lng: number
  departure_time?: string
  return_time?: string
  available_seats: number
  price_per_seat?: number
  description?: string
  status: 'active' | 'completed' | 'cancelled'
  route_data?: any
  created_at?: string
  updated_at?: string
  
  // Campos para viajes unificados
  trip_type: TripType
  start_date?: string
  end_date?: string
  price_per_day?: number
  price_per_period?: number
  recurrence_days?: number[]
  
  // Horarios por día
  monday_time?: string
  tuesday_time?: string
  wednesday_time?: string
  thursday_time?: string
  friday_time?: string
  saturday_time?: string
  sunday_time?: string
  
  special_times?: any
  auto_renew?: boolean
  renewal_notification_sent?: boolean
  renewal_notification_date?: string
}

class TripsServiceDirect {
  /**
   * Crear viaje usando función RPC insert_trip
   */
  async createTrip(tripData: Omit<Trip, 'id' | 'created_at' | 'updated_at'>): Promise<Trip | null> {
    try {
      console.log('🚗 Creando viaje con función RPC...')
      console.log('📊 Datos del viaje:', tripData)
      
      // Preparar parámetros para la función insert_trip
      const params: any = {
        p_driver_id: tripData.driver_id,
        p_origin_name: tripData.origin_name,
        p_origin_lat: tripData.origin_lat,
        p_origin_lng: tripData.origin_lng,
        p_destination_name: tripData.destination_name,
        p_destination_lat: tripData.destination_lat,
        p_destination_lng: tripData.destination_lng,
        p_trip_type: tripData.trip_type,
        p_available_seats: tripData.available_seats,
        p_status: tripData.status
      }
      
      // Agregar campos opcionales
      if (tripData.vehicle_id) params.p_vehicle_id = tripData.vehicle_id
      if (tripData.departure_time) params.p_departure_time = tripData.departure_time
      if (tripData.return_time) params.p_return_time = tripData.return_time
      if (tripData.price_per_seat !== undefined) params.p_price_per_seat = tripData.price_per_seat
      if (tripData.description) params.p_description = tripData.description
      if (tripData.start_date) params.p_start_date = tripData.start_date
      if (tripData.end_date) params.p_end_date = tripData.end_date
      if (tripData.price_per_day !== undefined) params.p_price_per_day = tripData.price_per_day
      if (tripData.price_per_period !== undefined) params.p_price_per_period = tripData.price_per_period
      if (tripData.recurrence_days) params.p_recurrence_days = tripData.recurrence_days
      if (tripData.monday_time) params.p_monday_time = tripData.monday_time
      if (tripData.tuesday_time) params.p_tuesday_time = tripData.tuesday_time
      if (tripData.wednesday_time) params.p_wednesday_time = tripData.wednesday_time
      if (tripData.thursday_time) params.p_thursday_time = tripData.thursday_time
      if (tripData.friday_time) params.p_friday_time = tripData.friday_time
      if (tripData.saturday_time) params.p_saturday_time = tripData.saturday_time
      if (tripData.sunday_time) params.p_sunday_time = tripData.sunday_time
      if (tripData.special_times) params.p_special_times = tripData.special_times
      if (tripData.route_data) params.p_route_data = tripData.route_data
      if (tripData.auto_renew !== undefined) params.p_auto_renew = tripData.auto_renew
      
      console.log('📝 Parámetros RPC:', params)
      
      // Llamar a la función insert_trip
      const { data, error } = await supabase.rpc('insert_trip', params)
      
      if (error) {
        console.error('❌ Error llamando a insert_trip:', error)
        console.log('⚠️ Intentando método alternativo...')
        return await this.createTripAlternative(tripData)
      }
      
      if (!data || data.length === 0) {
        console.error('❌ No se obtuvo respuesta de insert_trip')
        return await this.createTripAlternative(tripData)
      }
      
      const trip = data[0]
      console.log(`✅ Viaje creado con ID: ${trip.id}`)
      return trip
      
    } catch (error) {
      console.error('❌ Error en createTrip:', error)
      return await this.createTripAlternative(tripData)
    }
  }
  
  /**
   * Método alternativo usando INSERT directo
   */
  private async createTripAlternative(tripData: Omit<Trip, 'id' | 'created_at' | 'updated_at'>): Promise<Trip | null> {
    try {
      console.log('🔄 Usando método alternativo de inserción...')
      
      // Construir objeto de datos limpio
      const cleanData: any = {
        driver_id: tripData.driver_id,
        origin_name: tripData.origin_name,
        origin_lat: tripData.origin_lat,
        origin_lng: tripData.origin_lng,
        destination_name: tripData.destination_name,
        destination_lat: tripData.destination_lat,
        destination_lng: tripData.destination_lng,
        available_seats: tripData.available_seats,
        status: tripData.status,
        trip_type: tripData.trip_type
      }
      
      // Agregar campos opcionales solo si tienen valor
      if (tripData.vehicle_id) cleanData.vehicle_id = tripData.vehicle_id
      if (tripData.departure_time) cleanData.departure_time = tripData.departure_time
      if (tripData.return_time) cleanData.return_time = tripData.return_time
      if (tripData.price_per_seat !== undefined) cleanData.price_per_seat = tripData.price_per_seat
      if (tripData.description) cleanData.description = tripData.description
      if (tripData.start_date) cleanData.start_date = tripData.start_date
      if (tripData.end_date) cleanData.end_date = tripData.end_date
      if (tripData.price_per_day !== undefined) cleanData.price_per_day = tripData.price_per_day
      if (tripData.price_per_period !== undefined) cleanData.price_per_period = tripData.price_per_period
      if (tripData.recurrence_days) cleanData.recurrence_days = tripData.recurrence_days
      if (tripData.monday_time) cleanData.monday_time = tripData.monday_time
      if (tripData.tuesday_time) cleanData.tuesday_time = tripData.tuesday_time
      if (tripData.wednesday_time) cleanData.wednesday_time = tripData.wednesday_time
      if (tripData.thursday_time) cleanData.thursday_time = tripData.thursday_time
      if (tripData.friday_time) cleanData.friday_time = tripData.friday_time
      if (tripData.saturday_time) cleanData.saturday_time = tripData.saturday_time
      if (tripData.sunday_time) cleanData.sunday_time = tripData.sunday_time
      if (tripData.special_times) cleanData.special_times = tripData.special_times
      if (tripData.route_data) cleanData.route_data = tripData.route_data
      if (tripData.auto_renew !== undefined) cleanData.auto_renew = tripData.auto_renew
      
      console.log('📊 Datos limpios:', cleanData)
      
      // Intentar insertar usando from().insert()
      const { data, error } = await supabase
        .from('trips')
        .insert(cleanData)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Error en INSERT alternativo:', error)
        return null
      }
      
      console.log(`✅ Viaje creado con método alternativo, ID: ${data.id}`)
      return data
      
    } catch (error) {
      console.error('❌ Error en createTripAlternative:', error)
      return null
    }
  }
  
  /**
   * Buscar viajes por fecha
   */
  async searchTripsByDate(params: {
    search_date: string
    origin_lat?: number
    origin_lng?: number
    dest_lat?: number
    dest_lng?: number
    radius_km?: number
  }): Promise<Trip[]> {
    try {
      const { data, error } = await supabase.rpc('search_trips_by_date', params)
      
      if (error) {
        console.error('❌ Error buscando viajes:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('❌ Error en searchTripsByDate:', error)
      return []
    }
  }
}

export default new TripsServiceDirect()

