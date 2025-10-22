// Servicio simple de autocompletado que funciona sin APIs externas
export interface AutocompleteSuggestion {
  id: string
  name: string
  address: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export class SimpleAutocompleteService {
  private madridLocations: AutocompleteSuggestion[] = [
    // Centros históricos y culturales
    { id: 'puerta_sol', name: 'Puerta del Sol', address: 'Puerta del Sol, Madrid, España', coordinates: { lat: 40.4168, lng: -3.7038 } },
    { id: 'gran_via', name: 'Gran Vía', address: 'Gran Vía, Madrid, España', coordinates: { lat: 40.4194, lng: -3.7108 } },
    { id: 'plaza_espana', name: 'Plaza de España', address: 'Plaza de España, Madrid, España', coordinates: { lat: 40.4236, lng: -3.7122 } },
    { id: 'madrid_centro', name: 'Madrid Centro', address: 'Centro de Madrid, España', coordinates: { lat: 40.4168, lng: -3.7038 } },
    
    // Estaciones de transporte
    { id: 'atocha', name: 'Atocha', address: 'Estación de Atocha, Madrid, España', coordinates: { lat: 40.4075, lng: -3.6917 } },
    { id: 'chamartin', name: 'Chamartín', address: 'Estación de Chamartín, Madrid, España', coordinates: { lat: 40.4720, lng: -3.6806 } },
    { id: 'moncloa', name: 'Moncloa', address: 'Intercambiador de Moncloa, Madrid, España', coordinates: { lat: 40.4350, lng: -3.7200 } },
    
    // Distritos de negocios
    { id: 'nuevos_ministerios', name: 'Nuevos Ministerios', address: 'Nuevos Ministerios, Madrid, España', coordinates: { lat: 40.4459, lng: -3.6900 } },
    { id: 'azca', name: 'AZCA', address: 'AZCA, Madrid, España', coordinates: { lat: 40.4459, lng: -3.6900 } },
    { id: 'cuatro_torres', name: 'Cuatro Torres', address: 'Cuatro Torres Business Area, Madrid, España', coordinates: { lat: 40.4720, lng: -3.6806 } },
    { id: 'plaza_castilla', name: 'Plaza de Castilla', address: 'Plaza de Castilla, Madrid, España', coordinates: { lat: 40.4669, lng: -3.6889 } },
    
    // Educación y sanidad
    { id: 'universidad_complutense', name: 'Universidad Complutense', address: 'Universidad Complutense de Madrid, España', coordinates: { lat: 40.4459, lng: -3.7297 } },
    { id: 'hospital_la_paz', name: 'Hospital La Paz', address: 'Hospital Universitario La Paz, Madrid, España', coordinates: { lat: 40.4720, lng: -3.6806 } },
    
    // Centros financieros
    { id: 'santander_boadilla', name: 'Ciudad financiera Santander (Boadilla)', address: 'Ciudad financiera Santander, Boadilla del Monte, Madrid, España', coordinates: { lat: 40.4057, lng: -3.8753 } },
    { id: 'bbva_las_tablas', name: 'Ciudad financiera BBVA (Las Tablas)', address: 'Ciudad financiera BBVA, Las Tablas, Madrid, España', coordinates: { lat: 40.5475, lng: -3.6420 } },
    
    // Ciudades del extrarradio
    { id: 'torrejon_ardoz', name: 'Torrejón de Ardoz', address: 'Torrejón de Ardoz, Madrid, España', coordinates: { lat: 40.4594, lng: -3.4697 } },
    { id: 'alcala_henares', name: 'Alcalá de Henares', address: 'Alcalá de Henares, Madrid, España', coordinates: { lat: 40.4817, lng: -3.3641 } },
    { id: 'alcobendas', name: 'Alcobendas', address: 'Alcobendas, Madrid, España', coordinates: { lat: 40.5475, lng: -3.6420 } },
    { id: 'getafe', name: 'Getafe', address: 'Getafe, Madrid, España', coordinates: { lat: 40.3047, lng: -3.7312 } },
    { id: 'leganes', name: 'Leganés', address: 'Leganés, Madrid, España', coordinates: { lat: 40.3275, lng: -3.7639 } },
    { id: 'fuenlabrada', name: 'Fuenlabrada', address: 'Fuenlabrada, Madrid, España', coordinates: { lat: 40.2839, lng: -3.7942 } },
    { id: 'mostoles', name: 'Móstoles', address: 'Móstoles, Madrid, España', coordinates: { lat: 40.3228, lng: -3.8647 } },
    { id: 'alcorcon', name: 'Alcorcón', address: 'Alcorcón, Madrid, España', coordinates: { lat: 40.3458, lng: -3.8249 } },
    { id: 'parla', name: 'Parla', address: 'Parla, Madrid, España', coordinates: { lat: 40.2375, lng: -3.7731 } },
    { id: 'arganda_rey', name: 'Arganda del Rey', address: 'Arganda del Rey, Madrid, España', coordinates: { lat: 40.3012, lng: -3.4373 } },
    { id: 'boadilla_monte', name: 'Boadilla del Monte', address: 'Boadilla del Monte, Madrid, España', coordinates: { lat: 40.4057, lng: -3.8753 } },
    { id: 'collado_villalba', name: 'Collado Villalba', address: 'Collado Villalba, Madrid, España', coordinates: { lat: 40.6419, lng: -4.0089 } },
    { id: 'colmenar_viejo', name: 'Colmenar Viejo', address: 'Colmenar Viejo, Madrid, España', coordinates: { lat: 40.6592, lng: -3.7678 } },
    { id: 'coslada', name: 'Coslada', address: 'Coslada, Madrid, España', coordinates: { lat: 40.4238, lng: -3.5613 } },
    { id: 'rivas_vaciamadrid', name: 'Rivas-Vaciamadrid', address: 'Rivas-Vaciamadrid, Madrid, España', coordinates: { lat: 40.3319, lng: -3.5206 } },
    { id: 'san_sebastian_reyes', name: 'San Sebastián de los Reyes', address: 'San Sebastián de los Reyes, Madrid, España', coordinates: { lat: 40.5475, lng: -3.6250 } },
    { id: 'valdemoro', name: 'Valdemoro', address: 'Valdemoro, Madrid, España', coordinates: { lat: 40.1908, lng: -3.6778 } },
    { id: 'villaviciosa_odon', name: 'Villaviciosa de Odón', address: 'Villaviciosa de Odón, Madrid, España', coordinates: { lat: 40.3569, lng: -3.9006 } }
  ]

  /**
   * Busca sugerencias basadas en el input del usuario
   */
  searchSuggestions(input: string, limit: number = 10): AutocompleteSuggestion[] {
    if (!input || input.length < 2) {
      return []
    }

    const inputLower = input.toLowerCase()
    
    // Filtrar ubicaciones que coincidan con el input
    const matches = this.madridLocations.filter(location => 
      location.name.toLowerCase().includes(inputLower) ||
      location.address.toLowerCase().includes(inputLower)
    )

    // Ordenar por relevancia (coincidencias exactas primero, luego parciales)
    const sortedMatches = matches.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().startsWith(inputLower)
      const bNameMatch = b.name.toLowerCase().startsWith(inputLower)
      
      if (aNameMatch && !bNameMatch) return -1
      if (!aNameMatch && bNameMatch) return 1
      
      return a.name.localeCompare(b.name)
    })

    return sortedMatches.slice(0, limit)
  }

  /**
   * Obtiene una ubicación por ID
   */
  getLocationById(id: string): AutocompleteSuggestion | undefined {
    return this.madridLocations.find(location => location.id === id)
  }

  /**
   * Obtiene todas las ubicaciones disponibles
   */
  getAllLocations(): AutocompleteSuggestion[] {
    return [...this.madridLocations]
  }
}
