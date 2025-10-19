// services/routeService.ts
import type { Location, Route } from '@/types/carpooling';

class RouteService {
  constructor() {
    // Usar OpenRouteService (gratis, 2000 requests/día)
    // Por ahora usamos fallback sin API key
    this.ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY || 'NO_API_KEY';
    this.baseUrl = 'https://api.openrouteservice.org/v2';
  }

  /**
   * Obtiene la ruta entre dos puntos
   * @param origin - {lat, lng}
   * @param destination - {lat, lng}
   */
  async getRoute(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
    // Si no hay API key, usar fallback simple
    if (this.ORS_API_KEY === 'NO_API_KEY') {
      return this.getFallbackRoute(origin, destination);
    }

    try {
      const url = `${this.baseUrl}/directions/driving-car`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': this.ORS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          coordinates: [
            [origin.lng, origin.lat],
            [destination.lng, destination.lat]
          ],
          instructions: false
        })
      });

      const data = await response.json();
      const route = data.routes[0];
      
      return {
        distance: route.summary.distance / 1000, // Convertir a km
        duration: route.summary.duration / 60, // Convertir a minutos
        geometry: route.geometry, // Polyline codificada
        coordinates: this.decodePolyline(route.geometry)
      };
    } catch (error) {
      console.warn('Error con OpenRouteService, usando fallback:', error);
      return this.getFallbackRoute(origin, destination);
    }
  }

  /**
   * Ruta fallback usando cálculo simple
   */
  private getFallbackRoute(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
    const distance = this.calculateDistance(origin, destination);
    const duration = distance * 1.5; // ~1.5 min por km en ciudad
    const coordinates = this.generateSimpleRoute(origin, destination);

    return {
      distance,
      duration,
      geometry: 'fallback', // Polyline simple
      coordinates
    };
  }

  /**
   * Genera una ruta simple entre dos puntos
   */
  private generateSimpleRoute(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
    const points = 10;
    const coordinates = [];
    
    for (let i = 0; i <= points; i++) {
      const ratio = i / points;
      coordinates.push({
        lat: origin.lat + (destination.lat - origin.lat) * ratio,
        lng: origin.lng + (destination.lng - origin.lng) * ratio
      });
    }
    
    return coordinates;
  }

  /**
   * Decodifica polyline a coordenadas (simplificado para fallback)
   */
  private decodePolyline(encoded: string) {
    // Implementación simplificada - en producción usar librería como @mapbox/polyline
    return this.generateSimpleRoute({ lat: 0, lng: 0 }, { lat: 0, lng: 0 });
  }

  /**
   * Genera paradas automáticas cada X km a lo largo de la ruta
   * @param coordinates - Array de {lat, lng}
   * @param intervalKm - Intervalo en km (default: 3)
   */
  generateStops(coordinates: { lat: number; lng: number }[], intervalKm = 3) {
    const stops = [];
    let accumulatedDistance = 0;
    let nextStopDistance = intervalKm;
    
    // Añadir origen como primera parada
    stops.push({
      position: coordinates[0],
      stopOrder: 0,
      distanceFromOrigin: 0
    });

    for (let i = 1; i < coordinates.length; i++) {
      const segmentDistance = this.calculateDistance(
        coordinates[i - 1],
        coordinates[i]
      );
      
      accumulatedDistance += segmentDistance;

      // Si alcanzamos el intervalo, crear parada
      if (accumulatedDistance >= nextStopDistance) {
        stops.push({
          position: coordinates[i],
          stopOrder: stops.length,
          distanceFromOrigin: accumulatedDistance
        });
        nextStopDistance += intervalKm;
      }
    }

    // Añadir destino como última parada
    const lastCoord = coordinates[coordinates.length - 1];
    if (stops[stops.length - 1].position !== lastCoord) {
      stops.push({
        position: lastCoord,
        stopOrder: stops.length,
        distanceFromOrigin: accumulatedDistance
      });
    }

    return stops;
  }

  /**
   * Calcula distancia entre dos puntos usando fórmula Haversine
   * @returns Distancia en km
   */
  calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(point2.lat - point1.lat);
    const dLng = this.toRad(point2.lng - point1.lng);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(point1.lat)) * 
      Math.cos(this.toRad(point2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Encuentra matches: paradas cercanas a la ubicación del usuario
   * @param userLocation - {lat, lng}
   * @param stops - Array de paradas
   * @param maxDistance - Distancia máxima en km (default: 1)
   */
  findNearbyStops(
    userLocation: { lat: number; lng: number }, 
    stops: Array<{ position: { lat: number; lng: number }; stopOrder: number; distanceFromOrigin: number }>, 
    maxDistance = 1
  ) {
    return stops
      .map(stop => ({
        ...stop,
        distance: this.calculateDistance(userLocation, stop.position)
      }))
      .filter(stop => stop.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);
  }

  /**
   * Busca viajes compatibles para un pasajero
   * @param userPickup - Ubicación de recogida {lat, lng}
   * @param userDropoff - Ubicación de bajada {lat, lng}
   * @param trips - Array de viajes con sus paradas
   */
  async findMatchingTrips(
    userPickup: { lat: number; lng: number },
    userDropoff: { lat: number; lng: number },
    trips: any[]
  ) {
    const matches = [];

    for (const trip of trips) {
      // Crear paradas simuladas si no existen
      const stops = trip.stops || this.generateStops(this.generateSimpleRoute(trip.origin, trip.destination), 3);
      
      const pickupStops = this.findNearbyStops(userPickup, stops, 1);
      const dropoffStops = this.findNearbyStops(userDropoff, stops, 1);

      // Verificar que pickup esté antes que dropoff en la ruta
      for (const pickup of pickupStops) {
        for (const dropoff of dropoffStops) {
          if (pickup.stopOrder < dropoff.stopOrder) {
            matches.push({
              trip,
              pickupStop: pickup,
              dropoffStop: dropoff,
              pickupDistance: pickup.distance,
              dropoffDistance: dropoff.distance,
              matchScore: this.calculateMatchScore(pickup, dropoff)
            });
          }
        }
      }
    }

    // Ordenar por mejor match (menor distancia total)
    return matches.sort((a, b) => a.matchScore - b.matchScore);
  }

  /**
   * Calcula score de match (menor es mejor)
   */
  private calculateMatchScore(pickupStop: any, dropoffStop: any) {
    return pickupStop.distance + dropoffStop.distance;
  }

  /**
   * Calcula ruta y genera waypoints (para compatibilidad con código existente)
   */
  async calculateRoute(origin: Location, destination: Location) {
    const route = await this.getRoute(origin.coordinates, destination.coordinates);
    const waypoints = this.generateStops(route.coordinates, 3);

    return {
      ...route,
      waypoints: waypoints.map(wp => ({
        lat: wp.position.lat,
        lng: wp.position.lng,
        order: wp.stopOrder
      })),
      polyline: route.geometry
    };
  }
}

export default new RouteService();