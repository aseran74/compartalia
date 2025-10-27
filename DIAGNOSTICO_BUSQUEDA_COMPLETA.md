# 🔍 Diagnóstico Completo de Búsqueda de Viajes

## Problema
Se ha creado un viaje "Alcobendas → Sol" para el día 28 como semanal, pero no aparece en la búsqueda.

## Script de Diagnóstico (Ejecutar en la consola del navegador)

Abre la consola del navegador (F12) en http://localhost:5173/carpooling/buscar-viajes-hibrido y ejecuta:

```javascript
// ==========================================
// DIAGNÓSTICO COMPLETO DE BÚSQUEDA
// ==========================================

const SUPABASE_URL = 'https://iarhoniaajhmdtaelwql.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhcmhvbmlhYWpobWR0YWVsd3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTk5NDYsImV4cCI6MjA3NjA5NTk0Nn0.BCYxVKl6gowzVCdqPXm8hQcwHnTV7RWupUBsW33Sifk'

console.log('🔍 INICIANDO DIAGNÓSTICO...\n')

// Función para hacer consultas a Supabase
async function querySupabase(endpoint, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  })
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`)
  }
  
  return response.json()
}

// 1. Verificar si existe el viaje en monthly_trips
console.log('1️⃣ Verificando viajes en monthly_trips...')
try {
  const allTrips = await querySupabase('monthly_trips?select=*&limit=100')
Name: trip.origin_name, destination: trip.destination_name, start_date: trip.start_date, end_date: trip.end_date, is_active: trip.is_active })
  console.log('📊 Todos los viajes en monthly_trips:', allTrips.map(trip => ({
    id: trip.id,
    origin: trip.origin_name,
    destination: trip.destination_name,
    start_date: trip.start_date,
    end_date: trip.end_date,
    is_active: trip.is_active
  })))
  
  // Buscar específicamente el viaje de Alcobendas → Sol día 28
  const alcobendasSol = allTrips.filter(trip => 
    trip.origin_name?.toLowerCase().includes('alcobendas') &&
    trip.destination_name?.toLowerCase().includes('sol')
  )
  
  console.log('\n🎯 Viajes Alcobendas → Sol:', alcobendasSol.length)
  if (alcobendasSol.length > 0) {
    console.log('✅ ENCONTRADO:', alcobendasSol.map(t => ({
      id: t.id,
      origin: t.origin_name,
      destination: t.destination_name,
      start_date: t.start_date,
      end_date: t.end_date,
      monday_time: t.monday_time,
      tuesday_time: t.tuesday_time,
      wednesday_time: t.wednesday_time,
      thursday_time: t.thursday_time,
      friday_time: t.friday_time
    })))
  } else {
    console.log('❌ NO SE ENCONTRÓ NINGÚN VIAJE')
  }
} catch (error) {
  console.error('❌ Error consultando monthly_trips:', error)
}

// 2. Verificar filtros de fecha
console.log('\n2️⃣ Verificando filtros de fecha...')
const searchDate = '2025-01-28' // Ajustar según la fecha que estés buscando
console.log('📅 Fecha buscada:', searchDate)

try {
  const tripsWithDateFilter = await querySupabase(
    `monthly_trips?select=*&is_active=eq.true&start_date=lte.${searchDate}&or=(end_date.gte.${searchDate},end_date.is.null)&limit=100`
  )
  console.log('📊 Viajes activos en la fecha:', tripsWithDateFilter.length)
  console.log('📋 Detalles:', tripsWithDateFilter.map(t => ({
    origin: t.origin_name,
    destination: t.destination_name,
    start_date: t.start_date,
    end_date: t.end_date
  })))
} catch (error) {
  console.error('❌ Error con filtro de fecha:', error)
}

// 3. Verificar búsqueda por texto (origen Alcobendas)
console.log('\n3️⃣ Búsqueda por origen "Alcobendas"...')
try {
  const tripsWithOrigin = await querySupabase(
    `monthly_trips?select=*&origin_name=ilike.%25Alcobendas%25&limit=100`
  )
  console.log('📊 Viajes con origen Alcobendas:', tripsWithOrigin.length)
  console.log('📋 Detalles:', tripsWithOrigin.map(t => ({
    origin: t.origin_name,
    destination: t.destination_name,
    start_date: t.start_date
  })))
} catch (error) {
  console.error('❌ Error buscando por origen:', error)
}

// 4. Verificar búsqueda por destino "Sol"
console.log('\n4️⃣ Búsqueda por destino "Sol"...')
try {
  const tripsWithDest = await querySupabase(
    `monthly_trips?select=*&destination_name=ilike.%25Sol%25&limit=100`
  )
  console.log('📊 Viajes con destino Sol:', tripsWithDest.length)
  console.log('📋 Detalles:', tripsWithDest.map(t => ({
    origin: t.origin_name,
    destination: t.destination_name,
    start_date: t.start_date
  })))
} catch (error) {
  console.error('❌ Error buscando por destino:', error)
}

// 5. Simular la búsqueda exacta que hace el servicio
console.log('\n5️⃣ Simulando búsqueda híbrida exacta...')
try {
  const hybridSearch = await querySupabase(
    `monthly_trips?select=*&is_active=eq.true&origin_name=ilike.%25Alcobendas%25&destination_name=ilike.%25Sol%25&start_date=lte.2025-01-28&or=(end_date.gte.2025-01-28,end_date.is.null)&limit=100`
  )
  console.log('📊 Resultado de búsqueda híbrida:', hybridSearch.length)
  console.log('📋 Resultados:', hybridSearch.map(t => ({
    id: t.id,
    origin: t.origin_name,
    destination: t.destination_name,
    start_date: t.start_date,
    end_date: t.end_date,
    monday_time: t.monday_time,
    price_per_seat: t.price_per_seat
  })))
} catch (error) {
  console.error('❌ Error en búsqueda híbrida:', error)
}

// 6. Verificar si existe el perfil del conductor
console.log('\n6️⃣ Verificando perfiles de conductores...')
try {
  const allTrips = await querySupabase('monthly_trips?select=driver_id&limit=100')
  const driverIds = [...new Set(allTrips.map(t => t.driver_id))]
  console.log('👥 IDs de conductores:', driverIds)
  
  if (driverIds.length > 0) {
    const profiles = await querySupabase(
      `profiles?select=*&id=in.(${driverIds.join(',')})`
    )
    console.log('👤 Perfiles encontrados:', profiles.length)
    console.log('📋 Nombres:', profiles.map(p => p.name))
  }
} catch (error) {
  console.error('❌ Error obteniendo perfiles:', error)
}

console.log('\n✅ DIAGNÓSTICO COMPLETADO')
```

## Instrucciones
1. Copia todo el script de arriba
2. Abre la consola del navegador (F12)
3. Pega el script y presiona Enter
4. Comparte los resultados en la consola

## Análisis de Resultados

### Si el viaje no aparece en ninguna consulta:
- El viaje no se creó correctamente
- Verifica que se haya guardado en Supabase manualmente

### Si el viaje aparece en la consulta 1 pero no en la 5:
- Hay un problema con los filtros de fecha o búsqueda por texto
- Puede ser un problema de normalización de búsqueda ("Sol" vs "Puerta del Sol")

### Si el viaje aparece en todas las consultas:
- El problema está en el frontend o en el mapeo de resultados
- Verifica la consola del navegador para errores de JavaScript

