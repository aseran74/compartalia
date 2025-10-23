import type { Location } from '@/types/carpooling';

export class GooglePlacesServiceModern {
  private apiKey: string;
  private autocompleteService: google.maps.places.AutocompleteService | null = null;
  private placesService: google.maps.places.PlacesService | null = null;

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '';
    this.loadGoogleMapsAPI();
  }

  private loadGoogleMapsAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps && window.google.maps.places) {
        console.log('✅ Google Maps ya está cargado');
        this.initializeServices();
        resolve();
        return;
      }

      if (!this.apiKey) {
        console.warn('VITE_GOOGLE_PLACES_API_KEY no está configurada. Google Places API no se cargará.');
        reject(new Error('Google Places API Key missing.'));
        return;
      }

      console.log('📡 Cargando Google Maps API con Places...');
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places&language=es&region=ES&loading=async`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('✅ Google Maps API cargado exitosamente');
        this.initializeServices();
        resolve();
      };
      
      script.onerror = (error) => {
        console.error('❌ Error cargando Google Maps API:', error);
        reject(new Error('Error cargando Google Maps API'));
      };
      
      document.head.appendChild(script);
    });
  }

  private initializeServices() {
    if (window.google && window.google.maps && window.google.maps.places) {
      this.autocompleteService = new google.maps.places.AutocompleteService();
      this.placesService = new google.maps.places.PlacesService(document.createElement('div'));
    }
  }

  /**
   * Autocompleta direcciones usando Google Places API (versión moderna)
   */
  async autocompleteAddress(input: string, sessionToken?: string): Promise<Location[]> {
    if (!this.autocompleteService) {
      console.warn('Google Places API no está disponible, usando fallback');
      return this.getFallbackSuggestions(input);
    }

    if (input.length < 3) {
      return [];
    }

    try {
      console.log(`🔍 Autocompletando con Google Places (moderno): ${input}`);
      
      const request: google.maps.places.AutocompleteRequest = {
        input: input,
        componentRestrictions: { country: 'es' },
        types: ['geocode'],
        language: 'es',
        region: 'es',
        sessionToken: sessionToken // 👈 AÑADIDO: Usar sessionToken para facturación correcta
      };

      return new Promise((resolve) => {
        this.autocompleteService!.getPlacePredictions(request, (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            const locations = predictions.map((prediction) => ({
              id: `google_${prediction.place_id}`,
              name: prediction.structured_formatting.main_text,
              address: prediction.description,
              coordinates: { lat: 0, lng: 0 },
              type: 'origin' as const
            }));
            
            console.log(`✅ Google Places (moderno) autocompletado exitoso: ${locations.length} resultados`);
            resolve(locations);
          } else {
            console.warn('⚠️ Google Places (moderno) autocompletado falló, usando fallback');
            resolve(this.getFallbackSuggestions(input));
          }
        });
      });
    } catch (error) {
      console.error('❌ Error en Google Places (moderno):', error);
      return this.getFallbackSuggestions(input);
    }
  }

  /**
   * Geocodifica una dirección usando Google Places API
   */
  async geocodeAddress(address: string): Promise<Location | null> {
    if (!this.autocompleteService) {
      console.warn('Google Places API no está disponible para geocoding');
      return null;
    }

    try {
      console.log(`🌍 Geocodificando: ${address}`);
      
      // Usar el servicio de geocoding de Google Maps
      const geocoder = new google.maps.Geocoder();
      
      return new Promise((resolve) => {
        geocoder.geocode({ address: address }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
            const result = results[0];
            const location: Location = {
              id: `geocode_${Date.now()}`,
              name: result.formatted_address,
              address: result.formatted_address,
              coordinates: {
                lat: result.geometry.location.lat(),
                lng: result.geometry.location.lng()
              },
              type: 'origin'
            };
            
            console.log(`✅ Geocoding exitoso: ${location.name}`);
            resolve(location);
          } else {
            console.warn('⚠️ Geocoding falló:', status);
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('❌ Error en geocoding:', error);
      return null;
    }
  }

  /**
   * Obtiene los detalles (incluyendo coordenadas) de un Place ID
   */
  async getPlaceDetails(placeId: string, sessionToken?: string): Promise<Location | null> {
    if (!this.placesService) {
      console.warn('Google Places API no está disponible para getDetails');
      return null;
    }

    try {
      console.log(`🌍 Obteniendo detalles del Place ID: ${placeId}`);
      
      const request: google.maps.places.PlaceDetailsRequest = {
        placeId: placeId,
        fields: ['name', 'formatted_address', 'geometry.location', 'place_id'],
        sessionToken: sessionToken // MUY IMPORTANTE: Reutiliza el token de la sesión
      };

      return new Promise((resolve) => {
        this.placesService!.getDetails(request, (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
            const location: Location = {
              id: `google_${place.place_id}`,
              name: place.name || place.formatted_address?.split(',')[0] || 'Dirección no disponible',
              address: place.formatted_address || 'Dirección no disponible',
              coordinates: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              },
              type: 'origin'
            };
            
            console.log(`✅ Google Places getDetails exitoso: ${location.name}`);
            resolve(location);
          } else {
            console.warn('⚠️ Google Places getDetails falló:', status);
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('❌ Error en getPlaceDetails:', error);
      return null;
    }
  }

  /**
   * Sugerencias de fallback cuando Google Places no está disponible
   */
  private getFallbackSuggestions(input: string): Location[] {
    const madridLocations = [
      'Madrid Centro',
      'Puerta del Sol, Madrid',
      'Gran Vía, Madrid',
      'Plaza Mayor, Madrid',
      'Chamartín, Madrid',
      'Atocha, Madrid',
      'Nuevos Ministerios, Madrid',
      'Plaza de Castilla, Madrid',
      'Moncloa, Madrid',
      'Plaza de España, Madrid',
      'AZCA, Madrid',
      'Cuatro Torres, Madrid',
      'Universidad Complutense, Madrid',
      'Hospital La Paz, Madrid',
      'Ciudad financiera Santander, Boadilla del Monte',
      'Ciudad financiera BBVA, Las Tablas'
    ];

    return madridLocations
      .filter(location => 
        location.toLowerCase().includes(input.toLowerCase())
      )
      .slice(0, 5)
      .map((location, index) => ({
        id: `fallback_${index}`,
        name: location,
        address: location,
        coordinates: { lat: 40.4168, lng: -3.7038 },
        type: 'origin' as const
      }));
  }
}
