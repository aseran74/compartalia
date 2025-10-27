# 🔍 Diagnóstico de Búsqueda

## Problema: No encuentra viajes

Si la búsqueda no encuentra viajes, sigue estos pasos de diagnóstico:

---

## 1️⃣ Verificar que el viaje existe

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Importar supabase
const { supabaseClean } = await import('/src/config/supabaseClean.ts')

// Ver todos los viajes en monthly_trips
const { data, error } = await supabaseClean
  .from('monthly_trips')
  .select('*')
  .eq('is_active', true)

console.log('📊 Viajes en monthly_trips:', data)
console.log('❌ Error:', error)
```

**Resultado esperado:**
- Deberías ver al menos 1 viaje
- Con `origin_name: "Getafe"` y `destination_name` conteniendo "Sol"

---

## 2️⃣ Verificar las fechas del viaje

```javascript
const { data } = await supabaseClean
  .from('monthly_trips')
  .select('id, origin_name, destination_name, start_date, end_date, is_active')
  .eq('is_active', true)

console.table(data)
```

**Verificar:**
- ✅ `start_date` debe ser ≤ fecha de búsqueda (26 octubre)
- ✅ `end_date` debe ser ≥ fecha de búsqueda (26 octubre) o `null`
- ✅ `is_active` debe ser `true`

---

## 3️⃣ Probar la búsqueda manualmente

```javascript
const { HybridTripService } = await import('/src/services/hybridTripService.ts')
const service = new HybridTripService()

const results = await service.searchTrips(
  'Getafe',
  'Sol',
  {
    useGeolocation: false,
    limit: 50,
    date: '2025-10-26'
  }
)

console.log('🔍 Resultados de búsqueda:', results)
console.log('📊 Total encontrados:', results.length)
```

**Si no encuentra nada:**
- Revisa los logs en consola
- Busca errores de SQL

---

## 4️⃣ Verificar el filtro de fecha

El problema más común es el filtro de fecha. Ejecuta:

```javascript
const searchDate = '2025-10-26'

const { data, error } = await supabaseClean
  .from('monthly_trips')
  .select('*')
  .eq('is_active', true)
  .lte('start_date', searchDate)
  .or(`end_date.gte.${searchDate},end_date.is.null`)

console.log('📊 Viajes filtrados por fecha:', data)
console.log('❌ Error:', error)
```

**Si `data` está vacío:**
- El problema es el filtro de fecha
- Verifica que `start_date` y `end_date` estén correctos

---

## 5️⃣ Buscar sin filtro de fecha

```javascript
const { data, error } = await supabaseClean
  .from('monthly_trips')
  .select('*')
  .eq('is_active', true)
  .ilike('origin_name', '%Getafe%')
  .ilike('destination_name', '%Sol%')

console.log('📊 Viajes sin filtro de fecha:', data)
```

**Si encuentra viajes:**
- El problema es definitivamente el filtro de fecha
- Verifica las fechas del viaje

---

## 6️⃣ Ver el viaje específico

```javascript
// Si conoces el ID del viaje
const tripId = 'TU_TRIP_ID_AQUI'

const { data } = await supabaseClean
  .from('monthly_trips')
  .select('*')
  .eq('id', tripId)
  .single()

console.log('📊 Detalles del viaje:', data)
console.log('📅 Fechas:', {
  start: data.start_date,
  end: data.end_date,
  active: data.is_active
})
console.log('📍 Ubicaciones:', {
  origin: data.origin_name,
  destination: data.destination_name
})
```

---

## 🔧 SOLUCIONES COMUNES

### Problema 1: Fechas incorrectas

**Síntoma:** El viaje existe pero no aparece en búsquedas con fecha

**Solución:**
```javascript
// Actualizar las fechas del viaje
const tripId = 'TU_TRIP_ID_AQUI'

await supabaseClean
  .from('monthly_trips')
  .update({
    start_date: '2025-10-01', // Fecha de inicio en el pasado
    end_date: '2025-12-31'    // Fecha de fin en el futuro
  })
  .eq('id', tripId)

console.log('✅ Fechas actualizadas')
```

### Problema 2: Viaje inactivo

**Síntoma:** `is_active` es `false`

**Solución:**
```javascript
const tripId = 'TU_TRIP_ID_AQUI'

await supabaseClean
  .from('monthly_trips')
  .update({ is_active: true })
  .eq('id', tripId)

console.log('✅ Viaje activado')
```

### Problema 3: Nombres no coinciden

**Síntoma:** Los nombres de origen/destino no coinciden exactamente

**Solución:**
```javascript
// Ver todos los nombres de origen
const { data } = await supabaseClean
  .from('monthly_trips')
  .select('origin_name, destination_name')
  .eq('is_active', true)

console.table(data)

// Si el nombre es diferente, actualízalo
const tripId = 'TU_TRIP_ID_AQUI'

await supabaseClean
  .from('monthly_trips')
  .update({
    origin_name: 'Getafe',
    destination_name: 'Sol, Madrid'
  })
  .eq('id', tripId)
```

---

## 🎯 PRUEBA RÁPIDA

Ejecuta este código completo para un diagnóstico rápido:

```javascript
// Diagnóstico completo
const { supabaseClean } = await import('/src/config/supabaseClean.ts')

console.log('🔍 === DIAGNÓSTICO DE BÚSQUEDA ===')

// 1. Contar viajes totales
const { count: total } = await supabaseClean
  .from('monthly_trips')
  .select('*', { count: 'exact', head: true })

console.log(`📊 Total de viajes en monthly_trips: ${total}`)

// 2. Contar viajes activos
const { count: active } = await supabaseClean
  .from('monthly_trips')
  .select('*', { count: 'exact', head: true })
  .eq('is_active', true)

console.log(`✅ Viajes activos: ${active}`)

// 3. Ver viajes con Getafe
const { data: getafeTrips } = await supabaseClean
  .from('monthly_trips')
  .select('*')
  .ilike('origin_name', '%Getafe%')

console.log(`📍 Viajes desde Getafe: ${getafeTrips?.length || 0}`)
console.table(getafeTrips)

// 4. Ver viajes con Sol
const { data: solTrips } = await supabaseClean
  .from('monthly_trips')
  .select('*')
  .ilike('destination_name', '%Sol%')

console.log(`🎯 Viajes a Sol: ${solTrips?.length || 0}`)
console.table(solTrips)

// 5. Buscar Getafe → Sol (sin fecha)
const { data: results } = await supabaseClean
  .from('monthly_trips')
  .select('*')
  .eq('is_active', true)
  .ilike('origin_name', '%Getafe%')
  .ilike('destination_name', '%Sol%')

console.log(`🔍 Getafe → Sol (sin fecha): ${results?.length || 0}`)
console.table(results)

// 6. Buscar Getafe → Sol (con fecha)
const searchDate = '2025-10-26'
const { data: resultsWithDate } = await supabaseClean
  .from('monthly_trips')
  .select('*')
  .eq('is_active', true)
  .ilike('origin_name', '%Getafe%')
  .ilike('destination_name', '%Sol%')
  .lte('start_date', searchDate)
  .or(`end_date.gte.${searchDate},end_date.is.null`)

console.log(`🔍 Getafe → Sol (con fecha ${searchDate}): ${resultsWithDate?.length || 0}`)
console.table(resultsWithDate)

console.log('🔍 === FIN DIAGNÓSTICO ===')
```

---

## 📝 REPORTAR RESULTADOS

Después de ejecutar el diagnóstico, comparte:

1. **Total de viajes:** `X viajes`
2. **Viajes activos:** `X viajes`
3. **Viajes desde Getafe:** `X viajes`
4. **Viajes a Sol:** `X viajes`
5. **Getafe → Sol (sin fecha):** `X viajes`
6. **Getafe → Sol (con fecha):** `X viajes`

Con esta información podremos identificar exactamente dónde está el problema.

---

**¡Ejecuta el diagnóstico y comparte los resultados!** 🔍


