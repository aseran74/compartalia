import type { Location } from '@/types/carpooling';

export class GeolocationService {
  private googlePlacesApiKey: string;
  private nominatimApiUrl: string;

  constructor() {
    this.googlePlacesApiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '';
    this.nominatimApiUrl = import.meta.env.VITE_NOMINATIM_API_URL || 'https://nominatim.openstreetmap.org';
  }

  /**
   * Autocompleta direcciones usando OpenStreetMap (Nominatim)
   */
  async autocompleteAddress(input: string, sessionToken?: string): Promise<Location[]> {
    // Forzar uso de OpenStreetMap (Nominatim) para evitar errores de Google API
    console.log('🔍 Usando OpenStreetMap (Nominatim) para autocompletado');
    return this.autocompleteAddressNominatim(input);
  }

  /**
   * Autocompleta direcciones usando Nominatim (OpenStreetMap)
   */
  async autocompleteAddressNominatim(input: string): Promise<Location[]> {
    try {
      const response = await fetch(
        `${this.nominatimApiUrl}/search?` +
        `q=${encodeURIComponent(input)}&` +
        `format=json&` +
        `countrycodes=es&` +
        `limit=5&` +
        `addressdetails=1`
      );

      const data = await response.json();
      
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
      console.error('Error with Nominatim API:', error);
      return [];
    }
  }

  /**
   * Obtiene coordenadas para una dirección específica (geocodificación)
   */
  async geocodeAddress(address: string): Promise<Location | null> {
    // Forzar uso de OpenStreetMap (Nominatim) para evitar errores de Google API
    console.log('🔍 Usando OpenStreetMap (Nominatim) para geocodificación');
    return this.geocodeAddressNominatim(address);
  }

  /**
   * Geocodificación usando Nominatim
   */
  async geocodeAddressNominatim(address: string): Promise<Location | null> {
    try {
      const response = await fetch(
        `${this.nominatimApiUrl}/search?` +
        `q=${encodeURIComponent(address)}&` +
        `format=json&` +
        `countrycodes=es&` +
        `limit=1&` +
        `addressdetails=1`
      );

      const data = await response.json();
      
      if (!data.length) {
        return null;
      }

      const result = data[0];
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
      console.error('Error with Nominatim API:', error);
      return null;
    }
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