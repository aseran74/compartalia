/**
 * Servicio para coordinar búsquedas de viajes con lógica de precios prorrateados
 * Maneja la coordinación entre viajes semanales/mensuales y búsquedas por fecha específica
 */

import { supabaseClean } from '@/config/supabaseClean'
import TripPricingService, { type TripSearchContext, type TripPricing } from './tripPricingService'

export interface CoordinatedTripResult {
  trip: any;
  pricing: TripPricing;
  isProrated: boolean;
  originalPrice: number;
  finalPrice: number;
  priceDescription: string;
  daysRemaining: number;
  totalDays: number;
}

export interface TripSearchOptions {
  origin?: string;
  destination?: string;
  searchDate: string;
  maxDistanceKm?: number;
  limit?: number;
}

export class CoordinatedTripService {
  
  /**
   * Busca viajes con coordinación de precios
   */
  static async searchTripsWithPricing(options: TripSearchOptions): Promise<CoordinatedTripResult[]> {
    const { origin, destination, searchDate, maxDistanceKm = 50, limit = 20 } = options;
    
    try {
      console.log('🔍 CoordinatedTripService - Buscando viajes con coordinación de precios:', { 
        origin, destination, searchDate, maxDistanceKm, limit 
      });
      
      // Buscar viajes que coincidan con la fecha
      const trips = await this.findTripsForDate(origin, destination, searchDate, maxDistanceKm, limit);
      
      // Aplicar lógica de coordinación de precios
      const coordinatedResults: CoordinatedTripResult[] = [];
      
      for (const trip of trips) {
        try {
          const pricing = await this.coordinateTripPricing(trip, searchDate);
          const result = this.buildCoordinatedResult(trip, pricing);
          coordinatedResults.push(result);
        } catch (error) {
          console.warn('⚠️ Error coordinando precio para viaje:', trip.id, error);
          // Incluir el viaje con precio original si hay error en coordinación
          const result = this.buildCoordinatedResult(trip, null);
          coordinatedResults.push(result);
        }
      }
      
      console.log(`✅ CoordinatedTripService - Encontrados ${coordinatedResults.length} viajes coordinados`);
      return coordinatedResults;
      
    } catch (error) {
      console.error('❌ Error en CoordinatedTripService:', error);
      return [];
    }
  }
  
  /**
   * Busca viajes que coincidan con la fecha específica
   */
  private static async findTripsForDate(
    origin?: string, 
    destination?: string, 
    searchDate: string, 
    maxDistanceKm: number, 
    limit: number
  ): Promise<any[]> {
    
    const searchDateObj = new Date(searchDate);
    const startOfDay = new Date(searchDateObj.setHours(0, 0, 0, 0));
    const endOfDay = new Date(searchDateObj.setHours(23, 59, 59, 999));
    
    let query = supabaseClean
      .from('trips')
      .select('*')
      .eq('status', 'active')
      .gte('departure_time', startOfDay.toISOString())
      .lte('departure_time', endOfDay.toISOString())
      .limit(limit);
    
    // Aplicar filtros de origen y destino
    if (origin) {
      query = query.ilike('origin_name', `%${origin}%`);
    }
    
    if (destination) {
      query = query.ilike('destination_name', `%${destination}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Error buscando viajes:', error);
      return [];
    }
    
    return data || [];
  }
  
  /**
   * Coordina el precio de un viaje específico
   */
  private static async coordinateTripPricing(trip: any, searchDate: string): Promise<TripPricing | null> {
    try {
      // Determinar el tipo de viaje
      const tripType = this.determineTripType(trip);
      
      if (tripType === 'daily') {
        // Para viajes diarios, no hay coordinación necesaria
        return null;
      }
      
      // Obtener información del período del viaje
      const tripPeriod = await this.getTripPeriod(trip);
      
      if (!tripPeriod) {
        return null;
      }
      
      // Crear contexto para cálculo de precios
      const context: TripSearchContext = {
        tripId: trip.id,
        tripType,
        originalPrice: trip.price_per_seat,
        startDate: tripPeriod.startDate,
        endDate: tripPeriod.endDate,
        searchDate,
        daysOfWeek: tripPeriod.daysOfWeek
      };
      
      // Calcular precio prorrateado
      const pricing = TripPricingService.calculateProratedPrice(context);
      
      // Validar que el precio sea razonable
      if (!TripPricingService.isPriceReasonable(pricing)) {
        console.warn('⚠️ Precio prorrateado no razonable para viaje:', trip.id);
        return null;
      }
      
      return pricing;
      
    } catch (error) {
      console.error('❌ Error coordinando precio:', error);
      return null;
    }
  }
  
  /**
   * Determina el tipo de viaje basado en sus características
   */
  private static determineTripType(trip: any): 'daily' | 'weekly' | 'monthly' {
    // Verificar si tiene campos de viaje semanal/mensual
    if (trip.trip_type) {
      switch (trip.trip_type.toLowerCase()) {
        case 'weekly':
        case 'semanal':
          return 'weekly';
        case 'monthly':
        case 'mensual':
          return 'monthly';
        default:
          return 'daily';
      }
    }
    
    // Verificar si tiene días de la semana específicos
    if (trip.days_of_week && Array.isArray(trip.days_of_week) && trip.days_of_week.length > 1) {
      return 'weekly';
    }
    
    // Verificar si tiene fechas de inicio y fin
    if (trip.start_date && trip.end_date) {
      const start = new Date(trip.start_date);
      const end = new Date(trip.end_date);
      const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays > 30) {
        return 'monthly';
      } else if (diffDays > 7) {
        return 'weekly';
      }
    }
    
    return 'daily';
  }
  
  /**
   * Obtiene el período del viaje desde la base de datos
   */
  private static async getTripPeriod(trip: any): Promise<{
    startDate: string;
    endDate: string;
    daysOfWeek?: number[];
  } | null> {
    try {
      // Buscar información adicional del viaje
      const { data: tripData, error } = await supabaseClean
        .from('trips')
        .select('start_date, end_date, days_of_week, trip_type')
        .eq('id', trip.id)
        .single();
      
      if (error || !tripData) {
        return null;
      }
      
      return {
        startDate: tripData.start_date || trip.departure_time.split('T')[0],
        endDate: tripData.end_date || trip.departure_time.split('T')[0],
        daysOfWeek: tripData.days_of_week || [1, 2, 3, 4, 5]
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo período del viaje:', error);
      return null;
    }
  }
  
  /**
   * Construye el resultado coordinado
   */
  private static buildCoordinatedResult(trip: any, pricing: TripPricing | null): CoordinatedTripResult {
    if (!pricing) {
      // Sin coordinación de precios
      return {
        trip,
        pricing: {
          originalPrice: trip.price_per_seat,
          proratedPrice: trip.price_per_seat,
          tripType: 'daily',
          startDate: trip.departure_time.split('T')[0],
          endDate: trip.departure_time.split('T')[0],
          searchDate: trip.departure_time.split('T')[0],
          daysRemaining: 1,
          totalDays: 1,
          pricePerDay: trip.price_per_seat
        },
        isProrated: false,
        originalPrice: trip.price_per_seat,
        finalPrice: trip.price_per_seat,
        priceDescription: `Precio diario: €${trip.price_per_seat}`,
        daysRemaining: 1,
        totalDays: 1
      };
    }
    
    // Con coordinación de precios
    return {
      trip,
      pricing,
      isProrated: true,
      originalPrice: pricing.originalPrice,
      finalPrice: pricing.proratedPrice,
      priceDescription: TripPricingService.generatePriceDescription(pricing),
      daysRemaining: pricing.daysRemaining,
      totalDays: pricing.totalDays
    };
  }
  
  /**
   * Obtiene estadísticas de coordinación de precios
   */
  static getPricingStats(results: CoordinatedTripResult[]): {
    totalTrips: number;
    proratedTrips: number;
    totalSavings: number;
    averageSavings: number;
  } {
    const totalTrips = results.length;
    const proratedTrips = results.filter(r => r.isProrated).length;
    const totalSavings = results.reduce((sum, r) => sum + (r.originalPrice - r.finalPrice), 0);
    const averageSavings = proratedTrips > 0 ? totalSavings / proratedTrips : 0;
    
    return {
      totalTrips,
      proratedTrips,
      totalSavings: Math.round(totalSavings * 100) / 100,
      averageSavings: Math.round(averageSavings * 100) / 100
    };
  }
}

export default CoordinatedTripService;
