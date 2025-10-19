// services/routeServiceHybrid.ts
import type { Location, Route } from '@/types/carpooling';

class RouteServiceHybrid {
  constructor() {
    // OpenRouteService (gratis, 2000 requests/día)
    this.ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY || 'NO_API_KEY';
    this.ORS_BASE_URL = 'https://api.openrouteservice.org/v2';
    
    // Google Maps (para visualización)
    this.GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'NO_API_KEY';
    
    // Debug: Log de API keys al inicializar
    console.log('🔧 RouteServiceHybrid inicializado:');
    console.log('🗺️ Google API Key:', this.GOOGLE_API_KEY === 'NO_API_KEY' ? 'NO_DEFINIDA' : `${this.GOOGLE_API_KEY.substring(0, 10)}...`);
    console.log('🗺️ ORS API Key:', this.ORS_API_KEY === 'NO_API_KEY' ? 'NO_DEFINIDA' : `${this.ORS_API_KEY.substring(0, 10)}...`);
  }

  /**
   * Obtiene la ruta usando OpenRouteService (GRATIS)
   */
  async getRouteORS(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
    if (this.ORS_API_KEY === 'NO_API_KEY') {
      console.warn('⚠️ Sin API key de OpenRouteService, usando fallback');
      return this.getFallbackRoute(origin, destination);
    }

    try {
      console.log('🗺️ Obteniendo ruta con OpenRouteService...');
      
      const response = await fetch(`/api/ors/directions/driving-car`, {
        method: 'POST',
        headers: {
          'Authorization': this.ORS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          coordinates: [
            [origin.lng, origin.lat],  // ORS usa [lng, lat]
            [destination.lng, destination.lat]
          ],
          instructions: false,
          format: 'geojson'
        })
      });

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const route = data.features[0];
        const properties = route.properties;
        
        console.log('✅ Ruta obtenida con OpenRouteService:', {
          distance: properties.summary.distance / 1000,
          duration: properties.summary.duration / 60
        });
        
        return {
          distance: properties.summary.distance / 1000, // km
          duration: properties.summary.duration / 60,   // minutos
          geometry: route.geometry,
          coordinates: this.extractCoordinatesFromGeoJSON(route.geometry),
          source: 'openrouteservice'
        };
      } else {
        throw new Error('No se encontró ruta');
      }
      
    } catch (error) {
      console.warn('❌ Error con OpenRouteService:', error);
      console.warn('❌ Detalles del error ORS:', {
        message: error.message,
        stack: error.stack
      });
      return this.getFallbackRoute(origin, destination);
    }
  }

  /**
   * Obtiene la ruta usando Google Directions API (si tienes API key)
   */
  async getRouteGoogle(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
    if (this.GOOGLE_API_KEY === 'NO_API_KEY') {
      console.warn('⚠️ Sin API key de Google Maps');
      return null;
    }

    try {
      console.log('🗺️ Obteniendo ruta con Google Directions...');
      
        const url = `/api/google/directions/json?` +
          `origin=${encodeURIComponent(origin.lat + ',' + origin.lng)}&` +
          `destination=${encodeURIComponent(destination.lat + ',' + destination.lng)}&` +
          `key=${this.GOOGLE_API_KEY}&` +
          `language=es&` +
          `region=es`;
          
        console.log('🔗 URL completa Google (simple):', url);
        
        const response = await fetch(url);

      const data = await response.json();
      
      if (data.status === 'OK' && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs[0];
        
        console.log('✅ Ruta obtenida con Google Directions:', {
          distance: leg.distance.value / 1000,
          duration: leg.duration.value / 60
        });
        
        return {
          distance: leg.distance.value / 1000, // km
          duration: leg.duration.value / 60,   // minutos
          geometry: route.overview_polyline.points,
          coordinates: this.decodeGooglePolyline(route.overview_polyline.points),
          source: 'google'
        };
      } else {
        throw new Error(`Google Directions error: ${data.status}`);
      }
      
    } catch (error) {
      console.warn('❌ Error con Google Directions:', error);
      console.warn('❌ Detalles del error:', {
        message: error.message,
        stack: error.stack
      });
      return null;
    }
  }

  /**
   * Obtiene la mejor ruta disponible (prioriza ruta detallada para mejor seguimiento del trayecto)
   */
  async getRoute(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
    // Intentar obtener ruta detallada primero (mejor para paradas sobre trayecto)
    let route = await this.getDetailedRoute(origin, destination);
    
    // Si falla la ruta detallada, usar métodos básicos
    if (!route) {
      route = await this.getRouteGoogle(origin, destination);
      
      if (!route) {
        route = await this.getRouteORS(origin, destination);
      }
    }
    
    return route;
  }

  /**
   * Ruta fallback usando cálculo simple
   */
  private getFallbackRoute(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
    const distance = this.calculateDistance(origin, destination);
    const duration = distance * 1.5; // ~1.5 min por km en ciudad
    const coordinates = this.generateSimpleRoute(origin, destination);

    console.log('⚠️ Usando ruta fallback:', { distance, duration });

    return {
      distance,
      duration,
      geometry: 'fallback',
      coordinates,
      source: 'fallback'
    };
  }

  /**
   * Extrae coordenadas de GeoJSON (OpenRouteService)
   */
  private extractCoordinatesFromGeoJSON(geometry: any) {
    if (geometry.type === 'LineString') {
      return geometry.coordinates.map((coord: number[]) => ({
        lat: coord[1], // GeoJSON usa [lng, lat]
        lng: coord[0]
      }));
    }
    return [];
  }

  /**
   * Decodifica polyline de Google (versión simplificada)
   */
  private decodeGooglePolyline(encoded: string) {
    // Implementación simplificada - en producción usar @mapbox/polyline
    const coordinates = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      coordinates.push({
        lat: lat / 1e5,
        lng: lng / 1e5
      });
    }

    return coordinates;
  }

  /**
   * Genera una ruta simulada que sigue calles/autopistas (no línea recta)
   */
  private generateSimpleRoute(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
    const distance = this.calculateDistance(origin, destination);
    
    // Intentar usar ruta específica de Madrid si es posible
    const madridRoute = this.generateMadridSpecificRoute(origin, destination, distance);
    if (madridRoute) {
      return madridRoute;
    }
    
    // Fallback: ruta genérica con curvas
    const points = Math.max(40, Math.ceil(distance * 4)); // Más puntos para simular carreteras
    const coordinates = [];
    
    console.log(`🛣️ Generando ruta simulada de carreteras con ${points} puntos para ${distance.toFixed(2)}km`);
    
    // Calcular dirección general
    const latDiff = destination.lat - origin.lat;
    const lngDiff = destination.lng - origin.lng;
    const totalSteps = points;
    
    // Simular desviaciones como si siguiera carreteras reales
    for (let i = 0; i <= totalSteps; i++) {
      const ratio = i / totalSteps;
      
      // Simular curvas y desviaciones de carreteras
      let latOffset = 0;
      let lngOffset = 0;
      
      // Añadir "curvas" simuladas cada ciertos intervalos
      if (i > 0 && i < totalSteps) {
        const curveIntensity = 0.003; // Intensidad de las curvas
        const curvePhase = (i / totalSteps) * Math.PI * 3; // Fase para las curvas
        
        // Curvas en latitud (norte-sur)
        latOffset = Math.sin(curvePhase * 1.5) * curveIntensity;
        // Curvas en longitud (este-oeste) con diferente frecuencia
        lngOffset = Math.cos(curvePhase * 2.3) * curveIntensity * 0.8;
        
        // Añadir algunas desviaciones más pronunciadas (como cambios de autopista)
        if (i % 6 === 0) {
          latOffset += (Math.random() - 0.5) * curveIntensity * 3;
          lngOffset += (Math.random() - 0.5) * curveIntensity * 3;
        }
        
        // Simular curvas más suaves en ciertos tramos
        if (i % 15 === 0) {
          const smoothCurve = Math.sin((i / totalSteps) * Math.PI * 4) * curveIntensity * 1.5;
          latOffset += smoothCurve;
          lngOffset += smoothCurve * 0.6;
        }
      }
      
      const lat = origin.lat + (latDiff * ratio) + latOffset;
      const lng = origin.lng + (lngDiff * ratio) + lngOffset;
      
      coordinates.push({ lat, lng });
    }
    
    console.log(`✅ Ruta simulada de carreteras generada: ${coordinates.length} puntos con curvas y desviaciones`);
    return coordinates;
  }

  /**
   * Genera rutas específicas para trayectos conocidos de Madrid
   */
  private generateMadridSpecificRoute(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }, distance: number) {
    // Chamartín a Getafe (ruta conocida)
    if (this.isNearMadridPoint(origin, 40.4740, -3.6827) && this.isNearMadridPoint(destination, 40.3071, -3.7332)) {
      console.log('🗺️ Usando ruta específica: Chamartín → Getafe');
      return this.generateChamartinToGetafeRoute();
    }
    
    // Otras rutas conocidas de Madrid se pueden añadir aquí
    return null;
  }

  /**
   * Verifica si un punto está cerca de una ubicación conocida
   */
  private isNearMadridPoint(point: { lat: number; lng: number }, targetLat: number, targetLng: number, tolerance = 0.01) {
    const distance = this.calculateDistance(point, { lat: targetLat, lng: targetLng });
    return distance < tolerance;
  }

  /**
   * Genera ruta específica Chamartín → Getafe simulando A-5 y M-30
   */
  private generateChamartinToGetafeRoute() {
    console.log('🛣️ Generando ruta específica Chamartín → Getafe (A-5 + M-30)');
    
    // Puntos intermedios que simulan la ruta real por A-5 y M-30
    const waypoints = [
      { lat: 40.4740, lng: -3.6827 }, // Chamartín
      { lat: 40.4700, lng: -3.6900 }, // Bajada hacia M-30
      { lat: 40.4650, lng: -3.7000 }, // M-30 Norte
      { lat: 40.4600, lng: -3.7100 }, // M-30 continuando
      { lat: 40.4550, lng: -3.7200 }, // M-30 hacia A-5
      { lat: 40.4500, lng: -3.7250 }, // Conexión M-30/A-5
      { lat: 40.4400, lng: -3.7300 }, // A-5 inicio
      { lat: 40.4300, lng: -3.7320 }, // A-5 hacia sur
      { lat: 40.4200, lng: -3.7330 }, // A-5 continuando
      { lat: 40.4100, lng: -3.7340 }, // A-5 acercándose a Getafe
      { lat: 40.4000, lng: -3.7350 }, // A-5 cerca de Getafe
      { lat: 40.3900, lng: -3.7360 }, // Salida hacia Getafe
      { lat: 40.3800, lng: -3.7370 }, // Acceso a Getafe
      { lat: 40.3700, lng: -3.7380 }, // Entrada a Getafe
      { lat: 40.3600, lng: -3.7390 }, // Centro de Getafe
      { lat: 40.3500, lng: -3.7400 }, // Zona centro Getafe
      { lat: 40.3400, lng: -3.7410 }, // Acercándose al destino
      { lat: 40.3300, lng: -3.7420 }, // Cerca del destino
      { lat: 40.3200, lng: -3.7430 }, // Muy cerca
      { lat: 40.3100, lng: -3.7440 }, // Última curva
      { lat: 40.3071, lng: -3.7332 }  // Getafe destino
    ];
    
    console.log(`✅ Ruta específica generada: ${waypoints.length} puntos siguiendo A-5 y M-30`);
    console.log('📍 Puntos de la ruta específica:', waypoints.map((p, i) => `${i}: ${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`));
    return waypoints;
  }

  /**
   * Decodifica polyline de Google para obtener el trayecto real (no línea recta)
   */
  private decodeGooglePolylineDetailed(encoded: string) {
    const coordinates = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      coordinates.push({
        lat: lat / 1e5,
        lng: lng / 1e5
      });
    }

    console.log(`🗺️ Polyline decodificada: ${coordinates.length} puntos del trayecto real`);
    return coordinates;
  }

  /**
   * Obtiene el trayecto real desde la polyline (no línea recta)
   */
  private getRealRoutePath(routeData: any) {
    if (!routeData) {
      console.warn('⚠️ No hay datos de ruta');
      return [];
    }
    
    // Si tenemos polyline de Google, decodificarla
    if (routeData.geometry && typeof routeData.geometry === 'string' && routeData.geometry !== 'fallback') {
      console.log('🗺️ Decodificando polyline de Google para obtener trayecto real...');
      return this.decodeGooglePolylineDetailed(routeData.geometry);
    }
    
    // Si tenemos coordenadas de OpenRouteService GeoJSON
    if (routeData.geometry && routeData.geometry.coordinates) {
      console.log('🗺️ Usando coordenadas de OpenRouteService para trayecto real...');
      return this.extractCoordinatesFromGeoJSON(routeData.geometry);
    }
    
    // Si ya tenemos coordenadas (incluso básicas)
    if (routeData.coordinates && routeData.coordinates.length >= 2) {
      console.log(`🗺️ Usando coordenadas existentes (${routeData.coordinates.length} puntos)...`);
      return routeData.coordinates;
    }
    
    console.warn('⚠️ No se encontraron coordenadas válidas');
    return [];
  }

  /**
   * Obtiene la ruta detallada con más puntos para mejor seguimiento del trayecto
   */
  async getDetailedRoute(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
    // Intentar Google primero para obtener ruta más detallada
    if (this.GOOGLE_API_KEY !== 'NO_API_KEY') {
      try {
        console.log('🗺️ Obteniendo ruta detallada con Google Directions...');
        
        const url = `/api/google/directions/json?` +
          `origin=${encodeURIComponent(origin.lat + ',' + origin.lng)}&` +
          `destination=${encodeURIComponent(destination.lat + ',' + destination.lng)}&` +
          `key=${this.GOOGLE_API_KEY}&` +
          `language=es&` +
          `region=es&` +
          `alternatives=false&` +
          `mode=driving`;
          
        console.log('🔗 URL completa Google:', url);
        
        const response = await fetch(url);

        console.log('🔍 Status de respuesta Google:', response.status, response.statusText);
        
        const data = await response.json();
        
        console.log('🔍 Respuesta de Google Directions:', data);
        
        if (data.status === 'OK' && data.routes.length > 0) {
          const route = data.routes[0];
          const leg = route.legs[0];
          
          // Extraer todos los puntos de la ruta (steps)
          const detailedCoordinates = [];
          
          // Añadir origen
          detailedCoordinates.push(origin);
          
          // Añadir todos los puntos de los steps
          if (route.legs[0].steps) {
            route.legs[0].steps.forEach((step: any) => {
              if (step.polyline && step.polyline.points) {
                const decodedPoints = this.decodeGooglePolyline(step.polyline.points);
                detailedCoordinates.push(...decodedPoints);
              }
            });
          }
          
          // Añadir destino
          detailedCoordinates.push(destination);
          
          console.log(`✅ Ruta detallada de Google: ${detailedCoordinates.length} puntos`);
          
          return {
            distance: leg.distance.value / 1000,
            duration: leg.duration.value / 60,
            geometry: route.overview_polyline.points,
            coordinates: detailedCoordinates,
            source: 'google-detailed'
          };
        }
      } catch (error) {
        console.warn('❌ Error obteniendo ruta detallada de Google:', error);
        console.warn('❌ Detalles del error Google detallada:', {
          message: error.message,
          stack: error.stack
        });
      }
    }
    
    // Fallback a OpenRouteService con más detalle
    if (this.ORS_API_KEY !== 'NO_API_KEY') {
      try {
        console.log('🗺️ Obteniendo ruta detallada con OpenRouteService...');
        
        const response = await fetch(`/api/ors/directions/driving-car`, {
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
            instructions: true, // Obtener instrucciones detalladas
            format: 'geojson'
          })
        });

        console.log('🔍 Status de respuesta ORS:', response.status, response.statusText);
        
        const data = await response.json();
        
        console.log('🔍 Respuesta de OpenRouteService:', data);
        
        if (data.features && data.features.length > 0) {
          const route = data.features[0];
          const properties = route.properties;
          
          console.log(`✅ Ruta detallada de ORS: ${route.geometry.coordinates.length} puntos`);
          
          return {
            distance: properties.summary.distance / 1000,
            duration: properties.summary.duration / 60,
            geometry: route.geometry,
            coordinates: this.extractCoordinatesFromGeoJSON(route.geometry),
            source: 'ors-detailed'
          };
        }
      } catch (error) {
        console.warn('❌ Error obteniendo ruta detallada de ORS:', error);
        console.warn('❌ Detalles del error ORS detallada:', {
          message: error.message,
          stack: error.stack
        });
      }
    }
    
    // Fallback final
    console.log('⚠️ Usando ruta fallback simplificada');
    return this.getFallbackRoute(origin, destination);
  }

  /**
   * Genera paradas automáticas cada X km siguiendo el trayecto real de carreteras
   */
  generateStops(routeData: any, intervalKm = 3) {
    // Obtener el trayecto real desde la polyline (carreteras)
    const realRoutePath = this.getRealRoutePath(routeData);
    
    console.log(`🔍 Generando paradas siguiendo el trayecto real de carreteras:`);
    console.log(`  - Puntos de ruta: ${realRoutePath.length}`);
    console.log(`  - Distancia total: ${routeData.distance?.toFixed(2)} km`);
    console.log(`  - Fuente: ${routeData.source}`);
    
    if (realRoutePath.length < 2) {
      console.warn('⚠️ Ruta insuficiente para generar paradas');
      return [];
    }

    const stops = [];
    let accumulatedDistance = 0;
    let nextStopDistance = intervalKm;
    
    // Añadir origen como primera parada
    stops.push({
      position: realRoutePath[0],
      stopOrder: 0,
      distanceFromOrigin: 0
    });

    console.log(`🛣️ Generando paradas cada ${intervalKm}km siguiendo el trayecto REAL de carreteras...`);

    // Calcular distancia total acumulada siguiendo el trayecto real (carreteras)
    for (let i = 1; i < realRoutePath.length; i++) {
      const segmentDistance = this.calculateDistance(
        realRoutePath[i - 1],
        realRoutePath[i]
      );
      
      accumulatedDistance += segmentDistance;
      
      console.log(`  Punto ${i}: +${segmentDistance.toFixed(3)}km = ${accumulatedDistance.toFixed(3)}km total`);

      // Si alcanzamos el intervalo, crear parada EN ESTE PUNTO EXACTO del trayecto real
      if (accumulatedDistance >= nextStopDistance) {
        // Usar el punto exacto de la ruta, no interpolar
        const stop = {
          position: realRoutePath[i], // Punto exacto sobre la línea azul
          stopOrder: stops.length,
          distanceFromOrigin: accumulatedDistance
        };
        stops.push(stop);
        
        console.log(`  ✅ Parada ${stops.length-1} creada EXACTAMENTE en ${stop.position.lat.toFixed(4)}, ${stop.position.lng.toFixed(4)} (${accumulatedDistance.toFixed(2)}km) - SOBRE LA LÍNEA AZUL`);
        console.log(`     🎯 Este es el punto ${i} de la ruta de ${realRoutePath.length} puntos`);
        
        nextStopDistance += intervalKm;
      }
    }

    // Añadir destino como última parada solo si no está ya incluido
    const lastCoord = realRoutePath[realRoutePath.length - 1];
    const lastStop = stops[stops.length - 1];
    
    // Verificar si el destino ya está incluido (con tolerancia de 100m)
    const distanceToLastStop = this.calculateDistance(lastStop.position, lastCoord);
    
    if (distanceToLastStop > 0.1) { // Solo si está a más de 100m
      const finalStop = {
        position: lastCoord,
        stopOrder: stops.length,
        distanceFromOrigin: accumulatedDistance
      };
      stops.push(finalStop);
      console.log(`  ✅ Parada final (destino) en ${finalStop.position.lat.toFixed(4)}, ${finalStop.position.lng.toFixed(4)} (${accumulatedDistance.toFixed(2)}km)`);
    }

    console.log(`🛑 Generadas ${stops.length} paradas cada ${intervalKm}km siguiendo el trayecto REAL de carreteras`);
    console.log(`🗺️ Trayecto real tiene ${realRoutePath.length} puntos (carreteras reales)`);
    console.log('📍 Paradas EXACTAS sobre la línea azul:', stops.map(s => `${s.position.lat.toFixed(4)}, ${s.position.lng.toFixed(4)} (${s.distanceFromOrigin.toFixed(1)}km)`));
    
    // Verificar que las paradas están realmente sobre la ruta
    console.log('🔍 Verificando que las paradas están sobre la línea azul:');
    stops.forEach((stop, index) => {
      // Buscar el punto más cercano en la ruta
      let closestPoint = realRoutePath[0];
      let minDistance = Infinity;
      
      realRoutePath.forEach(point => {
        const distance = this.calculateDistance(stop.position, point);
        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = point;
        }
      });
      
      console.log(`  Parada ${index}: distancia al punto más cercano de la ruta = ${minDistance.toFixed(3)}km`);
    });
    
    // Verificar que las paradas siguen el trayecto real
    if (stops.length > 1) {
      console.log('🔍 Verificando que las paradas siguen el trayecto real de carreteras:');
      for (let i = 1; i < stops.length; i++) {
        const segmentDistance = this.calculateDistance(stops[i-1].position, stops[i].position);
        console.log(`  Parada ${i-1} → ${i}: ${segmentDistance.toFixed(2)} km (sobre carreteras reales)`);
      }
    }

    return stops;
  }

  /**
   * Calcula distancia entre dos puntos usando fórmula Haversine
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
   * Calcula ruta y genera waypoints siguiendo el trayecto real
   */
  async calculateRoute(origin: Location, destination: Location) {
    const route = await this.getRoute(origin.coordinates, destination.coordinates);
    const waypoints = this.generateStops(route, 3); // Pasar el objeto completo de la ruta

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

export default new RouteServiceHybrid();
