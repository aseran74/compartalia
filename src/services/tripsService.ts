import { supabase } from '../config/supabase';

// =====================================================
// TIPOS E INTERFACES
// =====================================================

export type TripType = 'single' | 'weekly' | 'monthly';
export type TripStatus = 'active' | 'completed' | 'cancelled';

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone?: string;
  rating: number;
  created_at?: string;
  updated_at?: string;
}

export interface Vehicle {
  id: string;
  driver_id: string;
  brand: string;
  model: string;
  year?: number;
  color?: string;
  plate_number?: string;
  max_capacity: number;
  features?: any;
  created_at?: string;
  updated_at?: string;
}

export interface Trip {
  id?: string;
  driver_id: string;
  vehicle_id?: string;
  
  // Ubicaciones
  origin_name: string;
  origin_lat: number;
  origin_lng: number;
  destination_name: string;
  destination_lat: number;
  destination_lng: number;
  
  // Tipo y fechas
  trip_type: TripType;
  departure_time: string; // TIMESTAMP para viajes únicos
  start_date?: string; // DATE para viajes recurrentes
  end_date?: string; // DATE para viajes recurrentes
  
  // Horarios por día de la semana (para recurrentes)
  monday_time?: string;
  tuesday_time?: string;
  wednesday_time?: string;
  thursday_time?: string;
  friday_time?: string;
  saturday_time?: string;
  sunday_time?: string;
  
  // Horarios especiales
  special_times?: {
    departure?: Record<string, string>;
    return?: Record<string, string>;
  };
  return_time?: string;
  
  // Plazas y precios
  available_seats: number;
  price_per_seat?: number; // Para viajes únicos
  price_per_day?: number; // Precio por día
  price_per_period?: number; // Precio por semana/mes
  
  // Renovación
  auto_renew?: boolean;
  renewal_notification_sent?: boolean;
  renewal_notification_date?: string;
  
  // Otros
  description?: string;
  status: TripStatus;
  route_data?: any;
  created_at?: string;
  updated_at?: string;
}

export interface TripSearchParams {
  search_date: string;
  origin_lat?: number;
  origin_lng?: number;
  dest_lat?: number;
  dest_lng?: number;
  radius_km?: number;
}

export interface TripGroup {
  zone: string;
  trips: Trip[];
  total_available_seats: number;
  average_price: number;
  time_range: string;
}

// =====================================================
// SERVICIO DE VIAJES UNIFICADO
// =====================================================

class TripsService {
  /**
   * Crea un viaje (único, semanal o mensual)
   */
  async createTrip(tripData: Omit<Trip, 'id' | 'created_at' | 'updated_at'>): Promise<Trip | null> {
    try {
      console.log(`🚗 Creando viaje ${tripData.trip_type}...`);
      
      // Preparar datos según el tipo de viaje
      const dataToInsert: any = {
        driver_id: tripData.driver_id,
        vehicle_id: tripData.vehicle_id,
        origin_name: tripData.origin_name,
        origin_lat: tripData.origin_lat,
        origin_lng: tripData.origin_lng,
        destination_name: tripData.destination_name,
        destination_lat: tripData.destination_lat,
        destination_lng: tripData.destination_lng,
        trip_type: tripData.trip_type,
        available_seats: tripData.available_seats,
        description: tripData.description,
        status: tripData.status || 'active',
        route_data: tripData.route_data || {}
      };

      // Campos específicos según tipo
      if (tripData.trip_type === 'single') {
        // Viaje único
        dataToInsert.departure_time = tripData.departure_time;
        dataToInsert.price_per_seat = tripData.price_per_seat;
        dataToInsert.return_time = tripData.return_time;
      } else {
        // Viajes recurrentes (weekly, monthly)
        dataToInsert.start_date = tripData.start_date;
        dataToInsert.end_date = tripData.end_date;
        dataToInsert.price_per_day = tripData.price_per_day;
        dataToInsert.price_per_period = tripData.price_per_period;
        dataToInsert.auto_renew = tripData.auto_renew || false;
        
        // Horarios por día
        dataToInsert.monday_time = tripData.monday_time;
        dataToInsert.tuesday_time = tripData.tuesday_time;
        dataToInsert.wednesday_time = tripData.wednesday_time;
        dataToInsert.thursday_time = tripData.thursday_time;
        dataToInsert.friday_time = tripData.friday_time;
        dataToInsert.saturday_time = tripData.saturday_time;
        dataToInsert.sunday_time = tripData.sunday_time;
        
        // Horarios especiales
        if (tripData.special_times) {
          dataToInsert.special_times = tripData.special_times;
        }
        
        // Departure time para compatibilidad (usar start_date + primer horario disponible)
        const firstTime = tripData.monday_time || tripData.tuesday_time || 
                         tripData.wednesday_time || tripData.thursday_time || 
                         tripData.friday_time || '08:00:00';
        dataToInsert.departure_time = `${tripData.start_date}T${firstTime}+00:00`;
      }

      const { data: trip, error } = await supabase
        .from('trips')
        .insert(dataToInsert)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando viaje:', error);
        return null;
      }

      console.log(`✅ Viaje ${tripData.trip_type} creado con ID: ${trip.id}`);
      return trip;

    } catch (error) {
      console.error('❌ Error en createTrip:', error);
      return null;
    }
  }

  /**
   * Busca viajes disponibles en una fecha específica
   * Usa la función SQL search_trips_by_date que maneja todos los tipos
   */
  async searchTripsByDate(params: TripSearchParams): Promise<Trip[]> {
    try {
      console.log('🔍 Buscando viajes para fecha:', params.search_date);
      
      const { data, error } = await supabase.rpc('search_trips_by_date', {
        p_search_date: params.search_date,
        p_origin_lat: params.origin_lat || null,
        p_origin_lng: params.origin_lng || null,
        p_dest_lat: params.dest_lat || null,
        p_dest_lng: params.dest_lng || null,
        p_radius_km: params.radius_km || 15
      });

      if (error) {
        console.error('❌ Error buscando viajes:', error);
        return [];
      }

      console.log(`✅ Encontrados ${data?.length || 0} viajes`);
      return data || [];

    } catch (error) {
      console.error('❌ Error en searchTripsByDate:', error);
      return [];
    }
  }

  /**
   * Verifica si un viaje está activo en una fecha específica
   */
  async isTripActiveOnDate(tripId: string, checkDate: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_trip_active_on_date', {
        p_trip_id: tripId,
        p_check_date: checkDate
      });

      if (error) {
        console.error('❌ Error verificando viaje:', error);
        return false;
      }

      return data || false;

    } catch (error) {
      console.error('❌ Error en isTripActiveOnDate:', error);
      return false;
    }
  }

  /**
   * Calcula el precio de un viaje según su tipo
   */
  async calculateTripPrice(tripId: string, tripType: TripType, numDays: number = 1): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('calculate_trip_price', {
        p_trip_id: tripId,
        p_trip_type: tripType,
        p_num_days: numDays
      });

      if (error) {
        console.error('❌ Error calculando precio:', error);
        return 0;
      }

      return data || 0;

    } catch (error) {
      console.error('❌ Error en calculateTripPrice:', error);
      return 0;
    }
  }

  /**
   * Obtiene todos los viajes activos
   */
  async getActiveTrips(tripType?: TripType): Promise<Trip[]> {
    try {
      let query = supabase
        .from('trips')
        .select(`
          *,
          drivers(name, rating),
          vehicles(brand, model)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (tripType) {
        query = query.eq('trip_type', tripType);
      }

      const { data, error } = await query;

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
  async getTripById(tripId: string): Promise<Trip | null> {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          drivers(*),
          vehicles(*)
        `)
        .eq('id', tripId)
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
  async updateTrip(tripId: string, updates: Partial<Trip>): Promise<Trip | null> {
    try {
      console.log(`🔄 Actualizando viaje ${tripId}...`);

      const { data, error } = await supabase
        .from('trips')
        .update(updates)
        .eq('id', tripId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error actualizando viaje:', error);
        return null;
      }

      console.log(`✅ Viaje actualizado: ${tripId}`);
      return data;

    } catch (error) {
      console.error('❌ Error en updateTrip:', error);
      return null;
    }
  }

  /**
   * Renueva un viaje recurrente (extiende end_date)
   */
  async renewTrip(tripId: string, newEndDate: string): Promise<Trip | null> {
    try {
      console.log(`🔄 Renovando viaje ${tripId} hasta ${newEndDate}...`);

      const { data, error } = await supabase
        .from('trips')
        .update({
          end_date: newEndDate,
          renewal_notification_sent: false,
          renewal_notification_date: null
        })
        .eq('id', tripId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error renovando viaje:', error);
        return null;
      }

      console.log(`✅ Viaje renovado hasta: ${newEndDate}`);
      return data;

    } catch (error) {
      console.error('❌ Error en renewTrip:', error);
      return null;
    }
  }

  /**
   * Obtiene viajes que necesitan renovación (próximos a expirar)
   */
  async getTripsNeedingRenewal(driverId?: string): Promise<Trip[]> {
    try {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      const dateStr = sevenDaysFromNow.toISOString().split('T')[0];

      let query = supabase
        .from('trips')
        .select('*')
        .in('trip_type', ['weekly', 'monthly'])
        .not('end_date', 'is', null)
        .lte('end_date', dateStr)
        .eq('status', 'active');

      if (driverId) {
        query = query.eq('driver_id', driverId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error obteniendo viajes para renovar:', error);
        return [];
      }

      return data || [];

    } catch (error) {
      console.error('❌ Error en getTripsNeedingRenewal:', error);
      return [];
    }
  }

  /**
   * Cancela un viaje
   */
  async cancelTrip(tripId: string): Promise<boolean> {
    try {
      console.log(`❌ Cancelando viaje ${tripId}...`);

      const { error } = await supabase
        .from('trips')
        .update({ status: 'cancelled' })
        .eq('id', tripId);

      if (error) {
        console.error('❌ Error cancelando viaje:', error);
        return false;
      }

      console.log(`✅ Viaje cancelado: ${tripId}`);
      return true;

    } catch (error) {
      console.error('❌ Error en cancelTrip:', error);
      return false;
    }
  }

  /**
   * Agrupa viajes por zona geográfica
   */
  groupTripsByZone(trips: Trip[]): TripGroup[] {
    const zoneMap = new Map<string, Trip[]>();

    trips.forEach(trip => {
      const zone = this.getZoneFromLocation(trip.origin_name, trip.origin_lat, trip.origin_lng);
      if (!zoneMap.has(zone)) {
        zoneMap.set(zone, []);
      }
      zoneMap.get(zone)!.push(trip);
    });

    return Array.from(zoneMap.entries()).map(([zone, zoneTrips]) => ({
      zone,
      trips: zoneTrips,
      total_available_seats: zoneTrips.reduce((sum, trip) => sum + trip.available_seats, 0),
      average_price: this.calculateAveragePrice(zoneTrips),
      time_range: this.getTimeRange(zoneTrips)
    }));
  }

  /**
   * Calcula precio promedio de un grupo de viajes
   */
  private calculateAveragePrice(trips: Trip[]): number {
    const prices = trips.map(trip => 
      trip.price_per_period || trip.price_per_day || trip.price_per_seat || 0
    );
    return prices.reduce((sum, price) => sum + price, 0) / prices.length;
  }

  /**
   * Determina la zona geográfica
   */
  private getZoneFromLocation(name: string, lat: number, lng: number): string {
    const lowerName = name.toLowerCase();
    
    const zones: Record<string, string[]> = {
      'Torrejón de Ardoz': ['torrejon', 'torrejón'],
      'Getafe': ['getafe'],
      'Alcorcón': ['alcorcon', 'alcorcón'],
      'Fuenlabrada': ['fuenlabrada'],
      'Rivas-Vaciamadrid': ['rivas', 'vaciamadrid'],
      'Majadahonda': ['majadahonda'],
      'Pozuelo de Alarcón': ['pozuelo'],
      'Leganés': ['leganes', 'leganés'],
      'Móstoles': ['mostoles', 'móstoles'],
      'Boadilla del Monte': ['boadilla'],
      'Las Rozas': ['las rozas']
    };

    for (const [zone, keywords] of Object.entries(zones)) {
      if (keywords.some(keyword => lowerName.includes(keyword))) {
        return zone;
      }
    }
    
    return `Zona ${Math.round(lat * 100) % 10}`;
  }

  /**
   * Calcula rango de horarios
   */
  private getTimeRange(trips: Trip[]): string {
    const times: string[] = [];
    
    trips.forEach(trip => {
      if (trip.monday_time) times.push(trip.monday_time);
      if (trip.tuesday_time) times.push(trip.tuesday_time);
      if (trip.wednesday_time) times.push(trip.wednesday_time);
      if (trip.thursday_time) times.push(trip.thursday_time);
      if (trip.friday_time) times.push(trip.friday_time);
      if (trip.saturday_time) times.push(trip.saturday_time);
      if (trip.sunday_time) times.push(trip.sunday_time);
    });

    if (times.length === 0) return 'Sin horarios';

    const minTime = Math.min(...times.map(time => this.timeToMinutes(time)));
    const maxTime = Math.max(...times.map(time => this.timeToMinutes(time)));
    
    return `${this.minutesToTime(minTime)} - ${this.minutesToTime(maxTime)}`;
  }

  /**
   * Convierte tiempo HH:MM a minutos
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Convierte minutos a tiempo HH:MM
   */
  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Calcula distancia entre dos puntos
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Crea un conductor de ejemplo (para testing)
   */
  async createSampleDriver(): Promise<string> {
    try {
      const { data: existingDriver } = await supabase
        .from('drivers')
        .select('id')
        .eq('email', 'conductor@ejemplo.com')
        .single();

      if (existingDriver) {
        return existingDriver.id;
      }

      const { data: driver, error } = await supabase
        .from('drivers')
        .insert({
          name: 'Conductor Ejemplo',
          email: 'conductor@ejemplo.com',
          phone: '+34 600 000 000',
          rating: 4.5
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando conductor:', error);
        return '';
      }

      return driver.id;
    } catch (error) {
      console.error('❌ Error en createSampleDriver:', error);
      return '';
    }
  }
}

export default new TripsService();


