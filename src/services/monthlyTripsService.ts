import { supabase } from '../config/supabase';

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

export interface MonthlyTrip {
  id?: string;
  driver_id: string;
  vehicle_id?: string;
  origin_name: string;
  origin_lat: number;
  origin_lng: number;
  destination_name: string;
  destination_lat: number;
  destination_lng: number;
  
  // Horarios por día
  monday_time?: string;
  tuesday_time?: string;
  wednesday_time?: string;
  thursday_time?: string;
  friday_time?: string;
  saturday_time?: string;
  sunday_time?: string;
  
  available_seats: number;
  monthly_price: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MonthlyBooking {
  id?: string;
  monthly_trip_id: string;
  passenger_name: string;
  passenger_email: string;
  passenger_phone?: string;
  seats_booked: number;
  total_price: number;
  booking_date: string;
  status: 'active' | 'cancelled' | 'completed';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TripGroup {
  zone: string;
  trips: MonthlyTrip[];
  total_available_seats: number;
  average_price: number;
  time_range: string;
}

class MonthlyTripsService {
  /**
   * Crea un viaje mensual
   */
  async createMonthlyTrip(tripData: Omit<MonthlyTrip, 'id' | 'created_at' | 'updated_at'>): Promise<MonthlyTrip | null> {
    try {
      console.log('🚗 Creando viaje mensual...');
      
      const { data: trip, error } = await supabase
        .from('monthly_trips')
        .insert({
          ...tripData,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando viaje mensual:', error);
        return null;
      }

      console.log(`✅ Viaje mensual creado con ID: ${trip.id}`);
      return trip;

    } catch (error) {
      console.error('❌ Error en createMonthlyTrip:', error);
      return null;
    }
  }

  /**
   * Busca viajes mensuales agrupados por zona
   */
  async searchMonthlyTripsByZone(
    userLat: number,
    userLng: number,
    radiusKm: number = 15
  ): Promise<TripGroup[]> {
    try {
      console.log('🔍 Buscando viajes mensuales por zona...');
      
      // Buscar viajes activos
      const { data: trips, error } = await supabase
        .from('monthly_trips')
        .select(`
          *,
          drivers(name, rating),
          vehicles(brand, model, max_capacity)
        `)
        .eq('is_active', true)
        .gte('start_date', new Date().toISOString().split('T')[0]);

      if (error) {
        console.error('❌ Error buscando viajes:', error);
        return [];
      }

      if (!trips || trips.length === 0) {
        console.log('📭 No se encontraron viajes');
        return [];
      }

      // Filtrar por proximidad geográfica
      const nearbyTrips = trips.filter(trip => {
        const distance = this.calculateDistance(userLat, userLng, trip.origin_lat, trip.origin_lng);
        return distance <= radiusKm;
      });

      // Agrupar por zona
      const tripGroups = this.groupTripsByZone(nearbyTrips);

      console.log(`✅ Encontrados ${tripGroups.length} grupos de viajes`);
      return tripGroups;

    } catch (error) {
      console.error('❌ Error en searchMonthlyTripsByZone:', error);
      return [];
    }
  }

  /**
   * Agrupa viajes por zona geográfica
   */
  private groupTripsByZone(trips: any[]): TripGroup[] {
    const zoneMap = new Map<string, any[]>();

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
      average_price: zoneTrips.reduce((sum, trip) => sum + trip.monthly_price, 0) / zoneTrips.length,
      time_range: this.getTimeRange(zoneTrips)
    }));
  }

  /**
   * Determina la zona geográfica basada en la ubicación
   */
  private getZoneFromLocation(name: string, lat: number, lng: number): string {
    if (name.toLowerCase().includes('torrejon') || name.toLowerCase().includes('torrejón')) {
      return 'Torrejón de Ardoz';
    }
    if (name.toLowerCase().includes('getafe')) {
      return 'Getafe';
    }
    if (name.toLowerCase().includes('alcorcon') || name.toLowerCase().includes('alcorcón')) {
      return 'Alcorcón';
    }
    if (name.toLowerCase().includes('fuenlabrada')) {
      return 'Fuenlabrada';
    }
    if (name.toLowerCase().includes('rivas') || name.toLowerCase().includes('vaciamadrid')) {
      return 'Rivas-Vaciamadrid';
    }
    if (name.toLowerCase().includes('majadahonda')) {
      return 'Majadahonda';
    }
    if (name.toLowerCase().includes('pozuelo')) {
      return 'Pozuelo de Alarcón';
    }
    if (name.toLowerCase().includes('leganes') || name.toLowerCase().includes('leganés')) {
      return 'Leganés';
    }
    if (name.toLowerCase().includes('mostoles') || name.toLowerCase().includes('móstoles')) {
      return 'Móstoles';
    }
    if (name.toLowerCase().includes('boadilla')) {
      return 'Boadilla del Monte';
    }
    if (name.toLowerCase().includes('las rozas')) {
      return 'Las Rozas';
    }
    
    return 'Zona Sur' + Math.round(lat * 100) % 10;
  }

  /**
   * Calcula el rango de horarios de un grupo de viajes
   */
  private getTimeRange(trips: MonthlyTrip[]): string {
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
   * Calcula distancia entre dos puntos geográficos
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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
   * Obtiene todos los viajes mensuales activos
   */
  async getActiveMonthlyTrips(): Promise<MonthlyTrip[]> {
    try {
      const { data, error } = await supabase
        .from('monthly_trips')
        .select(`
          *,
          drivers(name, rating),
          vehicles(brand, model)
        `)
        .eq('is_active', true)
        .order('start_date');

      if (error) {
        console.error('❌ Error obteniendo viajes mensuales:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error en getActiveMonthlyTrips:', error);
      return [];
    }
  }

  /**
   * Crea un conductor de ejemplo
   */
  async createSampleDriver(): Promise<string> {
    try {
      const { data: existingDriver } = await supabase
        .from('drivers')
        .select('id')
        .eq('email', 'conductor@ejemplo.com')
        .single()

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

export default new MonthlyTripsService();