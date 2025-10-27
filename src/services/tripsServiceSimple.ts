/**
 * Servicio de Viajes - Versión Simplificada
 * 
 * Concepto simple:
 * - Cada viaje tiene fecha_inicio y fecha_fin
 * - Cuando expira, se crea un NUEVO viaje (renovación)
 * - No hay auto_renew, solo viajes con períodos definidos
 */

import { supabase } from '../config/supabase'
import { supabaseAdmin } from './supabaseAdmin'

export interface TripSimple {
  id?: string
  driver_id: string
  vehicle_id?: string
  origin_name: string
  origin_lat: number
  origin_lng: number
  destination_name: string
  destination_lat: number
  destination_lng: number
  
  // Fechas del período
  fecha_inicio: string  // Fecha de inicio del viaje
  fecha_fin: string     // Fecha de fin del viaje
  
  // Días que opera (array de números: 1=Lunes, 7=Domingo)
  dias_operacion: number[]
  
  // Horarios por día de la semana
  monday_time?: string
  tuesday_time?: string
  wednesday_time?: string
  thursday_time?: string
  friday_time?: string
  saturday_time?: string
  sunday_time?: string
  
  // Plazas y precio
  available_seats: number
  price_per_seat: number
  
  // Opcional
  description?: string
  status: 'active' | 'completed' | 'cancelled'
  
  created_at?: string
  updated_at?: string
}

class TripsServiceSimple {
  /**
   * Crear viaje usando Service Role (bypasea PostgREST completamente)
   */
  async createTrip(tripData: Omit<TripSimple, 'id' | 'created_at' | 'updated_at'>): Promise<TripSimple | null> {
    try {
      console.log('🚗 Creando viaje con Service Role (bypasea caché)...')
      console.log('📊 Datos:', tripData)
      
      const insertData = {
        driver_id: tripData.driver_id,
        vehicle_id: tripData.vehicle_id || null,
        origin_name: tripData.origin_name,
        origin_lat: tripData.origin_lat,
        origin_lng: tripData.origin_lng,
        destination_name: tripData.destination_name,
        destination_lat: tripData.destination_lat,
        destination_lng: tripData.destination_lng,
        start_date: tripData.fecha_inicio,
        end_date: tripData.fecha_fin || null,
        monday_time: tripData.monday_time || null,
        tuesday_time: tripData.tuesday_time || null,
        wednesday_time: tripData.wednesday_time || null,
        thursday_time: tripData.thursday_time || null,
        friday_time: tripData.friday_time || null,
        saturday_time: tripData.saturday_time || null,
        sunday_time: tripData.sunday_time || null,
        available_seats: tripData.available_seats || 4,
        price_per_seat: tripData.price_per_seat,
        monthly_price: tripData.price_per_seat * 20,
        description: tripData.description || null,
        is_active: true
      }
      
      console.log('📝 Insertando con supabaseAdmin (Service Role)...')
      
      const { data, error } = await supabaseAdmin
        .from('monthly_trips')
        .insert(insertData)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Error insertando viaje:', error)
        return null
      }
      
      console.log(`✅ Viaje creado con ID: ${data.id}`)
      
      // Convertir respuesta a formato TripSimple
      const trip: TripSimple = {
        id: data.id,
        driver_id: data.driver_id,
        vehicle_id: data.vehicle_id,
        origin_name: data.origin_name,
        origin_lat: parseFloat(data.origin_lat),
        origin_lng: parseFloat(data.origin_lng),
        destination_name: data.destination_name,
        destination_lat: parseFloat(data.destination_lat),
        destination_lng: parseFloat(data.destination_lng),
        fecha_inicio: data.start_date,
        fecha_fin: data.end_date,
        dias_operacion: this.getDiasFromTimes(data),
        monday_time: data.monday_time,
        tuesday_time: data.tuesday_time,
        wednesday_time: data.wednesday_time,
        thursday_time: data.thursday_time,
        friday_time: data.friday_time,
        saturday_time: data.saturday_time,
        sunday_time: data.sunday_time,
        available_seats: data.available_seats,
        price_per_seat: parseFloat(data.price_per_seat),
        description: data.description,
        status: data.is_active ? 'active' : 'cancelled',
        created_at: data.created_at,
        updated_at: data.updated_at
      }
      
      return trip
      
    } catch (error) {
      console.error('❌ Error en createTrip:', error)
      return null
    }
  }
  
  /**
   * Renovar viaje = Crear un NUEVO viaje con las mismas características
   */
  async renewTrip(originalTripId: string, newEndDate: string): Promise<TripSimple | null> {
    try {
      console.log(`🔄 Renovando viaje ${originalTripId}...`)
      
      // 1. Obtener el viaje original
      const { data: originalTrip, error: fetchError } = await supabase
        .from('monthly_trips')
        .select('*')
        .eq('id', originalTripId)
        .single()
      
      if (fetchError || !originalTrip) {
        console.error('❌ Error obteniendo viaje original:', fetchError)
        return null
      }
      
      // 2. Calcular nueva fecha de inicio (día después del fin actual)
      const currentEndDate = new Date(originalTrip.end_date)
      const newStartDate = new Date(currentEndDate)
      newStartDate.setDate(newStartDate.getDate() + 1)
      
      // 3. Crear nuevo viaje con los mismos datos
      const newTripData: Omit<TripSimple, 'id' | 'created_at' | 'updated_at'> = {
        driver_id: originalTrip.driver_id,
        vehicle_id: originalTrip.vehicle_id,
        origin_name: originalTrip.origin_name,
        origin_lat: originalTrip.origin_lat,
        origin_lng: originalTrip.origin_lng,
        destination_name: originalTrip.destination_name,
        destination_lat: originalTrip.destination_lat,
        destination_lng: originalTrip.destination_lng,
        fecha_inicio: newStartDate.toISOString().split('T')[0],
        fecha_fin: newEndDate,
        dias_operacion: this.getDiasFromTimes(originalTrip),
        monday_time: originalTrip.monday_time,
        tuesday_time: originalTrip.tuesday_time,
        wednesday_time: originalTrip.wednesday_time,
        thursday_time: originalTrip.thursday_time,
        friday_time: originalTrip.friday_time,
        saturday_time: originalTrip.saturday_time,
        sunday_time: originalTrip.sunday_time,
        available_seats: originalTrip.available_seats,
        price_per_seat: originalTrip.price_per_seat,
        description: originalTrip.description,
        status: 'active'
      }
      
      const newTrip = await this.createTrip(newTripData)
      
      if (newTrip) {
        console.log(`✅ Viaje renovado. Nuevo ID: ${newTrip.id}`)
        
        // 4. Marcar el viaje original como completado
        await supabase
          .from('monthly_trips')
          .update({ is_active: false })
          .eq('id', originalTripId)
      }
      
      return newTrip
      
    } catch (error) {
      console.error('❌ Error en renewTrip:', error)
      return null
    }
  }
  
  /**
   * Obtener viajes próximos a expirar (7 días antes)
   */
  async getTripsNeedingRenewal(driverId?: string): Promise<TripSimple[]> {
    try {
      const today = new Date()
      const sevenDaysLater = new Date(today)
      sevenDaysLater.setDate(today.getDate() + 7)
      
      let query = supabase
        .from('monthly_trips')
        .select('*')
        .eq('is_active', true)
        .lte('end_date', sevenDaysLater.toISOString().split('T')[0])
        .gte('end_date', today.toISOString().split('T')[0])
      
      if (driverId) {
        query = query.eq('driver_id', driverId)
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error('❌ Error obteniendo viajes:', error)
        return []
      }
      
      return (data || []).map(trip => this.mapToTripSimple(trip))
      
    } catch (error) {
      console.error('❌ Error en getTripsNeedingRenewal:', error)
      return []
    }
  }
  
  /**
   * Buscar viajes por fecha
   */
  async searchTripsByDate(searchDate: string): Promise<TripSimple[]> {
    try {
      const dayOfWeek = new Date(searchDate).getDay() // 0=Dom, 1=Lun, ..., 6=Sáb
      const dayNumber = dayOfWeek === 0 ? 7 : dayOfWeek // Convertir a 1=Lun, 7=Dom
      
      const { data, error } = await supabase
        .from('monthly_trips')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', searchDate)
        .gte('end_date', searchDate)
      
      if (error) {
        console.error('❌ Error buscando viajes:', error)
        return []
      }
      
      // Filtrar por día de la semana
      const filtered = (data || []).filter(trip => {
        const dias = this.getDiasFromTimes(trip)
        return dias.includes(dayNumber)
      })
      
      return filtered.map(trip => this.mapToTripSimple(trip))
      
    } catch (error) {
      console.error('❌ Error en searchTripsByDate:', error)
      return []
    }
  }
  
  /**
   * Obtener viajes activos
   */
  async getActiveTrips(driverId?: string): Promise<TripSimple[]> {
    try {
      let query = supabase
        .from('monthly_trips')
        .select('*')
        .eq('is_active', true)
      
      if (driverId) {
        query = query.eq('driver_id', driverId)
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error('❌ Error obteniendo viajes activos:', error)
        return []
      }
      
      return (data || []).map(trip => this.mapToTripSimple(trip))
      
    } catch (error) {
      console.error('❌ Error en getActiveTrips:', error)
      return []
    }
  }
  
  /**
   * Helpers
   */
  private getDiasFromTimes(trip: any): number[] {
    const dias: number[] = []
    if (trip.monday_time) dias.push(1)
    if (trip.tuesday_time) dias.push(2)
    if (trip.wednesday_time) dias.push(3)
    if (trip.thursday_time) dias.push(4)
    if (trip.friday_time) dias.push(5)
    if (trip.saturday_time) dias.push(6)
    if (trip.sunday_time) dias.push(7)
    return dias
  }
  
  private mapToTripSimple(data: any): TripSimple {
    return {
      id: data.id,
      driver_id: data.driver_id,
      vehicle_id: data.vehicle_id,
      origin_name: data.origin_name,
      origin_lat: data.origin_lat,
      origin_lng: data.origin_lng,
      destination_name: data.destination_name,
      destination_lat: data.destination_lat,
      destination_lng: data.destination_lng,
      fecha_inicio: data.start_date,
      fecha_fin: data.end_date,
      dias_operacion: this.getDiasFromTimes(data),
      monday_time: data.monday_time,
      tuesday_time: data.tuesday_time,
      wednesday_time: data.wednesday_time,
      thursday_time: data.thursday_time,
      friday_time: data.friday_time,
      saturday_time: data.saturday_time,
      sunday_time: data.sunday_time,
      available_seats: data.available_seats,
      price_per_seat: data.price_per_seat,
      description: data.description,
      status: data.is_active ? 'active' : 'cancelled',
      created_at: data.created_at,
      updated_at: data.updated_at
    }
  }
}

export default new TripsServiceSimple()

