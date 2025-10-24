// Servicio híbrido simplificado para debugging
import { supabaseClean } from '@/config/supabaseClean'

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
}

export class SimpleHybridService {
  /**
   * Búsqueda simplificada que solo usa texto directo
   */
  async searchTrips(
    origin?: string, 
    destination?: string, 
    options: {
      useGeolocation?: boolean
      maxDistanceKm?: number
      limit?: number
      date?: string
    } = {}
  ): Promise<SearchResult[]> {
    const { limit = 50, date } = options

    try {
      console.log('🔍 SimpleHybridService - Búsqueda simplificada:', { 
        origin, destination, limit, date 
      })

      // Solo búsqueda por texto directo
      const textResults = await this.searchByText(origin, destination, limit, date)
      
      const results: SearchResult[] = textResults.map(trip => ({
        trip,
        matchType: 'exact_text' as const,
        score: 1.0
      }))

      console.log(`✅ SimpleHybridService - Encontrados ${results.length} viajes`)
      return results
    } catch (error) {
      console.error('❌ Error en SimpleHybridService.searchTrips:', error)
      throw error
    }
  }

  /**
   * Búsqueda por texto directo
   */
  private async searchByText(origin?: string, destination?: string, limit: number = 50, date?: string): Promise<Trip[]> {
    try {
      console.log('🔍 SimpleHybridService.searchByText - Iniciando búsqueda:', { origin, destination, limit, date })
      
      // Primero obtener los viajes sin JOIN
      let query = supabaseClean
        .from('trips')
        .select('*')
        .eq('status', 'active')
        .limit(limit)

      // Filtrar por fecha si se proporciona
      if (date) {
        const searchDate = new Date(date)
        const startOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate())
        const endOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate() + 1)
        
        console.log('🔍 Filtrando por fecha:', { 
          date, 
          startOfDay: startOfDay.toISOString(), 
          endOfDay: endOfDay.toISOString() 
        })
        
        query = query
          .gte('departure_time', startOfDay.toISOString())
          .lt('departure_time', endOfDay.toISOString())
      } else {
        // Si no hay fecha específica, buscar solo viajes futuros
        query = query.gte('departure_time', new Date().toISOString())
      }

      // Aplicar filtros de texto
      if (origin) {
        const normalizedOrigin = this.normalizeMadridSearch(origin)
        console.log('🔍 Aplicando filtro origen:', { original: origin, normalized: normalizedOrigin })
        query = query.ilike('origin_name', `%${normalizedOrigin}%`)
      }
      
      if (destination) {
        const normalizedDestination = this.normalizeMadridSearch(destination)
        console.log('🔍 Aplicando filtro destino:', { original: destination, normalized: normalizedDestination })
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
      console.log('📊 Viajes encontrados:', trips)

      // Ahora obtener los perfiles de los conductores
      const driverIds = trips.map(trip => trip.driver_id)
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

      // Combinar viajes con perfiles
      const tripsWithProfiles = trips.map(trip => {
        const profile = profiles?.find(p => p.id === trip.driver_id)
        console.log('🔍 Combinando viaje:', {
          tripId: trip.id,
          driverId: trip.driver_id,
          profileFound: !!profile,
          profileName: profile?.name || 'No encontrado'
        })
        return {
          ...trip,
          profiles: profile ? {
            name: profile.name,
            avatar_url: profile.avatar_url
          } : {
            name: 'Conductor',
            avatar_url: null
          }
        }
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
   * Normalizar búsquedas de Madrid y destinos financieros
   */
  private normalizeMadridSearch(searchTerm: string): string {
    const term = searchTerm.toLowerCase().trim()
    
    if (term === 'madrid') {
      return 'madrid centro'
    }
    
    if (term.includes('madrid centro')) {
      return 'madrid centro'
    }
    
    // Normalizar destinos financieros
    if (term.includes('santander') && term.includes('boadilla')) {
      return 'Ciudad financiera Santander (Boadilla)'
    }
    
    if (term.includes('bbva') && term.includes('tablas')) {
      return 'Ciudad financiera BBVA (Las Tablas)'
    }
    
    if (term.includes('santander')) {
      return 'Ciudad financiera Santander (Boadilla)'
    }
    
    if (term.includes('bbva')) {
      return 'Ciudad financiera BBVA (Las Tablas)'
    }
    
    if (term.includes('madrid') && term.length > 6) {
      return searchTerm
    }
    
    return searchTerm
  }
}
