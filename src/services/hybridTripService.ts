// Servicio híbrido que combina búsqueda por texto y geolocalización
import { supabaseClean } from '@/config/supabaseClean'
import { GeolocationService } from './geolocation'
import { bookingService, type TripWithBookings } from './bookingService'

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
    } = {}
  ): Promise<SearchResult[]> {
    const { useGeolocation = true, maxDistanceKm = 10, limit = 50 } = options

    try {
      console.log('🔍 HybridTripService - Búsqueda híbrida:', { 
        origin, destination, useGeolocation, maxDistanceKm, limit 
      })

      const results: SearchResult[] = []

      // 1. Búsqueda por texto directo (siempre)
      const textResults = await this.searchByText(origin, destination, limit)
      results.push(...textResults.map(trip => ({
        trip,
        matchType: 'exact_text' as const,
        score: 1.0
      })))

      // 2. Búsqueda por geolocalización (si está habilitada y tenemos coordenadas)
      if (useGeolocation && (origin || destination)) {
        const geoResults = await this.searchByGeolocation(origin, destination, maxDistanceKm, limit)
        results.push(...geoResults)
      }

      // 3. Eliminar duplicados y ordenar por score
      const uniqueResults = this.removeDuplicates(results)
      
      // 4. Añadir información de reservas y filtrar viajes completamente ocupados
      const resultsWithBookings = await this.addBookingInfo(uniqueResults)
      const availableResults = resultsWithBookings.filter(result => !result.bookingInfo?.is_fully_booked)
      
      const sortedResults = availableResults.sort((a, b) => b.score - a.score)

      console.log(`✅ HybridTripService - Encontrados ${sortedResults.length} viajes únicos con asientos disponibles`)
      return sortedResults.slice(0, limit)
    } catch (error) {
      console.error('❌ Error en HybridTripService.searchTrips:', error)
      throw error
    }
  }

  /**
   * Búsqueda por texto directo
   */
  private async searchByText(origin?: string, destination?: string, limit: number = 50): Promise<Trip[]> {
    try {
      let query = supabaseClean
        .from('trips')
        .select('*')
        .eq('status', 'active')
        .gte('departure_time', new Date().toISOString())
        .limit(limit)

      // Aplicar filtros de texto
      if (origin) {
        const normalizedOrigin = this.normalizeMadridSearch(origin)
        query = query.ilike('origin_name', `%${normalizedOrigin}%`)
      }
      
      if (destination) {
        const normalizedDestination = this.normalizeMadridSearch(destination)
        query = query.ilike('destination_name', `%${normalizedDestination}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ Error en búsqueda por texto:', error)
        return []
      }

      console.log(`✅ Búsqueda por texto: ${data?.length || 0} viajes`)
      return data || []
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
    const term = searchTerm.toLowerCase().trim()
    
    if (term === 'madrid') {
      return 'madrid centro'
    }
    
    if (term.includes('madrid centro')) {
      return 'madrid centro'
    }
    
    if (term.includes('madrid') && term.length > 6) {
      return searchTerm
    }
    
    return searchTerm
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
}
