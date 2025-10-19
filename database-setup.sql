-- Configuración de base de datos para Compartalia
-- Ejecutar este SQL en la consola de Supabase

-- Habilitar la extensión PostGIS para funciones geoespaciales
CREATE EXTENSION IF NOT EXISTS postgis;

-- Tabla de viajes
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_name TEXT NOT NULL,
  origin_lat DECIMAL(10, 8) NOT NULL,
  origin_lng DECIMAL(11, 8) NOT NULL,
  destination_name TEXT NOT NULL,
  destination_lat DECIMAL(10, 8) NOT NULL,
  destination_lng DECIMAL(11, 8) NOT NULL,
  route_distance DECIMAL(8, 2),
  route_duration INTEGER,
  route_coordinates JSONB,
  driver_id UUID REFERENCES auth.users(id),
  driver_name TEXT NOT NULL,
  driver_rating DECIMAL(2, 1),
  available_seats INTEGER NOT NULL DEFAULT 1,
  departure_time TIME NOT NULL,
  price DECIMAL(5, 2) NOT NULL,
  days_of_week INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5}', -- 1=Lunes, 7=Domingo
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de paradas
CREATE TABLE IF NOT EXISTS trip_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  stop_order INTEGER NOT NULL,
  name TEXT,
  address TEXT,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  distance_from_origin DECIMAL(8, 2) NOT NULL,
  radius_km DECIMAL(4, 2) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_trips_active ON trips(is_active);
CREATE INDEX IF NOT EXISTS idx_trips_days ON trips USING GIN(days_of_week);
CREATE INDEX IF NOT EXISTS idx_trips_origin_geom ON trips USING GIST(ST_Point(origin_lng, origin_lat));
CREATE INDEX IF NOT EXISTS idx_trips_destination_geom ON trips USING GIST(ST_Point(destination_lng, destination_lat));
CREATE INDEX IF NOT EXISTS idx_trip_stops_geom ON trip_stops USING GIST(ST_Point(lng, lat));
CREATE INDEX IF NOT EXISTS idx_trip_stops_trip_id ON trip_stops(trip_id);

-- Función para buscar viajes por proximidad
CREATE OR REPLACE FUNCTION search_trips_by_location(
  user_lat DECIMAL(10, 8),
  user_lng DECIMAL(11, 8),
  radius_km DECIMAL(4, 2) DEFAULT 1.0,
  day_of_week INTEGER DEFAULT NULL
)
RETURNS TABLE (
  trip_id UUID,
  match_type TEXT,
  match_distance DECIMAL(8, 2),
  stop_id UUID,
  stop_name TEXT,
  stop_address TEXT,
  trip_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH trip_matches AS (
    -- Buscar matches en origen
    SELECT 
      t.id as trip_id,
      'origin'::TEXT as match_type,
      ST_Distance(
        ST_Point(t.origin_lng, t.origin_lat)::geography,
        ST_Point(user_lng, user_lat)::geography
      ) / 1000 as match_distance,
      NULL::UUID as stop_id,
      t.origin_name as stop_name,
      t.origin_name as stop_address,
      to_jsonb(t.*) as trip_data
    FROM trips t
    WHERE t.is_active = true
      AND (day_of_week IS NULL OR day_of_week = ANY(t.days_of_week))
      AND ST_DWithin(
        ST_Point(t.origin_lng, t.origin_lat)::geography,
        ST_Point(user_lng, user_lat)::geography,
        radius_km * 1000
      )
    
    UNION ALL
    
    -- Buscar matches en destino
    SELECT 
      t.id as trip_id,
      'destination'::TEXT as match_type,
      ST_Distance(
        ST_Point(t.destination_lng, t.destination_lat)::geography,
        ST_Point(user_lng, user_lat)::geography
      ) / 1000 as match_distance,
      NULL::UUID as stop_id,
      t.destination_name as stop_name,
      t.destination_name as stop_address,
      to_jsonb(t.*) as trip_data
    FROM trips t
    WHERE t.is_active = true
      AND (day_of_week IS NULL OR day_of_week = ANY(t.days_of_week))
      AND ST_DWithin(
        ST_Point(t.destination_lng, t.destination_lat)::geography,
        ST_Point(user_lng, user_lat)::geography,
        radius_km * 1000
      )
    
    UNION ALL
    
    -- Buscar matches en paradas
    SELECT 
      t.id as trip_id,
      'stop'::TEXT as match_type,
      ST_Distance(
        ST_Point(ts.lng, ts.lat)::geography,
        ST_Point(user_lng, user_lat)::geography
      ) / 1000 as match_distance,
      ts.id as stop_id,
      ts.name as stop_name,
      ts.address as stop_address,
      to_jsonb(t.*) as trip_data
    FROM trips t
    JOIN trip_stops ts ON t.id = ts.trip_id
    WHERE t.is_active = true
      AND (day_of_week IS NULL OR day_of_week = ANY(t.days_of_week))
      AND ST_DWithin(
        ST_Point(ts.lng, ts.lat)::geography,
        ST_Point(user_lng, user_lat)::geography,
        ts.radius_km * 1000
      )
  )
  SELECT * FROM trip_matches
  ORDER BY match_distance ASC;
END;
$$ LANGUAGE plpgsql;

-- Habilitar Row Level Security (RLS)
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_stops ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para permitir lectura pública
CREATE POLICY "Allow public read access on trips" ON trips
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access on trip_stops" ON trip_stops
  FOR SELECT USING (true);

-- Política para permitir inserción a usuarios autenticados
CREATE POLICY "Allow authenticated users to insert trips" ON trips
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert trip_stops" ON trip_stops
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Insertar viaje de prueba Chamartín-Getafe
INSERT INTO trips (
  origin_name, origin_lat, origin_lng,
  destination_name, destination_lat, destination_lng,
  driver_name, driver_rating, available_seats,
  departure_time, price, days_of_week, is_active
) VALUES (
  'Chamartín, Madrid', 40.4740, -3.6827,
  'Getafe, Madrid', 40.3071, -3.7332,
  'María García', 4.8, 3,
  '08:30', 4.50, '{1,2,3,4,5}', true
);

-- Obtener el ID del viaje insertado
DO $$
DECLARE
  trip_uuid UUID;
BEGIN
  SELECT id INTO trip_uuid FROM trips WHERE origin_name = 'Chamartín, Madrid' LIMIT 1;
  
  -- Insertar paradas de ejemplo (coordenadas aproximadas de la ruta real)
  INSERT INTO trip_stops (trip_id, stop_order, name, address, lat, lng, distance_from_origin, radius_km) VALUES
  (trip_uuid, 1, 'Parada A-5 Norte', 'A-5, km 8, Madrid', 40.4615, -3.6945, 3.0, 1.0),
  (trip_uuid, 2, 'Parada A-5 Centro', 'A-5, km 11, Madrid', 40.4490, -3.7063, 6.0, 1.0),
  (trip_uuid, 3, 'Parada M-30 Norte', 'M-30, km 15, Madrid', 40.4365, -3.7181, 9.0, 1.0),
  (trip_uuid, 4, 'Parada M-30 Centro (Cerca C. Adelfas)', 'M-30, km 18, Madrid (Cerca C. Adelfas)', 40.4240, -3.7299, 12.0, 1.0),
  (trip_uuid, 5, 'Parada M-30 Sur', 'M-30, km 21, Madrid', 40.4115, -3.7417, 15.0, 1.0),
  (trip_uuid, 6, 'Parada A-5 Sur', 'A-5, km 24, Madrid', 40.3990, -3.7535, 18.0, 1.0),
  (trip_uuid, 7, 'Parada Getafe Norte', 'A-5, km 27, Getafe', 40.3865, -3.7653, 21.0, 1.0),
  (trip_uuid, 8, 'Parada Getafe Centro', 'Calle Mayor, Getafe', 40.3740, -3.7771, 24.0, 1.0);
END $$;

-- Verificar que todo se insertó correctamente
SELECT 
  t.id,
  t.origin_name,
  t.destination_name,
  COUNT(ts.id) as num_stops
FROM trips t
LEFT JOIN trip_stops ts ON t.id = ts.trip_id
GROUP BY t.id, t.origin_name, t.destination_name;
