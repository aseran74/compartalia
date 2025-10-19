import { GeolocationService } from './geolocation';
import routeServiceHybrid from './routeServiceHybrid';

export interface TripData {
  id: string;
  origin: {
    name: string;
    coordinates: { lat: number; lng: number };
  };
  destination: {
    name: string;
    coordinates: { lat: number; lng: number };
  };
  stops: Array<{
    id: string;
    position: { lat: number; lng: number };
    distanceFromOrigin: number;
    radius: number;
    name?: string;
    address?: string;
  }>;
  route: {
    distance: number;
    duration: number;
    coordinates: Array<{ lat: number; lng: number }>;
  };
  driver: {
    name: string;
    rating: number;
    avatar?: string;
  };
  availableSeats: number;
  departureTime: string;
  price: number;
  daysOfWeek: number[]; // 1=Lunes, 2=Martes, etc.
  isActive: boolean;
}

class TripDataService {
  private geolocationService: GeolocationService;
  private trips: TripData[] = [];

  constructor() {
    this.geolocationService = new GeolocationService();
    this.initializeTrips();
  }

  /**
   * Inicializa los viajes con datos reales
   */
  private async initializeTrips() {
    console.log('🚀 Inicializando datos de viajes...');
    
    try {
      // Viaje Chamartín -> Getafe
      const chamartinGetafeTrip = await this.createChamartinGetafeTrip();
      this.trips.push(chamartinGetafeTrip);
      
      console.log(`✅ ${this.trips.length} viajes inicializados`);
    } catch (error) {
      console.error('❌ Error inicializando viajes:', error);
    }
  }

  /**
   * Crea el viaje Chamartín -> Getafe con paradas reales
   */
  private async createChamartinGetafeTrip(): Promise<TripData> {
    console.log('🗺️ Creando viaje Chamartín -> Getafe...');
    
    // Coordenadas reales
    const origin = { lat: 40.4740, lng: -3.6827 }; // Chamartín
    const destination = { lat: 40.3071, lng: -3.7332 }; // Getafe
    
    // Obtener ruta real
    const route = await routeServiceHybrid.getRoute(origin, destination);
    console.log(`✅ Ruta obtenida: ${route.distance.toFixed(2)} km, ${route.duration} min`);
    
    // Generar paradas cada 3km
    const stopsData = routeServiceHybrid.generateStops(route, 3);
    console.log(`📍 Generadas ${stopsData.length} paradas`);
    
    // Mapear paradas con información adicional
    const stops = stopsData.map((stop, index) => ({
      id: `stop-${index + 1}`,
      position: stop.position,
      distanceFromOrigin: stop.distanceFromOrigin,
      radius: 1.0, // 1km de radio
      name: this.getStopName(index + 1, stop.distanceFromOrigin),
      address: this.getStopAddress(index + 1)
    }));

    return {
      id: 'trip-chamartin-getafe-001',
      origin: {
        name: 'Chamartín, Madrid',
        coordinates: origin
      },
      destination: {
        name: 'Getafe, Madrid',
        coordinates: destination
      },
      stops,
      route: {
        distance: route.distance,
        duration: route.duration,
        coordinates: route.coordinates
      },
      driver: {
        name: 'María García',
        rating: 4.8,
        avatar: '/images/user/user-01.jpg'
      },
      availableSeats: 3,
      departureTime: '08:30',
      price: 4.50,
      daysOfWeek: [1, 2, 3, 4, 5], // Lunes a Viernes
      isActive: true
    };
  }

  /**
   * Obtiene el nombre de la parada basado en su posición
   */
  private getStopName(stopNumber: number, distanceFromOrigin: number): string {
    const stopNames = {
      1: 'Parada A-5 Norte',
      2: 'Parada A-5 Centro',
      3: 'Parada M-30 Norte',
      4: 'Parada M-30 Centro (Cerca C. Adelfas)', // Esta es la clave
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
      4: 'M-30, km 18, Madrid (Cerca C. Adelfas)', // Esta es la clave
      5: 'M-30, km 21, Madrid',
      6: 'A-5, km 24, Madrid',
      7: 'A-5, km 27, Getafe',
      8: 'Calle Mayor, Getafe'
    };
    
    return addresses[stopNumber as keyof typeof addresses] || `Parada ${stopNumber}`;
  }

  /**
   * Obtiene todos los viajes disponibles
   */
  getAvailableTrips(): TripData[] {
    return this.trips.filter(trip => trip.isActive);
  }

  /**
   * Obtiene un viaje por ID
   */
  getTripById(id: string): TripData | null {
    return this.trips.find(trip => trip.id === id) || null;
  }

  /**
   * Obtiene viajes por día de la semana
   */
  getTripsByDay(dayOfWeek: number): TripData[] {
    return this.trips.filter(trip => 
      trip.isActive && trip.daysOfWeek.includes(dayOfWeek)
    );
  }

  /**
   * Añade un nuevo viaje
   */
  addTrip(trip: TripData): void {
    this.trips.push(trip);
    console.log(`✅ Viaje ${trip.id} añadido`);
  }

  /**
   * Actualiza un viaje existente
   */
  updateTrip(id: string, updates: Partial<TripData>): boolean {
    const index = this.trips.findIndex(trip => trip.id === id);
    if (index !== -1) {
      this.trips[index] = { ...this.trips[index], ...updates };
      console.log(`✅ Viaje ${id} actualizado`);
      return true;
    }
    return false;
  }

  /**
   * Elimina un viaje
   */
  removeTrip(id: string): boolean {
    const index = this.trips.findIndex(trip => trip.id === id);
    if (index !== -1) {
      this.trips.splice(index, 1);
      console.log(`✅ Viaje ${id} eliminado`);
      return true;
    }
    return false;
  }

  /**
   * Obtiene estadísticas de viajes
   */
  getTripStats() {
    return {
      totalTrips: this.trips.length,
      activeTrips: this.trips.filter(trip => trip.isActive).length,
      totalStops: this.trips.reduce((sum, trip) => sum + trip.stops.length, 0),
      averagePrice: this.trips.reduce((sum, trip) => sum + trip.price, 0) / this.trips.length
    };
  }
}

export default new TripDataService();
