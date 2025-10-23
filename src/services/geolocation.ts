import type { Location } from '@/types/carpooling';
import { GooglePlacesServiceModern } from './googlePlacesServiceModern';

export class GeolocationService {
  private googlePlacesApiKey: string;
  private nominatimApiUrl: string;
  private googlePlacesService: GooglePlacesServiceModern;

  constructor() {
    this.googlePlacesApiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '';
    this.nominatimApiUrl = import.meta.env.VITE_NOMINATIM_API_URL || 'https://nominatim.openstreetmap.org';
    this.googlePlacesService = new GooglePlacesServiceModern();
  }

  /**
   * Autocompleta direcciones usando Google Places API o fallback a Nominatim
   */
  async autocompleteAddress(input: string, sessionToken?: string): Promise<Location[]> {
    // Intentar usar Google Places API primero
    if (this.googlePlacesApiKey) {
      try {
        console.log('🔍 Intentando usar Google Places API...');
        return await this.googlePlacesService.autocompleteAddress(input, sessionToken);
      } catch (error) {
        console.warn('⚠️ Google Places API falló, usando Nominatim:', error);
      }
    }
    
    // Fallback a Nominatim
    console.log('🔍 Usando OpenStreetMap (Nominatim) para autocompletado');
    return this.autocompleteAddressNominatim(input);
  }

  /**
   * Autocompleta direcciones usando Nominatim (OpenStreetMap)
   */
  async autocompleteAddressNominatim(input: string): Promise<Location[]> {
    if (input.length < 3) {
      return [];
    }

    try {
      console.log(`🔍 Autocompletando con Nominatim: ${input}`);
      
      // Agregar headers para evitar bloqueos
      const headers = {
        'User-Agent': 'Compartalia/1.0 (compartalia@example.com)',
        'Accept': 'application/json',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
      };

      const response = await fetch(
        `${this.nominatimApiUrl}/search?` +
        `q=${encodeURIComponent(input)}&` +
        `format=json&` +
        `countrycodes=es&` +
        `limit=5&` +
        `addressdetails=1`,
        {
          method: 'GET',
          headers: headers,
          mode: 'cors'
        }
      );

      if (!response.ok) {
        console.error(`❌ Nominatim API error: ${response.status} ${response.statusText}`);
        return this.getFallbackSuggestions(input);
      }

      const data = await response.json();
      
      if (!data || !data.length) {
        console.log('⚠️ No se encontraron sugerencias en Nominatim');
        return this.getFallbackSuggestions(input);
      }

      console.log(`✅ Nominatim autocompletado exitoso: ${data.length} resultados`);
      
      return data.map((result: any) => ({
        id: `nominatim_${result.place_id}`,
        name: result.display_name.split(',')[0],
        address: result.display_name,
        coordinates: {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        },
        type: 'origin' as const
      }));
    } catch (error) {
      console.error('❌ Error with Nominatim API:', error);
      return this.getFallbackSuggestions(input);
    }
  }

  /**
   * Fallback para sugerencias cuando Nominatim falla
   */
  private getFallbackSuggestions(input: string): Location[] {
    console.log('🔄 Usando sugerencias de fallback para:', input);
    
    const suggestions = [
      'Madrid Centro',
      'Torrejón de Ardoz',
      'Alcalá de Henares',
      'Getafe',
      'Leganés',
      'Fuenlabrada',
      'Móstoles',
      'Alcorcón',
      'Parla',
      'Alcobendas'
    ];

    const filtered = suggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(input.toLowerCase())
    );

    return filtered.map((suggestion, index) => ({
      id: `fallback_${index}`,
      name: suggestion,
      address: suggestion,
      coordinates: { lat: 40.4168, lng: -3.7038 }, // Madrid Centro como fallback
      type: 'origin' as const
    }));
  }

  /**
   * Obtiene los detalles de un lugar por su Place ID (más eficiente que geocoding)
   */
  async getPlaceDetails(placeId: string, sessionToken?: string): Promise<Location | null> {
    // Intentar usar Google Places API primero
    if (this.googlePlacesApiKey) {
      try {
        console.log('🌍 Obteniendo detalles con Google Places API...');
        return await this.googlePlacesService.getPlaceDetails(placeId, sessionToken);
      } catch (error) {
        console.warn('⚠️ Google Places getDetails falló:', error);
      }
    }
    
    // Si no hay API key o falló, no podemos hacer fallback por Place ID
    console.warn('⚠️ No se puede obtener detalles sin Google Places API');
    return null;
  }

  /**
   * Obtiene coordenadas para una dirección específica (geocodificación)
   */
  async geocodeAddress(address: string): Promise<Location | null> {
    // Intentar usar Google Places API primero
    if (this.googlePlacesApiKey) {
      try {
        console.log('🔍 Intentando usar Google Places API para geocodificación...');
        return await this.googlePlacesService.geocodeAddress(address);
      } catch (error) {
        console.warn('⚠️ Google Places geocoding falló, usando Nominatim:', error);
      }
    }
    
    // Fallback a Nominatim
    console.log('🔍 Usando OpenStreetMap (Nominatim) para geocodificación');
    return this.geocodeAddressNominatim(address);
  }

  /**
   * Geocodificación usando Nominatim
   */
  async geocodeAddressNominatim(address: string): Promise<Location | null> {
    try {
      console.log(`🔍 Geocodificando con Nominatim: ${address}`);
      
      // Agregar headers para evitar bloqueos
      const headers = {
        'User-Agent': 'Compartalia/1.0 (compartalia@example.com)',
        'Accept': 'application/json',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
      };

      const response = await fetch(
        `${this.nominatimApiUrl}/search?` +
        `q=${encodeURIComponent(address)}&` +
        `format=json&` +
        `countrycodes=es&` +
        `limit=1&` +
        `addressdetails=1`,
        {
          method: 'GET',
          headers: headers,
          mode: 'cors'
        }
      );

      if (!response.ok) {
        console.error(`❌ Nominatim API error: ${response.status} ${response.statusText}`);
        return this.getFallbackLocation(address);
      }

      const data = await response.json();
      
      if (!data || !data.length) {
        console.log('⚠️ No se encontraron resultados en Nominatim');
        return this.getFallbackLocation(address);
      }

      const result = data[0];
      console.log(`✅ Nominatim geocodificación exitosa: ${result.display_name}`);
      
      return {
        id: `nominatim_${result.place_id}`,
        name: result.display_name.split(',')[0],
        address: result.display_name,
        coordinates: {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        },
        type: 'origin' as const
      };
    } catch (error) {
      console.error('❌ Error with Nominatim API:', error);
      return this.getFallbackLocation(address);
    }
  }

  /**
   * Fallback para cuando Nominatim falla
   */
  private getFallbackLocation(address: string): Location | null {
    console.log('🔄 Usando ubicación de fallback para:', address);
    
    // Coordenadas aproximadas para Madrid y alrededores
    const fallbackCoordinates = {
      'madrid': { lat: 40.4168, lng: -3.7038 },
      'torrejón': { lat: 40.4594, lng: -3.4697 },
      'alcalá': { lat: 40.4817, lng: -3.3641 },
      'getafe': { lat: 40.3047, lng: -3.7312 },
      'leganés': { lat: 40.3275, lng: -3.7639 },
      'fuenlabrada': { lat: 40.2839, lng: -3.7942 },
      'móstoles': { lat: 40.3228, lng: -3.8647 },
      'alcorcón': { lat: 40.3489, lng: -3.8289 },
      'parla': { lat: 40.2375, lng: -3.7731 },
      'alcobendas': { lat: 40.5475, lng: -3.6419 }
    };

    const addressLower = address.toLowerCase();
    for (const [key, coords] of Object.entries(fallbackCoordinates)) {
      if (addressLower.includes(key)) {
        return {
          id: `fallback_${key}`,
          name: address,
          address: address,
          coordinates: coords,
          type: 'origin' as const
        };
      }
    }

    // Fallback genérico a Madrid Centro
    return {
      id: 'fallback_madrid',
      name: address,
      address: address,
      coordinates: { lat: 40.4168, lng: -3.7038 },
      type: 'origin' as const
    };
  }

  /**
   * Genera un token de sesión para Google Places API
   */
  private generateSessionToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Obtiene la ubicación actual del usuario
   */
  async getCurrentLocation(): Promise<Location | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.error('Geolocation is not supported by this browser');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            id: 'current_location',
            name: 'Mi ubicación actual',
            address: 'Ubicación actual',
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            type: 'origin'
          };
          resolve(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          resolve(null);
        }
      );
    });
  }
}

// Instancia singleton
export const geolocationService = new GeolocationService();