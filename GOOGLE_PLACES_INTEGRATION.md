# 🗺️ Integración de Google Places API

## ✅ IMPLEMENTACIÓN COMPLETADA

Se ha integrado Google Places API para direcciones personalizadas en el formulario de creación de viajes.

---

## 📦 COMPONENTES CREADOS

### 1. `GooglePlacesAutocomplete.vue`
**Ubicación:** `src/components/shared/GooglePlacesAutocomplete.vue`

Componente reutilizable de autocompletado con Google Places API.

**Características:**
- ✅ Autocompletado en tiempo real
- ✅ Debounce de 300ms para optimizar llamadas a la API
- ✅ Filtrado por país (España)
- ✅ Sugerencias con formato estructurado
- ✅ Loading indicator
- ✅ Manejo de errores
- ✅ Cierre automático al seleccionar

**Props:**
```typescript
interface Props {
  modelValue: string        // v-model para el valor del input
  placeholder?: string      // Placeholder del input
  required?: boolean        // Si el campo es requerido
}
```

**Eventos:**
```typescript
interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'place-selected', place: google.maps.places.AutocompletePrediction): void
}
```

**Uso:**
```vue
<GooglePlacesAutocomplete
  v-model="direccion"
  placeholder="Escribe una dirección..."
  :required="true"
  @place-selected="handlePlaceSelected"
/>
```

---

## 🔧 MODIFICACIONES EN `CreateTripSimple.vue`

### Nuevos campos en el formulario:
```typescript
form: {
  // ... campos existentes ...
  origin_place_id: string,      // ID del lugar de Google Places
  origin_lat: number,            // Latitud del origen
  origin_lng: number,            // Longitud del origen
  destination_place_id: string,  // ID del lugar de destino
  destination_lat: number,       // Latitud del destino
  destination_lng: number        // Longitud del destino
}
```

### Coordenadas predefinidas:
Se han añadido coordenadas exactas para todos los lugares predefinidos (55 ubicaciones):
- **Ciudades del sur de Madrid:** Getafe, Leganés, Móstoles, etc.
- **Ciudades del norte:** Alcobendas, Las Rozas, Tres Cantos, etc.
- **Zonas de Madrid:** Sol, Atocha, Chamartín, Moncloa, etc.
- **Aeropuertos:** T1, T4
- **Otros:** IFEMA, Barajas

### Funciones añadidas:

#### `handleOriginPlaceSelected(place)`
Maneja la selección de un lugar de origen desde Google Places.
- Guarda el `place_id`
- Obtiene las coordenadas mediante Geocoder

#### `handleDestinationPlaceSelected(place)`
Maneja la selección de un lugar de destino desde Google Places.
- Guarda el `place_id`
- Obtiene las coordenadas mediante Geocoder

#### `getPlaceCoordinates(placeId, type)`
Obtiene las coordenadas exactas de un `place_id` usando Google Geocoder.
- Convierte `place_id` → coordenadas (lat, lng)
- Actualiza el formulario con las coordenadas reales

### Lógica de coordenadas en `createTrip()`:

```typescript
// 1. Prioridad: Coordenadas de Google Places (si se usó dirección personalizada)
let originLat = form.origin_lat
let originLng = form.origin_lng

// 2. Fallback: Coordenadas predefinidas (si se usó vista rápida o modal)
if (!form.origin_custom && coordenadasPredefinidas[form.origin_name]) {
  originLat = coordenadasPredefinidas[form.origin_name].lat
  originLng = coordenadasPredefinidas[form.origin_name].lng
}

// 3. Fallback final: Coordenadas por defecto
if (!originLat || !originLng) {
  originLat = 40.3057 // Getafe
  originLng = -3.7327
}
```

---

## 🎯 FLUJO DE USO

### Opción 1: Lugares Predefinidos (Vista Rápida)
1. Usuario selecciona "Getafe" en vista rápida
2. Se usan coordenadas predefinidas: `{ lat: 40.3057, lng: -3.7327 }`
3. ✅ Rápido y sin llamadas a API

### Opción 2: Lugares Predefinidos (Modal)
1. Usuario abre modal "Más lugares"
2. Busca "Alcalá de Henares"
3. Selecciona el lugar
4. Se usan coordenadas predefinidas: `{ lat: 40.4817, lng: -3.3641 }`
5. ✅ Rápido y sin llamadas a API

### Opción 3: Dirección Personalizada (Google Places)
1. Usuario marca checkbox "📝 Dirección personalizada"
2. Aparece el componente `GooglePlacesAutocomplete`
3. Usuario escribe "Calle Mayor 123, Getafe"
4. Google Places muestra sugerencias en tiempo real
5. Usuario selecciona una sugerencia
6. Se obtiene el `place_id`
7. Se llama a Google Geocoder para obtener coordenadas exactas
8. Se guardan las coordenadas reales en el formulario
9. ✅ Precisión máxima con Google Places

---

## 🔑 CONFIGURACIÓN DE LA API

### API Key
La API Key ya está configurada en `index.html`:

```html
<script async defer 
  src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBv-Flleyr8I0gqrG2VVU04EWyJuDODYj8&libraries=places&callback=initGoogleMaps&loading=async">
</script>
```

### Servicios utilizados:
1. **AutocompleteService** - Para sugerencias en tiempo real
2. **Geocoder** - Para obtener coordenadas exactas de un `place_id`

---

## 📊 VENTAJAS DE LA IMPLEMENTACIÓN

### ✅ Flexibilidad
- Vista rápida para lugares comunes
- Modal con búsqueda para más opciones
- Google Places para direcciones exactas

### ✅ Rendimiento
- Debounce para evitar llamadas excesivas a la API
- Coordenadas predefinidas para lugares populares (sin API)
- Solo se usa Google Places cuando es necesario

### ✅ Precisión
- Coordenadas exactas con Google Places
- Geocoding automático de `place_id`
- Fallback a coordenadas predefinidas

### ✅ UX
- Autocompletado en tiempo real
- Sugerencias con formato estructurado (nombre + dirección)
- Loading indicator
- Cierre automático al seleccionar

---

## 🧪 PRUEBAS

### Test 1: Vista Rápida
1. Selecciona "Getafe" en vista rápida
2. Selecciona "Atocha" en vista rápida
3. Crea el viaje
4. ✅ Verifica que las coordenadas sean las predefinidas

### Test 2: Modal
1. Clic en "+ Más lugares"
2. Busca "Alcalá"
3. Selecciona "Alcalá de Henares"
4. Crea el viaje
5. ✅ Verifica que las coordenadas sean las predefinidas

### Test 3: Google Places
1. Marca "📝 Dirección personalizada"
2. Escribe "Calle Mayor 123, Getafe"
3. Selecciona una sugerencia de Google Places
4. Verifica en consola: `✅ Coordenadas origen: 40.xxxx, -3.xxxx`
5. Crea el viaje
6. ✅ Verifica que las coordenadas sean las de Google Places

### Test 4: Combinación
1. Origen: Vista rápida "Getafe"
2. Destino: Google Places "Calle Alcalá 456, Madrid"
3. Crea el viaje
4. ✅ Verifica que el origen use coordenadas predefinidas y el destino use Google Places

---

## 📝 LOGS DE CONSOLA

El sistema muestra logs detallados:

```
✅ Google Places Autocomplete Service inicializado
📍 Origen seleccionado desde Google Places: Calle Mayor 123, Getafe
✅ Coordenadas origen: 40.3057, -3.7327
🎯 Destino seleccionado desde Google Places: Calle Alcalá 456, Madrid
✅ Coordenadas destino: 40.4168, -3.7038
🚗 Creando viaje...
📋 Tipo: semanal
📊 Datos del viaje: {...}
✅ Viaje creado: {...}
```

---

## 🚀 PRÓXIMOS PASOS (OPCIONAL)

1. **Validación de coordenadas**
   - Verificar que las coordenadas estén dentro de la Comunidad de Madrid
   - Mostrar alerta si la distancia es muy grande

2. **Caché de lugares**
   - Guardar lugares buscados recientemente
   - Mostrar sugerencias de lugares frecuentes

3. **Mapa de previsualización**
   - Mostrar un mapa pequeño con la ruta
   - Calcular distancia y tiempo estimado

4. **Autocompletado inteligente**
   - Sugerir destinos basados en el origen
   - Rutas populares

---

## 📚 DOCUMENTACIÓN RELACIONADA

- [Google Places API - Autocomplete](https://developers.google.com/maps/documentation/javascript/place-autocomplete)
- [Google Geocoding API](https://developers.google.com/maps/documentation/javascript/geocoding)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)

---

**Fecha de implementación:** 26 de octubre de 2025  
**Desarrollado por:** AI Assistant  
**Estado:** ✅ Completado y funcional


