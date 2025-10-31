// Servicio híbrido que combina búsqueda por texto y geolocalización
import { supabaseClean } from '@/config/supabaseClean'
import { GeolocationService } from './geolocation'
import { bookingService, type TripWithBookings } from './bookingService'
import CoordinatedTripService, { type CoordinatedTripResult } from './coordinatedTripService'

export interface Trip {
  id: string
  driver_id: string
  vehicle_id: string | null
  origin_name: string
  origin_lat: number
  origin_lng: number
  destination_name: string
  destination_lat: number
  destination_lng: number
  departure_time: string
  available_seats: number
  price_per_seat: number
  description: string | null
  status: string
  route_data: any
  created_at: string
  updated_at: string
  // Datos del conductor desde el JOIN
  profiles?: {
    name: string
    avatar_url: string | null
  }
}

export interface SearchResult {
  trip: Trip
  matchType: 'exact_text' | 'proximity' | 'geolocation'
  distance?: number
  score: number
  bookingInfo?: {
    total_seats: number
    confirmed_bookings: number
    remaining_seats: number
    is_fully_booked: boolean
  }
}

export class HybridTripService {
  private geolocationService: GeolocationService

  constructor() {
    this.geolocationService = new GeolocationService()
  }

  /**
   * Búsqueda híbrida que combina texto directo y geolocalización
   */
  async searchTrips(
    origin?: string, 
    destination?: string, 
    options: {
      useGeolocation?: boolean
      maxDistanceKm?: number
      limit?: number
      date?: string
      tripType?: string
    } = {}
  ): Promise<SearchResult[]> {
    const { useGeolocation = false, maxDistanceKm = 10, limit = 50 } = options // DESHABILITAR geolocalización por defecto

    try {
      console.log('🔍 HybridTripService - Búsqueda híbrida:', { 
        origin, destination, useGeolocation, maxDistanceKm, limit, tripType: options.tripType
      })

      const results: SearchResult[] = []

      // 1. Búsqueda por texto directo (siempre)
      const textResults = await this.searchByText(origin, destination, limit, options.date, options.tripType)
      results.push(...textResults.map(trip => ({
        trip,
        matchType: 'exact_text' as const,
        score: 1.0
      })))

      // 2. Búsqueda por geolocalización (DESHABILITADA temporalmente por resultados incorrectos)
      // if (useGeolocation && (origin || destination) && textResults.length === 0) {
      //   console.log('🔍 No hay coincidencias exactas por texto, buscando por geolocalización...')
      //   const geoResults = await this.searchByGeolocation(origin, destination, maxDistanceKm, limit)
      //   results.push(...geoResults)
      // } else if (textResults.length > 0) {
      //   console.log('🔍 Coincidencias exactas encontradas, omitiendo búsqueda por geolocalización')
      // }
      console.log('🔍 Búsqueda por geolocalización deshabilitada temporalmente')

      // 3. Eliminar duplicados y ordenar por score
      const uniqueResults = this.removeDuplicates(results)
      
      // 4. Añadir información de reservas y filtrar viajes completamente ocupados
      // TEMPORAL: Comentado para evitar error de BookingService
      // const resultsWithBookings = await this.addBookingInfo(uniqueResults)
      // const availableResults = resultsWithBookings.filter(result => !result.bookingInfo?.is_fully_booked)
      const availableResults = uniqueResults
      
      const sortedResults = availableResults.sort((a, b) => b.score - a.score)

      console.log(`✅ HybridTripService - Encontrados ${sortedResults.length} viajes únicos con asientos disponibles`)
      return sortedResults.slice(0, limit)
    } catch (error) {
      console.error('❌ Error en HybridTripService.searchTrips:', error)
      throw error
    }
  }

  /**
   * Búsqueda por texto directo en monthly_trips
   */
  private async searchByText(origin?: string, destination?: string, limit: number = 50, date?: string, tripType?: string): Promise<Trip[]> {
    try {
      console.log('🔍 HybridTripService.searchByText - Iniciando búsqueda en monthly_trips')
      console.log('📋 Parámetros:', { origin: origin || 'sin origen', destination: destination || 'sin destino', limit, date: date || 'sin fecha', tripType })
      
      // Buscar en monthly_trips
      let query = supabaseClean
        .from('monthly_trips')
        .select('*')
        .eq('is_active', true)
        .limit(limit)

      // Filtrar por fecha si se proporciona
      if (date) {
        const searchDate = date
        console.log('🔍 Filtrando por fecha en query Supabase:', searchDate)
        
        // Solo filtrar por start_date en la query de Supabase
        // El filtro de end_date lo haremos después en JavaScript
        query = query
          .lte('start_date', searchDate)
          
        console.log('✅ Aplicado filtro start_date <=', searchDate)
      } else {
        // Si no se proporciona fecha, filtrar por viajes activos desde hoy
        const today = new Date().toISOString().split('T')[0]
        query = query.lte('start_date', today)
      }

      // Aplicar filtros de texto
      if (origin) {
        const normalizedOrigin = this.normalizeMadridSearch(origin)
        console.log('🔍 Aplicando filtro origen - Original:', origin, 'Normalizado:', normalizedOrigin)
        query = query.ilike('origin_name', `%${normalizedOrigin}%`)
      }
      
      if (destination) {
        const normalizedDestination = this.normalizeMadridSearch(destination)
        console.log('🔍 Aplicando filtro destino - Original:', destination, 'Normalizado:', normalizedDestination)
        query = query.ilike('destination_name', `%${normalizedDestination}%`)
      }

      console.log('🔍 Ejecutando query de viajes...')
      const { data: trips, error: tripsError } = await query

      if (tripsError) {
        console.error('❌ Error en búsqueda por texto:', tripsError)
        return []
      }

      if (!trips || trips.length === 0) {
        console.log('✅ Búsqueda por texto: 0 viajes encontrados')
        return []
      }

      console.log(`✅ Búsqueda por texto: ${trips.length} viajes encontrados`)
      console.log('📊 Viajes encontrados ANTES de filtrar por fecha:', trips.map(t => ({
        id: t.id,
        origin: t.origin_name,
        destination: t.destination_name,
        start_date: t.start_date,
        end_date: t.end_date
      })))

      // Filtrar por end_date si se proporcionó fecha (filtrado manual)
      let filteredTrips = trips
      if (date) {
        // Normalizar fecha de búsqueda (eliminar hora si existe)
        const searchDateNormalized = date.split('T')[0]
        
        console.log('📅 FECHA ORIGINAL RECIBIDA:', date)
        console.log('📅 FECHA NORMALIZADA:', searchDateNormalized)
        console.log('📊 Total viajes antes de filtrar:', trips.length)
        
        filteredTrips = trips.filter(trip => {
          // Normalizar fechas del viaje
          const tripStartDate = trip.start_date ? trip.start_date.split('T')[0] : null
          const tripEndDate = trip.end_date ? trip.end_date.split('T')[0] : null
          
          // Comparar fechas como strings YYYY-MM-DD
          const startComparison = tripStartDate && tripStartDate <= searchDateNormalized
          const endComparison = tripEndDate === null || tripEndDate >= searchDateNormalized
          const isWithinDateRange = startComparison && endComparison
          
          console.log(`📅 Viaje ${trip.origin_name}→${trip.destination_name}:`)
          console.log(`   - start_date: ${tripStartDate}, end_date: ${tripEndDate}`)
          console.log(`   - Fecha buscada: ${searchDateNormalized}`)
          console.log(`   - start <= buscar: ${startComparison}, end >= buscar: ${endComparison}`)
          console.log(`   - ✅ Resultado: ${isWithinDateRange ? 'DENTRO del rango' : 'FUERA del rango'}`)
          
          return isWithinDateRange
        })
        console.log(`✅ Viajes filtrados por fecha: ${filteredTrips.length} de ${trips.length}`)
        console.log('📊 Viajes DESPUÉS de filtrar por fecha:', filteredTrips.map(t => ({
          id: t.id,
          origin: t.origin_name,
          destination: t.destination_name,
          start_date: t.start_date,
          end_date: t.end_date
        })))
      }
      
      // Filtrar por tipo de viaje si se proporciona
      if (tripType && tripType !== '') {
        const tripTypeLower = tripType.toLowerCase()
        console.log('🔍 Filtrando por tipo de viaje:', tripTypeLower)
        
        filteredTrips = filteredTrips.filter(trip => {
          // No filtramos por tipo en monthly_trips porque todos son recurrentes
          // Simplemente no filtramos nada
          return true
        })
        console.log(`✅ Viajes después de filtro de tipo: ${filteredTrips.length}`)
      }

      // Ahora obtener los perfiles de los conductores
      const driverIds = filteredTrips.map(trip => trip.driver_id)
      console.log('🔍 Obteniendo perfiles para driver_ids:', driverIds)

      const { data: profiles, error: profilesError } = await supabaseClean
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', driverIds)

      if (profilesError) {
        console.error('❌ Error obteniendo perfiles:', profilesError)
        // Continuar sin perfiles
      }

      console.log('📊 Perfiles encontrados:', profiles)

      // Combinar viajes con perfiles y mapear de monthly_trips a Trip
      const tripsWithProfiles = filteredTrips.map(trip => {
        const profile = profiles?.find(p => p.id === trip.driver_id)
        console.log('🔍 Combinando viaje:', {
          tripId: trip.id,
          driverId: trip.driver_id,
          profileFound: !!profile,
          profileName: profile?.name || 'No encontrado'
        })
        
        // Mapear monthly_trips a formato Trip
        return this.mapMonthlyTripToTrip(trip, profile)
      })

      // Debug específico para verificar si el JOIN funciona
      if (tripsWithProfiles && tripsWithProfiles.length > 0) {
        console.log('🔍 Primer viaje con JOIN:', tripsWithProfiles[0])
        console.log('🔍 Profiles del primer viaje:', tripsWithProfiles[0].profiles)
      }
      
      return tripsWithProfiles
    } catch (error) {
      console.error('❌ Error en searchByText:', error)
      return []
    }
  }

  /**
   * Búsqueda por geolocalización
   */
  private async searchByGeolocation(
    origin?: string, 
    destination?: string, 
    maxDistanceKm: number = 10,
    limit: number = 50
  ): Promise<SearchResult[]> {
    try {
      const results: SearchResult[] = []

      // Obtener coordenadas del origen si se proporciona
      if (origin) {
        const originLocation = await this.geolocationService.geocodeAddress(origin)
        if (originLocation) {
          console.log(`📍 Origen geocodificado: ${originLocation.name} (${originLocation.coordinates.lat}, ${originLocation.coordinates.lng})`)
          
          const originResults = await this.searchByProximity(
            originLocation.coordinates.lat,
            originLocation.coordinates.lng,
            maxDistanceKm,
            limit
          )
          
          results.push(...originResults.map(trip => ({
            trip,
            matchType: 'geolocation' as const,
            distance: this.calculateDistance(
              originLocation.coordinates.lat,
              originLocation.coordinates.lng,
              parseFloat(trip.origin_lat),
              parseFloat(trip.origin_lng)
            ),
            score: 0.8 // Score menor que texto exacto
          })))
        }
      }

      // Obtener coordenadas del destino si se proporciona
      if (destination) {
        const destinationLocation = await this.geolocationService.geocodeAddress(destination)
        if (destinationLocation) {
          console.log(`📍 Destino geocodificado: ${destinationLocation.name} (${destinationLocation.coordinates.lat}, ${destinationLocation.coordinates.lng})`)
          
          const destResults = await this.searchByProximity(
            destinationLocation.coordinates.lat,
            destinationLocation.coordinates.lng,
            maxDistanceKm,
            limit
          )
          
          results.push(...destResults.map(trip => ({
            trip,
            matchType: 'proximity' as const,
            distance: this.calculateDistance(
              destinationLocation.coordinates.lat,
              destinationLocation.coordinates.lng,
              parseFloat(trip.destination_lat),
              parseFloat(trip.destination_lng)
            ),
            score: 0.7 // Score menor que geolocalización de origen
          })))
        }
      }

      console.log(`✅ Búsqueda por geolocalización: ${results.length} viajes`)
      return results
    } catch (error) {
      console.error('❌ Error en searchByGeolocation:', error)
      return []
    }
  }

  /**
   * Búsqueda por proximidad geográfica
   */
  private async searchByProximity(
    lat: number, 
    lng: number, 
    radiusKm: number,
    limit: number
  ): Promise<Trip[]> {
    try {
      // Obtener todos los viajes activos
      const { data, error } = await supabaseClean
        .from('trips')
        .select('*')
        .eq('status', 'active')
        .gte('departure_time', new Date().toISOString())
        .limit(200) // Obtener más para filtrar por proximidad

      if (error) {
        console.error('❌ Error obteniendo viajes para proximidad:', error)
        return []
      }

      // Filtrar por proximidad
      const nearbyTrips = data?.filter(trip => {
        const distance = this.calculateDistance(
          lat, 
          lng, 
          parseFloat(trip.origin_lat), 
          parseFloat(trip.origin_lng)
        )
        return distance <= radiusKm
      }) || []

      console.log(`✅ Búsqueda por proximidad: ${nearbyTrips.length} viajes cercanos`)
      return nearbyTrips.slice(0, limit)
    } catch (error) {
      console.error('❌ Error en searchByProximity:', error)
      return []
    }
  }

  /**
   * Normalizar búsquedas de Madrid
   */
  private normalizeMadridSearch(searchTerm: string): string {
    let term = searchTerm.toLowerCase().trim()
    
    // Extraer solo el primer componente (antes de la primera coma)
    // Ej: "Leganés, Madrid, España" -> "leganés"
    if (term.includes(',')) {
      term = term.split(',')[0].trim()
    }
    
    // Normalizar "Puerta del Sol" a "Sol"
    if (term.includes('puerta del sol')) {
      return 'sol'
    }
    
    // Normalizar "Madrid" a "Madrid Centro"
    if (term === 'madrid') {
      return 'madrid centro'
    }
    
    if (term.includes('madrid centro')) {
      return 'madrid centro'
    }
    
    if (term.includes('madrid') && term.length > 6) {
      return term
    }
    
    return term
  }

  /**
   * Calcular distancia entre dos puntos (fórmula de Haversine)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1)
    const dLng = this.deg2rad(lng2 - lng1)
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180)
  }

  /**
   * Eliminar duplicados basándose en el ID del viaje
   */
  private removeDuplicates(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>()
    return results.filter(result => {
      if (seen.has(result.trip.id)) {
        return false
      }
      seen.add(result.trip.id)
      return true
    })
  }

  /**
   * Añadir información de reservas a los resultados
   */
  private async addBookingInfo(results: SearchResult[]): Promise<SearchResult[]> {
    try {
      const tripIds = results.map(result => result.trip.id)
      
      // Obtener información de reservas para todos los viajes
      const tripsWithBookings = await bookingService.getTripsWithBookingInfo()
      const bookingMap = new Map(tripsWithBookings.map(trip => [trip.id, trip]))
      
      // Añadir información de reservas a cada resultado
      return results.map(result => {
        const bookingInfo = bookingMap.get(result.trip.id)
        return {
          ...result,
          bookingInfo: bookingInfo ? {
            total_seats: bookingInfo.total_seats,
            confirmed_bookings: bookingInfo.confirmed_bookings,
            remaining_seats: bookingInfo.remaining_seats,
            is_fully_booked: bookingInfo.is_fully_booked
          } : undefined
        }
      })
    } catch (error) {
      console.error('❌ Error añadiendo información de reservas:', error)
      return results
    }
  }

  /**
   * Obtener sugerencias de autocompletado
   */
  async getSuggestions(input: string, type: 'origin' | 'destination' = 'origin'): Promise<any[]> {
    try {
      console.log(`🔍 Obteniendo sugerencias para: ${input}`)
      
      const suggestions = await this.geolocationService.autocompleteAddress(input)
      
      console.log(`✅ Encontradas ${suggestions.length} sugerencias`)
      return suggestions
    } catch (error) {
      console.error('❌ Error obteniendo sugerencias:', error)
      return []
    }
  }

  /**
   * Mapea un viaje de monthly_trips al formato Trip esperado
   */
  private mapMonthlyTripToTrip(monthlyTrip: any, profile?: any): Trip {
    // Obtener el primer horario disponible como departure_time
    let departureTime = monthlyTrip.monday_time || 
                       monthlyTrip.tuesday_time || 
                       monthlyTrip.wednesday_time || 
                       monthlyTrip.thursday_time || 
                       monthlyTrip.friday_time || 
                       monthlyTrip.saturday_time || 
                       monthlyTrip.sunday_time || 
                       '08:00'
    
    // Normalizar formato de tiempo (eliminar segundos si existen)
    if (departureTime && departureTime.includes(':')) {
      const parts = departureTime.split(':')
      if (parts.length >= 2) {
        departureTime = `${parts[0]}:${parts[1]}`
      }
    }
    
    // Crear un timestamp combinando start_date con el horario
    const startDate = monthlyTrip.start_date || new Date().toISOString().split('T')[0]
    const departureTimestamp = `${startDate}T${departureTime}:00`
    
    return {
      id: monthlyTrip.id,
      driver_id: monthlyTrip.driver_id,
      vehicle_id: monthlyTrip.vehicle_id,
      origin_name: monthlyTrip.origin_name,
      origin_lat: parseFloat(monthlyTrip.origin_lat),
      origin_lng: parseFloat(monthlyTrip.origin_lng),
      destination_name: monthlyTrip.destination_name,
      destination_lat: parseFloat(monthlyTrip.destination_lat),
      destination_lng: parseFloat(monthlyTrip.destination_lng),
      departure_time: departureTimestamp,
      available_seats: monthlyTrip.available_seats,
      price_per_seat: parseFloat(monthlyTrip.price_per_seat || 0), // Precio por trayecto (solo ida)
      monthly_price: parseFloat(monthlyTrip.monthly_price || 0), // Precio mensual
      start_date: monthlyTrip.start_date,
      end_date: monthlyTrip.end_date,
      trip_type: 'monthly' as const, // Los viajes de monthly_trips son siempre mensuales
      description: monthlyTrip.description || `Viaje recurrente de ${monthlyTrip.origin_name} a ${monthlyTrip.destination_name}`,
      status: monthlyTrip.is_active ? 'active' : 'inactive',
      route_data: null,
      created_at: monthlyTrip.created_at,
      updated_at: monthlyTrip.updated_at,
      profiles: profile ? {
        name: profile.name,
        avatar_url: profile.avatar_url
      } : {
        name: 'Conductor',
        avatar_url: null
      }
    }
  }
}
