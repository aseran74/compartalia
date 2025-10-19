# 🚗 Compartalia - Configuración del Sistema de Carpooling

## 📋 Configuración de APIs

### 1. Google Places API (Recomendado)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - **Places API**
   - **Geocoding API** 
   - **Directions API**
   - **Maps JavaScript API** (para mapas)

4. Ve a "Credenciales" y crea una nueva API Key
5. Restringe la API Key a las APIs que necesitas
6. Copia la API Key

### 2. Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Configuración de APIs para Compartalia
VITE_GOOGLE_PLACES_API_KEY=tu_google_places_api_key_aqui
VITE_GOOGLE_MAPS_API_KEY=tu_google_maps_api_key_aqui

# OpenStreetMap (alternativa gratuita)
VITE_NOMINATIM_API_URL=https://nominatim.openstreetmap.org

# Configuración de la aplicación
VITE_APP_NAME=Compartalia
VITE_APP_DESCRIPTION=Sistema de Carpooling Inteligente
VITE_APP_VERSION=1.0.0

# Configuración de desarrollo
VITE_DEV_MODE=true
VITE_MOCK_API=true
```

### 3. Alternativa Gratuita: Solo OpenStreetMap

Si prefieres no usar Google APIs (para evitar costos), el sistema funcionará solo con OpenStreetMap:

```env
# Solo OpenStreetMap
VITE_NOMINATIM_API_URL=https://nominatim.openstreetmap.org
VITE_DEV_MODE=true
VITE_MOCK_API=true
```

## 🚀 Funcionalidades Implementadas

### ✅ Completado
- [x] Dashboard principal de carpooling
- [x] Sistema de búsqueda de viajes
- [x] Formulario para crear viajes
- [x] Componente de autocompletado de direcciones
- [x] Servicio de geolocalización
- [x] Sistema de matching de rutas compatibles
- [x] Tipos TypeScript para el sistema
- [x] Rutas del router configuradas

### 🔄 En Progreso
- [ ] Páginas restantes (Mis Viajes, Mensajes, Detalles)
- [ ] Sistema de autenticación
- [ ] Integración con backend
- [ ] Chat en tiempo real

## 🛠️ Cómo Usar

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
Copia `env.example` a `.env` y configura tus API keys.

### 3. Ejecutar en Desarrollo
```bash
npm run dev
```

### 4. Acceder a la Aplicación
- Dashboard: http://localhost:5174/
- Buscar Viajes: http://localhost:5174/carpooling/search-trips
- Crear Viaje: http://localhost:5174/carpooling/create-trip

## 🎯 Características del Sistema

### Autocompletado Inteligente
- Usa Google Places API para sugerencias precisas
- Fallback a OpenStreetMap si no hay API key
- Soporte para ubicación actual del usuario
- Navegación con teclado (flechas, Enter, Escape)

### Sistema de Matching de Rutas
- Detecta rutas compatibles automáticamente
- Calcula segmentos compartidos
- Considera hubs de intercambio (Moncloa, Plaza España, etc.)
- Algoritmo de compatibilidad con scoring

### Interfaz Responsiva
- Diseño mobile-first
- Componentes reutilizables
- Tema claro/oscuro
- Iconos SVG integrados

## 🔧 Estructura del Proyecto

```
src/
├── components/
│   └── carpooling/
│       └── AddressAutocomplete.vue
├── services/
│   ├── geolocation.ts
│   └── routeMatching.ts
├── types/
│   └── carpooling.ts
└── views/
    └── Carpooling/
        ├── Dashboard.vue
        ├── SearchTrips.vue
        └── CreateTrip.vue
```

## 🚧 Próximos Pasos

1. **Completar páginas restantes**
2. **Implementar autenticación de usuarios**
3. **Conectar con backend/API**
4. **Añadir mapas interactivos**
5. **Sistema de notificaciones push**
6. **Chat en tiempo real**
7. **Sistema de pagos**
8. **App móvil (React Native)**

## 💡 Consejos de Desarrollo

- Usa el componente `AddressAutocomplete` en todos los formularios de ubicación
- El servicio `geolocationService` maneja automáticamente el fallback entre APIs
- Los tipos TypeScript están en `src/types/carpooling.ts`
- El sistema de matching está en `src/services/routeMatching.ts`

## 🐛 Solución de Problemas

### Error: "Google Places API error"
- Verifica que la API Key sea correcta
- Asegúrate de que las APIs estén habilitadas en Google Cloud Console
- Revisa las restricciones de la API Key

### Error: "No se pudo obtener la ubicación actual"
- Verifica que el usuario haya dado permisos de ubicación
- Usa HTTPS en producción (requerido para geolocalización)

### Las direcciones no se autocompletan
- El sistema usará automáticamente OpenStreetMap como fallback
- Verifica la conexión a internet
