import type { Location } from '@/types/carpooling';

export class GooglePlacesService {
  private apiKey: string;
  private service: google.maps.places.PlacesService | null = null;
  private autocompleteService: google.maps.places.AutocompleteService | null = null;

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '';
    
    // Cargar Google Maps API si no está cargada
    this.loadGoogleMapsAPI();
  }

  private loadGoogleMapsAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps && window.google.maps.places) {
        this.initializeServices();
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places&language=es&region=ES`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        this.initializeServices();
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Error cargando Google Maps API'));
      };
      
      document.head.appendChild(script);
    });
  }

  private initializeServices() {
    if (window.google && window.google.maps && window.google.maps.places) {
      this.autocompleteService = new google.maps.places.AutocompleteService();
      this.service = new google.maps.places.PlacesService(document.createElement('div'));
    }
  }

  /**
   * Autocompleta direcciones usando Google Places API
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
      console.log(`🔍 Autocompletando con Google Places: ${input}`);
      
      const request: google.maps.places.AutocompleteRequest = {
        input: input,
        componentRestrictions: { country: 'es' },
        types: ['geocode'],
        language: 'es',
        region: 'es'
      };

      return new Promise((resolve) => {
        this.autocompleteService!.getPlacePredictions(request, (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            const locations = predictions.map((prediction, index) => ({
              id: `google_${prediction.place_id}`,
              name: prediction.structured_formatting.main_text,
              address: prediction.description,
              coordinates: { lat: 0, lng: 0 }, // Se obtendrán con geocoding
              type: 'origin' as const
            }));
            
            console.log(`✅ Google Places autocompletado exitoso: ${locations.length} resultados`);
            resolve(locations);
          } else {
            console.warn('⚠️ Google Places autocompletado falló, usando fallback');
            resolve(this.getFallbackSuggestions(input));
          }
        });
      });
    } catch (error) {
      console.error('❌ Error con Google Places API:', error);
      return this.getFallbackSuggestions(input);
    }
  }

  /**
   * Obtiene coordenadas para una dirección específica (geocodificación)
   */
  async geocodeAddress(address: string): Promise<Location | null> {
    if (!this.service) {
      console.warn('Google Places API no está disponible, usando fallback');
      return this.getFallbackLocation(address);
    }

    try {
      console.log(`🔍 Geocodificando con Google Places: ${address}`);
      
      const geocoder = new google.maps.Geocoder();
      
      return new Promise((resolve) => {
        geocoder.geocode({ address: address, region: 'ES' }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
            const result = results[0];
            const location: Location = {
              id: `google_${result.place_id}`,
              name: result.formatted_address.split(',')[0],
              address: result.formatted_address,
              coordinates: {
                lat: result.geometry.location.lat(),
                lng: result.geometry.location.lng()
              },
              type: 'origin' as const
            };
            
            console.log(`✅ Google Places geocodificación exitosa: ${location.address}`);
            resolve(location);
          } else {
            console.warn('⚠️ Google Places geocodificación falló, usando fallback');
            resolve(this.getFallbackLocation(address));
          }
        });
      });
    } catch (error) {
      console.error('❌ Error con Google Places geocoding:', error);
      return this.getFallbackLocation(address);
    }
  }

  /**
   * Fallback para sugerencias cuando Google Places falla
   */
  private getFallbackSuggestions(input: string): Location[] {
    console.log('🔄 Usando sugerencias de fallback para:', input);
    
    const suggestions = [
      'Madrid Centro',
      'Puerta del Sol, Madrid',
      'Gran Vía, Madrid',
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
      'Torrejón de Ardoz, Madrid',
      'Alcalá de Henares, Madrid',
      'Alcobendas, Madrid',
      'Getafe, Madrid',
      'Leganés, Madrid',
      'Fuenlabrada, Madrid',
      'Móstoles, Madrid'
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
   * Fallback para cuando Google Places falla
   */
  private getFallbackLocation(address: string): Location | null {
    console.log('🔄 Usando ubicación de fallback para:', address);
    
    // Coordenadas aproximadas para Madrid y alrededores
    const fallbackCoordinates = {
      'madrid': { lat: 40.4168, lng: -3.7038 },
      'puerta del sol': { lat: 40.4168, lng: -3.7038 },
      'gran vía': { lat: 40.4194, lng: -3.7108 },
      'chamartín': { lat: 40.4720, lng: -3.6806 },
      'atocha': { lat: 40.4075, lng: -3.6917 },
      'nuevos ministerios': { lat: 40.4459, lng: -3.6900 },
      'plaza de castilla': { lat: 40.4669, lng: -3.6889 },
      'moncloa': { lat: 40.4350, lng: -3.7200 },
      'plaza de españa': { lat: 40.4236, lng: -3.7122 },
      'azca': { lat: 40.4459, lng: -3.6900 },
      'cuatro torres': { lat: 40.4720, lng: -3.6806 },
      'universidad complutense': { lat: 40.4459, lng: -3.7297 },
      'hospital la paz': { lat: 40.4720, lng: -3.6806 },
      'torrejón': { lat: 40.4594, lng: -3.4697 },
      'alcalá': { lat: 40.4817, lng: -3.3641 },
      'alcobendas': { lat: 40.5475, lng: -3.6420 },
      'getafe': { lat: 40.3047, lng: -3.7312 },
      'leganés': { lat: 40.3275, lng: -3.7639 },
      'fuenlabrada': { lat: 40.2839, lng: -3.7942 },
      'móstoles': { lat: 40.3228, lng: -3.8647 }
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
}
