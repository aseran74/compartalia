# 🎯 Ejemplos Prácticos de Uso - Sistema Unificado de Viajes

## ✅ Sistema Implementado

La tabla `trips` ahora soporta 3 tipos de viajes:
- **`single`** - Viaje único/puntual
- **`weekly`** - Viaje semanal recurrente
- **`monthly`** - Viaje mensual recurrente

## 📊 Datos Actuales

- **Total viajes:** 35
- **Viajes únicos:** 5
- **Viajes mensuales:** 30 (migrados desde `monthly_trips`)

## 🔍 Ejemplos de Búsqueda

### 1. Buscar Todos los Viajes para una Fecha Específica

```sql
-- Buscar viajes para el 4 de noviembre de 2025 (lunes)
SELECT 
  id,
  trip_type,
  origin_name,
  destination_name,
  CASE 
    WHEN trip_type = 'single' THEN price_per_seat
    WHEN trip_type = 'weekly' THEN price_per_period
    WHEN trip_type = 'monthly' THEN price_per_period
  END as precio_mostrar,
  available_seats
FROM search_trips_by_date(
  '2025-11-04'::DATE,
  NULL, NULL, NULL, NULL, 100
);
```

**Resultado:**
- Encuentra viajes únicos programados para ese día
- Encuentra viajes semanales activos ese lunes
- Encuentra viajes mensuales activos ese lunes

### 2. Buscar Viajes Cerca de una Ubicación

```sql
-- Buscar viajes desde Getafe (40.3057, -3.7327) para el 4 de noviembre
SELECT 
  origin_name,
  destination_name,
  trip_type,
  price_per_day,
  price_per_period,
  available_seats
FROM search_trips_by_date(
  '2025-11-04'::DATE,
  40.3057,  -- Getafe lat
  -3.7327,  -- Getafe lng
  NULL,
  NULL,
  15  -- radio 15km
);
```

### 3. Verificar si un Viaje Está Activo en una Fecha

```sql
-- Verificar si el viaje mensual Getafe-Atocha está activo el 4 de noviembre
SELECT is_trip_active_on_date(
  'edb5adb2-0819-4d0d-9128-003560dcc000'::UUID,
  '2025-11-04'::DATE
);
-- Resultado: true (porque es lunes y tiene monday_time configurado)
```

### 4. Calcular Precio de un Viaje

```sql
-- Calcular precio mensual
SELECT calculate_trip_price(
  'edb5adb2-0819-4d0d-9128-003560dcc000'::UUID,
  'monthly',
  1
);
-- Resultado: 130.00 (price_per_period)

-- Calcular precio semanal (si fuera weekly)
SELECT calculate_trip_price(
  'uuid-del-viaje'::UUID,
  'weekly',
  1
);
-- Resultado: price_per_period o (price_per_day * 5)
```

## 🎨 Casos de Uso en el Frontend

### Caso 1: Usuario Busca Viaje para una Fecha

```typescript
// Usuario selecciona: "Quiero viajar el 4 de noviembre de Getafe a Madrid"

const searchTrips = async (date: string, origin: Location, destination: Location) => {
  const { data, error } = await supabase.rpc('search_trips_by_date', {
    p_search_date: date,
    p_origin_lat: origin.lat,
    p_origin_lng: origin.lng,
    p_dest_lat: destination.lat,
    p_dest_lng: destination.lng,
    p_radius_km: 15
  })
  
  // Retorna TODOS los viajes disponibles ese día:
  // - Viajes únicos programados para ese día
  // - Viajes semanales que operan ese día de la semana
  // - Viajes mensuales que operan ese día de la semana
  
  return data
}
```

### Caso 2: Mostrar Precio Correcto según Tipo

```typescript
const displayPrice = (trip: Trip) => {
  switch (trip.trip_type) {
    case 'single':
      return `${trip.price_per_seat}€ por plaza`
    
    case 'weekly':
      return `${trip.price_per_day}€/día o ${trip.price_per_period}€/semana`
    
    case 'monthly':
      return `${trip.price_per_day}€/día o ${trip.price_per_period}€/mes`
  }
}
```

### Caso 3: Crear Viaje Semanal

```typescript
const createWeeklyTrip = async (tripData: WeeklyTripData) => {
  const { data, error } = await supabase
    .from('trips')
    .insert({
      driver_id: tripData.driverId,
      vehicle_id: tripData.vehicleId,
      origin_name: tripData.origin.name,
      origin_lat: tripData.origin.lat,
      origin_lng: tripData.origin.lng,
      destination_name: tripData.destination.name,
      destination_lat: tripData.destination.lat,
      destination_lng: tripData.destination.lng,
      
      // Tipo y fechas
      trip_type: 'weekly',
      start_date: tripData.startDate,
      end_date: tripData.endDate,
      
      // Precios
      price_per_day: tripData.pricePerDay,
      price_per_period: tripData.pricePerWeek,
      
      // Horarios por día
      monday_time: tripData.schedule.monday,
      tuesday_time: tripData.schedule.tuesday,
      wednesday_time: tripData.schedule.wednesday,
      thursday_time: tripData.schedule.thursday,
      friday_time: tripData.schedule.friday,
      
      // Configuración
      available_seats: tripData.seats,
      auto_renew: tripData.autoRenew,
      status: 'active'
    })
    .select()
    .single()
  
  return data
}
```

### Caso 4: Notificación de Renovación

```typescript
// Obtener viajes que necesitan renovación (7 días antes de expirar)
const getTripsNeedingRenewal = async (driverId: string) => {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('driver_id', driverId)
    .in('trip_type', ['weekly', 'monthly'])
    .not('end_date', 'is', null)
    .lte('end_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
    .eq('status', 'active')
  
  return data
}

// Renovar viaje
const renewTrip = async (tripId: string, newEndDate: string) => {
  const { data, error } = await supabase
    .from('trips')
    .update({
      end_date: newEndDate,
      renewal_notification_sent: false,
      renewal_notification_date: null
    })
    .eq('id', tripId)
    .select()
    .single()
  
  return data
}
```

## 🎯 Flujo Completo de Usuario

### Escenario: Usuario busca viaje para ir al trabajo

1. **Usuario introduce:**
   - Fecha: 4 de noviembre de 2025
   - Origen: Getafe
   - Destino: Madrid Centro

2. **Sistema busca:**
   ```sql
   SELECT * FROM search_trips_by_date(
     '2025-11-04'::DATE,
     40.3057, -3.7327,  -- Getafe
     40.4168, -3.7038,  -- Madrid Centro
     15
   );
   ```

3. **Sistema muestra resultados:**
   - ✅ Viaje único para ese día: "Madrid - Barcelona" (si existe)
   - ✅ Viaje semanal L-V: "Getafe - Atocha" 
     - Precio: 5€/día o 20€/semana
   - ✅ Viaje mensual L-V: "Getafe - Chamartín"
     - Precio: 6.50€/día o 130€/mes

4. **Usuario selecciona opción:**
   - Viaje único: Paga 5€ por ese día
   - Viaje semanal: Puede pagar 5€ por ese día o 20€ por toda la semana
   - Viaje mensual: Puede pagar 6.50€ por ese día o 130€ por todo el mes

## 📱 UI Recomendada

### Formulario de Creación de Viaje

```
┌─────────────────────────────────────┐
│ Crear Nuevo Viaje                   │
├─────────────────────────────────────┤
│                                     │
│ Tipo de viaje:                      │
│ ○ Único (puntual)                   │
│ ○ Semanal (recurrente)              │
│ ● Mensual (recurrente)              │
│                                     │
│ [Si es recurrente]                  │
│ Fecha inicio: [04/11/2025]          │
│ Fecha fin:    [30/11/2025]          │
│ □ Sin fecha de fin                  │
│                                     │
│ Días que opera:                     │
│ ☑ Lunes    07:30                    │
│ ☑ Martes   07:30                    │
│ ☑ Miércoles 07:30                   │
│ ☑ Jueves   07:30                    │
│ ☑ Viernes  07:30                    │
│ ☐ Sábado   --:--                    │
│ ☐ Domingo  --:--                    │
│                                     │
│ Precio:                             │
│ Por día:    [6.50] €                │
│ Por mes:    [130.00] €              │
│                                     │
│ □ Renovación automática             │
│                                     │
│ [Crear Viaje]                       │
└─────────────────────────────────────┘
```

### Resultados de Búsqueda

```
Viajes disponibles para el 4 de noviembre de 2025

┌─────────────────────────────────────┐
│ 🚗 Getafe → Atocha                  │
│ Salida: 07:30                       │
│ Tipo: Mensual (L-V)                 │
│ 💰 6.50€/día o 130€/mes             │
│ 👥 3 plazas disponibles             │
│ [Ver detalles] [Reservar]           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🚗 Getafe → Chamartín               │
│ Salida: 08:00                       │
│ Tipo: Semanal (L-V)                 │
│ 💰 5€/día o 20€/semana              │
│ 👥 2 plazas disponibles             │
│ [Ver detalles] [Reservar]           │
└─────────────────────────────────────┘
```

## 🔔 Sistema de Notificaciones

### Trigger Automático
Cuando un viaje recurrente está a 7 días de expirar:

```sql
-- El trigger automáticamente marca:
UPDATE trips SET
  renewal_notification_sent = true,
  renewal_notification_date = NOW()
WHERE end_date - CURRENT_DATE <= 7
  AND trip_type IN ('weekly', 'monthly')
  AND renewal_notification_sent = false;
```

### Consulta para Enviar Notificaciones

```typescript
// Obtener viajes que necesitan notificación
const { data: tripsToNotify } = await supabase
  .from('trips')
  .select('*, drivers(*)')
  .eq('renewal_notification_sent', true)
  .is('renewal_notification_date', null)  // Aún no se ha enviado email
  
// Enviar email/notificación a cada conductor
for (const trip of tripsToNotify) {
  await sendRenewalEmail(trip.drivers.email, {
    tripId: trip.id,
    origin: trip.origin_name,
    destination: trip.destination_name,
    endDate: trip.end_date
  })
  
  // Marcar como enviado
  await supabase
    .from('trips')
    .update({ renewal_notification_date: new Date().toISOString() })
    .eq('id', trip.id)
}
```

## 🎉 Ventajas del Sistema Unificado

1. ✅ **Una sola búsqueda** para todos los tipos de viajes
2. ✅ **Flexibilidad de precios** (día/semana/mes)
3. ✅ **Horarios personalizados** por día de la semana
4. ✅ **Renovación automática** con notificaciones
5. ✅ **Mejor experiencia** para el usuario
6. ✅ **Código más simple** en el frontend
7. ✅ **Base de datos optimizada** con índices

## 📝 Próximos Pasos

1. ✅ Migración completada
2. ✅ Funciones SQL creadas
3. ✅ Datos migrados (30 viajes mensuales)
4. 🔄 Actualizar servicios TypeScript
5. 🔄 Actualizar componentes Vue
6. 🔄 Implementar UI de creación/edición
7. 🔄 Implementar sistema de notificaciones
8. 🔄 Testing completo

¡El sistema está listo para ser usado desde el frontend!


