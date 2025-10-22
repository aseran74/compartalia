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
    } = {}
  ): Promise<SearchResult[]> {
    const { limit = 50 } = options

    try {
      console.log('🔍 SimpleHybridService - Búsqueda simplificada:', { 
        origin, destination, limit 
      })

      // Solo búsqueda por texto directo
      const textResults = await this.searchByText(origin, destination, limit)
      
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
