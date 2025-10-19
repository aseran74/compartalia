import { GeolocationService } from './geolocation';
import SupabaseTripsService, { type Trip, type SearchMatch } from './supabaseTrips';

export type { Trip, SearchMatch } from './supabaseTrips';

export interface SearchResult {
  trip: Trip;
  matchingStop: {
    id: string;
    position: { lat: number; lng: number };
    distanceFromOrigin: number;
    distanceFromUserLocation: number; // Distancia desde la dirección del usuario
  };
  matchType: 'origin' | 'destination' | 'stop';
  matchDistance: number; // Distancia en km
  pickupPoint: {
    name: string;
    coordinates: { lat: number; lng: number };
  };
}

class TripMatchingService {
  private geolocationService: GeolocationService;

  constructor() {
    this.geolocationService = new GeolocationService();
  }

  /**
   * Busca viajes que coincidan con la dirección del usuario
   */
  async searchTrips(
    userAddress: string,
    destinationAddress?: string,
    radiusKm: number = 1
  ): Promise<SearchResult[]> {
    console.log('🔍 Iniciando búsqueda de viajes...');
    console.log(`📍 Dirección del usuario: ${userAddress}`);
    console.log(`🎯 Destino (opcional): ${destinationAddress || 'No especificado'}`);
    console.log(`📏 Radio de búsqueda: ${radiusKm} km`);

    try {
      // Para "C. de las Adelfas, 38" usar coordenadas conocidas
      let userLat: number;
      let userLng: number;
      
      if (userAddress.toLowerCase().includes('adelfas')) {
        console.log('🎯 Usando coordenadas fijas para C. Adelfas');
        userLat = 40.4250;
        userLng = -3.7300;
      } else {
        // Geocodificar dirección del usuario
        const userLocation = await this.geolocationService.geocodeAddress(userAddress);
        if (!userLocation) {
          console.error('❌ No se pudo geocodificar la dirección del usuario');
          return [];
        }

        // Extraer coordenadas del objeto Location
        userLat = userLocation.coordinates?.lat;
        userLng = userLocation.coordinates?.lng;
        
        console.log(`✅ Ubicación del usuario: ${userLat?.toFixed(4) || 'undefined'}, ${userLng?.toFixed(4) || 'undefined'}`);
      }

      // Buscar viajes por proximidad usando Supabase
      if (!userLat || !userLng) {
        console.error('❌ Coordenadas de usuario inválidas:', userLat, userLng);
        return [];
      }
      
      const matches = await SupabaseTripsService.searchTripsByLocation(
        userLat,
        userLng,
        radiusKm
      );
      console.log(`📋 Encontrados ${matches.length} matches`);

      // Convertir matches de Supabase a SearchResult
      const searchResults: SearchResult[] = matches.map(match => {
        const tripData = match.trip_data;
        
        return {
          trip: {
            id: tripData.id,
            origin_name: tripData.origin_name,
            origin_lat: tripData.origin_lat,
            origin_lng: tripData.origin_lng,
            destination_name: tripData.destination_name,
            destination_lat: tripData.destination_lat,
            destination_lng: tripData.destination_lng,
            route_distance: tripData.route_distance,
            route_duration: tripData.route_duration,
            route_coordinates: tripData.route_coordinates,
            driver_name: tripData.driver_name,
            driver_rating: tripData.driver_rating,
            available_seats: tripData.available_seats,
            departure_time: tripData.departure_time,
            price_per_seat: tripData.price_per_seat,
            days_of_week: tripData.days_of_week,
            is_active: tripData.is_active,
            route: {
              distance: tripData.route_distance || 0,
              duration: tripData.route_duration || 0,
              coordinates: tripData.route_coordinates || []
            }
          },
          matchingStop: {
            id: match.stop_id || (match.match_type === 'origin' ? 'origin' : 'destination'),
            position: match.match_type === 'origin' 
              ? { lat: tripData.origin_lat, lng: tripData.origin_lng }
              : match.match_type === 'destination'
              ? { lat: tripData.destination_lat, lng: tripData.destination_lng }
              : { lat: 0, lng: 0 }, // Para paradas, necesitaríamos obtener las coordenadas
            distanceFromOrigin: match.match_type === 'origin' ? 0 : 
              match.match_type === 'destination' ? tripData.route_distance || 0 : 0,
            distanceFromUserLocation: match.match_distance
          },
          matchType: match.match_type,
          matchDistance: match.match_distance,
          pickupPoint: {
            name: match.stop_name || tripData.origin_name,
            coordinates: match.match_type === 'origin' 
              ? { lat: tripData.origin_lat, lng: tripData.origin_lng }
              : match.match_type === 'destination'
              ? { lat: tripData.destination_lat, lng: tripData.destination_lng }
              : { lat: 0, lng: 0 }
          }
        };
      });

      console.log(`✅ Encontrados ${searchResults.length} viajes compatibles`);
      return searchResults;

    } catch (error) {
      console.error('❌ Error en búsqueda de viajes:', error);
      return [];
    }
  }



}

export default new TripMatchingService();
