# 🚀 Guía Rápida de Uso - Sistema Unificado de Viajes

## 📝 Tabla de Contenidos
1. [Crear Viajes](#crear-viajes)
2. [Buscar Viajes](#buscar-viajes)
3. [Renovar Viajes](#renovar-viajes)
4. [Ejemplos de Código](#ejemplos-de-código)

---

## 🚗 Crear Viajes

### Componente: `CreateMonthlyTrip.vue`

### 1. Viaje Único (Puntual)

```vue
<CreateMonthlyTrip />
```

**Pasos:**
1. Seleccionar tipo: **"🚗 Viaje Único (puntual)"**
2. Completar origen y destino
3. Seleccionar **fecha única**
4. Establecer hora de salida
5. Definir plazas disponibles
6. Establecer **precio por plaza** (ej: 25€)
7. Crear viaje

**Resultado:** Viaje para una fecha específica

---

### 2. Viaje Semanal (Recurrente)

**Pasos:**
1. Seleccionar tipo: **"📅 Semanal (recurrente)"**
2. Completar origen y destino
3. Seleccionar **fecha de inicio** y **fecha de fin**
4. Marcar **días de la semana** que opera (ej: L-V)
5. Establecer horarios (puede ser diferente por día)
6. Definir:
   - **Precio por día**: 5€
   - **Precio por semana**: 20€
7. Opcionalmente: Activar **🔄 Renovación automática**
8. Crear viaje

**Resultado:** Viaje que opera los días seleccionados cada semana

---

### 3. Viaje Mensual (Recurrente)

**Pasos:**
1. Seleccionar tipo: **"📅 Mensual (recurrente)"**
2. Completar origen y destino
3. Seleccionar **fecha de inicio** y **fecha de fin**
4. Marcar **días de la semana** que opera
5. Establecer horarios
6. Definir:
   - **Precio por día**: 6.50€
   - **Precio por mes**: 130€
7. Opcionalmente: Activar **🔄 Renovación automática**
8. Crear viaje

**Resultado:** Viaje que opera los días seleccionados cada mes

---

### 🔄 Renovación Automática

**¿Qué es?**
- El viaje continúa **sin fecha de fin**
- Se renueva automáticamente
- No requiere gestión manual

**¿Cuándo usarla?**
- ✅ Rutas casa-trabajo permanentes
- ✅ Viajes escolares durante todo el año
- ✅ Servicios de transporte indefinidos

**Cómo activarla:**
1. Al crear el viaje, marcar checkbox **"🔄 Renovación automática"**
2. El campo "Fecha de fin" se deshabilitará
3. El viaje continuará indefinidamente

---

## 🔍 Buscar Viajes

### Componente: `UnifiedTripSearch.vue`

```vue
<UnifiedTripSearch />
```

### Búsqueda Básica

**Pasos:**
1. Seleccionar **fecha** (ej: 4 de noviembre de 2025)
2. Opcionalmente: Filtrar por origen/destino
3. Clic en **"Buscar"**

**Resultado:** Lista de TODOS los viajes disponibles ese día:
- 🚗 Viajes únicos programados para ese día
- 📅 Viajes semanales que operan ese día de la semana
- 📅 Viajes mensuales que operan ese día de la semana

### Filtros Avanzados

**Checkboxes:**
- ☑️ **Viajes únicos** - Mostrar viajes puntuales
- ☑️ **Viajes semanales** - Mostrar viajes semanales
- ☑️ **Viajes mensuales** - Mostrar viajes mensuales

**Ejemplo:**
- Si solo quieres ver viajes mensuales, desmarca los otros dos checkboxes

---

## 🔔 Renovar Viajes

### Componente: `TripRenewalNotifications.vue`

```vue
<TripRenewalNotifications />
```

### Ver Viajes que Necesitan Renovación

**El componente muestra automáticamente:**
- Viajes que expiran en los próximos 7 días
- Días restantes hasta la expiración
- Información del viaje

### Renovar Manualmente

**Pasos:**
1. Clic en **"🔄 Renovar"** en el viaje deseado
2. El sistema sugiere una nueva fecha (mismo período)
3. Ajustar la fecha si es necesario
4. Clic en **"Confirmar"**

**Resultado:** Viaje extendido hasta la nueva fecha

### Activar Renovación Automática

**Pasos:**
1. Clic en **"🔄 Renovar"** en el viaje deseado
2. Marcar checkbox **"🔄 Renovación automática"**
3. El campo de fecha se deshabilitará
4. Clic en **"Confirmar"**

**Resultado:** Viaje sin fecha de fin, se renueva automáticamente

---

## 💻 Ejemplos de Código

### Usar el Servicio en tu Componente

```typescript
import TripsService from '@/services/tripsService'

// Buscar viajes para una fecha
const searchTrips = async () => {
  const trips = await TripsService.searchTripsByDate({
    search_date: '2025-11-04',
    origin_lat: 40.3057,  // Getafe
    origin_lng: -3.7327,
    radius_km: 15
  })
  
  console.log(`Encontrados ${trips.length} viajes`)
}

// Crear viaje semanal
const createWeeklyTrip = async () => {
  const trip = await TripsService.createTrip({
    driver_id: 'uuid-conductor',
    origin_name: 'Getafe',
    origin_lat: 40.3057,
    origin_lng: -3.7327,
    destination_name: 'Madrid Centro',
    destination_lat: 40.4168,
    destination_lng: -3.7038,
    trip_type: 'weekly',
    start_date: '2025-11-01',
    end_date: '2025-11-30',
    monday_time: '07:30:00',
    tuesday_time: '07:30:00',
    wednesday_time: '07:30:00',
    thursday_time: '07:30:00',
    friday_time: '07:30:00',
    available_seats: 3,
    price_per_day: 5.00,
    price_per_period: 20.00,
    auto_renew: false,
    status: 'active'
  })
  
  if (trip) {
    console.log('Viaje creado:', trip.id)
  }
}

// Renovar viaje
const renewTrip = async (tripId: string) => {
  const renewed = await TripsService.renewTrip(
    tripId,
    '2025-12-31' // Nueva fecha de fin
  )
  
  if (renewed) {
    console.log('Viaje renovado hasta:', renewed.end_date)
  }
}

// Activar renovación automática
const enableAutoRenew = async (tripId: string) => {
  const updated = await TripsService.updateTrip(tripId, {
    auto_renew: true,
    end_date: null // Sin fecha de fin
  })
  
  if (updated) {
    console.log('Renovación automática activada')
  }
}

// Obtener viajes que necesitan renovación
const checkRenewals = async () => {
  const trips = await TripsService.getTripsNeedingRenewal()
  
  console.log(`${trips.length} viajes necesitan renovación`)
}
```

---

## 🎯 Casos de Uso Comunes

### Caso 1: Conductor Regular (Casa-Trabajo)

**Escenario:** Juan va de Getafe a Madrid Centro de lunes a viernes

**Solución:**
1. Crear viaje **mensual**
2. Marcar días: L, M, X, J, V
3. Horario: 07:30
4. Precio: 6.50€/día o 130€/mes
5. ✅ Activar **renovación automática**

**Resultado:** Viaje permanente sin gestión manual

---

### Caso 2: Viaje Ocasional al Aeropuerto

**Escenario:** María necesita ir al aeropuerto el 15 de noviembre

**Solución:**
1. Crear viaje **único**
2. Fecha: 15 de noviembre
3. Horario: 05:00
4. Precio: 30€/plaza

**Resultado:** Viaje puntual para esa fecha

---

### Caso 3: Servicio Semanal Temporal

**Escenario:** Pedro ofrece viajes semanales durante 1 mes

**Solución:**
1. Crear viaje **semanal**
2. Inicio: 1 de noviembre
3. Fin: 30 de noviembre
4. Días: L-V
5. Precio: 5€/día o 20€/semana
6. ❌ NO activar renovación automática

**Resultado:** Viaje semanal con fecha de fin definida

---

## 🔍 Búsquedas Inteligentes

### Ejemplo 1: Buscar Viaje para Ir al Trabajo

```
Fecha: 4 de noviembre de 2025 (lunes)
Origen: Getafe
Destino: Madrid Centro
```

**Resultados mostrados:**
- ✅ Viajes únicos para el 4 de noviembre
- ✅ Viajes semanales que operan los lunes
- ✅ Viajes mensuales que operan los lunes

---

### Ejemplo 2: Buscar Solo Viajes Mensuales

```
Fecha: 4 de noviembre de 2025
Filtros: ☑️ Solo viajes mensuales
```

**Resultados mostrados:**
- ✅ Solo viajes mensuales que operan ese día
- ❌ Viajes únicos y semanales ocultos

---

## ⚠️ Notas Importantes

### Renovación Automática
- ⚠️ Una vez activada, el viaje continúa indefinidamente
- ⚠️ Para detenerlo, debes cancelar el viaje manualmente
- ✅ Ideal para servicios permanentes

### Precios
- 💡 Precio por día: Para usuarios ocasionales
- 💡 Precio por período: Para usuarios comprometidos (con descuento)
- 💡 Los usuarios eligen cómo pagar al reservar

### Días de Operación
- 📅 Puedes seleccionar cualquier combinación de días
- 📅 Puedes tener horarios diferentes por día
- 📅 Puedes definir horarios especiales para fechas específicas

---

## 🆘 Solución de Problemas

### "No se encontraron viajes"
- ✅ Verifica que la fecha sea correcta
- ✅ Verifica que haya viajes creados para esa fecha
- ✅ Verifica los filtros de tipo de viaje

### "Error al crear viaje"
- ✅ Verifica que todos los campos requeridos estén completos
- ✅ Verifica que las coordenadas sean válidas
- ✅ Verifica que el driver_id exista

### "Error al renovar viaje"
- ✅ Verifica que el viaje exista
- ✅ Verifica que la nueva fecha sea posterior a la actual
- ✅ Verifica la conexión a la base de datos

---

## 📞 Soporte

Para más información, consulta:
- `NUEVA_ESTRUCTURA_TRIPS.md` - Documentación técnica completa
- `EJEMPLOS_USO_TRIPS_UNIFICADOS.md` - Ejemplos detallados
- `RESUMEN_IMPLEMENTACION_COMPLETA.md` - Resumen de implementación

---

**¡Disfruta del nuevo sistema unificado de viajes!** 🚀


