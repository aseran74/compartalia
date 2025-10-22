// Servicio simple de búsqueda de viajes sin RPC
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

export class SimpleTripService {
  /**
   * Buscar viajes por origen y destino
   */
  static async searchTrips(origin?: string, destination?: string, limit: number = 50): Promise<Trip[]> {
    try {
      console.log('🔍 SimpleTripService - Buscando viajes:', { origin, destination, limit });
      
      let query = supabaseClean
        .from('trips')
        .select('*')
        .eq('status', 'active')
        .gte('departure_time', new Date().toISOString())
        .limit(limit);

      // Aplicar filtros si se proporcionan
      if (origin) {
        // Normalizar búsqueda de Madrid
        const normalizedOrigin = this.normalizeMadridSearch(origin);
        query = query.ilike('origin_name', `%${normalizedOrigin}%`);
      }
      
      if (destination) {
        // Normalizar búsqueda de Madrid
        const normalizedDestination = this.normalizeMadridSearch(destination);
        query = query.ilike('destination_name', `%${normalizedDestination}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error en búsqueda de viajes:', error);
        throw new Error(`Error de Supabase: ${error.message}`);
      }

      console.log(`✅ Encontrados ${data?.length || 0} viajes`);
      return data || [];
    } catch (error) {
      console.error('❌ Error en SimpleTripService.searchTrips:', error);
      throw error;
    }
  }

  /**
   * Normalizar búsquedas de Madrid para encontrar "Madrid Centro"
   */
  private static normalizeMadridSearch(searchTerm: string): string {
    const term = searchTerm.toLowerCase().trim();
    
    // Si busca "madrid" sin especificar, buscar "madrid centro"
    if (term === 'madrid') {
      return 'madrid centro';
    }
    
    // Si busca "madrid centro", mantenerlo
    if (term.includes('madrid centro')) {
      return 'madrid centro';
    }
    
    // Si busca "madrid" con algo más, mantenerlo
    if (term.includes('madrid') && term.length > 6) {
      return searchTerm;
    }
    
    // Para otros casos, devolver el término original
    return searchTerm;
  }

  /**
   * Obtener todos los viajes activos
   */
  static async getAllActiveTrips(limit: number = 100): Promise<Trip[]> {
    try {
      console.log('🔍 SimpleTripService - Obteniendo todos los viajes activos...');
      
      const { data, error } = await supabaseClean
        .from('trips')
        .select('*')
        .eq('status', 'active')
        .gte('departure_time', new Date().toISOString())
        .limit(limit);

      if (error) {
        console.error('❌ Error obteniendo viajes activos:', error);
        throw new Error(`Error de Supabase: ${error.message}`);
      }

      console.log(`✅ Obtenidos ${data?.length || 0} viajes activos`);
      return data || [];
    } catch (error) {
      console.error('❌ Error en SimpleTripService.getAllActiveTrips:', error);
      throw error;
    }
  }

  /**
   * Buscar viajes por proximidad (simplificado)
   */
  static async searchByLocation(
    userLat: number, 
    userLng: number, 
    radiusKm: number = 10
  ): Promise<Trip[]> {
    try {
      console.log('🔍 SimpleTripService - Buscando por proximidad:', { userLat, userLng, radiusKm });
      
      // Obtener todos los viajes activos
      const allTrips = await this.getAllActiveTrips(200);

      // Filtrar por proximidad
      const nearbyTrips = allTrips.filter(trip => {
        const distance = this.calculateDistance(
          userLat, 
          userLng, 
          parseFloat(trip.origin_lat), 
          parseFloat(trip.origin_lng)
        );
        
        return distance <= radiusKm;
      });

      console.log(`✅ Encontrados ${nearbyTrips.length} viajes cercanos`);
      return nearbyTrips;
    } catch (error) {
      console.error('❌ Error en SimpleTripService.searchByLocation:', error);
      throw error;
    }
  }

  /**
   * Buscar viajes compatibles (simplificado)
   */
  static async searchCompatible(
    originLat: number,
    originLng: number,
    destinationLat: number,
    destinationLng: number,
    maxDeviationKm: number = 5
  ): Promise<Trip[]> {
    try {
      console.log('🔍 SimpleTripService - Buscando viajes compatibles:', { 
        originLat, originLng, destinationLat, destinationLng, maxDeviationKm 
      });
      
      // Obtener todos los viajes activos
      const allTrips = await this.getAllActiveTrips(200);

      // Filtrar por proximidad de origen y destino
      const compatibleTrips = allTrips.filter(trip => {
        const originDistance = this.calculateDistance(
          originLat, 
          originLng, 
          parseFloat(trip.origin_lat), 
          parseFloat(trip.origin_lng)
        );
        
        const destDistance = this.calculateDistance(
          destinationLat, 
          destinationLng, 
          parseFloat(trip.destination_lat), 
          parseFloat(trip.destination_lng)
        );
        
        return originDistance <= maxDeviationKm && destDistance <= maxDeviationKm;
      });

      console.log(`✅ Encontrados ${compatibleTrips.length} viajes compatibles`);
      return compatibleTrips;
    } catch (error) {
      console.error('❌ Error en SimpleTripService.searchCompatible:', error);
      throw error;
    }
  }

  /**
   * Calcular distancia entre dos puntos (fórmula de Haversine simplificada)
   */
  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  /**
   * Obtener viajes por ID
   */
  static async getTripById(id: string): Promise<Trip | null> {
    try {
      console.log('🔍 SimpleTripService - Obteniendo viaje por ID:', id);
      
      const { data, error } = await supabaseClean
        .from('trips')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Error obteniendo viaje por ID:', error);
        return null;
      }

      console.log('✅ Viaje obtenido correctamente');
      return data;
    } catch (error) {
      console.error('❌ Error en SimpleTripService.getTripById:', error);
      return null;
    }
  }
}
