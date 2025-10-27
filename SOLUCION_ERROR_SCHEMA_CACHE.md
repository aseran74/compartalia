# 🔧 Solución: Error "Could not find the table 'public.trips' in the schema cache"

## ❌ Error

```
code: "PGRST205"
message: "Could not find the table 'public.trips' in the schema cache"
```

## ✅ Causa

La tabla `trips` **SÍ existe** en la base de datos (verificado: 35 registros), pero PostgREST (la API de Supabase) no ha actualizado su caché de esquema.

## 🔧 Soluciones

### Solución 1: Refrescar desde SQL Editor (MÁS RÁPIDO)

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Selecciona el proyecto `iarhoniaajhmdtaelwql`
3. Ve a **SQL Editor**
4. Ejecuta este comando:

```sql
-- Refrescar el esquema de PostgREST
SELECT pg_notify('pgrst', 'reload schema');
SELECT pg_notify('pgrst', 'reload config');
NOTIFY pgrst, 'reload schema';
```

5. Espera 10-15 segundos
6. Intenta crear el viaje nuevamente

---

### Solución 2: Reiniciar API de Supabase (SI LA SOLUCIÓN 1 NO FUNCIONA)

1. Ve a **Settings** → **API** en tu proyecto de Supabase
2. Busca el botón **"Restart API"** o **"Restart PostgREST"**
3. Haz clic y espera 1-2 minutos
4. Intenta crear el viaje nuevamente

---

### Solución 3: Hacer un Cambio Mínimo en la Tabla (FORZAR ACTUALIZACIÓN)

1. Ve a **SQL Editor**
2. Ejecuta:

```sql
-- Agregar y eliminar una columna dummy para forzar actualización
ALTER TABLE trips ADD COLUMN IF NOT EXISTS _temp_refresh TEXT;
ALTER TABLE trips DROP COLUMN IF EXISTS _temp_refresh;

-- Refrescar
SELECT pg_notify('pgrst', 'reload schema');
NOTIFY pgrst, 'reload schema';
```

3. Espera 10-15 segundos
4. Intenta crear el viaje nuevamente

---

### Solución 4: Pausar y Restaurar Proyecto (ÚLTIMO RECURSO)

⚠️ **Advertencia:** Esto detendrá temporalmente tu proyecto

1. Ve a **Settings** → **General**
2. Scroll hasta **Pause project**
3. Haz clic en **Pause project** y confirma
4. Espera 30 segundos
5. Haz clic en **Restore project**
6. Espera 2-3 minutos hasta que el proyecto esté activo
7. Intenta crear el viaje nuevamente

---

## 🧪 Verificar que la Tabla Existe

Puedes verificar que la tabla `trips` existe ejecutando en SQL Editor:

```sql
-- Ver estructura de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'trips'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Contar registros
SELECT COUNT(*) as total_trips FROM trips;

-- Ver algunos registros
SELECT id, trip_type, origin_name, destination_name, status
FROM trips
LIMIT 5;
```

**Resultado esperado:**
- La tabla debe tener 35+ columnas
- Debe haber 35 registros
- Debe incluir campos como `trip_type`, `auto_renew`, `monday_time`, etc.

---

## 🔍 Por Qué Pasa Esto

PostgREST (la API REST de Supabase) mantiene un caché del esquema de la base de datos para mejorar el rendimiento. Cuando se hacen cambios significativos en el esquema (como agregar muchas columnas nuevas), a veces el caché no se actualiza automáticamente.

**Cambios que causaron esto:**
- Agregamos 15+ columnas nuevas a la tabla `trips`
- Creamos 3 funciones SQL nuevas
- Creamos 1 trigger nuevo
- Migramos 30 registros de `monthly_trips` a `trips`

---

## ✅ Después de Aplicar la Solución

Una vez que el esquema esté actualizado, deberías poder:

1. ✅ Crear viajes desde `CreateMonthlyTrip.vue`
2. ✅ Buscar viajes con `UnifiedTripSearch.vue`
3. ✅ Ver notificaciones de renovación con `TripRenewalNotifications.vue`
4. ✅ Usar todas las funciones SQL (`search_trips_by_date`, etc.)

---

## 🆘 Si Nada Funciona

Si ninguna de las soluciones anteriores funciona, es posible que haya un problema con los permisos de la tabla. Verifica:

```sql
-- Ver permisos de la tabla trips
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'trips'
  AND table_schema = 'public';

-- Si no hay permisos, agregarlos
GRANT ALL ON TABLE trips TO postgres;
GRANT ALL ON TABLE trips TO anon;
GRANT ALL ON TABLE trips TO authenticated;
GRANT ALL ON TABLE trips TO service_role;

-- Refrescar
NOTIFY pgrst, 'reload schema';
```

---

## 📞 Contacto

Si el problema persiste después de probar todas las soluciones:

1. Verifica que estés usando el proyecto correcto (`iarhoniaajhmdtaelwql`)
2. Verifica que la tabla `trips` realmente existe
3. Verifica los logs de Supabase en **Logs** → **API**
4. Contacta al soporte de Supabase si es necesario

---

**¡La tabla existe y está lista para usar! Solo necesita refrescar el caché.** 🚀


