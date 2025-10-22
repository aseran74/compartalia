// Cliente de Supabase completamente limpio sin cache
import { createClient } from '@supabase/supabase-js'

// Configuración limpia de Supabase
const supabaseUrl = 'https://iarhoniaajhmdtaelwql.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhcmhvbmlhYWpobWR0YWVsd3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTk5NDYsImV4cCI6MjA3NjA5NTk0Nn0.BCYxVKl6gowzVCdqPXm8hQcwHnTV7RWupUBsW33Sifk'

// Crear cliente completamente nuevo sin configuraciones problemáticas
export const supabaseClean = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})

// Función para probar la conexión
export const testConnection = async () => {
  try {
    console.log('🔍 Probando conexión limpia con Supabase...')
    
    const { data, error } = await supabaseClean
      .from('trips')
      .select('id, origin_name, destination_name')
      .limit(1)
    
    if (error) {
      console.error('❌ Error en conexión:', error)
      return false
    }
    
    console.log('✅ Conexión exitosa:', data)
    return true
  } catch (err) {
    console.error('❌ Error de conexión:', err)
    return false
  }
}

// Función para limpiar cache (si es posible)
export const clearCache = () => {
  console.log('🔄 Intentando limpiar cache...')
  // Forzar una nueva instancia
  if (typeof window !== 'undefined') {
    // Limpiar localStorage si existe
    try {
      localStorage.removeItem('sb-iarhoniaajhmdtaelwql-auth-token')
      localStorage.removeItem('supabase.auth.token')
    } catch (e) {
      console.log('No se pudo limpiar localStorage')
    }
  }
}

export default supabaseClean
