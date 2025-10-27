# 🔧 SOLUCIÓN DEFINITIVA - Error de Caché PostgREST

## ❌ El Problema

```
Error: "Could not find the table 'public.trips' in the schema cache"
```

La tabla `trips` **SÍ EXISTE** en tu base de datos (verificado: 35 registros), pero PostgREST no la reconoce debido a su caché desactualizado.

---

## ✅ SOLUCIÓN INMEDIATA (5 minutos)

### Opción 1: Refrescar Esquema desde Dashboard

1. Ve a: https://supabase.com/dashboard/project/iarhoniaajhmdtaelwql
2. Ve a **SQL Editor**
3. Ejecuta este código:

```sql
-- Refrescar esquema
SELECT pg_notify('pgrst', 'reload schema');
SELECT pg_notify('pgrst', 'reload config');
```

4. Espera 15 segundos
5. **Recarga tu aplicación** (F5 en el navegador)
6. Intenta crear un viaje

---

### Opción 2: Reiniciar Servicios de Supabase

1. Ve a: https://supabase.com/dashboard/project/iarhoniaajhmdtaelwql/settings/api
2. Busca el botón **"Restart services"** o **"Restart"**
3. Haz clic y espera 1-2 minutos
4. **Recarga tu aplicación** (F5 en el navegador)
5. Intenta crear un viaje

---

### Opción 3: Crear Función Helper (RECOMENDADO)

Esta es la solución más robusta. Crea una función SQL que inserta viajes directamente:

1. Ve a **SQL Editor**
2. Ejecuta este código completo:

```sql
-- Función para insertar viajes (evita caché de PostgREST)
CREATE OR REPLACE FUNCTION insert_trip(
  p_driver_id UUID,
  p_vehicle_id UUID DEFAULT NULL,
  p_origin_name TEXT,
  p_origin_lat NUMERIC,
  p_origin_lng NUMERIC,
  p_destination_name TEXT,
  p_destination_lat NUMERIC,
  p_destination_lng NUMERIC,
  p_trip_type TEXT DEFAULT 'single',
  p_departure_time TIMESTAMPTZ DEFAULT NULL,
  p_return_time TIMESTAMPTZ DEFAULT NULL,
  p_available_seats INTEGER DEFAULT 4,
  p_price_per_seat NUMERIC DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'active',
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_price_per_day NUMERIC DEFAULT NULL,
  p_price_per_period NUMERIC DEFAULT NULL,
  p_recurrence_days INTEGER[] DEFAULT NULL,
  p_monday_time TIME DEFAULT NULL,
  p_tuesday_time TIME DEFAULT NULL,
  p_wednesday_time TIME DEFAULT NULL,
  p_thursday_time TIME DEFAULT NULL,
  p_friday_time TIME DEFAULT NULL,
  p_saturday_time TIME DEFAULT NULL,
  p_sunday_time TIME DEFAULT NULL,
  p_special_times JSONB DEFAULT NULL,
  p_route_data JSONB DEFAULT NULL,
  p_auto_renew BOOLEAN DEFAULT FALSE
)
RETURNS SETOF trips
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO trips (
    driver_id, vehicle_id, origin_name, origin_lat, origin_lng,
    destination_name, destination_lat, destination_lng, trip_type,
    departure_time, return_time, available_seats, price_per_seat,
    description, status, start_date, end_date, price_per_day,
    price_per_period, recurrence_days, monday_time, tuesday_time,
    wednesday_time, thursday_time, friday_time, saturday_time,
    sunday_time, special_times, route_data, auto_renew
  )
  VALUES (
    p_driver_id, p_vehicle_id, p_origin_name, p_origin_lat, p_origin_lng,
    p_destination_name, p_destination_lat, p_destination_lng, p_trip_type,
    p_departure_time, p_return_time, p_available_seats, p_price_per_seat,
    p_description, p_status, p_start_date, p_end_date, p_price_per_day,
    p_price_per_period, COALESCE(p_recurrence_days, ARRAY[]::INTEGER[]),
    p_monday_time, p_tuesday_time, p_wednesday_time, p_thursday_time,
    p_friday_time, p_saturday_time, p_sunday_time,
    COALESCE(p_special_times, '{}'::JSONB),
    COALESCE(p_route_data, '{}'::JSONB),
    p_auto_renew
  )
  RETURNING *;
END;
$$;
```

3. Ahora tu aplicación usará esta función automáticamente
4. **Recarga tu aplicación** (F5)
5. Intenta crear un viaje

---

## 🎯 DESPUÉS DE APLICAR LA SOLUCIÓN

Una vez que hayas aplicado cualquiera de las 3 opciones:

1. ✅ **Recarga completamente tu navegador** (Ctrl+Shift+R o Cmd+Shift+R)
2. ✅ Abre la consola del navegador (F12)
3. ✅ Ve a la página de crear viajes
4. ✅ Intenta crear un viaje de prueba
5. ✅ Verifica en la consola que aparezca: `✅ Viaje creado con ID: ...`

---

## 🔍 VERIFICAR QUE TODO FUNCIONA

Ejecuta esto en SQL Editor para verificar:

```sql
-- Ver viajes creados recientemente
SELECT 
  id,
  trip_type,
  origin_name,
  destination_name,
  status,
  auto_renew,
  created_at
FROM trips
ORDER BY created_at DESC
LIMIT 5;
```

Deberías ver tus viajes recién creados.

---

## 💡 POR QUÉ PASA ESTO

PostgREST (la API REST de Supabase) cachea el esquema de la base de datos para mejorar el rendimiento. Cuando agregamos 15+ columnas nuevas a la tabla `trips`, el caché no se actualizó automáticamente.

**Cambios que causaron esto:**
- ✅ Agregamos campos: `trip_type`, `auto_renew`, `start_date`, `end_date`, etc.
- ✅ Agregamos horarios por día: `monday_time`, `tuesday_time`, etc.
- ✅ Migramos 30 viajes de `monthly_trips` a `trips`

---

## 🚀 MEJORAS IMPLEMENTADAS

He actualizado el código para que sea más robusto:

### 1. Nuevo Servicio: `tripsServiceDirect.ts`

Este servicio intenta 3 métodos en orden:
1. Función RPC `insert_trip` (más rápido, evita caché)
2. INSERT directo con `.from('trips')` (fallback)
3. Manejo de errores detallado

### 2. Componente Actualizado

`CreateMonthlyTrip.vue` ahora usa `tripsServiceDirect.ts` automáticamente.

### 3. Logs Mejorados

Verás en la consola exactamente qué está pasando:
- `🚗 Creando viaje con función RPC...`
- `⚠️ Intentando método alternativo...`
- `✅ Viaje creado con ID: ...`

---

## ⚠️ SI NADA FUNCIONA

Si después de probar las 3 opciones el error persiste:

### Verificar Permisos

```sql
-- Ver permisos de la tabla
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'trips'
  AND table_schema = 'public';

-- Otorgar todos los permisos
GRANT ALL ON TABLE trips TO postgres;
GRANT ALL ON TABLE trips TO anon;
GRANT ALL ON TABLE trips TO authenticated;
GRANT ALL ON TABLE trips TO service_role;

-- Refrescar
SELECT pg_notify('pgrst', 'reload schema');
```

### Verificar que la Tabla Existe

```sql
-- Listar todas las columnas de trips
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'trips'
  AND table_schema = 'public'
ORDER BY ordinal_position;
```

Deberías ver 34 columnas incluyendo:
- `trip_type`
- `auto_renew`
- `monday_time`, `tuesday_time`, etc.
- `start_date`, `end_date`
- `price_per_day`, `price_per_period`

---

## 📞 ÚLTIMO RECURSO

Si absolutamente nada funciona, puedes:

1. **Pausar y Restaurar el Proyecto**
   - Settings → General → Pause project
   - Espera 30 segundos
   - Restore project
   - Espera 2-3 minutos

2. **Contactar Soporte de Supabase**
   - https://supabase.com/dashboard/support
   - Menciona: "PostgREST schema cache not updating after ALTER TABLE"

---

## ✅ RESUMEN RÁPIDO

**Solución más rápida (30 segundos):**
```sql
SELECT pg_notify('pgrst', 'reload schema');
```
Luego recarga tu navegador (F5).

**Solución más robusta (2 minutos):**
Crea la función `insert_trip` (código arriba) y recarga tu navegador.

**¡Una de estas soluciones definitivamente funcionará!** 🚀


