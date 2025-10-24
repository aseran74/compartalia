// Servicio para usar la nueva Routes API de Google
import { supabaseClean } from '@/config/supabaseClean'

// 🛑 ¡IMPORTANTE!
// Pon tu API Key aquí. Lo ideal es que la cargues desde un archivo .env
// y no la dejes "quemada" en el código.
const API_KEY = 'AIzaSyBv-Flleyr8I0gqrG2VVU04EWyJuDODYj8'
const ROUTES_API_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes'

export interface Coords {
  lat: number
  lng: number
}

export interface RouteInfo {
  distance: number // Distancia en metros
  duration: string // Duración en segundos (ej: "1200s")
  polyline?: string // Polylínea para dibujar en el mapa
}

export class RoutesApiService {
  
  // -----------------------------------------------------------------
  // ✅ FUNCIÓN PARA CALCULAR LA RUTA (LA NUEVA FORMA)
  // -----------------------------------------------------------------
  // Esta función REEMPLAZA al antiguo `new google.maps.DirectionsService()`
  async calculateRoute(origin: Coords, destination: Coords): Promise<RouteInfo> {
    
    console.log('🛣️ Calculando ruta con Routes API...', { origin, destination })

    try {
      const response = await fetch(ROUTES_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          // Pedimos distancia, duración y polylínea
          'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline' 
        },
        body: JSON.stringify({
          origin: {
            location: {
              latLng: {
                latitude: origin.lat,
                longitude: origin.lng
              }
            }
          },
          destination: {
            location: {
              latLng: {
                latitude: destination.lat,
                longitude: destination.lng
              }
            }
          },
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE_OPTIMAL'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Error de Routes API:', errorData)
        
        // Si la API Key es incorrecta o la API no está habilitada,
        // el error (REQUEST_DENIED) ahora se mostrará aquí.
        throw new Error(errorData.error?.message || 'Error al calcular la ruta')
      }

      const data = await response.json()
      console.log('✅ Respuesta de Routes API:', data)

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0]
        // Devolvemos la información de la primera ruta encontrada
        return {
          distance: route.distanceMeters, // Distancia en metros
          duration: route.duration, // Duración en segundos (ej: "1200s")
          polyline: route.polyline?.encodedPolyline // Polylínea para dibujar
        }
      }
      
      throw new Error('No se encontró una ruta válida.')
    } catch (error) {
      console.error('❌ Error en calculateRoute:', error)
      throw error
    }
  }

  // -----------------------------------------------------------------
  // ✅ FUNCIÓN PARA DIBUJAR LA RUTA EN EL MAPA
  // -----------------------------------------------------------------
  drawRouteOnMap(map: any, origin: Coords, destination: Coords, polyline?: string) {
    console.log('🗺️ Dibujando ruta en el mapa...', { origin, destination, polyline })

    try {
      // Si tenemos polylínea de la API, la usamos
      if (polyline) {
        const decodedPath = this.decodePolyline(polyline)
        const routePolyline = new window.google.maps.Polyline({
          path: decodedPath,
          map: map,
          strokeColor: '#3B82F6',
          strokeOpacity: 0.8,
          strokeWeight: 4
        })
        return routePolyline
      } else {
        // Fallback a línea recta
        const fallbackPolyline = new window.google.maps.Polyline({
          path: [
            { lat: origin.lat, lng: origin.lng },
            { lat: destination.lat, lng: destination.lng }
          ],
          map: map,
          strokeColor: '#3B82F6',
          strokeOpacity: 0.8,
          strokeWeight: 4
        })
        return fallbackPolyline
      }
    } catch (error) {
      console.error('❌ Error dibujando ruta:', error)
      // Fallback a línea recta
      const fallbackPolyline = new window.google.maps.Polyline({
        path: [
          { lat: origin.lat, lng: origin.lng },
          { lat: destination.lat, lng: destination.lng }
        ],
        map: map,
        strokeColor: '#3B82F6',
        strokeOpacity: 0.8,
        strokeWeight: 4
      })
      return fallbackPolyline
    }
  }

  // -----------------------------------------------------------------
  // ✅ FUNCIÓN PARA DECODIFICAR POLYLÍNEA
  // -----------------------------------------------------------------
  private decodePolyline(encoded: string): google.maps.LatLngLiteral[] {
    const poly = []
    let index = 0
    const len = encoded.length
    let lat = 0
    let lng = 0

    while (index < len) {
      let b, shift = 0, result = 0
      do {
        b = encoded.charCodeAt(index++) - 63
        result |= (b & 0x1f) << shift
        shift += 5
      } while (b >= 0x20)
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1))
      lat += dlat

      shift = 0
      result = 0
      do {
        b = encoded.charCodeAt(index++) - 63
        result |= (b & 0x1f) << shift
        shift += 5
      } while (b >= 0x20)
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1))
      lng += dlng

      poly.push({ lat: lat / 1e5, lng: lng / 1e5 })
    }

    return poly
  }

  // -----------------------------------------------------------------
  // ✅ FUNCIÓN PARA BUSCAR VIAJES CON RUTA
  // -----------------------------------------------------------------
  async searchTripsWithRoute(origin: string, destination: string, date?: string) {
    console.log('🔍 Buscando viajes con ruta...', { origin, destination, date })

    try {
      // 1. Geocodificar origen y destino
      const originCoords = await this.geocodeAddress(origin)
      const destinationCoords = await this.geocodeAddress(destination)

      if (!originCoords || !destinationCoords) {
        throw new Error('No se pudieron encontrar las coordenadas para el origen o destino.')
      }

      console.log('📍 Coordenadas obtenidas:', { originCoords, destinationCoords })

      // 2. Calcular la ruta
      const routeInfo = await this.calculateRoute(originCoords, destinationCoords)
      console.log('🛣️ Ruta calculada:', routeInfo)

      // 3. Buscar viajes en Supabase
      const trips = await this.searchTripsInDatabase(originCoords, destinationCoords, date)

      return {
        trips,
        routeInfo,
        originCoords,
        destinationCoords
      }
    } catch (error) {
      console.error('❌ Error en searchTripsWithRoute:', error)
      throw error
    }
  }

  // -----------------------------------------------------------------
  // ✅ FUNCIÓN PARA GEOCODIFICAR DIRECCIONES
  // -----------------------------------------------------------------
  private async geocodeAddress(address: string): Promise<Coords | null> {
    try {
      // Usar Google Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`
      )
      
      const data = await response.json()
      
      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location
        return {
          lat: location.lat,
          lng: location.lng
        }
      }
      
      return null
    } catch (error) {
      console.error('❌ Error geocodificando:', error)
      return null
    }
  }

  // -----------------------------------------------------------------
  // ✅ FUNCIÓN PARA BUSCAR VIAJES EN LA BASE DE DATOS
  // -----------------------------------------------------------------
  private async searchTripsInDatabase(originCoords: Coords, destinationCoords: Coords, date?: string) {
    try {
      let query = supabaseClean
        .from('trips')
        .select(`
          *,
          profiles:driver_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .gte('departure_time', new Date().toISOString())

      // Filtrar por fecha si se proporciona
      if (date) {
        const startDate = new Date(date)
        const endDate = new Date(date)
        endDate.setDate(endDate.getDate() + 1)
        
        query = query
          .gte('departure_time', startDate.toISOString())
          .lt('departure_time', endDate.toISOString())
      }

      const { data: trips, error } = await query

      if (error) {
        console.error('❌ Error buscando viajes:', error)
        return []
      }

      console.log('✅ Viajes encontrados:', trips?.length || 0)
      return trips || []
    } catch (error) {
      console.error('❌ Error en searchTripsInDatabase:', error)
      return []
    }
  }
}
