import { supabase } from '../config/supabase';
import routeServiceHybrid from './routeServiceHybrid';

export interface TripStop {
  id?: string;
  trip_id?: string;
  stop_order: number;
  name?: string;
  address?: string;
  lat: number;
  lng: number;
  distance_from_origin: number;
  radius_km: number;
}

export interface Trip {
  id?: string;
  origin_name: string;
  origin_lat: number;
  origin_lng: number;
  destination_name: string;
  destination_lat: number;
  destination_lng: number;
  route_distance?: number;
  route_duration?: number;
  route_coordinates?: any[];
  driver_id?: string;
  driver_name: string;
  driver_rating?: number;
  available_seats: number;
  departure_time: string;
      price_per_seat: number;
  days_of_week: number[];
  is_active: boolean;
  stops?: TripStop[];
}

export interface SearchMatch {
  trip_id: string;
  match_type: 'origin' | 'destination' | 'stop';
  match_distance: number;
  stop_id?: string;
  stop_name?: string;
  stop_address?: string;
  trip_data: any; // JSONB from database
}

class SupabaseTripsService {
  /**
   * Crea un nuevo viaje con paradas
   */
  async createTrip(tripData: Omit<Trip, 'id'>): Promise<Trip | null> {
    try {
      console.log('🚗 Creando nuevo viaje...');
      
      // Obtener ruta real
      const origin = { lat: tripData.origin_lat, lng: tripData.origin_lng };
      const destination = { lat: tripData.destination_lat, lng: tripData.destination_lng };
      
      const route = await routeServiceHybrid.getRoute(origin, destination);
      console.log(`✅ Ruta obtenida: ${route.distance.toFixed(2)} km`);
      
      // Generar paradas cada 3km
      const stopsData = routeServiceHybrid.generateStops(route, 3);
      console.log(`📍 Generadas ${stopsData.length} paradas`);
      
      // Insertar viaje
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .insert({
          ...tripData,
          route_distance: route.distance,
          route_duration: route.duration,
          route_coordinates: route.coordinates
        })
        .select()
        .single();

      if (tripError) {
        console.error('❌ Error creando viaje:', tripError);
        return null;
      }

      console.log(`✅ Viaje creado con ID: ${trip.id}`);

      // Insertar paradas
      const stopsToInsert = stopsData.map((stop, index) => ({
        trip_id: trip.id,
        stop_order: index + 1,
        name: this.getStopName(index + 1, stop.distanceFromOrigin),
        address: this.getStopAddress(index + 1),
        lat: stop.position.lat,
        lng: stop.position.lng,
        distance_from_origin: stop.distanceFromOrigin,
        radius_km: 1.0
      }));

      const { error: stopsError } = await supabase
        .from('trip_stops')
        .insert(stopsToInsert);

      if (stopsError) {
        console.error('❌ Error creando paradas:', stopsError);
        return null;
      }

      console.log(`✅ ${stopsToInsert.length} paradas creadas`);

      return { ...trip, stops: stopsToInsert };

    } catch (error) {
      console.error('❌ Error en createTrip:', error);
      return null;
    }
  }

  /**
   * Busca viajes por ubicación del usuario
   */
  async searchTripsByLocation(
    userLat: number,
    userLng: number,
    radiusKm: number = 1.0,
    dayOfWeek?: number
  ): Promise<SearchMatch[]> {
    try {
      console.log('🔍 Buscando viajes por ubicación...');
      console.log(`📍 Usuario: ${userLat}, ${userLng}`);
      console.log(`📏 Radio: ${radiusKm} km`);

      // Consulta directa a la tabla trips
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('status', 'active')
        .gte('departure_time', new Date().toISOString())
        .limit(50);

      if (error) {
        console.error('❌ Error en búsqueda:', error);
        return [];
      }

      // Filtrar por proximidad (simplificado)
      const nearbyTrips = data?.filter(trip => {
        // Cálculo simple de distancia (aproximado)
        const distance = Math.sqrt(
          Math.pow(trip.origin_lat - userLat, 2) + 
          Math.pow(trip.origin_lng - userLng, 2)
        ) * 111; // Conversión aproximada a km
        
        return distance <= radiusKm;
      }) || [];

      console.log(`✅ Encontrados ${nearbyTrips.length} matches`);
      
      return nearbyTrips.map(trip => ({
        id: trip.id,
        origin: {
          name: trip.origin_name,
          lat: trip.origin_lat,
          lng: trip.origin_lng
        },
        destination: {
          name: trip.destination_name,
          lat: trip.destination_lat,
          lng: trip.destination_lng
        },
        departureTime: trip.departure_time,
        availableSeats: trip.available_seats,
        pricePerSeat: trip.price_per_seat,
        description: trip.description || '',
        status: trip.status
      }));

    } catch (error) {
      console.error('❌ Error en searchTripsByLocation:', error);
      return [];
    }
  }

  /**
   * Obtiene todos los viajes activos
   */
  async getActiveTrips(): Promise<Trip[]> {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          stops:trip_stops(*)
        `)
        .eq('is_active', true)
        .order('departure_time');

      if (error) {
        console.error('❌ Error obteniendo viajes:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error en getActiveTrips:', error);
      return [];
    }
  }

  /**
   * Obtiene un viaje por ID
   */
  async getTripById(id: string): Promise<Trip | null> {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          stops:trip_stops(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Error obteniendo viaje:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Error en getTripById:', error);
      return null;
    }
  }

  /**
   * Actualiza un viaje
   */
  async updateTrip(id: string, updates: Partial<Trip>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('trips')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('❌ Error actualizando viaje:', error);
        return false;
      }

      console.log(`✅ Viaje ${id} actualizado`);
      return true;
    } catch (error) {
      console.error('❌ Error en updateTrip:', error);
      return false;
    }
  }

  /**
   * Elimina un viaje
   */
  async deleteTrip(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error eliminando viaje:', error);
        return false;
      }

      console.log(`✅ Viaje ${id} eliminado`);
      return true;
    } catch (error) {
      console.error('❌ Error en deleteTrip:', error);
      return false;
    }
  }

  /**
   * Crea el viaje Chamartín-Getafe de ejemplo
   */
  async createChamartinGetafeTrip(): Promise<Trip | null> {
    const tripData: Omit<Trip, 'id'> = {
      origin_name: 'Chamartín, Madrid',
      origin_lat: 40.4740,
      origin_lng: -3.6827,
      destination_name: 'Getafe, Madrid',
      destination_lat: 40.3071,
      destination_lng: -3.7332,
      driver_name: 'María García',
      driver_rating: 4.8,
      available_seats: 3,
      departure_time: '08:30',
      price_per_seat: 4.50,
      days_of_week: [1, 2, 3, 4, 5], // Lunes a Viernes
      is_active: true
    };

    return await this.createTrip(tripData);
  }

  /**
   * Obtiene el nombre de la parada basado en su posición
   */
  private getStopName(stopNumber: number, distanceFromOrigin: number): string {
    const stopNames = {
      1: 'Parada A-5 Norte',
      2: 'Parada A-5 Centro',
      3: 'Parada M-30 Norte',
      4: 'Parada M-30 Centro (Cerca C. Adelfas)',
      5: 'Parada M-30 Sur',
      6: 'Parada A-5 Sur',
      7: 'Parada Getafe Norte',
      8: 'Parada Getafe Centro'
    };
    
    return stopNames[stopNumber as keyof typeof stopNames] || `Parada ${stopNumber}`;
  }

  /**
   * Obtiene la dirección aproximada de la parada
   */
  private getStopAddress(stopNumber: number): string {
    const addresses = {
      1: 'A-5, km 8, Madrid',
      2: 'A-5, km 11, Madrid',
      3: 'M-30, km 15, Madrid',
      4: 'M-30, km 18, Madrid (Cerca C. Adelfas)',
      5: 'M-30, km 21, Madrid',
      6: 'A-5, km 24, Madrid',
      7: 'A-5, km 27, Getafe',
      8: 'Calle Mayor, Getafe'
    };
    
    return addresses[stopNumber as keyof typeof addresses] || `Parada ${stopNumber}`;
  }
}

export default new SupabaseTripsService();
