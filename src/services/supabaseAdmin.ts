/**
 * Cliente de Supabase con Service Role
 * 
 * ⚠️ IMPORTANTE:
 * - Este cliente bypasea PostgREST y RLS
 * - SOLO usar para desarrollo local
 * - NUNCA usar en producción
 * - NUNCA subir el Service Role Key a Git
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY

if (!supabaseServiceKey) {
  console.warn('⚠️ VITE_SUPABASE_SERVICE_KEY no está configurado')
  console.warn('⚠️ Crea un archivo .env.local con tu Service Role Key')
}

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  }
)

console.log('🔑 Supabase Admin client initialized')
console.log('📍 URL:', supabaseUrl)
console.log('🔐 Using Service Role:', !!supabaseServiceKey)


