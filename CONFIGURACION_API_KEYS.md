# 🔑 Configuración de API Keys

## 🚨 **Problema Actual:**
El sistema está usando ruta "fallback" porque no tienes las API keys configuradas. Esto genera pocos puntos y no permite crear paradas.

## 📋 **Solución:**

### 1. **Crear archivo `.env` en la raíz del proyecto:**

```bash
# En la terminal, ejecuta:
cp .env.example .env
```

### 2. **Editar el archivo `.env` y añadir tus API keys:**

```env
# Google Maps API Keys (opcional - mejor calidad)
VITE_GOOGLE_MAPS_API_KEY=tu_google_maps_api_key_aqui
VITE_GOOGLE_PLACES_API_KEY=tu_google_places_api_key_aqui

# OpenRouteService API Key (RECOMENDADO - gratis, 2000 requests/día)
VITE_ORS_API_KEY=tu_openrouteservice_api_key_aqui

# Mapbox Access Token (opcional)
VITE_MAPBOX_ACCESS_TOKEN=tu_mapbox_access_token_aqui

# Supabase Configuration (ya tienes estas)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🎯 **Recomendación:**

### **OpenRouteService (GRATIS):**
1. Ve a: https://openrouteservice.org/
2. Crea una cuenta gratuita
3. Obtén tu API key (2000 requests/día gratis)
4. Añádela a `.env`:
   ```env
   VITE_ORS_API_KEY=5b3ce3597851110001cf6248xxxxxxxxxxxx
   ```

### **Google Maps (PAGO):**
1. Ve a: https://console.cloud.google.com/
2. Activa Google Directions API
3. Crea una API key
4. Añádela a `.env`:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyCxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

## 🧪 **Probar sin API keys:**

Si no quieres configurar API keys ahora, el sistema mejorado ahora genera **rutas simuladas que NO son líneas rectas**:

### **✅ Nuevo Sistema de Ruta Fallback:**
- **Chamartín → Getafe:** Ruta específica simulando A-5 y M-30 con 21 puntos
- **Otras rutas:** Curvas y desviaciones simuladas como carreteras reales
- **Mínimo 40 puntos** para rutas de 19km (antes solo 11)

### **🛣️ Características de la Ruta Simulada:**
- **Curvas sinusoidales** que simulan cambios de dirección
- **Desviaciones aleatorias** como cambios de autopista
- **Puntos intermedios realistas** siguiendo carreteras principales
- **NO más línea recta** - ahora sigue trayectos curvos

Prueba de nuevo en `/carpooling/test-route-stops` y verás una ruta con curvas y paradas cada 3km.

## 📊 **Diferencias:**

| Fuente | Calidad | Costo | Puntos de ruta | Trayecto |
|--------|---------|-------|----------------|----------|
| **Google Directions** | ⭐⭐⭐⭐⭐ | 💰 Pago | ~200-500 puntos | 🛣️ Carreteras reales |
| **OpenRouteService** | ⭐⭐⭐⭐ | 🆓 Gratis | ~100-300 puntos | 🛣️ Carreteras reales |
| **Fallback Simulado** | ⭐⭐⭐ | 🆓 Gratis | ~40-80 puntos | 🛣️ Curvas simuladas |

---

**¡Con una API key de OpenRouteService tendrás paradas perfectas siguiendo el trayecto real de carreteras! 🛣️✨**
