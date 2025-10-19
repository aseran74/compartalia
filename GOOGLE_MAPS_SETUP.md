# 🗺️ Configuración de Google Maps API para Compartalia

## 📋 Pasos para Configurar las API Keys

### 1. **Crear Proyecto en Google Cloud Console**

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la facturación (requerido para las APIs)

### 2. **Habilitar las APIs Necesarias**

Ve a "APIs y servicios" > "Biblioteca" y habilita:

- ✅ **Maps JavaScript API** - Para mostrar mapas interactivos
- ✅ **Directions API** - Para calcular rutas entre puntos
- ✅ **Places API** - Para autocompletado de direcciones
- ✅ **Roads API** - Para ajustar puntos a carreteras (opcional)
- ✅ **Geocoding API** - Para convertir direcciones a coordenadas

### 3. **Crear API Key**

1. Ve a "APIs y servicios" > "Credenciales"
2. Haz clic en "Crear credenciales" > "Clave de API"
3. Copia la API key generada
4. **IMPORTANTE**: Restringe la API key por seguridad:
   - Restricciones de aplicación: HTTP referrers
   - Añade: `localhost:*`, `127.0.0.1:*`, tu dominio de producción
   - Restricciones de API: Selecciona solo las APIs que necesitas

### 4. **Configurar Variables de Entorno**

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Google Maps API Configuration
VITE_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
VITE_GOOGLE_PLACES_API_KEY=tu_api_key_aqui

# Configuración de la aplicación
VITE_APP_NAME=Compartalia
VITE_APP_DESCRIPTION=Sistema de Carpooling Inteligente
VITE_APP_VERSION=1.0.0

# Configuración de desarrollo
VITE_DEV_MODE=true
VITE_MOCK_API=false
```

### 5. **Reiniciar el Servidor**

```bash
npm run dev
```

## 🔧 Funcionalidades Implementadas

### **Con Google Maps API:**
- 🗺️ **Mapa interactivo** con Google Maps
- 🛣️ **Rutas reales** calculadas por Google Directions
- 📍 **Waypoints precisos** distribuidos en la ruta real
- 🚗 **Marcadores de recogida** en ubicaciones accesibles
- ⏱️ **Tiempos de viaje** considerando tráfico actual
- 📏 **Distancias exactas** de la ruta optimizada

### **Sin API Key (Fallback):**
- 🗺️ **Mapa SVG simple** que funciona sin APIs
- 📍 **Waypoints simulados** distribuidos en línea recta
- ⏱️ **Tiempos estimados** basados en distancia
- 📏 **Distancias aproximadas** usando fórmula Haversine

## 💰 Costos de Google Maps API

### **Precios (2024):**
- **Maps JavaScript API**: $7 por cada 1,000 cargas de mapa
- **Directions API**: $5 por cada 1,000 solicitudes
- **Places API**: $17 por cada 1,000 solicitudes
- **Roads API**: $5 por cada 1,000 solicitudes

### **Límites Gratuitos:**
- **$200 USD/mes** de crédito gratuito
- **~28,000 cargas de mapa** gratuitas
- **~40,000 solicitudes de direcciones** gratuitas

## 🔒 Seguridad

### **Restricciones Recomendadas:**

1. **Por Referrer HTTP:**
   ```
   localhost:*
   127.0.0.1:*
   tu-dominio.com/*
   ```

2. **Por API:**
   - Solo las APIs que necesitas
   - No "Todas las APIs"

3. **Por IP (opcional):**
   - IPs de tus servidores de producción

## 🚨 Troubleshooting

### **Error: "For development purposes only"**
- ✅ API key no configurada o inválida
- ✅ Restricciones de referrer muy estrictas
- ✅ APIs no habilitadas

### **Error: "This API project is not authorized"**
- ✅ Verificar que las APIs estén habilitadas
- ✅ Verificar que la facturación esté activa

### **Error: "Quota exceeded"**
- ✅ Verificar límites de cuota en Google Cloud Console
- ✅ Implementar caché para reducir solicitudes

## 📞 Soporte

Si tienes problemas con la configuración:

1. **Revisa los logs** en la consola del navegador
2. **Verifica las restricciones** de la API key
3. **Comprueba la facturación** en Google Cloud Console
4. **Consulta la documentación** oficial de Google Maps

---

**¡Una vez configurado, tendrás mapas interactivos reales con rutas precisas! 🎉**
