// Utilidades simples para búsqueda de viajes sin RPC
import { supabase } from '@/config/supabase'

export interface SimpleTrip {
  id: string
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
}

export class TripSearchService {
  /**
   * Búsqueda simple de viajes por origen y destino
   */
  static async searchTrips(origin?: string, destination?: string, limit: number = 50): Promise<SimpleTrip[]> {
    try {
      console.log('🔍 Buscando viajes con parámetros:', { origin, destination, limit });
      
      let query = supabase
        .from('trips')
        .select('*')
        .eq('status', 'active')
        .gte('departure_time', new Date().toISOString())
        .limit(limit);

      // Aplicar filtros si se proporcionan
      if (origin) {
        query = query.ilike('origin_name', `%${origin}%`);
      }
      
      if (destination) {
        query = query.ilike('destination_name', `%${destination}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error en búsqueda de viajes:', error);
        return [];
      }

      console.log(`✅ Encontrados ${data?.length || 0} viajes`);
      return data || [];
    } catch (error) {
      console.error('❌ Error en TripSearchService.searchTrips:', error);
      return [];
    }
  }

  /**
   * Búsqueda de viajes por proximidad (simplificada)
   */
  static async searchTripsByLocation(
    userLat: number, 
    userLng: number, 
    radiusKm: number = 10
  ): Promise<SimpleTrip[]> {
    try {
      console.log('🔍 Buscando viajes por proximidad:', { userLat, userLng, radiusKm });
      
      // Obtener todos los viajes activos
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('status', 'active')
        .gte('departure_time', new Date().toISOString())
        .limit(100);

      if (error) {
        console.error('❌ Error en búsqueda por proximidad:', error);
        return [];
      }

      // Filtrar por proximidad (cálculo simple)
      const nearbyTrips = data?.filter(trip => {
        const distance = Math.sqrt(
          Math.pow(parseFloat(trip.origin_lat) - userLat, 2) + 
          Math.pow(parseFloat(trip.origin_lng) - userLng, 2)
        ) * 111; // Conversión aproximada a km
        
        return distance <= radiusKm;
      }) || [];

      console.log(`✅ Encontrados ${nearbyTrips.length} viajes cercanos`);
      return nearbyTrips;
    } catch (error) {
      console.error('❌ Error en TripSearchService.searchTripsByLocation:', error);
      return [];
    }
  }

  /**
   * Búsqueda de viajes compatibles (simplificada)
   */
  static async searchCompatibleTrips(
    originLat: number,
    originLng: number,
    destinationLat: number,
    destinationLng: number,
    maxDeviationKm: number = 5
  ): Promise<SimpleTrip[]> {
    try {
      console.log('🔍 Buscando viajes compatibles:', { originLat, originLng, destinationLat, destinationLng, maxDeviationKm });
      
      // Obtener todos los viajes activos
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('status', 'active')
        .gte('departure_time', new Date().toISOString())
        .limit(100);

      if (error) {
        console.error('❌ Error en búsqueda de viajes compatibles:', error);
        return [];
      }

      // Filtrar por proximidad de origen y destino
      const compatibleTrips = data?.filter(trip => {
        const originDistance = Math.sqrt(
          Math.pow(parseFloat(trip.origin_lat) - originLat, 2) + 
          Math.pow(parseFloat(trip.origin_lng) - originLng, 2)
        ) * 111;
        
        const destDistance = Math.sqrt(
          Math.pow(parseFloat(trip.destination_lat) - destinationLat, 2) + 
          Math.pow(parseFloat(trip.destination_lng) - destinationLng, 2)
        ) * 111;
        
        return originDistance <= maxDeviationKm && destDistance <= maxDeviationKm;
      }) || [];

      console.log(`✅ Encontrados ${compatibleTrips.length} viajes compatibles`);
      return compatibleTrips;
    } catch (error) {
      console.error('❌ Error en TripSearchService.searchCompatibleTrips:', error);
      return [];
    }
  }

  /**
   * Obtener todos los viajes activos
   */
  static async getAllActiveTrips(limit: number = 100): Promise<SimpleTrip[]> {
    try {
      console.log('🔍 Obteniendo todos los viajes activos...');
      
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('status', 'active')
        .gte('departure_time', new Date().toISOString())
        .limit(limit);

      if (error) {
        console.error('❌ Error obteniendo viajes activos:', error);
        return [];
      }

      console.log(`✅ Obtenidos ${data?.length || 0} viajes activos`);
      return data || [];
    } catch (error) {
      console.error('❌ Error en TripSearchService.getAllActiveTrips:', error);
      return [];
    }
  }
}
