// Parche para reemplazar funciones RPC problemáticas con consultas directas
import { supabase } from '@/config/supabase'

export const rpcPatch = {
  // Reemplazo para find_nearby_trips
  async findNearbyTrips(userLat: number, userLng: number, radiusKm: number) {
    try {
      console.log('🔍 findNearbyTrips - Buscando viajes cercanos...');
      
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('status', 'active')
        .gte('departure_time', new Date().toISOString())
        .limit(50);

      if (error) {
        console.error('❌ Error in findNearbyTrips:', error);
        return [];
      }

      console.log(`✅ findNearbyTrips - Encontrados ${data?.length || 0} viajes`);

      // Filtrar por proximidad
      const nearbyTrips = data?.filter(trip => {
        const distance = Math.sqrt(
          Math.pow(parseFloat(trip.origin_lat) - userLat, 2) + 
          Math.pow(parseFloat(trip.origin_lng) - userLng, 2)
        ) * 111; // Conversión aproximada a km
        
        return distance <= radiusKm;
      }) || [];

      console.log(`✅ findNearbyTrips - ${nearbyTrips.length} viajes cercanos`);
      return nearbyTrips;
    } catch (error) {
      console.error('❌ Error in findNearbyTrips:', error);
      return [];
    }
  },

  // Reemplazo para search_compatible_trips
  async searchCompatibleTrips(params: any) {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('status', 'active')
        .gte('departure_time', new Date().toISOString())
        .limit(50);

      if (error) {
        console.error('Error in searchCompatibleTrips:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchCompatibleTrips:', error);
      return [];
    }
  },

  // Reemplazo para find_compatible_routes
  async findCompatibleRoutes(params: any) {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('status', 'active')
        .gte('departure_time', new Date().toISOString())
        .limit(20);

      if (error) {
        console.error('Error in findCompatibleRoutes:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in findCompatibleRoutes:', error);
      return [];
    }
  },

  // Reemplazo para search_trips_by_proximity
  async searchTripsByProximity(params: any) {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('status', 'active')
        .gte('departure_time', new Date().toISOString())
        .limit(50);

      if (error) {
        console.error('Error in searchTripsByProximity:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchTripsByProximity:', error);
      return [];
    }
  },

  // Reemplazo para search_compatible_routes
  async searchCompatibleRoutes(params: any) {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('status', 'active')
        .gte('departure_time', new Date().toISOString())
        .limit(20);

      if (error) {
        console.error('Error in searchCompatibleRoutes:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchCompatibleRoutes:', error);
      return [];
    }
  }
};

// Interceptar llamadas RPC problemáticas
export const interceptRPC = () => {
  const originalRpc = supabase.rpc;
  
  supabase.rpc = (fn: string, args?: any) => {
    console.log(`🔄 Interceptando RPC: ${fn}`);
    
    switch (fn) {
      case 'find_nearby_trips':
        return rpcPatch.findNearbyTrips(args.user_lat, args.user_lng, args.radius_km);
      case 'search_compatible_trips':
        return rpcPatch.searchCompatibleTrips(args);
      case 'find_compatible_routes':
        return rpcPatch.findCompatibleRoutes(args);
      case 'search_trips_by_proximity':
        return rpcPatch.searchTripsByProximity(args);
      case 'search_compatible_routes':
        return rpcPatch.searchCompatibleRoutes(args);
      default:
        console.warn(`⚠️ RPC no interceptada: ${fn}`);
        return originalRpc.call(supabase, fn, args);
    }
  };
};
