/**
 * Servicio para manejar la lógica de precios de viajes semanales y mensuales
 * Coordina precios cuando alguien busca un día específico dentro de un período
 */

export interface TripPricing {
  originalPrice: number;
  proratedPrice: number;
  tripType: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  searchDate: string;
  daysRemaining: number;
  totalDays: number;
  pricePerDay: number;
}

export interface TripSearchContext {
  tripId: string;
  tripType: 'daily' | 'weekly' | 'monthly';
  originalPrice: number;
  startDate: string;
  endDate: string;
  searchDate: string;
  daysOfWeek?: number[];
}

export class TripPricingService {
  
  /**
   * Calcula el precio prorrateado para un viaje basado en la fecha de búsqueda
   */
  static calculateProratedPrice(context: TripSearchContext): TripPricing {
    const { tripType, originalPrice, startDate, endDate, searchDate } = context;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const search = new Date(searchDate);
    
    // Validar que la fecha de búsqueda esté dentro del rango
    if (search < start || search > end) {
      throw new Error('La fecha de búsqueda está fuera del rango del viaje');
    }
    
    switch (tripType) {
      case 'weekly':
        return this.calculateWeeklyPricing(context);
      case 'monthly':
        return this.calculateMonthlyPricing(context);
      case 'daily':
      default:
        return this.calculateDailyPricing(context);
    }
  }
  
  /**
   * Calcula precios para viajes semanales
   */
  private static calculateWeeklyPricing(context: TripSearchContext): TripPricing {
    const { originalPrice, startDate, endDate, searchDate, daysOfWeek } = context;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const search = new Date(searchDate);
    
    // Calcular días laborables restantes desde la fecha de búsqueda
    const daysRemaining = this.calculateWorkingDaysRemaining(search, end, daysOfWeek);
    const totalWorkingDays = this.calculateWorkingDaysRemaining(start, end, daysOfWeek);
    
    // Precio por día laborable
    const pricePerDay = originalPrice / totalWorkingDays;
    const proratedPrice = Math.round(pricePerDay * daysRemaining * 100) / 100;
    
    return {
      originalPrice,
      proratedPrice,
      tripType: 'weekly',
      startDate,
      endDate,
      searchDate,
      daysRemaining,
      totalDays: totalWorkingDays,
      pricePerDay: Math.round(pricePerDay * 100) / 100
    };
  }
  
  /**
   * Calcula precios para viajes mensuales
   */
  private static calculateMonthlyPricing(context: TripSearchContext): TripPricing {
    const { originalPrice, startDate, endDate, searchDate } = context;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const search = new Date(searchDate);
    
    // Calcular días restantes desde la fecha de búsqueda
    const daysRemaining = Math.ceil((end.getTime() - search.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Precio por día
    const pricePerDay = originalPrice / totalDays;
    const proratedPrice = Math.round(pricePerDay * daysRemaining * 100) / 100;
    
    return {
      originalPrice,
      proratedPrice,
      tripType: 'monthly',
      startDate,
      endDate,
      searchDate,
      daysRemaining,
      totalDays,
      pricePerDay: Math.round(pricePerDay * 100) / 100
    };
  }
  
  /**
   * Calcula precios para viajes diarios (sin prorrateo)
   */
  private static calculateDailyPricing(context: TripSearchContext): TripPricing {
    const { originalPrice, startDate, endDate, searchDate } = context;
    
    return {
      originalPrice,
      proratedPrice: originalPrice,
      tripType: 'daily',
      startDate,
      endDate,
      searchDate,
      daysRemaining: 1,
      totalDays: 1,
      pricePerDay: originalPrice
    };
  }
  
  /**
   * Calcula días laborables restantes entre dos fechas
   */
  private static calculateWorkingDaysRemaining(
    startDate: Date, 
    endDate: Date, 
    daysOfWeek: number[] = [1, 2, 3, 4, 5] // Lunes a viernes por defecto
  ): number {
    let count = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay(); // 0 = Domingo, 1 = Lunes, etc.
      const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek; // Convertir domingo de 0 a 7
      
      if (daysOfWeek.includes(adjustedDay)) {
        count++;
      }
      
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  }
  
  /**
   * Determina si un viaje es aplicable para una fecha específica
   */
  static isTripApplicableForDate(
    tripType: 'daily' | 'weekly' | 'monthly',
    startDate: string,
    endDate: string,
    searchDate: string,
    daysOfWeek?: number[]
  ): boolean {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const search = new Date(searchDate);
    
    // Verificar que la fecha esté dentro del rango
    if (search < start || search > end) {
      return false;
    }
    
    // Para viajes semanales, verificar que el día de la semana coincida
    if (tripType === 'weekly' && daysOfWeek) {
      const dayOfWeek = search.getDay();
      const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
      return daysOfWeek.includes(adjustedDay);
    }
    
    return true;
  }
  
  /**
   * Genera descripción del precio para mostrar al usuario
   */
  static generatePriceDescription(pricing: TripPricing): string {
    const { tripType, originalPrice, proratedPrice, daysRemaining, totalDays, pricePerDay } = pricing;
    
    switch (tripType) {
      case 'weekly':
        return `Precio semanal: €${originalPrice} → Prorrateado: €${proratedPrice} (${daysRemaining}/${totalDays} días laborables restantes)`;
      case 'monthly':
        return `Precio mensual: €${originalPrice} → Prorrateado: €${proratedPrice} (${daysRemaining}/${totalDays} días restantes)`;
      case 'daily':
      default:
        return `Precio diario: €${originalPrice}`;
    }
  }
  
  /**
   * Calcula el precio final que debe pagar el usuario
   */
  static getFinalPrice(pricing: TripPricing): number {
    return pricing.proratedPrice;
  }
  
  /**
   * Valida si el precio prorrateado es razonable
   */
  static isPriceReasonable(pricing: TripPricing): boolean {
    const { originalPrice, proratedPrice, daysRemaining, totalDays } = pricing;
    
    // El precio prorrateado no debe ser mayor al original
    if (proratedPrice > originalPrice) {
      return false;
    }
    
    // El precio prorrateado debe ser proporcional a los días restantes
    const expectedRatio = daysRemaining / totalDays;
    const actualRatio = proratedPrice / originalPrice;
    
    // Permitir una diferencia del 10% por redondeos
    return Math.abs(expectedRatio - actualRatio) <= 0.1;
  }
}

export default TripPricingService;
