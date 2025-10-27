# 🚗 Crear Viaje de Prueba

Para crear un viaje de prueba que puedas buscar, sigue estos pasos:

## Opción 1: Desde el formulario (Recomendado)

1. **Ve a:** http://localhost:5173/carpooling/create-trip

2. **Completa el formulario:**
   - **Tipo de Viaje:** Semanal
   - **Origen:** Getafe (selecciona de vista rápida)
   - **Destino:** Sol (selecciona de vista rápida)
   - **Fecha Inicio:** Hoy
   - **Fecha Fin:** Dentro de 30 días
   - **Días:** Lunes a Viernes (L-V)
   - **Hora de salida:** 07:30
   - **Plazas:** 3
   - **Precio:** 5€

3. **Haz clic en:** ✅ Crear Viaje

---

## Opción 2: Desde la consola del navegador

1. **Abre la consola** (F12)

2. **Pega este código:**

```javascript
// Importar el servicio
const { default: TripsService } = await import('/src/services/tripsServiceSimple.ts')

// Crear viaje de prueba
const viaje = await TripsService.createTrip({
  driver_id: '550e8400-e29b-41d4-a716-446655440001',
  origin_name: 'Getafe',
  origin_lat: 40.3057,
  origin_lng: -3.7327,
  destination_name: 'Sol, Madrid',
  destination_lat: 40.4168,
  destination_lng: -3.7038,
  fecha_inicio: new Date().toISOString().split('T')[0],
  fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  dias_operacion: [1, 2, 3, 4, 5], // Lunes a Viernes
  monday_time: '07:30',
  tuesday_time: '07:30',
  wednesday_time: '07:30',
  thursday_time: '07:30',
  friday_time: '07:30',
  available_seats: 3,
  price_per_seat: 5,
  description: 'Viaje diario de Getafe a Sol. Salida puntual, ambiente tranquilo.',
  status: 'active'
})

console.log('✅ Viaje creado:', viaje)
```

---

## Opción 3: Varios viajes de prueba

Aquí tienes varios viajes para crear y probar diferentes búsquedas:

### Viaje 1: Getafe → Sol
```javascript
await TripsService.createTrip({
  driver_id: '550e8400-e29b-41d4-a716-446655440001',
  origin_name: 'Getafe',
  origin_lat: 40.3057,
  origin_lng: -3.7327,
  destination_name: 'Sol, Madrid',
  destination_lat: 40.4168,
  destination_lng: -3.7038,
  fecha_inicio: new Date().toISOString().split('T')[0],
  fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  dias_operacion: [1, 2, 3, 4, 5],
  monday_time: '07:30',
  tuesday_time: '07:30',
  wednesday_time: '07:30',
  thursday_time: '07:30',
  friday_time: '07:30',
  available_seats: 3,
  price_per_seat: 5,
  description: 'Viaje diario Getafe-Sol',
  status: 'active'
})
```

### Viaje 2: Leganés → Atocha
```javascript
await TripsService.createTrip({
  driver_id: '550e8400-e29b-41d4-a716-446655440001',
  origin_name: 'Leganés',
  origin_lat: 40.3275,
  origin_lng: -3.7639,
  destination_name: 'Atocha, Madrid',
  destination_lat: 40.4075,
  destination_lng: -3.6917,
  fecha_inicio: new Date().toISOString().split('T')[0],
  fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  dias_operacion: [1, 2, 3, 4, 5],
  monday_time: '08:00',
  tuesday_time: '08:00',
  wednesday_time: '08:00',
  thursday_time: '08:00',
  friday_time: '08:00',
  available_seats: 4,
  price_per_seat: 6,
  description: 'Viaje Leganés-Atocha',
  status: 'active'
})
```

### Viaje 3: Móstoles → Nuevos Ministerios
```javascript
await TripsService.createTrip({
  driver_id: '550e8400-e29b-41d4-a716-446655440001',
  origin_name: 'Móstoles',
  origin_lat: 40.3228,
  origin_lng: -3.8647,
  destination_name: 'Nuevos Ministerios, Madrid',
  destination_lat: 40.4459,
  destination_lng: -3.6900,
  fecha_inicio: new Date().toISOString().split('T')[0],
  fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  dias_operacion: [1, 2, 3, 4, 5],
  monday_time: '07:00',
  tuesday_time: '07:00',
  wednesday_time: '07:00',
  thursday_time: '07:00',
  friday_time: '07:00',
  available_seats: 2,
  price_per_seat: 7,
  description: 'Viaje Móstoles-Nuevos Ministerios',
  status: 'active'
})
```

---

## 🔍 Probar la Búsqueda

Una vez creados los viajes, ve a:
```
http://localhost:5173/carpooling/buscar-viajes-hibrido
```

### Búsquedas de prueba:

1. **Origen:** Getafe → **Destino:** Sol
   - ✅ Debería encontrar el Viaje 1

2. **Origen:** Leganés → **Destino:** Atocha
   - ✅ Debería encontrar el Viaje 2

3. **Origen:** Móstoles → **Destino:** Nuevos Ministerios
   - ✅ Debería encontrar el Viaje 3

4. **Origen:** Getafe → **Destino:** Madrid
   - ✅ Debería encontrar viajes con "Madrid" en el destino

---

## 📊 Verificar en Supabase

Para ver los viajes creados:

1. Ve a: https://supabase.com/dashboard/project/gxhlqnnkzbkasjhkfqzv/editor
2. Selecciona la tabla `monthly_trips`
3. Verás todos los viajes creados

---

## ⚠️ Nota Importante

El `driver_id` usado (`550e8400-e29b-41d4-a716-446655440001`) es un ID de prueba.

Si quieres usar tu propio ID de usuario:
1. Inicia sesión en la app
2. Abre la consola (F12)
3. Ejecuta: `console.log(user.value?.uid)`
4. Copia tu ID y úsalo en lugar del ID de prueba

---

**¡Ahora puedes crear y buscar viajes!** 🎉


