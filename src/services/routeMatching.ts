import type { Route, RouteMatch, Location, Hub } from '@/types/carpooling';

// Servicio para el matching de rutas compatibles
export class RouteMatchingService {
  private hubs: Hub[] = [
    {
      id: 'moncloa',
      name: 'Moncloa',
      coordinates: { lat: 40.4350, lng: -3.7194 },
      facilities: ['parking', 'metro', 'bus'],
      description: 'Intercambiador de Moncloa'
    },
    {
      id: 'plaza-espana',
      name: 'Plaza España',
      coordinates: { lat: 40.4238, lng: -3.7133 },
      facilities: ['parking', 'metro'],
      description: 'Plaza España'
    },
    {
      id: 'nuevos-ministerios',
      name: 'Nuevos Ministerios',
      coordinates: { lat: 40.4466, lng: -3.6908 },
      facilities: ['parking', 'metro'],
      description: 'Nuevos Ministerios'
    }
  ];

  /**
   * Encuentra rutas compatibles para una solicitud de viaje
   */
  findCompatibleRoutes(requestRoute: Route, existingRoutes: Route[]): RouteMatch[] {
    const matches: RouteMatch[] = [];

    for (const existingRoute of existingRoutes) {
      const match = this.calculateRouteCompatibility(requestRoute, existingRoute);
      if (match && match.compatibilityScore >= 60) { // Mínimo 60% de compatibilidad
        matches.push(match);
      }
    }

    // Ordenar por score de compatibilidad
    return matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }

  /**
   * Calcula la compatibilidad entre dos rutas
   */
  private calculateRouteCompatibility(route1: Route, route2: Route): RouteMatch | null {
    // 1. Verificar si comparten origen
    const sharedOrigin = this.areLocationsNearby(route1.origin, route2.origin, 1000); // 1km
    if (!sharedOrigin) return null;

    // 2. Verificar si el destino de route1 está en el camino de route2
    const sharedSegment = this.findSharedSegment(route1, route2);
    if (!sharedSegment) return null;

    // 3. Calcular métricas de compatibilidad
    const sharedDistance = this.calculateSharedDistance(route1, route2, sharedSegment);
    const totalDistance1 = route1.distance;
    const totalDistance2 = route2.distance;
    const maxDeviation = this.calculateMaxDeviation(route1, route2, sharedSegment);

    // 4. Calcular score de compatibilidad
    const compatibilityScore = this.calculateCompatibilityScore(
      sharedDistance,
      totalDistance1,
      totalDistance2,
      maxDeviation
    );

    return {
      id: `match-${route1.id}-${route2.id}`,
      originalRoute: route1,
      compatibleRoute: route2,
      sharedDistance,
      totalDeviation: maxDeviation,
      compatibilityScore,
      sharedSegment,
      estimatedPickupTime: new Date(), // TODO: Calcular basado en tiempo de partida
      estimatedDropoffTime: new Date()  // TODO: Calcular basado en tiempo estimado
    };
  }

  /**
   * Encuentra el segmento compartido entre dos rutas
   */
  private findSharedSegment(route1: Route, route2: Route): Location | null {
    // Si el destino de route1 coincide con un waypoint de route2
    for (const waypoint of route2.waypoints) {
      if (this.areLocationsNearby(route1.destination, waypoint, 500)) {
        return waypoint;
      }
    }

    // Si el destino de route1 está cerca del destino de route2
    if (this.areLocationsNearby(route1.destination, route2.destination, 1000)) {
      return route2.destination;
    }

    // Verificar si hay un hub intermedio
    const hub = this.findIntermediateHub(route1, route2);
    if (hub) return hub;

    return null;
  }

  /**
   * Busca un hub intermedio que conecte ambas rutas
   */
  private findIntermediateHub(route1: Route, route2: Route): Location | null {
    for (const hub of this.hubs) {
      const hubLocation: Location = {
        id: hub.id,
        name: hub.name,
        address: hub.description || hub.name,
        coordinates: hub.coordinates,
        type: 'hub'
      };

      const isOnRoute1 = this.isLocationOnRoute(hubLocation, route1);
      const isOnRoute2 = this.isLocationOnRoute(hubLocation, route2);

      if (isOnRoute1 && isOnRoute2) {
        return hubLocation;
      }
    }
    return null;
  }

  /**
   * Verifica si una ubicación está en una ruta
   */
  private isLocationOnRoute(location: Location, route: Route): boolean {
    // Verificar si está cerca del origen
    if (this.areLocationsNearby(location, route.origin, 1000)) return true;

    // Verificar si está cerca del destino
    if (this.areLocationsNearby(location, route.destination, 1000)) return true;

    // Verificar waypoints
    for (const waypoint of route.waypoints) {
      if (this.areLocationsNearby(location, waypoint, 1000)) return true;
    }

    return false;
  }

  /**
   * Calcula la distancia compartida entre dos rutas
   */
  private calculateSharedDistance(route1: Route, route2: Route, sharedSegment: Location): number {
    // Distancia desde origen hasta el punto compartido
    const distanceToShared = this.calculateDistance(route1.origin.coordinates, sharedSegment.coordinates);
    
    // La distancia compartida es la menor entre ambas rutas hasta el punto compartido
    const route1Distance = distanceToShared;
    const route2Distance = this.calculateDistance(route2.origin.coordinates, sharedSegment.coordinates);
    
    return Math.min(route1Distance, route2Distance);
  }

  /**
   * Calcula la desviación máxima
   */
  private calculateMaxDeviation(route1: Route, route2: Route, sharedSegment: Location): number {
    const route1ToShared = this.calculateDistance(route1.origin.coordinates, sharedSegment.coordinates);
    const route2ToShared = this.calculateDistance(route2.origin.coordinates, sharedSegment.coordinates);
    
    return Math.abs(route1ToShared - route2ToShared);
  }

  /**
   * Calcula el score de compatibilidad (0-100)
   */
  private calculateCompatibilityScore(
    sharedDistance: number,
    totalDistance1: number,
    totalDistance2: number,
    maxDeviation: number
  ): number {
    // Factor de distancia compartida (40% del score)
    const sharedDistanceScore = Math.min((sharedDistance / Math.max(totalDistance1, totalDistance2)) * 100, 100);
    
    // Factor de desviación (30% del score)
    const deviationScore = Math.max(100 - (maxDeviation / 1000) * 10, 0); // Penaliza desviaciones > 1km
    
    // Factor de eficiencia (30% del score)
    const efficiencyScore = Math.min((sharedDistance / (totalDistance1 + totalDistance2 - sharedDistance)) * 100, 100);
    
    return Math.round(
      (sharedDistanceScore * 0.4) + 
      (deviationScore * 0.3) + 
      (efficiencyScore * 0.3)
    );
  }

  /**
   * Verifica si dos ubicaciones están cerca (en metros)
   */
  private areLocationsNearby(location1: Location, location2: Location, maxDistance: number): boolean {
    const distance = this.calculateDistance(location1.coordinates, location2.coordinates);
    return distance <= maxDistance;
  }

  /**
   * Calcula la distancia entre dos coordenadas usando la fórmula de Haversine
   */
  private calculateDistance(coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }): number {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = coord1.lat * Math.PI / 180;
    const φ2 = coord2.lat * Math.PI / 180;
    const Δφ = (coord2.lat - coord1.lat) * Math.PI / 180;
    const Δλ = (coord2.lng - coord1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distancia en metros
  }
}

// Instancia singleton
export const routeMatchingService = new RouteMatchingService();
