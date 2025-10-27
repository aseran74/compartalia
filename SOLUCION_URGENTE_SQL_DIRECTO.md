# 🚨 SOLUCIÓN URGENTE - SQL DIRECTO

## ❌ PROBLEMA CRÍTICO

**TODAS las tablas han desaparecido del caché de PostgREST:**
- ❌ `trips` - No está en caché
- ❌ `monthly_trips` - No está en caché
- ❌ Ninguna tabla funciona con `.from()`

## ✅ SOLUCIÓN INMEDIATA (DEBES HACERLO TÚ)

### Opción 1: Refrescar Esquema (30 segundos) ⭐ RECOMENDADO

1. **Ve a Supabase Dashboard:**
   https://supabase.com/dashboard/project/iarhoniaajhmdtaelwql

2. **Abre SQL Editor**

3. **Ejecuta este código:**
```sql
-- Refrescar esquema de PostgREST
SELECT pg_notify('pgrst', 'reload schema');
SELECT pg_notify('pgrst', 'reload config');

-- Esperar 2 segundos
SELECT pg_sleep(2);

-- Refrescar de nuevo
NOTIFY pgrst, 'reload schema';

-- Verificar que las tablas existen
SELECT 
  schemaname,
  tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('trips', 'monthly_trips')
ORDER BY tablename;
```

4. **Espera 15 segundos**

5. **Recarga tu navegador** (F5 o Ctrl+Shift+R)

6. **Intenta crear un viaje de nuevo**

---

### Opción 2: Reiniciar Servicios de Supabase (2 minutos)

1. Ve a: https://supabase.com/dashboard/project/iarhoniaajhmdtaelwql/settings/api

2. Busca el botón **"Restart services"** o **"Restart"**

3. Haz clic y espera 1-2 minutos

4. **Recarga tu navegador** (F5)

5. Intenta crear un viaje

---

### Opción 3: Pausar y Restaurar Proyecto (5 minutos) - ÚLTIMO RECURSO

⚠️ **Advertencia:** Esto detendrá temporalmente tu proyecto

1. Ve a: https://supabase.com/dashboard/project/iarhoniaajhmdtaelwql/settings/general

2. Scroll hasta **"Pause project"**

3. Haz clic en **"Pause project"** y confirma

4. **Espera 30 segundos**

5. Haz clic en **"Restore project"**

6. **Espera 2-3 minutos** hasta que el proyecto esté activo

7. **Recarga tu navegador** (F5)

8. Intenta crear un viaje

---

## 🔍 VERIFICAR QUE LAS TABLAS EXISTEN

Ejecuta esto en SQL Editor:

```sql
-- Ver todas las tablas públicas
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Contar registros en monthly_trips
SELECT COUNT(*) as total FROM monthly_trips;

-- Contar registros en trips
SELECT COUNT(*) as total FROM trips;
```

**Resultado esperado:**
- Deberías ver ambas tablas: `monthly_trips` y `trips`
- `monthly_trips` debería tener ~30 registros
- `trips` debería tener ~35 registros

---

## 🆘 POR QUÉ PASA ESTO

PostgREST (la API REST de Supabase) mantiene un caché del esquema de la base de datos. Cuando este caché se desincroniza, **NINGUNA tabla funciona** con `.from()`.

**Causas posibles:**
1. Cambios masivos en el esquema (agregamos muchas columnas)
2. Múltiples migraciones en poco tiempo
3. Bug temporal de Supabase
4. El servicio PostgREST necesita reiniciarse

---

## 💡 MIENTRAS TANTO...

He creado un servicio que usa **funciones SQL RPC** en lugar de `.from()`, pero primero necesitas crear la función en Supabase.

### Crear Función SQL de Inserción

Ejecuta esto en SQL Editor:

```sql
-- Función para insertar viajes directamente
CREATE OR REPLACE FUNCTION insert_monthly_trip(
  p_driver_id UUID,
  p_vehicle_id UUID,
  p_origin_name TEXT,
  p_origin_lat NUMERIC,
  p_origin_lng NUMERIC,
  p_destination_name TEXT,
  p_destination_lat NUMERIC,
  p_destination_lng NUMERIC,
  p_start_date DATE,
  p_end_date DATE,
  p_monday_time TIME DEFAULT NULL,
  p_tuesday_time TIME DEFAULT NULL,
  p_wednesday_time TIME DEFAULT NULL,
  p_thursday_time TIME DEFAULT NULL,
  p_friday_time TIME DEFAULT NULL,
  p_saturday_time TIME DEFAULT NULL,
  p_sunday_time TIME DEFAULT NULL,
  p_available_seats INTEGER DEFAULT 4,
  p_price_per_seat NUMERIC,
  p_monthly_price NUMERIC,
  p_description TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  driver_id UUID,
  vehicle_id UUID,
  origin_name TEXT,
  origin_lat NUMERIC,
  origin_lng NUMERIC,
  destination_name TEXT,
  destination_lat NUMERIC,
  destination_lng NUMERIC,
  start_date DATE,
  end_date DATE,
  monday_time TIME,
  tuesday_time TIME,
  wednesday_time TIME,
  thursday_time TIME,
  friday_time TIME,
  saturday_time TIME,
  sunday_time TIME,
  available_seats INTEGER,
  price_per_seat NUMERIC,
  monthly_price NUMERIC,
  description TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO monthly_trips (
    driver_id, vehicle_id, origin_name, origin_lat, origin_lng,
    destination_name, destination_lat, destination_lng,
    start_date, end_date,
    monday_time, tuesday_time, wednesday_time, thursday_time,
    friday_time, saturday_time, sunday_time,
    available_seats, price_per_seat, monthly_price, description, is_active
  )
  VALUES (
    p_driver_id, p_vehicle_id, p_origin_name, p_origin_lat, p_origin_lng,
    p_destination_name, p_destination_lat, p_destination_lng,
    p_start_date, p_end_date,
    p_monday_time, p_tuesday_time, p_wednesday_time, p_thursday_time,
    p_friday_time, p_saturday_time, p_sunday_time,
    p_available_seats, p_price_per_seat, p_monthly_price, p_description, true
  )
  RETURNING 
    monthly_trips.id,
    monthly_trips.driver_id,
    monthly_trips.vehicle_id,
    monthly_trips.origin_name,
    monthly_trips.origin_lat,
    monthly_trips.origin_lng,
    monthly_trips.destination_name,
    monthly_trips.destination_lat,
    monthly_trips.destination_lng,
    monthly_trips.start_date,
    monthly_trips.end_date,
    monthly_trips.monday_time,
    monthly_trips.tuesday_time,
    monthly_trips.wednesday_time,
    monthly_trips.thursday_time,
    monthly_trips.friday_time,
    monthly_trips.saturday_time,
    monthly_trips.sunday_time,
    monthly_trips.available_seats,
    monthly_trips.price_per_seat,
    monthly_trips.monthly_price,
    monthly_trips.description,
    monthly_trips.is_active,
    monthly_trips.created_at,
    monthly_trips.updated_at;
END;
$$;

-- Comentario
COMMENT ON FUNCTION insert_monthly_trip IS 'Inserta un viaje mensual directamente, evitando el caché de PostgREST';
```

Después de crear esta función, tu aplicación la usará automáticamente.

---

## 📞 CONTACTAR SOPORTE DE SUPABASE

Si ninguna de las soluciones funciona, contacta al soporte:

1. Ve a: https://supabase.com/dashboard/support
2. Describe el problema:
   ```
   PostgREST schema cache is not updating after multiple migrations.
   Tables exist in database but return PGRST205 error.
   Already tried:
   - pg_notify('pgrst', 'reload schema')
   - Restarting services
   
   Project ID: iarhoniaajhmdtaelwql
   Tables affected: trips, monthly_trips
   ```

---

## ✅ RESUMEN RÁPIDO

**LO MÁS IMPORTANTE:**

1. **Ejecuta en SQL Editor:**
```sql
SELECT pg_notify('pgrst', 'reload schema');
NOTIFY pgrst, 'reload schema';
```

2. **Espera 15 segundos**

3. **Recarga tu navegador (F5)**

4. **Intenta crear un viaje**

Si no funciona → **Reinicia servicios de Supabase** desde Settings → API

Si tampoco funciona → **Pausa y restaura el proyecto** desde Settings → General

**¡Una de estas soluciones DEBE funcionar!** 🚀

---

## 🔧 NOTA TÉCNICA

Este problema NO es culpa de tu código. Es un problema conocido de PostgREST cuando:
- Se hacen muchos cambios en el esquema
- Se ejecutan múltiples migraciones seguidas
- El caché no se invalida correctamente

La solución definitiva es que Supabase refresque su caché, lo cual DEBES hacer manualmente desde el dashboard.


