# 🚗 Nueva Estructura Unificada de Viajes

## ✅ Migración Completada

Se ha unificado toda la lógica de viajes en una sola tabla `trips` con soporte para diferentes tipos de recurrencia.

## 📋 Estructura de la Tabla `trips`

### Campos Existentes
- `id` (UUID) - Identificador único
- `driver_id` (UUID) - Conductor
- `vehicle_id` (UUID) - Vehículo
- `origin_name`, `origin_lat`, `origin_lng` - Origen
- `destination_name`, `destination_lat`, `destination_lng` - Destino
- `departure_time` (TIMESTAMP) - Hora de salida
- `available_seats` (INTEGER) - Plazas disponibles
- `description` (TEXT) - Descripción
- `status` (TEXT) - Estado: 'active', 'completed', 'cancelled'
- `route_data` (JSONB) - Datos de ruta
- `created_at`, `updated_at` - Timestamps

### Nuevos Campos Agregados

#### Tipo de Viaje
- **`trip_type`** (TEXT) - Tipo de viaje:
  - `'single'` - Viaje único (puntual)
  - `'weekly'` - Viaje semanal recurrente
  - `'monthly'` - Viaje mensual recurrente

#### Fechas de Recurrencia
- **`start_date`** (DATE) - Fecha de inicio (para viajes recurrentes)
- **`end_date`** (DATE) - Fecha de fin (NULL = sin fin)

#### Precios
- **`price_per_seat`** (NUMERIC) - Precio por plaza (viajes únicos)
- **`price_per_day`** (NUMERIC) - Precio por plaza por día
- **`price_per_period`** (NUMERIC) - Precio por plaza por periodo (semanal/mensual)

#### Horarios por Día de la Semana
- **`monday_time`** (TIME) - Hora los lunes
- **`tuesday_time`** (TIME) - Hora los martes
- **`wednesday_time`** (TIME) - Hora los miércoles
- **`thursday_time`** (TIME) - Hora los jueves
- **`friday_time`** (TIME) - Hora los viernes
- **`saturday_time`** (TIME) - Hora los sábados
- **`sunday_time`** (TIME) - Hora los domingos

#### Horarios Especiales
- **`special_times`** (JSONB) - Horarios especiales para fechas específicas
  ```json
  {
    "departure": {
      "2025-12-25": "10:00:00",
      "2025-12-31": "14:00:00"
    },
    "return": {
      "2025-12-25": "20:00:00"
    }
  }
  ```

#### Renovación Automática
- **`return_time`** (TIMESTAMP) - Hora de regreso
- **`auto_renew`** (BOOLEAN) - Renovación automática activada
- **`renewal_notification_sent`** (BOOLEAN) - Notificación de renovación enviada
- **`renewal_notification_date`** (TIMESTAMP) - Fecha de notificación

## 🔍 Funciones Creadas

### 1. `is_trip_active_on_date(trip_id, check_date)`
Verifica si un viaje está activo en una fecha específica.

```sql
SELECT is_trip_active_on_date('uuid-del-viaje', '2025-11-02');
```

### 2. `search_trips_by_date(search_date, origin_lat, origin_lng, dest_lat, dest_lng, radius_km)`
Busca todos los viajes disponibles en una fecha específica (únicos, semanales y mensuales).

```sql
-- Buscar viajes para el 2 de noviembre cerca de Madrid
SELECT * FROM search_trips_by_date(
  '2025-11-02'::DATE,
  40.4168,  -- lat Madrid
  -3.7038,  -- lng Madrid
  NULL,
  NULL,
  15  -- radio 15km
);
```

### 3. `calculate_trip_price(trip_id, trip_type, num_days)`
Calcula el precio según el tipo de viaje.

```sql
-- Precio para un viaje mensual
SELECT calculate_trip_price('uuid-del-viaje', 'monthly', 1);
```

## 🎯 Ejemplos de Uso

### Crear Viaje Único (Puntual)
```sql
INSERT INTO trips (
  driver_id,
  vehicle_id,
  origin_name,
  origin_lat,
  origin_lng,
  destination_name,
  destination_lat,
  destination_lng,
  departure_time,
  available_seats,
  price_per_seat,
  trip_type,
  status
) VALUES (
  'uuid-conductor',
  'uuid-vehiculo',
  'Madrid',
  40.4168,
  -3.7038,
  'Barcelona',
  41.3851,
  2.1734,
  '2025-11-02 08:00:00+00',
  4,
  25.00,
  'single',
  'active'
);
```

### Crear Viaje Semanal Recurrente
```sql
INSERT INTO trips (
  driver_id,
  vehicle_id,
  origin_name,
  origin_lat,
  origin_lng,
  destination_name,
  destination_lat,
  destination_lng,
  departure_time,
  available_seats,
  price_per_day,
  price_per_period,
  trip_type,
  start_date,
  end_date,
  monday_time,
  tuesday_time,
  wednesday_time,
  thursday_time,
  friday_time,
  status
) VALUES (
  'uuid-conductor',
  'uuid-vehiculo',
  'Móstoles',
  40.3217,
  -3.8650,
  'Madrid Centro',
  40.4168,
  -3.7038,
  '2025-11-01 07:00:00+00',
  3,
  5.00,   -- 5€ por día
  20.00,  -- 20€ por semana (5 días)
  'weekly',
  '2025-11-01',
  '2025-12-31',
  '07:00:00',  -- Lunes a las 7am
  '07:00:00',  -- Martes a las 7am
  '07:00:00',  -- Miércoles a las 7am
  '07:00:00',  -- Jueves a las 7am
  '07:00:00',  -- Viernes a las 7am
  'active'
);
```

### Crear Viaje Mensual Recurrente
```sql
INSERT INTO trips (
  driver_id,
  vehicle_id,
  origin_name,
  origin_lat,
  origin_lng,
  destination_name,
  destination_lat,
  destination_lng,
  departure_time,
  available_seats,
  price_per_day,
  price_per_period,
  trip_type,
  start_date,
  end_date,
  monday_time,
  tuesday_time,
  wednesday_time,
  thursday_time,
  friday_time,
  auto_renew,
  status
) VALUES (
  'uuid-conductor',
  'uuid-vehiculo',
  'Getafe',
  40.3057,
  -3.7327,
  'Madrid Centro',
  40.4168,
  -3.7038,
  '2025-11-01 07:30:00+00',
  4,
  4.50,   -- 4.50€ por día
  80.00,  -- 80€ por mes (~20 días)
  'monthly',
  '2025-11-01',
  '2025-11-30',
  '07:30:00',
  '07:30:00',
  '07:30:00',
  '07:30:00',
  '07:30:00',
  true,  -- Renovación automática
  'active'
);
```

### Buscar Viajes para una Fecha Específica
```sql
-- Buscar todos los viajes (únicos, semanales, mensuales) para el 2 de noviembre
SELECT 
  id,
  origin_name,
  destination_name,
  trip_type,
  CASE 
    WHEN trip_type = 'single' THEN price_per_seat
    WHEN trip_type = 'weekly' THEN price_per_period
    WHEN trip_type = 'monthly' THEN price_per_period
  END as price,
  available_seats
FROM search_trips_by_date(
  '2025-11-02'::DATE,
  40.4168,  -- Madrid lat
  -3.7038,  -- Madrid lng
  NULL,
  NULL,
  20  -- radio 20km
);
```

## 🔔 Sistema de Notificaciones de Renovación

El sistema automáticamente detecta cuando un viaje recurrente está próximo a expirar (7 días antes) y marca que se debe enviar una notificación al conductor.

### Trigger Automático
Cuando `end_date - CURRENT_DATE <= 7`:
- Se marca `renewal_notification_sent = true`
- Se registra `renewal_notification_date = NOW()`

### Consultar Viajes que Necesitan Renovación
```sql
SELECT 
  id,
  driver_id,
  origin_name,
  destination_name,
  end_date,
  trip_type
FROM trips
WHERE trip_type IN ('weekly', 'monthly')
  AND end_date IS NOT NULL
  AND end_date - CURRENT_DATE <= 7
  AND renewal_notification_sent = true
  AND status = 'active';
```

## 📊 Migración de Datos

✅ Los 30 viajes existentes en `monthly_trips` han sido migrados automáticamente a `trips` con `trip_type = 'monthly'`.

La tabla `monthly_trips` se mantiene por seguridad pero está marcada como DEPRECATED.

## 🎨 Ventajas del Nuevo Sistema

1. **Búsqueda Unificada**: Una sola consulta para buscar todos los tipos de viajes
2. **Flexibilidad**: Soporte para viajes únicos, semanales y mensuales
3. **Precios Flexibles**: Precio por día y por periodo
4. **Horarios Personalizados**: Diferentes horarios para cada día de la semana
5. **Renovación Automática**: Sistema de notificaciones integrado
6. **Mejor Rendimiento**: Índices optimizados para búsquedas por fecha y tipo

## 🚀 Próximos Pasos

1. Actualizar el frontend para usar la nueva estructura
2. Implementar UI para seleccionar tipo de viaje (único/semanal/mensual)
3. Crear sistema de notificaciones de renovación
4. Actualizar servicios TypeScript para usar los nuevos campos
5. Implementar lógica de renovación automática

## 📝 Notas Importantes

- Los viajes recurrentes sin `end_date` se consideran indefinidos
- Si un día de la semana tiene `NULL` en su campo de tiempo, el viaje NO opera ese día
- Los `special_times` permiten sobrescribir horarios para fechas específicas
- El campo `price_per_seat` se mantiene para compatibilidad con viajes únicos


